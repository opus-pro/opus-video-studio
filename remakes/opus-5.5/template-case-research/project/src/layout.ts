import {Easing} from 'remotion';
import {ESM, ESNAP, lerp, mixRect, prog, Rect, scaleRect, shiftRect} from './lib';

// ---------- Theme ----------
export const C = {
  bgDeep: '#120b07',
  ink: '#2a1d14',
  inkSoft: '#4d3c2f',
  muted: '#8a7462',
  paper: '#f4ebdd',
  paperHi: '#faf4ea',
  chip: '#fbf6ee',
  chipLine: '#e6d8c4',
  line: 'rgba(70,45,20,0.13)',
  amber: '#b8671f',
  amberBtn: '#c8772c',
  gold: '#f4c27c',
  cream: '#f6e7d0',
};

export const SANS =
  '"SF Pro Text", "SF Pro", system-ui, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif';
export const DISPLAY =
  '"SF Pro Display", "SF Pro", system-ui, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif';
export const SERIF = '"Iowan Old Style", "Palatino", "Palatino Linotype", Georgia, serif';

export const img = (name: string) => `generated-assets/${name}.png`;

// ---------- Geometry (frame coordinates, 960x540) ----------
export const CX = 480;
export const CY = 270;

export const BAR: Rect = {x: 180, y: 236, w: 600, h: 68};
export const CARD: Rect = {x: 160, y: 122, w: 640, h: 296};
export const CARD_PAD = 28;

export const CHIP = {top: 216, w: 186, h: 50, gap: 13};
export const THUMB_IN_CHIP: Rect = {x: 8, y: 9, w: 48, h: 32};
export const chipAbs = (i: number): Rect => ({
  x: CARD.x + CARD_PAD + i * (CHIP.w + CHIP.gap),
  y: CARD.y + CHIP.top,
  w: CHIP.w,
  h: CHIP.h,
});
export const thumbAbs = (i: number): Rect => {
  const c = chipAbs(i);
  return {x: c.x + THUMB_IN_CHIP.x, y: c.y + THUMB_IN_CHIP.y, w: THUMB_IN_CHIP.w, h: THUMB_IN_CHIP.h};
};

// Hero printed photo: 384x256 image, 9px border, 32px caption strip.
export const HERO: Rect = {x: 279, y: 113, w: 402, h: 306};
export const HERO_BORDER = 9;
export const HERO_STRIP = 32;

// Brand mark (the markers become this reticle)
export const LOGO: Rect = {x: 452, y: 176, w: 56, h: 56};

// ---------- Timeline ----------
export const T = {
  barIn: [4, 24],
  typeStart: 18,
  press: 53,
  expandW: [57, 82],
  expandH: [60, 88],
  chipFocus: [108, 124],
  heroGrow: [124, 152],
  cardExit: [124, 150],
  proofIn: 132,
  brandOut: [188, 214],
  markToLogo: [188, 217],
};

// Camera drift in the proof scene (parallax source); continuous, never stops.
export const camX = (f: number) => {
  const t = Math.max(0, f - 120);
  return -0.21 * t - 0.0006 * t * t;
};

// Query surface rectangle: pill bar that expands into the answer card.
export const surfaceRect = (f: number): Rect => {
  const pw = prog(f, T.expandW[0], T.expandW[1], ESM);
  const ph = prog(f, T.expandH[0], T.expandH[1], ESM);
  const w = lerp(BAR.w, CARD.w, pw);
  const h = lerp(BAR.h, CARD.h, ph);
  return {x: CX - w / 2, y: CY - h / 2, w, h};
};

export const heroGrowP = (f: number) => prog(f, T.heroGrow[0], T.heroGrow[1], Easing.bezier(0.62, 0, 0.14, 1));
export const heroFrameP = (f: number) => prog(f, T.heroGrow[0] + 5, T.heroGrow[1], ESM);
export const heroExitP = (f: number) => prog(f, T.brandOut[0] + 2, T.brandOut[1], Easing.bezier(0.5, 0, 0.8, 0.4));

// Slow dolly-in during the proof scene; deeper layers scale more.
export const camPush = (f: number) => 1 + 0.0005 * Math.max(0, f - 136);
export const heroFrameRect = (f: number): Rect => scaleRect(shiftRect(HERO, camX(f), 0), camPush(f));

export const heroRect = (f: number): Rect => {
  const target = heroFrameRect(f);
  const r = mixRect(thumbAbs(0), target, heroGrowP(f));
  return scaleRect(r, lerp(1, 0.84, heroExitP(f)));
};

export {ESNAP};
