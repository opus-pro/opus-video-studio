import React from 'react';
import {Easing, interpolate} from 'remotion';
import {C, MONO} from './theme';

export const EXPO_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const QUART_OUT = Easing.bezier(0.25, 1, 0.5, 1);
export const IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const SNAP = Easing.bezier(0.8, 0, 0.1, 1);
export const EXPO_IN = Easing.bezier(0.7, 0, 0.84, 0);
export const BACK_OUT = Easing.bezier(0.34, 1.45, 0.64, 1);

export const tw = (f: number, a: number, b: number, from = 0, to = 1, ease: (t: number) => number = EXPO_OUT) =>
  interpolate(f, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const hex = (c: string) => {
  const h = c.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};
export const mix = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  const k = clamp01(t);
  const r = A.map((v, i) => Math.round(v + (B[i] - v) * k));
  return `rgb(${r[0]},${r[1]},${r[2]})`;
};
export const alpha = (c: string, a: number) => {
  const [r, g, b] = hex(c);
  return `rgba(${r},${g},${b},${a})`;
};

export const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export type Rect = {x: number; y: number; w: number; h: number; r: number};
export const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
  r: lerp(a.r, b.r, t),
});

/** Directional motion blur via an SVG gaussian filter. Crisp (no filter) when at rest. */
export const Blur: React.FC<{
  id: string;
  x?: number;
  y?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({id, x = 0, y = 0, style, children}) => {
  const bx = Math.min(Math.abs(x), 40);
  const by = Math.min(Math.abs(y), 40);
  if (bx < 0.25 && by < 0.25) return <div style={style}>{children}</div>;
  return (
    <>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <defs>
          <filter id={id} x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} />
          </filter>
        </defs>
      </svg>
      <div style={{...style, filter: `url(#${id})`}}>{children}</div>
    </>
  );
};

/** Velocity (px/frame) of a tweened value, for motion blur. */
export const vel = (fn: (f: number) => number, f: number) => fn(f) - fn(f - 1);

export const Panel: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({x, y, w, h, style, children}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: 10,
      background: `linear-gradient(180deg, ${C.panelHi} 0%, ${C.panel} 100%)`,
      boxShadow: `inset 0 0 0 1px ${C.line}, inset 0 1px 0 rgba(255,255,255,0.04), 0 18px 40px -18px rgba(0,0,0,0.8)`,
      overflow: 'hidden',
      ...style,
    }}
  >
    {children}
  </div>
);

export const Label: React.FC<{
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
  size?: number;
}> = ({children, color = C.mute, style, size = 10}) => (
  <div
    style={{
      fontFamily: MONO,
      fontSize: size,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </div>
);

export const fmt = (v: number, d = 0) =>
  v.toLocaleString('en-US', {minimumFractionDigits: d, maximumFractionDigits: d});
