import {Easing, interpolate} from 'remotion';

// Stage geometry (960x540 canvas).
export const WIN_X = 90;
export const WIN_Y = 27;
export const WIN_W = 780;
export const CHROME_H = 46;
export const PAGE_X = WIN_X;
export const PAGE_Y = WIN_Y + CHROME_H;

// Segmented theme control inside the browser chrome (window-local coords).
export const SEG_X = 478;
export const SEG_Y = 7;
export const SEG_W = 286;
export const SEG_H = 32;
export const SEG_PAD = 3;
export const CHIP_W = (SEG_W - SEG_PAD * 2) / 3;

export const chipCenter = (i: number) => ({
  x: WIN_X + SEG_X + SEG_PAD + CHIP_W * (i + 0.5),
  y: WIN_Y + SEG_Y + SEG_H / 2,
});

// Beats (frames @30fps).
export const CLICK1 = 38;
export const CLICK2 = 100;
export const WIPE_DUR = 30;
export const PUSH_START = 134;
export const PUSH_END = 178;

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const wipeEase = Easing.bezier(0.3, 0.05, 0.1, 1);
export const wipeProgress = (f: number, click: number) =>
  interpolate(f, [click, click + WIPE_DUR], [0, 1], {...clamp, easing: wipeEase});

// Press envelope around a click frame: 0 -> 1 (held down) -> 0.
export const pressAmount = (f: number, click: number) =>
  interpolate(f, [click - 5, click - 2, click + 1, click + 6], [0, 1, 1, 0], {
    ...clamp,
    easing: Easing.bezier(0.33, 0, 0.3, 1),
  });

type Pt = {x: number; y: number};
type Seg = {from: Pt; to: Pt; ctrl: Pt; start: number; end: number};

const c1 = chipCenter(1);
const c2 = chipCenter(2);
const tip1 = {x: c1.x - 6, y: c1.y + 1};
const tip2 = {x: c2.x - 6, y: c2.y + 1};

const SEGS: Seg[] = [
  {from: {x: 600, y: 296}, to: tip1, ctrl: {x: 730, y: 250}, start: 0, end: 31},
  {from: tip1, to: {x: 598, y: 238}, ctrl: {x: 700, y: 150}, start: 48, end: 76},
  {from: {x: 598, y: 238}, to: tip2, ctrl: {x: 790, y: 200}, start: 78, end: 95},
  {from: tip2, to: {x: 1030, y: 430}, ctrl: {x: 930, y: 120}, start: 110, end: 142},
];

const moveEase = Easing.bezier(0.45, 0, 0.2, 1);

const bez = (a: Pt, c: Pt, b: Pt, t: number): Pt => {
  const u = 1 - t;
  return {x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y};
};

export const cursorPos = (f: number): Pt => {
  if (f <= SEGS[0].start) return SEGS[0].from;
  for (let i = 0; i < SEGS.length; i++) {
    const s = SEGS[i];
    if (f < s.start) return SEGS[i - 1].to;
    if (f <= s.end) {
      const t = moveEase((f - s.start) / (s.end - s.start));
      return bez(s.from, s.ctrl, s.to, t);
    }
  }
  return SEGS[SEGS.length - 1].to;
};

export const cursorOpacity = (f: number) => interpolate(f, [118, 136], [1, 0], clamp);
