import {Easing} from 'remotion';

export const FPS = 60;
export const DURATION_FRAMES = 216;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const mix = (a: number, b: number, p: number) => a + (b - a) * p;

/** Normalised progress of `t` (seconds) through the window [start, start + dur]. */
export const progress = (t: number, start: number, dur: number) => clamp01((t - start) / dur);

// Curves -------------------------------------------------------------------
/** Settle curve for the intro: a long, soft landing with no overshoot. */
export const settle = Easing.bezier(0.24, 0.78, 0.2, 1);
/** Spec: tile travel + scale 1.1s -> 1.8s. */
export const travel = Easing.bezier(0, 0, 0, 1);
/** Rise curve for the typography. */
export const rise = Easing.bezier(0.16, 1, 0.3, 1);
/** Opacity ramp for the typography. */
export const fade = Easing.bezier(0.33, 0, 0.2, 1);

// Timeline (seconds) ---------------------------------------------------------
export const T = {
  introEnd: 0.5,
  petalStagger: 0.035,
  moveStart: 1.1,
  moveEnd: 1.8,
  wordStart: 1.24,
  letterStagger: 0.035,
  wordDur: 0.62,
  tagStart: 1.44,
  tagDur: 0.64,
} as const;

// Geometry (px) -------------------------------------------------------------
export const TILE = 384;
export const CENTER_X = 960;
export const TILE_Y_START = 540;
export const TILE_Y_END = 370;
export const TILE_SCALE_END = 0.52;
export const INTRO_SCALE = 0.64;
export const INTRO_ROT = -12;
export const INTRO_BLUR = 10;

export type TileState = {
  cx: number;
  cy: number;
  scale: number;
  rot: number;
  blur: number;
  petals: {p: number}[];
};

export const tileState = (t: number): TileState => {
  const a = settle(progress(t, 0, T.introEnd));
  const m = travel(progress(t, T.moveStart, T.moveEnd - T.moveStart));
  const introScale = mix(INTRO_SCALE, 1, a);
  const moveScale = mix(1, TILE_SCALE_END, m);
  // Petal i starts 35ms after petal i-1; the last one lands exactly at 0.5s with the tile.
  const petalDur = T.introEnd - 3 * T.petalStagger;
  const petals = [0, 1, 2, 3].map((i) => ({
    p: settle(progress(t, i * T.petalStagger, petalDur)),
  }));
  return {
    cx: CENTER_X,
    cy: mix(TILE_Y_START, TILE_Y_END, m),
    scale: introScale * moveScale,
    rot: mix(INTRO_ROT, 0, a),
    // 10px -> 0 across the same window, but focus pulls in ahead of the scale so the
    // tile is already sharp while it finishes settling.
    blur: INTRO_BLUR * (1 - a) ** 1.7,
    petals,
  };
};

export type RiseState = {dy: number; opacity: number; blur: number};

/**
 * Rise-from-below state with blur linked to instantaneous velocity.
 * Velocity is measured over the trailing half frame (a 180-degree shutter), in px per frame.
 */
export const riseState = (t: number, start: number, dur: number, distance: number, blurPerPx = 0.85): RiseState => {
  const dyAt = (tt: number) => distance * (1 - rise(progress(tt, start, dur)));
  const h = 0.5 / FPS;
  const dy = dyAt(t);
  const velocity = Math.abs(dyAt(t - h) - dy) / 0.5; // px per frame
  const opacity = fade(progress(t, start, dur * 0.42));
  return {dy, opacity, blur: Math.min(18, velocity * blurPerPx)};
};
