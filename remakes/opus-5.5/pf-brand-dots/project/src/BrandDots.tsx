import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {MarkShapes} from './Mark';
import {
  COLORS,
  MORPH_END,
  MORPH_START,
  PANELS,
  PanelKey,
  REVEAL,
  TURN_END,
  TURN_START,
  bezier,
  ease,
  lerp,
  progress,
  shapesAt,
} from './motion';

const FONT = 'Geist, system-ui, sans-serif';

// ---------------------------------------------------------------------------
// Font
// ---------------------------------------------------------------------------
const useGeist = () => {
  const [handle] = useState(() => delayRender('Loading Geist'));
  useEffect(() => {
    const face = new FontFace('Geist', `url(${staticFile('assets/GeistVF.woff2')}) format('woff2')`, {
      weight: '100 900',
      style: 'normal',
    });
    face
      .load()
      .then(() => {
        document.fonts.add(face);
        return document.fonts.ready;
      })
      .then(() => continueRender(handle))
      .catch((err) => {
        console.error(err);
        continueRender(handle);
      });
  }, [handle]);
};

// ---------------------------------------------------------------------------
// Accumulation motion blur. Every sample is a fully opaque layer and sample k is
// composited at opacity 1/(k+1): a running average, so the result is an equal-weight
// average of all sub-frame samples without the 8-bit colour drift of additive stacks.
// ---------------------------------------------------------------------------
const Accumulate: React.FC<{
  t: number;
  samples: number;
  shutter: number;
  render: (t: number) => React.ReactNode;
}> = ({t, samples, shutter, render}) => {
  if (samples <= 1) return <AbsoluteFill>{render(t)}</AbsoluteFill>;
  const layers = [];
  for (let k = 0; k < samples; k++) {
    const tk = t - shutter / 2 + (shutter * (k + 0.5)) / samples;
    layers.push(
      <AbsoluteFill key={k} style={{opacity: 1 / (k + 1)}}>
        {render(tk)}
      </AbsoluteFill>,
    );
  }
  return <AbsoluteFill>{layers}</AbsoluteFill>;
};

// ---------------------------------------------------------------------------
// Morph: five points -> five panels
// ---------------------------------------------------------------------------
const BG = `radial-gradient(75% 75% at 50% 45%, #E4DFD5 0%, ${COLORS.bg} 55%, ${COLORS.bgEdge} 100%)`;

// One soft contact shadow for the whole board (never per panel): it settles into the
// seams as the board lands, so the grid reads as a single inlaid surface, not floating cards.
const BoardShadow: React.FC<{t: number}> = ({t}) => {
  const k = ease.inOut(progress(t, MORPH_START + 18, MORPH_END));
  if (k <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 80 + 40 * (1 - k),
        top: 80 + 30 * (1 - k),
        width: 1760 - 80 * (1 - k),
        height: 920 - 60 * (1 - k),
        background: 'rgba(70, 52, 32, 1)',
        opacity: 0.2 * k,
        filter: 'blur(28px)',
        transform: 'translateY(14px)',
      }}
    />
  );
};

const MorphLayer: React.FC<{t: number}> = ({t}) => {
  const moving = t > MORPH_START && t < MORPH_END;
  return (
    <Accumulate
      t={t}
      samples={moving ? 12 : 1}
      shutter={0.5}
      render={(tt) => (
        <AbsoluteFill style={{background: BG}}>
          <BoardShadow t={Math.min(tt, MORPH_END)} />
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            {shapesAt(Math.min(tt, MORPH_END)).map((s) => (
              <rect key={s.key} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.r} ry={s.r} fill={s.fill} />
            ))}
          </svg>
        </AbsoluteFill>
      )}
    />
  );
};

