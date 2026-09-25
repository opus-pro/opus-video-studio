import {Easing, interpolate} from 'remotion';

export type Rect = {x: number; y: number; w: number; h: number};
export type RGB = [number, number, number];

export const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Easing vocabulary
export const EIO = Easing.bezier(0.65, 0, 0.35, 1);
export const EOUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EIN = Easing.bezier(0.55, 0, 0.85, 0.35);
export const ESM = Easing.bezier(0.45, 0, 0.15, 1);
export const ESNAP = Easing.bezier(0.72, 0, 0.18, 1);

export const prog = (f: number, a: number, b: number, e: (t: number) => number = EIO) =>
  e(clamp01((f - a) / (b - a)));

export const interp = (
  f: number,
  input: number[],
  output: number[],
  easing?: (t: number) => number,
) =>
  interpolate(f, input, output, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

export const mixRect = (a: Rect, b: Rect, t: number): Rect => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
});

export const padRect = (r: Rect, p: number): Rect => ({x: r.x - p, y: r.y - p, w: r.w + 2 * p, h: r.h + 2 * p});

export const shiftRect = (r: Rect, dx: number, dy: number): Rect => ({...r, x: r.x + dx, y: r.y + dy});

export const scaleRect = (r: Rect, s: number, cx = r.x + r.w / 2, cy = r.y + r.h / 2): Rect => ({
  x: cx + (r.x - cx) * s,
  y: cy + (r.y - cy) * s,
  w: r.w * s,
  h: r.h * s,
});

export const rectSpeed = (a: Rect, b: Rect) =>
  Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.w - b.w) + Math.abs(a.h - b.h);

export const mixRgb = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
export const rgb = (c: RGB, a = 1) => `rgba(${c[0].toFixed(0)},${c[1].toFixed(0)},${c[2].toFixed(0)},${a})`;

export const blurCss = (px: number) => (px > 0.05 ? `blur(${px.toFixed(2)}px)` : undefined);

// 0 -> 1 -> 0 bump over [a, b]
export const bump = (f: number, a: number, b: number) => {
  const t = clamp01((f - a) / (b - a));
  return Math.sin(t * Math.PI);
};
