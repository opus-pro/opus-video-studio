import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {INK, POSTERS} from './data';
import {FONT_STACK, useGeist} from './font';
import {blurAt, groupSlots, HERO_SCALE, SIDE_SCALE, SLOT} from './motion';
import {Poster, POSTER_H, POSTER_W} from './Poster';

const W = 1200;
const H = 1200;
const CX = W / 2;
const CY = H / 2;
const STAGE = '#0B0B0D';

const hexToRgb = (hex: string) => {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255] as const;
};
const mixHex = (a: string, b: string, t: number) => {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return A.map((c, i) => Math.round(c + (B[i] - c) * t)) as unknown as [number, number, number];
};

/** Stage tint follows the group position continuously. */
const glowAt = (slots: number) => {
  const i = Math.min(POSTERS.length - 2, Math.floor(slots));
  return mixHex(POSTERS[i].deep, POSTERS[i + 1].deep, Math.min(1, Math.max(0, slots - i)));
};

const MotionBlurDefs: React.FC<{blur: number}> = ({blur}) => (
  <svg width={0} height={0} style={{position: 'absolute'}} aria-hidden>
    <defs>
      <filter id="relay-mb" x="-20%" y="-30%" width="140%" height="160%" colorInterpolationFilters="sRGB">
        <feGaussianBlur stdDeviation={`0 ${blur.toFixed(3)}`} edgeMode="none" />
      </filter>
    </defs>
  </svg>
);

const smallCaps: React.CSSProperties = {
  fontSize: 12.5,
  fontWeight: 560,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  lineHeight: '16px',
};

const DIGIT_H = 140; // line box; the ~92px numeral is centred in it
const DIGIT_TRAVEL = 32; // short relay: outgoing numeral slides down + fades, incoming drops in from above

const Counter: React.FC<{slots: number}> = ({slots}) => (
  <div style={{position: 'absolute', left: 100, top: CY - 90, width: 180, color: INK}}>
    <div style={{...smallCaps, opacity: 0.5}}>Portfolio</div>
    <div style={{position: 'relative', marginTop: 4, height: DIGIT_H}}>
      {POSTERS.map((_, k) => {
        const d = slots - k; // >0: already passed (below), <0: still to come (above)
        // Hand-off, not a cross-fade: the outgoing numeral clears in the first 30% of the eased
        // move, the incoming one resolves over the rest, so two numerals never stack.
        const opacity = d >= 0 ? Math.max(0, 1 - d / 0.3) : Math.max(0, 1 - -d / 0.7);
        if (opacity <= 0) return null;
        return (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: -6,
              top: 0,
              height: DIGIT_H,
              fontSize: 120,
              lineHeight: `${DIGIT_H}px`,
              fontWeight: 480,
              letterSpacing: '-0.05em',
              opacity,
              transform: `translateY(${d * DIGIT_TRAVEL}px)`,
            }}
          >
            {String(k + 1).padStart(2, '0')}
          </div>
        );
      })}
    </div>
    <div style={{...smallCaps, marginTop: 4, opacity: 0.5}}>of {String(POSTERS.length).padStart(2, '0')}</div>
  </div>
);

const ROW_H = 30;
const Index: React.FC<{slots: number}> = ({slots}) => {
  const listTop = 28;
  return (
    <div style={{position: 'absolute', left: 952, top: CY - (listTop + ROW_H * POSTERS.length) / 2, width: 160, color: INK}}>
      <div style={{...smallCaps, opacity: 0.5}}>Index</div>
      <div style={{position: 'relative', marginTop: listTop - 16}}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: slots * ROW_H + ROW_H / 2 - 1,
            width: 16,
            height: 2,
            borderRadius: 1,
            backgroundColor: INK,
          }}
        />
        {POSTERS.map((p, k) => {
          const on = Math.max(0, 1 - Math.abs(slots - k));
          return (
            <div
              key={k}
              style={{
                position: 'absolute',
                left: 28,
                top: k * ROW_H,
                height: ROW_H,
                lineHeight: `${ROW_H}px`,
                fontSize: 15,
                fontWeight: 500,
                letterSpacing: '-0.005em',
                whiteSpace: 'nowrap',
                opacity: 0.32 + 0.68 * on,
                fontFeatureSettings: '"tnum" 1',
              }}
            >
              <span style={{opacity: 0.6, marginRight: 10}}>{String(k + 1).padStart(2, '0')}</span>
              {p.kicker}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const VerticalRelay: React.FC = () => {
  useGeist();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const slots = groupSlots(t);
  const blur = blurAt(t);
  const [gr, gg, gb] = glowAt(slots);

  return (
    <AbsoluteFill style={{backgroundColor: STAGE, fontFamily: FONT_STACK, overflow: 'hidden'}}>
      {/* stage glow tinted by the active poster */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 640px 720px at ${CX}px ${CY}px, rgba(${gr},${gg},${gb},1) 0%, rgba(${gr},${gg},${gb},0.46) 48%, rgba(${gr},${gg},${gb},0) 100%)`,
        }}
      />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 900px 900px at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}} />

      <MotionBlurDefs blur={blur} />

      {POSTERS.map((p, i) => {
        const d = (slots - i) * SLOT; // signed distance of this card's center from the frame center
        const k = Math.min(1, Math.abs(d) / SLOT);
        if (Math.abs(d) > SLOT * 1.6) return null; // fully off-frame
        const scale = HERO_SCALE + (SIDE_SCALE - HERO_SCALE) * k;
        const cy = CY + d;
        return (
          <div
            key={p.image}
            style={{
              position: 'absolute',
              left: CX - POSTER_W / 2,
              top: cy - POSTER_H / 2,
              width: POSTER_W,
              height: POSTER_H,
              zIndex: Math.round(100 - k * 10),
              filter: blur > 0.01 ? 'url(#relay-mb)' : undefined,
            }}
          >
            <div style={{position: 'relative', width: POSTER_W, height: POSTER_H, transform: `scale(${scale})`, transformOrigin: '50% 50%'}}>
              <Poster data={p} index={i} total={POSTERS.length} />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 20,
                  backgroundColor: STAGE,
                  opacity: 0.46 * k,
                }}
              />
            </div>
          </div>
        );
      })}

      {/* frame-edge falloff so the peeking neighbours read as a continuing stack */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${STAGE} 0px, rgba(11,11,13,0) 150px, rgba(11,11,13,0) ${H - 150}px, ${STAGE} ${H}px)`,
          opacity: 0.7,
          zIndex: 200,
        }}
      />

      <div style={{position: 'absolute', inset: 0, zIndex: 300}}>
        <Counter slots={slots} />
        <Index slots={slots} />
      </div>
    </AbsoluteFill>
  );
};
