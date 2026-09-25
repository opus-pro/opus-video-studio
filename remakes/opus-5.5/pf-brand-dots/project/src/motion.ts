// Pure motion math (no imports) so it can be unit-checked from node.

export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const progress = (t: number, t0: number, t1: number) => clamp((t - t0) / (t1 - t0));
export const smoothstep = (e0: number, e1: number, x: number) => {
  const u = clamp((x - e0) / (e1 - e0));
  return u * u * (3 - 2 * u);
};

// CSS-style cubic-bezier easing (y may leave [0,1] for anticipation / overshoot).
export const bezier = (x1: number, y1: number, x2: number, y2: number) => {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sx = (s: number) => ((ax * s + bx) * s + cx) * s;
  const sy = (s: number) => ((ay * s + by) * s + cy) * s;
  const dsx = (s: number) => (3 * ax * s + 2 * bx) * s + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let s = x;
    for (let i = 0; i < 8; i++) {
      const err = sx(s) - x;
      const d = dsx(s);
      if (Math.abs(err) < 1e-7) break;
      if (Math.abs(d) < 1e-6) break;
      s -= err / d;
    }
    // Bisection fallback for robustness.
    if (Math.abs(sx(s) - x) > 1e-5) {
      let lo = 0;
      let hi = 1;
      s = x;
      for (let i = 0; i < 40; i++) {
        const v = sx(s);
        if (Math.abs(v - x) < 1e-7) break;
        if (v < x) lo = s;
        else hi = s;
        s = (lo + hi) / 2;
      }
    }
    return sy(s);
  };
};

export const ease = {
  // Gentle, editorial in-out.
  inOut: bezier(0.65, 0, 0.35, 1),
  // Fast start, long soft landing (the house "arrive" curve).
  out: bezier(0.16, 1, 0.3, 1),
  outSoft: bezier(0.25, 0.8, 0.25, 1),
  // Small overshoot for pops.
  outBack: bezier(0.34, 1.45, 0.64, 1),
  // Morph curves.
  morphPosX: bezier(0.62, 0, 0.2, 1),
  morphPosY: bezier(0.42, 0, 0.18, 1),
  morphSize: bezier(0.74, 0, 0.16, 1),
  // Mark turn: slight wind-up, slight overshoot.
  turn: bezier(0.62, -0.18, 0.24, 1.14),
};

// ---------------------------------------------------------------------------
// Board geometry
// ---------------------------------------------------------------------------

export type Box = {x: number; y: number; w: number; h: number};
export type PanelKey = 'A' | 'B' | 'C' | 'D' | 'E';

// 1760x920 board centred on 1920x1080, 12px seams.
export const BOARD: Box = {x: 80, y: 80, w: 1760, h: 920};
export const SEAM = 12;

export const PANELS: Record<PanelKey, Box> = {
  A: {x: 80, y: 80, w: 540, h: 380}, // mark pattern
  D: {x: 80, y: 472, w: 540, h: 528}, // dark wordmark / tagline
  B: {x: 632, y: 80, w: 680, h: 560}, // coast photo
  E: {x: 632, y: 652, w: 680, h: 348}, // colour bands
  C: {x: 1324, y: 80, w: 516, h: 920}, // coral hero mark
};

export const COLORS = {
  bg: '#DCD6CB',
  bgEdge: '#CBC4B7',
  bone: '#F4F0E8',
  ink: '#151514',
  lake: '#1D625D',
  coral: '#FF5B45',
  sand: '#E9B45F',
};

// Left-to-right order of the five starting points (keeps every path outward, no crossings).
export const DOT_ORDER: PanelKey[] = ['A', 'D', 'B', 'E', 'C'];
export const DOT_COLOR: Record<PanelKey, string> = {
  A: COLORS.bone,
  D: COLORS.ink,
  B: COLORS.lake,
  E: COLORS.sand,
  C: COLORS.coral,
};

export const DOT = 72;
export const DOT_Y = 540;
export const DOT_GAP = 144;
export const MORPH_START = 42; // 0.70s
export const MORPH_END = 87; // 1.45s

const DELAY: Record<PanelKey, number> = {A: 0, D: 2, B: 1, E: 3, C: 1};
const GATHER = 0.84; // anticipation: points inhale toward centre
const SQUASH = 0.9;

export type Shape = Box & {r: number; fill: string; key: PanelKey};

const dotX = (i: number) => 960 + (i - 2) * DOT_GAP;

// Idle life before the morph: a counting pulse left-to-right (always back to 72px).
const pulse = (i: number, t: number) => 0.075 * Math.exp(-(((t - (9 + i * 5)) / 3.6) ** 2));
// The inhale lives inside the morph window (0.70s+): points gather and squash, then burst out.
const anticipation = (t: number) => ease.inOut(progress(t, MORPH_START, MORPH_START + 11));

export const shapeAt = (key: PanelKey, t: number): Shape => {
  const i = DOT_ORDER.indexOf(key);
  const p = PANELS[key];
  const fill = DOT_COLOR[key];
  const a = anticipation(t);
  const sx0 = dotX(i);
  const sx = lerp(sx0, 960 + (sx0 - 960) * GATHER, a);
  const scale = (1 + pulse(i, t)) * lerp(1, SQUASH, a);
  const start = MORPH_START + DELAY[key];
  if (t <= start) {
    const d = DOT * scale;
    return {key, fill, x: sx - d / 2, y: DOT_Y - d / 2, w: d, h: d, r: d / 2};
  }
  const u = progress(t, start, MORPH_END);
  const se = ease.morphSize(u);
  const d0 = DOT * scale;
  const cx = lerp(sx, p.x + p.w / 2, ease.morphPosX(u));
  const cy = lerp(DOT_Y, p.y + p.h / 2, ease.morphPosY(u));
  const w = lerp(d0, p.w, se);
  const h = lerp(d0, p.h, se);
  // Stay liquid (fully round) for most of the flight, square off on landing.
  const round = (1 - smoothstep(0.42, 0.985, u)) ** 1.35;
  const r = (Math.min(w, h) / 2) * round;
  return {key, fill, x: cx - w / 2, y: cy - h / 2, w, h, r};
};

export const shapesAt = (t: number) => DOT_ORDER.map((k) => shapeAt(k, t));

// ---------------------------------------------------------------------------
// Reveal schedule (A / C / B / E / D)
// ---------------------------------------------------------------------------
export const REVEAL: Record<PanelKey, number> = {A: 88, C: 98, B: 108, E: 118, D: 128};
export const TURN_START = 204;
export const TURN_END = 240;
