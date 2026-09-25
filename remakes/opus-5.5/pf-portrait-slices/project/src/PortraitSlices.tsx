import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ensureFont, FONT_FAMILY} from './font';
import {Grain} from './Grain';

ensureFont();

// ---------------------------------------------------------------------------
// Canvas + source constants
// ---------------------------------------------------------------------------
const W = 1080;
const H = 1920;
const STRIP_H = 480; // four fixed 1080x480 windows tile the 9:16 frame exactly
const IMG_W = 1024;
const IMG_H = 1536;

const SRC = {
  wide: staticFile('assets/editorial-sunset-wide.png'),
  turn: staticFile('assets/editorial-sunset-turn.png'),
  macro: staticFile('assets/editorial-sunset-macro.png'),
};

const INK = '#F5EDE4';
const INK_SOFT = 'rgba(245, 237, 228, 0.74)';
const BG = '#0B0806';

// ---------------------------------------------------------------------------
// Timing (seconds)
// ---------------------------------------------------------------------------
const ENTRY_STARTS = [0.6, 0.7, 0.8, 0.9]; // last strip lands at 1.3s
const ENTRY_DUR = 0.4;
const EXP_START = 1.6;
const EXP_END = 2.22;
const SHUTTER = 0.5 / 60; // 180deg shutter at 60fps

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const entryEase = Easing.bezier(0.16, 1, 0.3, 1);
const expandEase = Easing.bezier(0.72, 0, 0.14, 1);
const pushEase = Easing.bezier(0.42, 0, 0.72, 1);
const textEase = Easing.bezier(0.16, 1, 0.3, 1);

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const range = (t: number, a: number, b: number, ease?: (x: number) => number) =>
  interpolate(t, [a, b], [0, 1], {...CLAMP, easing: ease});

// ---------------------------------------------------------------------------
// Strip crops. Image placement is in window-local px: scale, left, top.
// ---------------------------------------------------------------------------
type StripDef = {
  src: string;
  from: 1 | -1; // -1 enters from the left, 1 from the right
  s: number;
  left: number;
  top: number;
  index: string;
  label: string;
};

const STRIPS: StripDef[] = [
  // turn: hair + glasses
  {src: SRC.turn, from: -1, s: 1.26, left: -14, top: -176, index: '01', label: 'Hair / Frame'},
  // macro: eye + upper lens (same image that later fills the frame)
  {src: SRC.macro, from: 1, s: 1.12, left: -40, top: 32 - STRIP_H, index: '02', label: 'Eye / Lens'},
  // wide: shoulder + chain
  {src: SRC.wide, from: -1, s: 1.6, left: -420, top: -720, index: '03', label: 'Shoulder / Chain'},
  // turn: profile (nose, lips, jaw)
  {src: SRC.turn, from: 1, s: 1.45, left: -217, top: -725, index: '04', label: 'Profile'},
];

// Macro full-frame cover crop at the end of the expansion, and its push-in anchor.
const MACRO_FULL = {s: 1.25, left: -100, top: 0};
const PUSH_ANCHOR = {x: 500, y: 712};

type Geo = {
  x: number;
  y: number;
  h: number;
  scale: number;
  origin: string;
  bright: number;
  img: {s: number; left: number; top: number};
};

const expandP = (t: number) => range(t, EXP_START, EXP_END, expandEase);
const pushK = (t: number) => lerp(1, 1.07, range(t, 1.95, 4.6, pushEase));

const stripGeo = (i: number, t: number): Geo => {
  const def = STRIPS[i];
  const start = ENTRY_STARTS[i];
  const p = range(t, start, start + ENTRY_DUR, entryEase);
  const x = def.from * W * (1 - p);
  // Content lags the window slightly (parallax), then keeps drifting while it rests.
  const drift = -def.from * 18 * Math.max(0, t - start - ENTRY_DUR);
  const e = expandP(t);

  if (i === 1) {
    const winTop = STRIP_H * (1 - e);
    const winH = STRIP_H + (H - STRIP_H) * e;
    // Interpolate the macro crop in frame space (strip crop -> full-frame cover).
    const s0 = def.s;
    const left0 = def.left + x * -0.22 + drift * (1 - e);
    const top0 = STRIP_H + def.top;
    let s = lerp(s0, MACRO_FULL.s, e);
    let left = lerp(left0, MACRO_FULL.left, e);
    let top = lerp(top0, MACRO_FULL.top, e);
    const k = pushK(t);
    s *= k;
    left = PUSH_ANCHOR.x + (left - PUSH_ANCHOR.x) * k;
    top = PUSH_ANCHOR.y + (top - PUSH_ANCHOR.y) * k;
    return {
      x: x,
      y: winTop,
      h: winH,
      scale: 1,
      origin: '50% 50%',
      bright: 1,
      img: {s, left: left - x, top: top - winTop},
    };
  }

  // Retreating strips: pushed away by the expanding window, receding in depth.
  const winTop = STRIP_H * (1 - e);
  const winBottom = winTop + STRIP_H + (H - STRIP_H) * e;
  const scale = 1 - 0.085 * e;
  const gap = 34 * e;
  const back = def.from * 46 * e;
  let y = i * STRIP_H;
  let origin = '50% 50%';
  if (i === 0) {
    y = winTop - gap - STRIP_H;
    origin = '50% 100%';
  } else if (i === 2) {
    y = winBottom + gap;
    origin = '50% 0%';
  } else if (i === 3) {
    y = winBottom + gap + STRIP_H * scale + gap * 0.6;
    origin = '50% 0%';
  }
  return {
    x: x + back,
    y,
    h: STRIP_H,
    scale,
    origin,
    bright: 1 - 0.72 * e,
    img: {s: def.s, left: def.left + x * -0.22 + drift, top: def.top},
  };
};

