// Deterministic, fractional-frame-safe motion helpers.
// Everything here is a pure function of time so we can sample sub-frames for motion blur.

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Normalised progress of `f` through [start, end], clamped to 0..1. */
export const progress = (f: number, start: number, end: number) => clamp01((f - start) / (end - start));

// Cubic-bezier solver (same maths as CSS timing functions).
export const bezier = (x1: number, y1: number, x2: number, y2: number) => {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  const solve = (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const err = sampleX(t) - x;
      const d = sampleDX(t);
      if (Math.abs(err) < 1e-6) return t;
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    let lo = 0;
    let hi = 1;
    t = x;
    for (let i = 0; i < 30; i++) {
      const v = sampleX(t);
      if (Math.abs(v - x) < 1e-6) return t;
      if (x > v) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return t;
  };
  return (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : sampleY(solve(x)));
};

export const easeOut = bezier(0.22, 1, 0.36, 1); // soft "expo-ish" settle
export const easeInOut = bezier(0.65, 0, 0.35, 1);
export const easeOutSoft = bezier(0.16, 1, 0.3, 1);

/** Eased 0..1 over a frame window. */
export const ease = (f: number, start: number, end: number, fn: (x: number) => number = easeOut) =>
  fn(progress(f, start, end));

/** Analytic under-damped spring step response. t in seconds; returns 0 before t=0. */
export const spring = (t: number, zeta = 0.74, omega = 8.4) => {
  if (t <= 0) return 0;
  const wd = omega * Math.sqrt(1 - zeta * zeta);
  const decay = Math.exp(-zeta * omega * t);
  return 1 - decay * (Math.cos(wd * t) + ((zeta * omega) / wd) * Math.sin(wd * t));
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type RGB = [number, number, number];
const hex = (h: string): RGB => {
  const n = parseInt(h.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
export const mix = (a: string, b: string, t: number, alpha = 1) => {
  const ca = hex(a);
  const cb = hex(b);
  const c = ca.map((v, i) => Math.round(lerp(v, cb[i], clamp01(t))));
  return `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
};
