import {Easing} from 'remotion';

// ---------------------------------------------------------------------------
// Canvas, palette
// ---------------------------------------------------------------------------
export const FPS = 60;
export const sec = (s: number) => s * FPS;

export const C = {
  paper: '#F3EFE7',
  paperDeep: '#E9E3D7',
  clay: '#CA5B41',
  ink: '#0F241C',
  coral: '#FF6A4B',
  moss: '#8FB47A',
  ochre: '#F2C265',
};

export type Rect = {x: number; y: number; w: number; h: number};

// ---------------------------------------------------------------------------
// The FIELD mark: four capsules on the diagonals, 440px square at rest.
// Each capsule is a horizontal pill (PETAL_L x PETAL_T) rotated +-45deg.
// Outer extent: r_out/sqrt2 + T/2 = 220  ->  exactly a 440px box.
// Inner gap between neighbours: sqrt2 * r_in - T = 22px.
// ---------------------------------------------------------------------------
export const MARK_SIZE = 440;
export const MARK_CX = 960;
export const MARK_CY = 440;
export const PETAL_T = 132;
const R_IN = 109;
const R_OUT = (MARK_SIZE / 2 - PETAL_T / 2) * Math.SQRT2;
export const PETAL_L = R_OUT - R_IN + PETAL_T;
const PETAL_D = (R_IN + R_OUT) / 2 / Math.SQRT2; // centre offset on each axis

// ---------------------------------------------------------------------------
// The 1760x920 modular identity board (12 x 6 modules, 16px gutters).
// ---------------------------------------------------------------------------
export const BOARD: Rect = {x: 80, y: 80, w: 1760, h: 920};
export const GAP = 16;
export const PANEL_RADIUS = 26;

export const REGION = {
  moss: {x: 80, y: 80, w: 576, h: 296},
  ochre: {x: 672, y: 80, w: 428, h: 296},
  fifth: {x: 1116, y: 80, w: 724, h: 608},
  ink: {x: 80, y: 392, w: 1020, h: 608},
  coral: {x: 1116, y: 704, w: 724, h: 296},
} satisfies Record<string, Rect>;

export type PetalKey = 'ink' | 'coral' | 'ochre' | 'moss';

export const PETALS: {key: PetalKey; dir: [number, number]; angle: number; color: string; delay: number}[] = [
  {key: 'moss', dir: [-1, -1], angle: 45, color: C.moss, delay: 2},
  {key: 'ochre', dir: [1, -1], angle: -45, color: C.ochre, delay: 3},
  {key: 'coral', dir: [1, 1], angle: 45, color: C.coral, delay: 1},
  {key: 'ink', dir: [-1, 1], angle: -45, color: C.ink, delay: 0},
];

// ---------------------------------------------------------------------------
// Timing (frames @ 60fps)
// ---------------------------------------------------------------------------
export const T = {
  rotateEnd: sec(0.65), // 39  mark resolves -45deg -> 0
  unfoldStart: sec(0.8), // 48
  unfoldEnd: sec(1.65), // 99
  fifthStart: 70,
  wordStart: 52,
  revealStart: sec(1.4), // 84
  revealEnd: sec(2.4), // 144
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const progress = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));

export const ease = {
  resolve: Easing.bezier(0.5, 0, 0.12, 1),
  travel: Easing.bezier(0.7, 0, 0.18, 1),
  turn: Easing.bezier(0.45, 0, 0.2, 1),
  grow: Easing.bezier(0.62, 0, 0.16, 1),
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
};

export const markRotation = (f: number) => -45 * (1 - ease.resolve(progress(f, 0, T.rotateEnd)));

export type PetalState = {cx: number; cy: number; w: number; h: number; angle: number; radius: number; lift: number; p: number};

const rotate = (x: number, y: number, deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
};

export const petalState = (i: number, f: number): PetalState => {
  const petal = PETALS[i];
  const region = REGION[petal.key];
  const g = markRotation(f);
  const [ox, oy] = rotate(petal.dir[0] * PETAL_D, petal.dir[1] * PETAL_D, g);
  const sx = MARK_CX + ox;
  const sy = MARK_CY + oy;
  const start = T.unfoldStart + petal.delay;
  const p = ease.travel(progress(f, start, T.unfoldEnd));
  const r = ease.turn(progress(f, start, T.unfoldStart + 36));
  const z = ease.grow(progress(f, start + (petal.key === 'ink' ? 0 : 5), T.unfoldEnd));
  const ex = region.x + region.w / 2;
  const ey = region.y + region.h / 2;
  // A gentle outward arc: top petals bow up, bottom petals bow down.
  const bow = Math.sin(Math.PI * p) * 30 * petal.dir[1];
  const w = lerp(PETAL_L, region.w, z);
  const h = lerp(PETAL_T, region.h, z);
  return {
    cx: lerp(sx, ex, p),
    cy: lerp(sy, ey, p) + bow,
    w,
    h,
    angle: lerp(petal.angle + g, 0, r),
    radius: Math.min(lerp(PETAL_T / 2, PANEL_RADIUS, ease.inOut(z)), h / 2, w / 2),
    lift: Math.sin(Math.PI * progress(f, start, T.unfoldEnd)),
    p,
  };
};

// Fifth region, in the coral petal's local frame (it grows out of coral's lower edge).
export const fifthLocal = (f: number, coral: PetalState) => {
  const g = ease.grow(progress(f, T.fifthStart, T.unfoldEnd));
  // grows upward out of coral's top edge; the gutter opens a little ahead of the growth
  const top = lerp(0, -GAP - REGION.fifth.h, g);
  const bottom = lerp(44, -GAP, ease.out(progress(f, T.fifthStart + 4, T.unfoldEnd)));
  return {x: 0, y: top, w: coral.w, h: bottom - top, g};
};

// ---------------------------------------------------------------------------
// Wordmark: one element, one continuous quadratic path, 104px -> WORD_SCALE.
// ---------------------------------------------------------------------------
export const WORD_SIZE = 104;
export const WORD_SCALE = 2.25;
export const WORD_START = {x: 960, y: 792};
export const WORD_END = {x: 0, y: 0}; // filled in by layout (see BrandClover)

export const quad = (a: number, b: number, c: number, t: number) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;