const Panel: React.FC<{k: PanelKey; children: React.ReactNode; style?: React.CSSProperties}> = ({
  k,
  children,
  style,
}) => {
  const p = PANELS[k];
  return (
    <div
      style={{
        position: 'absolute',
        left: p.x,
        top: p.y,
        width: p.w,
        height: p.h,
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ---------------------------------------------------------------------------
// A: moving monochrome mark pattern
// ---------------------------------------------------------------------------
const CELL = 64;
const MARK = 52; // 12px gutter inside the pattern echoes the board seams
// 2x2 block rotations: the four quarter-fields meet as one disc, points orbit outside.
const BLOCK_ROT = [
  [270, 0],
  [180, 90],
];

const PatternPanel: React.FC<{t: number}> = ({t}) => {
  const p = PANELS.A;
  const start = REVEAL.A;
  const dx = t * 0.46;
  const dy = t * 0.22;
  const cols = Math.ceil((p.w + 260) / CELL) + 1;
  const rows = Math.ceil((p.h + 260) / CELL) + 1;
  const marks = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x = (i - 4) * CELL + dx + (CELL - MARK) / 2;
      const y = (j - 4) * CELL + dy + (CELL - MARK) / 2;
      if (x < -MARK || y < -MARK || x > p.w || y > p.h) continue;
      // Diagonal wave from the top-left corner, based on on-screen position at reveal time.
      const rx = (i - 4) * CELL + start * 0.46;
      const ry = (j - 4) * CELL + start * 0.22;
      const delay = start + Math.max(0, (rx + ry) / CELL) * 1.55;
      const s = ease.outBack(progress(t, delay, delay + 20));
      if (s <= 0.001) continue;
      const rot = BLOCK_ROT[((j % 2) + 2) % 2][((i % 2) + 2) % 2];
      marks.push(
        <g
          key={`${i}-${j}`}
          transform={`translate(${x + MARK / 2} ${y + MARK / 2}) scale(${(s * MARK) / 100}) rotate(${rot}) translate(-50 -50)`}
        >
          <MarkShapes field={COLORS.ink} point={COLORS.ink} />
        </g>,
      );
    }
  }
  return (
    <Panel k="A">
      <svg width={p.w} height={p.h} style={{position: 'absolute', inset: 0}}>
        {marks}
      </svg>
    </Panel>
  );
};

// ---------------------------------------------------------------------------
// C: coral hero mark with one 90deg turn
// ---------------------------------------------------------------------------
const HERO = 330;

const HERO_GLOW =
  'radial-gradient(120% 80% at 28% 18%, rgba(255,150,120,0.55) 0%, rgba(255,120,95,0.0) 55%), radial-gradient(90% 60% at 70% 100%, rgba(170,30,20,0.28) 0%, rgba(170,30,20,0) 70%)';

const HeroPanel: React.FC<{t: number}> = ({t}) => {
  const p = PANELS.C;
  const start = REVEAL.C;
  const sweep = bezier(0.55, 0, 0.2, 1)(progress(t, start, start + 30));
  const grow = lerp(0.84, 1, ease.out(progress(t, start, start + 40)));
  const point = ease.outBack(progress(t, start + 20, start + 42));
  const glow = ease.outSoft(progress(t, start, start + 50));
  const turnU = progress(t, TURN_START, TURN_END);
  const turning = turnU > 0 && turnU < 1;
  const label = ease.out(progress(t, start + 34, start + 60));
  const cx = p.w / 2;
  const cy = 408;
  return (
    <Panel k="C">
      <Accumulate
        t={t}
        samples={turning ? 12 : 1}
        shutter={0.5}
        render={(tt) => {
          // Starts a quarter turn back, lands in the canonical orientation.
          const a = -90 + 90 * ease.turn(progress(tt, TURN_START, TURN_END));
          return (
            <AbsoluteFill style={{background: COLORS.coral}}>
              <AbsoluteFill style={{opacity: glow, background: HERO_GLOW}} />
              {sweep > 0 ? (
                <svg
                  width={HERO}
                  height={HERO}
                  viewBox="0 0 100 100"
                  style={{
                    position: 'absolute',
                    left: cx - HERO / 2,
                    top: cy - HERO / 2,
                    overflow: 'visible',
                    filter: `drop-shadow(0 26px 34px rgba(120, 22, 10, ${(0.3 * glow).toFixed(3)}))`,
                  }}
                >
                  <g transform={`translate(50 50) rotate(${a}) scale(${grow}) translate(-50 -50)`}>
                    <MarkShapes field={COLORS.bone} point={COLORS.ink} sweep={sweep} pointScale={point} />
                  </g>
                </svg>
              ) : null}
            </AbsoluteFill>
          );
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 40,
          bottom: 38,
          fontFamily: FONT,
          color: COLORS.ink,
          opacity: label,
          transform: `translateY(${Math.round((1 - label) * 12)}px)`,
        }}
      >
        <div style={{fontSize: 24, fontWeight: 620, letterSpacing: '-0.01em', lineHeight: 1.15}}>The Point</div>
        <div style={{fontSize: 17, fontWeight: 460, opacity: 0.68, marginTop: 6, lineHeight: 1.2}}>Primary mark</div>
      </div>
    </Panel>
  );
};

// ---------------------------------------------------------------------------
// B: coast photo with caption, push-in
// ---------------------------------------------------------------------------
const PhotoPanel: React.FC<{t: number}> = ({t}) => {
  const p = PANELS.B;
  const start = REVEAL.B;
  const open = bezier(0.6, 0, 0.18, 1)(progress(t, start, start + 36));
  const radius = open * Math.hypot(p.w / 2, p.h / 2) + 1;
  // Monotonic push-in: quick start as the aperture opens, still creeping at the last frame.
  const pu = progress(t, start, 336);
  const push = 0.7 * (1 - (1 - pu) ** 2.2) + 0.3 * pu;
  const scale = lerp(1.02, 1.16, push);
  const l1 = ease.out(progress(t, start + 26, start + 52));
  const l2 = ease.out(progress(t, start + 34, start + 60));
  const scrim = ease.outSoft(progress(t, start + 16, start + 50));
  if (t < start) return null;
  return (
    <Panel k="B">
      <AbsoluteFill style={{clipPath: `circle(${radius.toFixed(2)}px at 50% 50%)`}}>
        <Img
          src={staticFile('assets/coast.jpg')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: '50% 58%',
            transform: `scale(${scale.toFixed(5)})`,
            transformOrigin: '52% 56%',
          }}
        />
        <AbsoluteFill
          style={{
            opacity: scrim,
            background:
              'linear-gradient(180deg, rgba(10,14,14,0) 50%, rgba(10,14,14,0.64) 100%), radial-gradient(120% 95% at 50% 40%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.22) 100%)',
          }}
        />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 36, bottom: 32, fontFamily: FONT, color: '#FFFFFF'}}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            opacity: 0.82 * l1,
            transform: `translateY(${Math.round((1 - l1) * 14)}px)`,
          }}
        >
          Field Notes — 03
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 520,
            letterSpacing: '-0.015em',
            marginTop: 10,
            opacity: l2,
            transform: `translateY(${Math.round((1 - l2) * 16)}px)`,
          }}
        >
          Open water, first light.
        </div>
      </div>
    </Panel>
  );
};

