// Single source of truth for the relay's geometry and timing.
// Imported by the Remotion scene and by scripts/spatial-audit.mjs, so the audit
// describes exactly what is rendered. Keep this file dependency-free.

export const WIDTH = 1200;
export const HEIGHT = 1200;
export const FPS = 60;
export const DURATION_IN_FRAMES = 288;

export const CAMERA = {
  position: [0, 0, 10] as [number, number, number],
  fov: 40,
  near: 0.1,
  far: 100,
};

export const CARD_WIDTH = 2.7;
export const CARD_HEIGHT = 3.5;
export const CARD_COUNT = 4;

// Loop: x = 2.9 sin(theta) / sqrt(2), y = 2.9 sin(theta) / sqrt(2), z = -1 + 2.6 cos(theta)
export const LOOP_RADIUS = 2.9;
export const LOOP_Z_CENTER = -1;
export const LOOP_Z_RADIUS = 2.6;

// Phase advances by PI/2 in each window (seconds).
export const SEGMENTS: ReadonlyArray<readonly [number, number]> = [
  [0.9, 1.54],
  [2.05, 2.69],
  [3.2, 3.84],
];

// Motion blur: a Hann-weighted exposure 0.8 frame wide, centred on the frame time. Its
// temporal spread (std 0.145 frame) matches a 180 degree box shutter, but trails fall off
// softly instead of ending in hard "slab" edges.
export const SHUTTER_SECONDS = 0.8 / FPS;
export const shutterWeight = (u: number): number => Math.cos(Math.PI * (u - 0.5)) ** 2;

export const cubicBezier = (x1: number, y1: number, x2: number, y2: number) => {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number): number => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const err = sampleX(t) - x;
      if (Math.abs(err) < 1e-9) return sampleY(t);
      const d = slopeX(t);
      if (Math.abs(d) < 1e-7) break;
      t -= err / d;
    }
    let lo = 0;
    let hi = 1;
    t = x;
    for (let i = 0; i < 60 && hi - lo > 1e-10; i++) {
      if (sampleX(t) < x) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return sampleY(t);
  };
};

export const relayEase = cubicBezier(0.22, 0.85, 0.2, 1);

/** Continuous relay progress in [0, 3]: whole numbers are rests, fractions are hand-offs. */
export const relayProgress = (seconds: number, ease: (x: number) => number = relayEase): number => {
  let p = 0;
  for (const [start, end] of SEGMENTS) {
    if (seconds >= end) p += 1;
    else if (seconds > start) p += ease((seconds - start) / (end - start));
  }
  return p;
};

export const phaseAt = (seconds: number): number => relayProgress(seconds) * (Math.PI / 2);

export const thetaFor = (index: number, phase: number): number => (index * Math.PI) / 2 - phase;

export const loopPosition = (theta: number): [number, number, number] => {
  const s = (LOOP_RADIUS * Math.sin(theta)) / Math.SQRT2;
  return [s, s, LOOP_Z_CENTER + LOOP_Z_RADIUS * Math.cos(theta)];
};

export const cardPosition = (index: number, phase: number): [number, number, number] =>
  loopPosition(thetaFor(index, phase));

const Z_FRONT = LOOP_Z_CENTER + LOOP_Z_RADIUS;
const Z_BACK = LOOP_Z_CENTER - LOOP_Z_RADIUS;

/** Aerial-perspective falloff (sRGB multiplier) for a card at world depth z. */
export const depthShade = (z: number): number => {
  const t = Math.min(1, Math.max(0, (Z_FRONT - z) / (Z_FRONT - Z_BACK)));
  return 1 - 0.5 * Math.pow(t, 1.15);
};

/** Index of the card nearest the front slot for a relay progress value. */
export const activeIndex = (progress: number): number => Math.min(CARD_COUNT - 1, Math.round(progress));
