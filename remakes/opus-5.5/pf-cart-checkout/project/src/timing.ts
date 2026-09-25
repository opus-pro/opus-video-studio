import {Easing, interpolate} from 'remotion';

export const FPS = 60;
export const sec = (s: number) => Math.round(s * FPS);

// Spec beats (frames @ 60 fps)
export const T = {
  enterEnd: sec(0.55), // 33 — product + title settled
  cursorIn: 34,
  pressStart: sec(1.1), // 66
  pressEnd: sec(1.35), // 81
  morphEnd: sec(2.05), // 123
  returnStart: sec(3.1), // 186
  returnEnd: sec(3.8), // 228
};

export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1), // expo-ish out
  outSoft: Easing.bezier(0.22, 1, 0.36, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  inOutSoft: Easing.bezier(0.45, 0, 0.25, 1),
  in: Easing.bezier(0.5, 0, 0.75, 0),
};

/** Clamped tween with easing. */
export const tw = (
  f: number,
  from: number,
  to: number,
  a: number,
  b: number,
  easing: (t: number) => number = ease.inOut,
) => interpolate(f, [from, to], [a, b], {easing, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

export const progress = (f: number, from: number, to: number, easing: (t: number) => number = ease.inOut) =>
  tw(f, from, to, 0, 1, easing);

/**
 * 0 -> peak -> 1 with C1 continuity: ease-out to `peak` at `split`, then ease-in-out back to 1.
 * Overshoot is exactly (peak - 1) * travel, so it can be budgeted in px.
 */
export const overshoot = (t: number, peak: number, split = 0.52) => {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  if (t < split) return peak * Easing.bezier(0.2, 0.7, 0.35, 1)(t / split);
  const u = (t - split) / (1 - split);
  return peak + (1 - peak) * Easing.bezier(0.45, 0, 0.35, 1)(u);
};
