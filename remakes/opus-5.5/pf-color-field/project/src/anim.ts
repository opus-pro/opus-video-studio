import {Easing, interpolate} from 'remotion';

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

// Named curves used across the piece.
export const easeOutExpo = Easing.bezier(0.16, 1, 0.3, 1);
export const easeOutCubic = Easing.bezier(0.33, 1, 0.68, 1);
export const easeInCubic = Easing.bezier(0.32, 0, 0.67, 0);
export const easeInOut = Easing.bezier(0.76, 0, 0.18, 1);
export const easeInOutSoft = Easing.bezier(0.6, 0, 0.25, 1);

/** Progress 0..1 between two frames, with an easing curve. */
export const prog = (frame: number, from: number, to: number, ease: (t: number) => number = (t) => t) =>
  interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

/** Numerical velocity of an animated value, in units per frame. */
export const velocity = (fn: (f: number) => number, frame: number) => (fn(frame + 0.5) - fn(frame - 0.5));

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
