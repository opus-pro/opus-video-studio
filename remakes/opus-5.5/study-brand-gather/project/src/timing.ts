import {Easing, interpolate} from 'remotion';

// "E": the one house ease used for every eased move in this study. A soft start,
// a decisive middle and a long, quiet settle.
export const E = Easing.bezier(0.45, 0, 0.2, 1);

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Eased 0..1 progress of `t` across [from, to]. Works with fractional frames. */
export const progress = (t: number, from: number, to: number) =>
  interpolate(t, [from, to], [0, 1], {...clamp, easing: E});

export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// Frame map (30 fps, 66 frames).
export const T = {
  markGrow: [0, 19] as const, // scale .12 -> 1
  markBlur: [0, 14] as const, // blur 6 -> 0
  travel: [0, 22] as const, // squares converge, rotate 0 -> 90
  hold: [23, 27] as const, // single coral square rests at center
  release: [28, 35] as const, // scale 1 -> .72, opacity 1 -> 0
  rest: [36, 65] as const, // only the symbol
};
