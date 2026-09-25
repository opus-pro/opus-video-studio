import {Easing} from 'remotion';

// ---------------------------------------------------------------------------
// Timing (60 fps). All numbers are frames.
// ---------------------------------------------------------------------------
export const FPS = 60;
export const DURATION = 336;

/** First product is fully entered and at rest by 0.55s (frame 33). */
export const INTRO = {start: 0, end: 33} as const;
/** Cross-relay windows: 1.5s-2.2s and 3.2s-3.9s. */
export const RELAYS = [
  {start: 90, end: 132},
  {start: 192, end: 234},
] as const;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const progress = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
const smooth = (v: number) => v * v * (3 - 2 * v);
const smoothRange = (v: number, a: number, b: number) => smooth(clamp01((v - a) / (b - a)));

// ---------------------------------------------------------------------------
// Curves
// ---------------------------------------------------------------------------
// Point-symmetric ease-in-out: the travel speed peaks exactly at r = 0.5, so the
// blur (which follows speed) peaks exactly on the middle frame of each relay.
const relayEase = Easing.bezier(0.7, 0, 0.3, 1);
// Decelerating entrance for the intro.
const introEase = Easing.bezier(0.16, 0.84, 0.3, 1);

const H = 1 / 2000;
const deriv = (fn: (t: number) => number, t: number) => {
  const a = Math.max(0, t - H);
  const b = Math.min(1, t + H);
  return (fn(b) - fn(a)) / (b - a);
};
const RELAY_VMAX = deriv(relayEase, 0.5);
const INTRO_VMAX = deriv(introEase, 0);
const relaySpeed = (r: number) => clamp01(deriv(relayEase, r) / RELAY_VMAX);
const introSpeed = (r: number) => clamp01(deriv(introEase, r) / INTRO_VMAX);

// ---------------------------------------------------------------------------
// Visual state of one moving layer
// ---------------------------------------------------------------------------
export type Layer = {
  x: number; // px offset from the rest position
  opacity: number;
  blur: number; // px, gaussian std-dev along the travel axis
  sx: number; // scale-X (constrained stretch + settle overshoot)
  scale: number; // uniform scale (depth)
};

export type Feel = {
  dist: number; // travel distance, px
  dir: 1 | -1; // +1 travels rightward, -1 leftward
  blur: number; // peak blur, px
  stretch: number; // peak scale-X stretch at top speed (e.g. 0.04)
  dip: number; // settle overshoot below 1 (e.g. 0.018)
  recede: number; // uniform scale lost by the outgoing layer
  fadeIn: [number, number];
  fadeOut: [number, number];
};

export const REST: Layer = {x: 0, opacity: 1, blur: 0, sx: 1, scale: 1};
export const HIDDEN: Layer = {x: 0, opacity: 0, blur: 0, sx: 1, scale: 1};

// Settle overshoot: after the stretch releases, scale-X passes through 1, dips
// slightly below and returns to exactly 1 at the end. Bounded on both sides.
const settle = (r: number, from: number, dip: number) => {
  const u = clamp01((r - from) / (1 - from));
  const s = Math.sin(Math.PI * u);
  return dip * s * s;
};

const constrainSx = (sx: number) => Math.min(1.05, Math.max(0.975, sx));

/** Layer leaving during a relay (r = 0..1). */
export const outgoing = (r: number, k: Feel): Layer => {
  if (r <= 0) return REST;
  if (r >= 1) return HIDDEN;
  const e = relayEase(r);
  const v = relaySpeed(r);
  return {
    x: k.dir * k.dist * e,
    opacity: 1 - smoothRange(r, k.fadeOut[0], k.fadeOut[1]),
    blur: k.blur * v,
    sx: constrainSx(1 + k.stretch * v),
    scale: 1 - k.recede * e,
  };
};

/** Layer arriving during a relay (r = 0..1). */
export const incoming = (r: number, k: Feel): Layer => {
  if (r <= 0) return HIDDEN;
  if (r >= 1) return REST;
  const e = relayEase(r);
  const v = relaySpeed(r);
  return {
    x: -k.dir * k.dist * (1 - e),
    opacity: smoothRange(r, k.fadeIn[0], k.fadeIn[1]),
    blur: k.blur * v,
    sx: constrainSx(1 + k.stretch * v - settle(r, 0.6, k.dip)),
    scale: 1,
  };
};

/** Intro entrance (decelerating from off-rest). */
export const introIn = (r: number, k: Feel): Layer => {
  if (r <= 0) return {...HIDDEN};
  if (r >= 1) return REST;
  const e = introEase(r);
  const v = introSpeed(r);
  return {
    x: -k.dir * k.dist * (1 - e),
    opacity: smoothRange(r, 0, 0.42),
    blur: k.blur * v,
    sx: constrainSx(1 + k.stretch * v - settle(r, 0.45, k.dip)),
    scale: 1,
  };
};

/**
 * State of item `index` (0..2) for a track whose relays run in sub-windows of
 * the global relay windows (offset/length in frames, relative to each window).
 */
export const trackLayer = (
  frame: number,
  index: number,
  k: Feel,
  sub: {offset: number; length: number},
  intro: {start: number; end: number},
): Layer => {
  const win = (i: number) => {
    const w = RELAYS[i];
    const s = w.start + sub.offset;
    return {s, e: s + sub.length};
  };
  if (index === 0) {
    const w = win(0);
    if (frame < w.s) return introIn(progress(frame, intro.start, intro.end), k);
    return outgoing(progress(frame, w.s, w.e), k);
  }
  if (index === 1) {
    const a = win(0);
    const b = win(1);
    if (frame < b.s) return incoming(progress(frame, a.s, a.e), k);
    return outgoing(progress(frame, b.s, b.e), k);
  }
  const b = win(1);
  return incoming(progress(frame, b.s, b.e), k);
};
