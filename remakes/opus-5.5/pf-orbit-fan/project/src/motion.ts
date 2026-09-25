import {Easing} from 'remotion';

export const FPS = 60;
export const DURATION = 288;

// Geometry (px, deg)
export const W = 1440;
export const H = 1080;
export const PIVOT_X = 720;
export const PIVOT_Y = 1500;
export const RADIUS = 940;
export const CARD_W = 340;
export const CARD_H = 500;
export const FOOTER_H = 180;
export const STEP = 17;
export const CLOSED = 4;
export const YIELD = 5;
export const SELECT_SCALE = 1.12;
export const PEAK_BLUR = 3;

const s = (sec: number) => sec * FPS;

// Timeline (frames)
export const OPEN = [s(0), s(0.6)] as const; // 0 -> 36
export const ROT1 = [s(0.9), s(1.65)] as const; // 54 -> 99
export const ROT2 = [s(2.0), s(2.75)] as const; // 120 -> 165
export const SEL = [s(3.1), s(3.65)] as const; // 186 -> 219

// Opening: starts from rest, snaps open, long settle.
export const easeOpen = Easing.bezier(0.3, 0, 0.08, 1);
// Rotation: short wind-up, then a fast deceleration into the slot.
export const easeRot = Easing.bezier(0.25, 0, 0, 1);
// Selection: calm, no overshoot so the scale lands exactly on 1.12.
export const easeSel = Easing.bezier(0.32, 0, 0.1, 1);

export const progress = (frame: number, [a, b]: readonly [number, number], ease: (t: number) => number) => {
  if (frame <= a) return 0;
  if (frame >= b) return 1;
  return ease((frame - a) / (b - a));
};

// Numerical derivative of an eased segment, in "progress per frame".
const rate = (frame: number, seg: readonly [number, number], ease: (t: number) => number) => {
  const h = 0.05;
  return (progress(frame + h, seg, ease) - progress(frame - h, seg, ease)) / (2 * h);
};

// Peak rate of the rotation curve, used to normalise blur so rotations peak at exactly 3px.
const ROT_PEAK_RATE = (() => {
  let peak = 0;
  for (let f = ROT1[0]; f <= ROT1[1]; f += 0.05) peak = Math.max(peak, rate(f, ROT1, easeRot));
  return peak;
})();
const ROT_PEAK_DEG_PER_FRAME = ROT_PEAK_RATE * STEP;

export type FanState = {
  spread: number; // deg between neighbouring slots (4 -> 17)
  offset: number; // global fan rotation (deg), 0 -> -17 -> -34
  sel: number; // selection progress 0..1
  spreadRate: number; // d(spread)/dframe
  offsetRate: number; // d(offset)/dframe
  selRate: number;
};

export const fanState = (frame: number): FanState => {
  const open = progress(frame, OPEN, easeOpen);
  const r1 = progress(frame, ROT1, easeRot);
  const r2 = progress(frame, ROT2, easeRot);
  return {
    spread: CLOSED + (STEP - CLOSED) * open,
    offset: -STEP * (r1 + r2),
    sel: progress(frame, SEL, easeSel),
    spreadRate: (STEP - CLOSED) * rate(frame, OPEN, easeOpen),
    offsetRate: -STEP * (rate(frame, ROT1, easeRot) + rate(frame, ROT2, easeRot)),
    selRate: rate(frame, SEL, easeSel),
  };
};

// Motion blur from angular speed (deg/frame). Rotations hit exactly PEAK_BLUR at their
// fastest frame (0 -> 3 -> 0); the opening uses the same scale, capped at PEAK_BLUR.
export const blurFor = (degPerFrame: number) =>
  Math.min(PEAK_BLUR, (PEAK_BLUR * Math.abs(degPerFrame)) / ROT_PEAK_DEG_PER_FRAME);
