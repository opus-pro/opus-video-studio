// Poster constants. Everything snaps to one grid: a 45px outer margin, a 42px mask
// cell, and a 7px dither pitch (42 = 6 x 7, 1260 = 30 x 42 = 180 x 7).
export const W = 1350;
export const H = 1350;
export const FPS = 60;
export const FRAMES = 288;

export const M = 45; // outer margin
export const CONTENT_W = W - 2 * M; // 1260
export const CELL = 42; // title mask cell
export const PITCH = 7; // dither column pitch (1260 / 180)

export const CORAL = '#f0aca2';
export const GREEN = '#0f3a2b';

export const FONT = 'Geist';

// Grid row helper: y of the n-th 42px row, anchored at the top margin.
export const row = (n: number) => M + n * CELL;
export const col = (n: number) => M + n * CELL;

// Timings (frames @ 60 fps)
export const INTRO_START = 0;
export const INTRO_END = 63; // 1.05 s
export const SWAP_START = 96; // 1.6 s
export const SWAP_END = 135; // 2.25 s

// Dither block
export const DITHER_COLS = 180;
export const DITHER_ROWS = 72;
export const DITHER_X = M;
export const DITHER_Y = row(15); // 675 — the lower half starts here
export const DITHER_W = DITHER_COLS * PITCH; // 1260
export const DITHER_H = DITHER_ROWS * PITCH; // 504