// ---------------------------------------------------------------------------
// E: three labeled colour bands
// ---------------------------------------------------------------------------
const BANDS = [
  {name: 'Coral', hex: '#FF5B45', fill: COLORS.coral, text: COLORS.ink, w: 227},
  {name: 'Lake', hex: '#1D625D', fill: COLORS.lake, text: COLORS.bone, w: 227},
  {name: 'Bone', hex: '#F4F0E8', fill: COLORS.bone, text: COLORS.ink, w: 226},
];

const BandsPanel: React.FC<{t: number}> = ({t}) => {
  const p = PANELS.E;
  let left = 0;
  return (
    <Panel k="E">
      {BANDS.map((b, i) => {
        const s = REVEAL.E + i * 8;
        const wipe = bezier(0.7, 0, 0.2, 1)(progress(t, s, s + 26));
        const lab = ease.out(progress(t, s + 14, s + 38));
        const x = left;
        left += b.w;
        if (wipe <= 0) return null;
        return (
          <div
            key={b.name}
            style={{
              position: 'absolute',
              left: x,
              top: 0,
              width: b.w,
              height: p.h,
              background: b.fill,
              clipPath: `inset(${((1 - wipe) * 100).toFixed(3)}% 0 0 0)`,
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 24,
                bottom: 22,
                fontFamily: FONT,
                color: b.text,
                opacity: lab,
                transform: `translateY(${Math.round((1 - lab) * 12)}px)`,
              }}
            >
              <div style={{fontSize: 26, fontWeight: 620, letterSpacing: '-0.01em', lineHeight: 1.1}}>{b.name}</div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 500,
                  letterSpacing: '0.06em',
                  marginTop: 6,
                  opacity: 0.72,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {b.hex}
              </div>
            </div>
            <div
              style={{
                position: 'absolute',
                left: 24,
                top: 22,
                fontFamily: FONT,
                fontSize: 15,
                fontWeight: 540,
                letterSpacing: '0.08em',
                color: b.text,
                opacity: 0.55 * lab,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              0{i + 1}
            </div>
          </div>
        );
      })}
    </Panel>
  );
};

// ---------------------------------------------------------------------------
// D: dark wordmark + tagline
// ---------------------------------------------------------------------------
const WORD = 'FIELD';

const WordmarkPanel: React.FC<{t: number}> = ({t}) => {
  const start = REVEAL.D;
  const meta = ease.out(progress(t, start + 10, start + 36));
  const line1 = ease.out(progress(t, start + 22, start + 48));
  const line2 = ease.out(progress(t, start + 32, start + 58));
  const iconSweep = bezier(0.55, 0, 0.2, 1)(progress(t, start + 8, start + 32));
  const iconPoint = ease.outBack(progress(t, start + 20, start + 38));
  return (
    <Panel k="D">
      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding: '40px 44px 44px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontFamily: FONT,
          color: COLORS.bone,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: meta}}>
          <svg width={30} height={30} viewBox="0 0 100 100">
            <MarkShapes field={COLORS.bone} point={COLORS.coral} sweep={iconSweep} pointScale={iconPoint} />
          </svg>
          <div
            style={{
              fontSize: 15,
              fontWeight: 560,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              opacity: 0.56,
            }}
          >
            Brand System — 2026
          </div>
        </div>
        <div>
          <div style={{display: 'flex', fontSize: 168, fontWeight: 720, letterSpacing: '-0.055em', lineHeight: 1}}>
            {WORD.split('').map((ch, i) => {
              const u = bezier(0.2, 0.9, 0.25, 1)(progress(t, start + i * 3, start + i * 3 + 30));
              return (
                <span key={i} style={{display: 'inline-block', overflow: 'hidden', paddingTop: 6, marginTop: -6}}>
                  <span
                    style={{
                      display: 'inline-block',
                      transform: `translateY(${((1 - u) * 105).toFixed(2)}%)`,
                    }}
                  >
                    {ch}
                  </span>
                </span>
              );
            })}
          </div>
          <div style={{marginTop: 26, fontSize: 34, fontWeight: 460, letterSpacing: '-0.015em', lineHeight: 1.22}}>
            <div style={{opacity: line1, transform: `translateY(${Math.round((1 - line1) * 18)}px)`}}>Five points.</div>
            <div style={{opacity: 0.6 * line2, transform: `translateY(${Math.round((1 - line2) * 18)}px)`}}>
              One open field.
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
};

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------
export const BrandDots: React.FC = () => {
  useGeist();
  const t = useCurrentFrame();
  const contents = t >= MORPH_END;
  return (
    <AbsoluteFill style={{background: COLORS.bg}}>
      <MorphLayer t={t} />
      {contents ? (
        <>
          <PatternPanel t={t} />
          <HeroPanel t={t} />
          <PhotoPanel t={t} />
          <BandsPanel t={t} />
          <WordmarkPanel t={t} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

