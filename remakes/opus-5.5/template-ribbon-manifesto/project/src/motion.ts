import {Easing} from 'remotion';

// E: confident ease-out (between cubic and quart). Used for entrances, crop and the text-train brake.
export const E = Easing.bezier(0.3, 1, 0.6, 1);
// S: smooth symmetric in-out (cubic-like). Used for re-orientation and exits.
export const S = Easing.bezier(0.65, 0, 0.35, 1);

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Normalised progress of `frame` through [start, start + duration]. */
export const progress = (frame: number, start: number, duration: number) =>
  clamp01((frame - start) / duration);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Integral of the E-based velocity profile v(p) = 1 - E(p) from p to 1.
 * Multiplying by (speed * durationInFrames) gives the distance a text train
 * still travels once the brake has reached progress p. Deterministic Simpson rule.
 */
const brakeCache = new Map<number, number>();
export const brakeTail = (p: number): number => {
  const pc = clamp01(p);
  if (pc >= 1) return 0;
  const key = Math.round(pc * 1e6);
  const hit = brakeCache.get(key);
  if (hit !== undefined) return hit;
  const n = 400; // even
  const h = (1 - pc) / n;
  let sum = 0;
  for (let i = 0; i <= n; i++) {
    const q = pc + i * h;
    const w = i === 0 || i === n ? 1 : i % 2 === 1 ? 4 : 2;
    sum += w * (1 - E(q));
  }
  const value = (sum * h) / 3;
  brakeCache.set(key, value);
  return value;
};
