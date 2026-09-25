import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {DECK, type Photo, type Poster} from './deck';
import {
  CARD_H,
  CARD_W,
  FOOTER_H,
  PIVOT_X,
  PIVOT_Y,
  RADIUS,
  SELECT_SCALE,
  STEP,
  YIELD,
  blurFor,
  fanState,
} from './motion';

// ---------------------------------------------------------------------------
// Font: Geist variable, loaded once before the first frame renders.
// ---------------------------------------------------------------------------
const FONT = 'GeistFan';
let fontPromise: Promise<void> | null = null;
const loadFont = () => {
  if (!fontPromise) {
    const face = new FontFace(FONT, `url(${staticFile('assets/GeistVF.woff2')}) format('woff2')`, {
      weight: '100 900',
      style: 'normal',
    });
    fontPromise = face.load().then((f) => {
      document.fonts.add(f);
    });
  }
  return fontPromise;
};

const useFont = () => {
  const [handle] = useState(() => delayRender('Geist font'));
  useEffect(() => {
    loadFont()
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
};

// ---------------------------------------------------------------------------
// Photo window with a gentle parallax against the card's travel.
// ---------------------------------------------------------------------------
const NATURAL: Record<Photo, [number, number]> = {
  coast: [1200, 800],
  desert: [1200, 795],
  forest: [1200, 800],
  mountains: [1200, 800],
};
const PHOTO_H = CARD_H - FOOTER_H; // 320

const PhotoWindow: React.FC<{p: Poster; angle: number}> = ({p, angle}) => {
  const [nw, nh] = NATURAL[p.photo];
  const k = Math.max(CARD_W / nw, PHOTO_H / nh) * p.zoom;
  const iw = nw * k;
  const ih = nh * k;
  const slackX = iw - CARD_W;
  const x = Math.min(0, Math.max(-slackX, -slackX * p.fx - angle * 0.45));
  const y = -(ih - PHOTO_H) * p.fy;
  return (
    <div style={{position: 'absolute', left: -1, top: -1, width: CARD_W + 2, height: PHOTO_H + 2, overflow: 'hidden'}}>
      <Img
        src={staticFile(`assets/${p.photo}.jpg`)}
        style={{position: 'absolute', left: 1, top: 1, width: iw, height: ih, transform: `translate(${x}px, ${y}px)`}}
      />
    </div>
  );
};

const Footer: React.FC<{p: Poster}> = ({p}) => (
  <div
    style={{
      position: 'absolute',
      left: -1,
      top: PHOTO_H,
      width: CARD_W + 2,
      height: FOOTER_H + 1,
      background: p.footer,
      color: p.ink,
      fontFamily: `${FONT}, sans-serif`,
      padding: '20px 25px 23px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}
  >
    <div
      style={{
        fontSize: 11,
        lineHeight: '14px',
        fontWeight: 560,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: p.sub,
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
      }}
    >
      No. {p.no}
      <span style={{opacity: 0.55, padding: '0 7px'}}>/</span>
      Field Series
    </div>
    <div>
      <div style={{fontSize: 36, lineHeight: '38px', fontWeight: 620, letterSpacing: '-0.035em', whiteSpace: 'nowrap'}}>{p.title}</div>
      <div style={{marginTop: 10, fontSize: 14, lineHeight: '18px', fontWeight: 480, letterSpacing: '-0.005em'}}>
        {p.place}
      </div>
      <div
        style={{
          marginTop: 3,
          fontSize: 12,
          lineHeight: '15px',
          fontWeight: 450,
          letterSpacing: '0.02em',
          color: p.sub,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {p.coords}
      </div>
    </div>
    {/* Arrow badge, bottom-right: balances the left-set type block. */}
    <svg
      width={30}
      height={30}
      viewBox="0 0 30 30"
      style={{position: 'absolute', right: 23, bottom: 23}}
    >
      <circle cx={15} cy={15} r={14.25} fill="none" stroke={p.sub} strokeWidth={1.5} />
      <path
        d="M11 19 L19 11 M12.5 11 H19 V17.5"
        fill="none"
        stroke={p.ink}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

// ---------------------------------------------------------------------------
// One card on the fan.
// ---------------------------------------------------------------------------
type Placed = {
  p: Poster;
  slotPos: number; // slot angle with the final 17deg spread (drives order + visibility)
  angle: number; // actual angle on the fan
  scale: number;
  opacity: number;
  blur: number;
  dim: number;
  lift: number; // 0..1, extra shadow depth for the selected card
  z: number;
};

const Card: React.FC<{c: Placed; opacity: number; shadowMul: number; filterId: string}> = ({
  c,
  opacity,
  shadowMul,
  filterId,
}) => {
  const rad = (c.angle * Math.PI) / 180;
  // Keep the light coming from straight above: counter-rotate the shadow offset.
  const sx = Math.sin(rad);
  const sy = Math.cos(rad);
  const near = 3 + 3 * c.lift;
  const far = 22 + 16 * c.lift;
  const farBlur = 46 + 20 * c.lift;
  const farAlpha = (0.26 + 0.1 * c.lift) * shadowMul;
  const boxShadow = shadowMul > 0.001
    ? `${(sx * near).toFixed(2)}px ${(sy * near).toFixed(2)}px ${8 + 4 * c.lift}px rgba(28, 22, 16, ${(0.16 * shadowMul).toFixed(3)}), ` +
      `${(sx * far).toFixed(2)}px ${(sy * far).toFixed(2)}px ${farBlur}px -12px rgba(28, 22, 16, ${farAlpha.toFixed(3)}), ` +
      `0 0 ${(30 * c.lift).toFixed(2)}px rgba(28, 22, 16, ${(0.14 * c.lift * shadowMul).toFixed(3)})`
    : 'none';
  return (
    <div
      style={{
        position: 'absolute',
        left: PIVOT_X - CARD_W / 2,
        top: PIVOT_Y - CARD_H / 2,
        width: CARD_W,
        height: CARD_H,
        borderRadius: 20,
        overflow: 'hidden',
        transform: `rotate(${c.angle.toFixed(4)}deg) translateY(${-RADIUS}px) scale(${c.scale.toFixed(5)})`,
        opacity,
        boxShadow,
        filter: c.blur > 0.02 ? `url(#${filterId})` : undefined,
      }}
    >
      <PhotoWindow p={c.p} angle={c.angle} />
      <Footer p={c.p} />
      {c.dim > 0.001 ? (
        <div style={{position: 'absolute', inset: 0, background: `rgba(14, 11, 8, ${c.dim.toFixed(3)})`}} />
      ) : null}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 20,
          boxShadow: 'inset 0 0 0 1px rgba(20, 14, 8, 0.07)',
        }}
      />
    </div>
  );
};

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const OrbitFan: React.FC = () => {
  useFont();
  const frame = useCurrentFrame();
  const st = fanState(frame);

  const placed: Placed[] = DECK.map((p) => {
    const slotPos = p.slot * STEP + st.offset;
    const selected = Math.abs(slotPos) < 0.5;
    const side = selected ? 0 : Math.sign(slotPos);
    const angle = p.slot * st.spread + st.offset + side * YIELD * st.sel;
    const speed = p.slot * st.spreadRate + st.offsetRate + side * YIELD * st.selRate;
    const opacity = clamp01((4 * STEP - Math.abs(slotPos)) / STEP);
    const depth = Math.min(1, Math.abs(angle) / (3 * STEP));
    return {
      p,
      slotPos,
      angle,
      scale: selected ? 1 + (SELECT_SCALE - 1) * st.sel : 1,
      opacity,
      blur: blurFor(speed),
      dim: 0.1 * depth * depth + (selected ? 0 : 0.13 * st.sel),
      lift: selected ? st.sel : 0,
      z: 0,
    };
  }).filter((c) => c.opacity > 0.001);

  // Held like a hand of cards: every card sits on top of its left neighbour. The
  // order never changes while the fan opens or rotates, so nothing pops.
  placed.sort((a, b) => a.p.slot - b.p.slot);
  placed.forEach((c, i) => (c.z = i + 1));

  // Selection lifts the hero above its right neighbour. A copy of the hero is laid
  // on top of the whole stack and revealed by a soft wipe that runs parallel to the
  // neighbour's inner edge. Where the copy is revealed it matches the hero pixel for
  // pixel, so the only visible change is the overlap: the neighbour's edge appears to
  // slide under the hero as it yields, instead of the stacking order popping.
  const hero = placed.find((c) => c.lift > 0);
  const neighbour = hero ? placed.find((c) => c.p.slot === hero.p.slot + 1) : undefined;
  const wt = Math.min(1, Math.max(0, st.sel / 0.7));
  const wipe = hero ? wt * wt * (3 - 2 * wt) : 0;
  let echoMask: string | undefined;
  if (hero && neighbour && wipe < 1) {
    const th = (neighbour.angle * Math.PI) / 180;
    const nx = Math.cos(th);
    const ny = Math.sin(th);
    // Inner (left) edge of the neighbour, through its mid-height.
    const cx = PIVOT_X + RADIUS * Math.sin(th);
    const cy = PIVOT_Y - RADIUS * Math.cos(th);
    const p0 = (cx - (CARD_W / 2) * nx) * nx + (cy - (CARD_W / 2) * ny) * ny;
    // Hero corners (hero sits at 0deg, scaled about its centre).
    const hx = PIVOT_X;
    const hy = PIVOT_Y - RADIUS;
    const hw = (CARD_W / 2) * hero.scale;
    const hh = (CARD_H / 2) * hero.scale;
    let far = -Infinity;
    for (const [dx, dy] of [[hw, hh], [hw, -hh], [-hw, hh], [-hw, -hh]]) {
      far = Math.max(far, (hx + dx) * nx + (hy + dy) * ny - p0);
    }
    const feather = 22;
    const e = wipe * (far + feather);
    const len = 1440 * Math.abs(nx) + 1080 * Math.abs(ny);
    const mid = 720 * nx + 540 * ny;
    const pos = (v: number) => (((v + p0 - mid) / len + 0.5) * 100).toFixed(3);
    echoMask = `linear-gradient(${(90 + neighbour.angle).toFixed(3)}deg, #000 ${pos(e - feather)}%, transparent ${pos(e)}%)`;
  }

  // Ground shadow grows with the fan and softens under the lifted hero card.
  const open = (st.spread - 4) / (STEP - 4);
  const groundW = 420 + 560 * open;
  const contactW = 300 + 60 * st.sel;

  return (
    <AbsoluteFill style={{background: '#EAE6DF'}}>
      <AbsoluteFill
        style={{background: 'radial-gradient(ellipse 70% 60% at 50% 46%, #F4F2EE 0%, rgba(244,242,238,0) 100%)'}}
      />
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <defs>
          {placed.map((c) => (
            <filter
              key={c.p.slot}
              id={`mb-${c.p.slot + 10}`}
              x="-30%"
              y="-30%"
              width="160%"
              height="160%"
              colorInterpolationFilters="sRGB"
            >
              {/* Tangential (card-local x) motion blur with a little spill across. */}
              <feGaussianBlur stdDeviation={`${c.blur.toFixed(3)} ${(c.blur * 0.22).toFixed(3)}`} />
            </filter>
          ))}
        </defs>
      </svg>

      {/* Faint ground shadow */}
      <div
        style={{
          position: 'absolute',
          left: 720 - groundW / 2,
          top: 868 - 44,
          width: groundW,
          height: 88,
          background: 'radial-gradient(closest-side, rgba(40, 30, 20, 0.13), rgba(40, 30, 20, 0))',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 720 - contactW / 2,
          top: 846 + 16 * st.sel - 18,
          width: contactW,
          height: 36,
          background: `radial-gradient(closest-side, rgba(40, 30, 20, ${(0.16 - 0.04 * st.sel).toFixed(3)}), rgba(40, 30, 20, 0))`,
        }}
      />

      {placed.map((c) => (
        <div key={c.p.slot} style={{position: 'absolute', inset: 0, zIndex: c.z}}>
          <Card
            c={c}
            opacity={c.opacity}
            shadowMul={c === hero ? 1 - wipe : 1}
            filterId={`mb-${c.p.slot + 10}`}
          />
        </div>
      ))}
      {hero ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: placed.length + 1,
            maskImage: echoMask,
            WebkitMaskImage: echoMask,
          }}
        >
          <Card c={hero} opacity={hero.opacity} shadowMul={wipe} filterId={`mb-${hero.p.slot + 10}`} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
