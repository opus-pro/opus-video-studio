import {Easing} from 'remotion';

export const FPS = 60;

// Advance windows in seconds. Each one moves the relay forward by one poster.
export const ADVANCES: ReadonlyArray<readonly [number, number]> = [
  [0.9, 1.54],
  [2.05, 2.69],
  [3.2, 3.84],
];

export const ease = Easing.bezier(0.22, 0.85, 0.2, 1);

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Continuous relay position: 0 = poster one is the hero, 3 = poster four. */
export const relayPosition = (t: number): number => {
  let p = 0;
  for (const [start, end] of ADVANCES) {
    p += ease(clamp01((t - start) / (end - start)));
  }
  return p;
};

// ---------------------------------------------------------------------------
// Motion blur envelope.
// Blur follows the eased velocity, with a short attack so it never pops on the
// first moving frame, and a velocity floor so it is fully gone long before the
// poster settles (the bezier has a very long, slow tail).
// ---------------------------------------------------------------------------
export const BLUR_PEAK_PX = 5;
const VELOCITY_FLOOR = 0.1; // fraction of peak speed below which blur is zero
const ATTACK = 0.09; // fraction of the window (~3.5 frames) for blur to ramp in

const H = 1e-4;
const speed = (u: number) => (ease(clamp01(u + H)) - ease(clamp01(u - H))) / (2 * H);

const PEAK_SPEED = (() => {
  let m = 0;
  for (let i = 0; i <= 4000; i++) m = Math.max(m, speed(i / 4000));
  return m;
})();

const rawEnvelope = (u: number) => {
  if (u <= 0 || u >= 1) return 0;
  const v = speed(u) / PEAK_SPEED;
  const body = clamp01((v - VELOCITY_FLOOR) / (1 - VELOCITY_FLOOR));
  return smoothstep(0, ATTACK, u) * body;
};

// Every window starts on a whole frame and lasts 38.4 frames, so all three
// sample the envelope at the same u values. Normalise against those rendered
// samples so the peak frame lands exactly on BLUR_PEAK_PX.
const ENVELOPE_PEAK = (() => {
  const [start, end] = ADVANCES[0];
  let m = 0;
  for (let f = Math.round(start * FPS); f <= Math.round(end * FPS); f++) {
    m = Math.max(m, rawEnvelope((f / FPS - start) / (end - start)));
  }
  return m;
})();

/** Horizontal motion blur (Gaussian std-dev, screen px) at time t. */
export const motionBlurAt = (t: number): number => {
  for (const [start, end] of ADVANCES) {
    if (t > start && t < end) {
      const u = (t - start) / (end - start);
      return Math.min(BLUR_PEAK_PX, (BLUR_PEAK_PX * rawEnvelope(u)) / ENVELOPE_PEAK);
    }
  }
  return 0;
};