// ---------------------------------------------------------------------------
// Directional motion blur via per-element SVG gaussian filter (x/y separable).
// ---------------------------------------------------------------------------
const BlurDefs: React.FC<{id: string; sx: number; sy: number}> = ({id, sx, sy}) => (
  <svg width={0} height={0} style={{position: 'absolute'}} aria-hidden>
    <defs>
      <filter id={id} x="-12%" y="-12%" width="124%" height="124%" colorInterpolationFilters="sRGB">
        <feGaussianBlur stdDeviation={`${sx.toFixed(2)} ${sy.toFixed(2)}`} />
      </filter>
    </defs>
  </svg>
);

const blurFor = (d: number, k = 0.42) => Math.min(44, Math.abs(d) * k);

const Photo: React.FC<{src: string; s: number; left: number; top: number; filter?: string}> = ({
  src,
  s,
  left,
  top,
  filter,
}) => (
  <Img
    src={src}
    style={{
      position: 'absolute',
      left: 0,
      top: 0,
      width: IMG_W,
      height: IMG_H,
      transformOrigin: '0 0',
      transform: `translate3d(${left}px, ${top}px, 0) scale(${s})`,
      filter,
      willChange: 'transform',
    }}
  />
);

const Strip: React.FC<{i: number; t: number}> = ({i, t}) => {
  const def = STRIPS[i];
  const g = stripGeo(i, t);
  const prev = stripGeo(i, t - SHUTTER);
  const sx = blurFor(g.x - prev.x);
  const sy = i === 1 ? 0 : blurFor(g.y - prev.y, 0.3);
  const blurred = sx > 0.3 || sy > 0.3;
  const id = `mb-strip-${i}`;
  const e = expandP(t);
  const start = ENTRY_STARTS[i];
  const onStage = t >= start - 0.001;
  if (!onStage) return null;
  const shadowA = i === 1 ? lerp(0.4, 0.62, Math.min(1, e * 3)) : 0.42 * (1 - e * 0.5);

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: W,
        height: g.h,
        transform: `translate3d(${g.x}px, ${g.y}px, 0) scale(${g.scale})`,
        transformOrigin: g.origin,
        zIndex: i === 1 ? 10 : i + 1,
        boxShadow: `0 0 ${i === 1 ? 90 + 40 * e : 70}px ${i === 1 ? 10 : 0}px rgba(0,0,0,${shadowA})`,
      }}
    >
      {blurred ? <BlurDefs id={id} sx={sx} sy={sy} /> : null}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          background: BG,
          filter: blurred ? `url(#${id})` : undefined,
        }}
      >
        <Photo src={def.src} s={g.img.s} left={g.img.left} top={g.img.top} />
        {/* depth: dim as the strip recedes */}
        <div style={{position: 'absolute', inset: 0, background: '#000', opacity: 1 - g.bright}} />
        {/* soft inner edge so seams read as separate panes */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            boxShadow: 'inset 0 1px 0 rgba(255,236,220,0.10), inset 0 -24px 40px -28px rgba(0,0,0,0.55)',
          }}
        />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Type
// ---------------------------------------------------------------------------
const cornerStyle: React.CSSProperties = {
  position: 'absolute',
  top: 72,
  fontFamily: FONT_FAMILY,
  fontSize: 22,
  fontWeight: 560,
  letterSpacing: '0.24em',
  textTransform: 'uppercase',
  color: INK,
  textShadow: '0 1px 14px rgba(0,0,0,0.35)',
  lineHeight: 1,
};

const CornerType: React.FC = () => (
  <>
    <div style={{...cornerStyle, left: 64}}>After Hours</div>
    <div style={{...cornerStyle, right: 64 - 5 /* compensate trailing tracking */}}>Sera</div>
  </>
);

