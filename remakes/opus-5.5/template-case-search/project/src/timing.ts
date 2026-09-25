import {Easing} from 'remotion';

export const WIDTH = 960;
export const HEIGHT = 540;

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const EASE = {
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  inOutSoft: Easing.bezier(0.45, 0, 0.25, 1),
  out: Easing.bezier(0.16, 1, 0.3, 1),
  outSoft: Easing.bezier(0.22, 1, 0.36, 1),
  in: Easing.bezier(0.55, 0, 1, 0.45),
  flight: Easing.bezier(0.7, 0, 0.16, 1),
  linear: (x: number) => x,
};

/** Eased progress of frame f through [a, b]. */
export const prog = (f: number, a: number, b: number, ease: (x: number) => number = EASE.inOut) =>
  ease(clamp01((f - a) / (b - a)));

// Palette
export const INK = '#15161A';
export const MUTED = '#8C8C88';
export const FAINT = '#B9B8B3';
export const ACCENT = '#EF532D';
export const FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif';

// Hero geometry (CSS px)
export const HERO_X = 480;
export const HERO_Y = 276;
export const POSTER_W = 198;
export const POSTER_H = 264;
export const GRID_POSTER_W = 54;

// Timeline (frames @ 60fps, 590 total)
export const TL = {
  typeChars: [70, 77, 85, 92],
  filter: [100, 124],
  cursor: [114, 162],
  hover: 160,
  press: 176,
  release: 184,
  fly: [190, 230],
  swap: [238, 248],
  roll: [250, 344],
  flatOff: [258, 356],
  metal: [322, 392],
  bend: [316, 410],
  thin: [320, 414],
  grow: [352, 432],
  line: [456, 520],
  ink: [478, 516],
  svg: [512, 524],
};

// Form -> line constants
export const RING_R = POSTER_H / (2 * Math.PI); // centreline radius once bent, object units
export const TUBE_R = POSTER_W / (2 * Math.PI); // tube radius once rolled, object units
export const FORM_SCALE = 1.85;
export const LINE_SCALE = 2.72;
export const LINE_STROKE = 2.4; // px
export const FORM_RS = 0.54;
export const LINE_RS = LINE_STROKE / 2 / (TUBE_R * LINE_SCALE);
export const LINE_RADIUS_PX = RING_R * LINE_SCALE;
