import {Easing} from 'remotion';

export const FPS = 60;
export const SLOT = 690; // vertical distance between card centers (px)
export const HERO_SCALE = 1;
export const SIDE_SCALE = 0.78;

/** Group moves down one slot during each window (seconds). */
export const MOVES: ReadonlyArray<readonly [number, number]> = [
  [0.9, 1.54],
  [2.05, 2.69],
  [3.2, 3.84],
];

export const ease = Easing.bezier(0.22, 0.85, 0.2, 1);

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Raw (linear) progress of a move window at time t (seconds). */
export const moveProgress = (t: number, [start, end]: readonly [number, number]) =>
  clamp01((t - start) / (end - start));

/** Group offset in slots (0 = card one centered, 3 = card four centered). */
export const groupSlots = (t: number) => MOVES.reduce((acc, m) => acc + ease(moveProgress(t, m)), 0);

// ---- Motion blur envelope -------------------------------------------------
// Local, direction-aware (vertical) blur. It follows the eased velocity, peaks at
// exactly BLUR_PEAK px where the move is fastest, and is fully cleared by 85% of the move.
export const BLUR_PEAK = 5;
export const BLUR_CLEAR = 0.85;

const H = 1e-4;
const velocity = (p: number) => (ease(clamp01(p + H)) - ease(clamp01(p - H))) / (clamp01(p + H) - clamp01(p - H));

// The eased velocity is at its maximum ~0.04-0.05 into the move. Pin the blur peak to the
// frame-aligned sample at 2 frames in (p = 2/38.4 = 0.052, within 0.3% of the true velocity
// maximum) so the rendered frames actually reach the full 5px.
const MOVE_DURATION = MOVES[0][1] - MOVES[0][0];
const V_PEAK_AT = 2 / FPS / MOVE_DURATION;
const V_MAX = velocity(V_PEAK_AT);
const V_CLEAR = velocity(BLUR_CLEAR);

export const blurForProgress = (p: number) => {
  if (p <= 0 || p >= BLUR_CLEAR) return 0;
  if (p < V_PEAK_AT) return BLUR_PEAK * Math.sin((Math.PI / 2) * (p / V_PEAK_AT));
  const n = clamp01((velocity(p) - V_CLEAR) / (V_MAX - V_CLEAR));
  return BLUR_PEAK * Math.pow(n, 0.75);
};

/** Blur (px, screen space) at time t — only one move is ever active. */
export const blurAt = (t: number) => MOVES.reduce((acc, m) => Math.max(acc, blurForProgress(moveProgress(t, m))), 0);