const RevealLine: React.FC<{t: number; start: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  t,
  start,
  children,
  style,
}) => {
  const p = range(t, start, start + 0.75, textEase);
  const y = (1 - p) * 105;
  return (
    <div style={{overflow: 'hidden', paddingBottom: 10, marginBottom: -10}}>
      <div style={{transform: p >= 0.999 ? undefined : `translate3d(0, ${y}%, 0)`, ...style}}>{children}</div>
    </div>
  );
};

const FinalCopy: React.FC<{t: number}> = ({t}) => {
  const labelP = range(t, 2.1, 2.6, textEase);
  const ruleP = range(t, 2.38, 3.0, textEase);
  const urlP = range(t, 2.5, 3.0, textEase);
  const fade = (p: number, dy: number): React.CSSProperties => ({
    opacity: p,
    transform: p >= 0.999 ? undefined : `translate3d(0, ${(1 - p) * dy}px, 0)`,
  });
  return (
    <div
      style={{
        position: 'absolute',
        left: 64,
        right: 64,
        bottom: 84,
        fontFamily: FONT_FAMILY,
        color: INK,
      }}
    >
      <div
        style={{
          fontSize: 20,
          fontWeight: 520,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: INK_SOFT,
          marginBottom: 26,
          ...fade(labelP, 14),
        }}
      >
        AW26 Collection&nbsp;&nbsp;·&nbsp;&nbsp;The Sunset Edit
      </div>
      <div style={{fontSize: 84, fontWeight: 480, letterSpacing: '-0.035em', lineHeight: 1.0}}>
        <RevealLine t={t} start={2.18}>
          A closer
        </RevealLine>
        <RevealLine t={t} start={2.27}>
          point of view.
        </RevealLine>
      </div>
      <div
        style={{
          marginTop: 40,
          height: 1,
          background: 'rgba(245,237,228,0.42)',
          transformOrigin: '0 50%',
          transform: `scaleX(${ruleP})`,
        }}
      />
      <div
        style={{
          marginTop: 22,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          fontSize: 22,
          fontWeight: 480,
          letterSpacing: '0.02em',
          ...fade(urlP, 12),
        }}
      >
        <span>sera.studio/after-hours</span>
        <span style={{color: INK_SOFT, letterSpacing: '0.16em', fontVariantNumeric: 'tabular-nums'}}>02 / 04</span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------
export const PortraitSlices: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  // Opening wide: slow push, then dims/recedes as the windows cover it.
  const wideK = lerp(1, 1.06, range(t, 0, 1.6, Easing.bezier(0.3, 0, 0.6, 1)));
  const wideDim = range(t, 0.6, 1.3, Easing.bezier(0.4, 0, 0.6, 1));
  const wideVisible = t < ENTRY_STARTS[3] + ENTRY_DUR + 0.05;
  const wideBase = {s: 1.25, left: -110, top: 0};
  const wa = {x: 540, y: 760};
  const wide = {
    s: wideBase.s * wideK,
    left: wa.x + (wideBase.left - wa.x) * wideK,
    top: wa.y + (wideBase.top - wa.y) * wideK,
  };

  const scrim = range(t, 1.95, 2.6, Easing.bezier(0.4, 0, 0.6, 1));

  return (
    <AbsoluteFill style={{backgroundColor: BG, overflow: 'hidden'}}>
      {wideVisible ? (
        <AbsoluteFill>
          <Photo
            src={SRC.wide}
            s={wide.s}
            left={wide.left}
            top={wide.top}
            filter={wideDim > 0.01 ? `blur(${(7 * wideDim).toFixed(2)}px)` : undefined}
          />
          <AbsoluteFill style={{background: '#000', opacity: 0.62 * wideDim}} />
        </AbsoluteFill>
      ) : null}

      {[0, 2, 3, 1].map((i) => (
        <Strip key={i} i={i} t={t} />
      ))}

      {/* grade + vignette */}
      <AbsoluteFill
        style={{
          zIndex: 20,
          background:
            'radial-gradient(120% 80% at 50% 45%, rgba(0,0,0,0) 55%, rgba(8,4,2,0.34) 100%)',
          pointerEvents: 'none',
        }}
      />
      <Grain opacity={0.09} zIndex={22} />
      {/* top scrim for corner type */}
      <AbsoluteFill
        style={{
          zIndex: 21,
          background: 'linear-gradient(180deg, rgba(10,6,4,0.42) 0px, rgba(10,6,4,0) 260px)',
        }}
      />
      {/* bottom scrim for final copy */}
      <AbsoluteFill
        style={{
          zIndex: 21,
          opacity: scrim,
          background:
            'linear-gradient(180deg, rgba(12,7,4,0) 1280px, rgba(12,7,4,0.5) 1560px, rgba(12,7,4,0.82) 1920px)',
        }}
      />
      <AbsoluteFill style={{zIndex: 30}}>
        <CornerType />
        <FinalCopy t={t} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
