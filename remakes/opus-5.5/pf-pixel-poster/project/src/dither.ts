import {Easing, interpolate} from 'remotion';
import type {ToneImage} from './assets';
import {DITHER_COLS, DITHER_H, DITHER_ROWS, DITHER_W, FRAMES, GREEN, PITCH} from './theme';

// Fixed 4x4 Bayer matrix. It is anchored to the output grid and never changes.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

// Crop: 1 / 1.05 of the photo width, so a 5% move of the crop stays inside it.
const PAN = 0.05;
const CROP_Y = 196; // source px; frames the peaks with a band of sky above them

const panEase = Easing.bezier(0.42, 0, 0.3, 1);

export const ditherCrop = (frame: number, tone: ToneImage) => {
  const cw = tone.w / (1 + PAN);
  const ch = (cw * DITHER_ROWS) / DITHER_COLS;
  const p = panEase(interpolate(frame, [0, FRAMES - 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  return {x: p * PAN * cw, y: CROP_Y, w: cw, h: ch};
};

// Bilinear read of the summed-area table at a fractional coordinate.
const satAt = (t: ToneImage, x: number, y: number) => {
  const stride = t.w + 1;
  const cx = Math.min(Math.max(x, 0), t.w);
  const cy = Math.min(Math.max(y, 0), t.h);
  const x0 = Math.min(Math.floor(cx), t.w - 1);
  const y0 = Math.min(Math.floor(cy), t.h - 1);
  const fx = cx - x0;
  const fy = cy - y0;
  const a = t.sat[y0 * stride + x0];
  const b = t.sat[y0 * stride + x0 + 1];
  const c = t.sat[(y0 + 1) * stride + x0];
  const d = t.sat[(y0 + 1) * stride + x0 + 1];
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
};

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (v: number) => v * v * (3 - 2 * v);

// Tone curve: lift the sky, hold detail in the mountain faces, keep the pines
// dark but textured. Local contrast (cell mean vs. a 5x5-cell surround) sharpens
// ridgelines and tree edges that a 180-column grid would otherwise smear.
const BLACK = 0.08;
const WHITE = 0.86;
const GAMMA = 1.35;
const LOCAL = 0.8;
const CONTRAST = 0.5;
const SURROUND = 2; // cells on each side
const FADE_ROWS = 20; // the top of the block dissolves into the coral field

const boxMean = (t: ToneImage, ax: number, ay: number, bx: number, by: number) => {
  // Clamp to the photo so edge cells average only real pixels.
  const x0 = Math.max(ax, 0);
  const y0 = Math.max(ay, 0);
  const x1 = Math.min(bx, t.w);
  const y1 = Math.min(by, t.h);
  return (satAt(t, x1, y1) - satAt(t, x0, y1) - satAt(t, x1, y0) + satAt(t, x0, y0)) / ((x1 - x0) * (y1 - y0));
};

// Mark size from darkness: 4 px stipple in light passages, 7 px (solid) only in the deepest shadow.
const markSize = (dark: number) => (dark < 0.4 ? 4 : dark < 0.62 ? 5 : dark < 0.88 ? 6 : 7);

export const drawDither = (ctx: CanvasRenderingContext2D, tone: ToneImage, frame: number) => {
  ctx.clearRect(0, 0, DITHER_W, DITHER_H);
  ctx.fillStyle = GREEN;
  const crop = ditherCrop(frame, tone);
  const sx = crop.w / DITHER_COLS;
  const sy = crop.h / DITHER_ROWS;
  for (let r = 0; r < DITHER_ROWS; r++) {
    const y0 = crop.y + r * sy;
    const y1 = y0 + sy;
    const fade = smooth(clamp01((r - 1) / FADE_ROWS)); // rows 0-1 stay clear
    for (let c = 0; c < DITHER_COLS; c++) {
      const x0 = crop.x + c * sx;
      const x1 = x0 + sx;
      const mean = boxMean(tone, x0, y0, x1, y1);
      const wide = boxMean(tone, x0 - SURROUND * sx, y0 - SURROUND * sy, x1 + SURROUND * sx, y1 + SURROUND * sy);
      const v = mean + LOCAL * (mean - wide);
      const lin = Math.pow(clamp01((v - BLACK) / (WHITE - BLACK)), 1 / GAMMA);
      const lit = lin + CONTRAST * (smooth(lin) - lin); // gentle S-curve
      const dark = (1 - lit) * fade;
      const threshold = (BAYER[(r & 3) * 4 + (c & 3)] + 0.5) / 16;
      if (dark <= threshold) continue;
      // Deterministic 4-7 px mark, centred in its 7 px cell.
      const size = markSize(dark);
      const off = (PITCH - size) >> 1;
      ctx.fillRect(c * PITCH + off, r * PITCH + off, size, size);
    }
  }
};
