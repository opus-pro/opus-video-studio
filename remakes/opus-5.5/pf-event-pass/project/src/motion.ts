import {Easing} from 'remotion';

export const FPS = 60;
export const sec = (s: number) => s * FPS;

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const progress = (frame: number, start: number, duration: number) => clamp01((frame - start) / duration);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Curves
export const easeOutExpo = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOutQuart = Easing.bezier(0.76, 0, 0.24, 1);
export const easeSwap = Easing.bezier(0.7, 0, 0.18, 1);
export const easeDock = Easing.bezier(0.5, 0, 0.15, 1);
export const easeGrow = Easing.bezier(0.3, 0.55, 0.1, 1);
export const easeOutQuint = Easing.bezier(0.22, 1, 0.36, 1);
export const easeOutCubic = Easing.bezier(0.33, 1, 0.68, 1);

/**
 * Damped settle: 0 -> 1 with one soft overshoot, lands on exactly 1 at t = 1
 * (so anything driven by it is perfectly still afterwards).
 */
export const settle = (t: number, damping = 4, cycles = 1.5) => {
  const x = clamp01(t);
  return 1 - (1 - x) * Math.exp(-damping * x) * Math.cos(cycles * 2 * Math.PI * x);
};

/**
 * Normalised speed (0..1) of an easing curve at t, used to drive velocity blur.
 */
export const makeSpeed = (fn: (t: number) => number) => {
  const h = 0.002;
  const d = (t: number) => Math.abs(fn(Math.min(1, t + h)) - fn(Math.max(0, t - h))) / (Math.min(1, t + h) - Math.max(0, t - h));
  let peak = 0;
  for (let i = 0; i <= 500; i++) peak = Math.max(peak, d(i / 500));
  return (t: number) => (t <= 0 || t >= 1 ? 0 : d(t) / peak);
};
