import {SWAP_END_FRAME, SWAP_START_FRAME} from './spiral';

// Headline swap choreography, 3.7s (f222) -> 4.35s (f261). Word-level so kerning survives.
export const OUT_START = SWAP_START_FRAME; // 222
export const OUT_STAGGER = 3;
export const OUT_DURATION = 14;
export const IN_START = SWAP_START_FRAME + 15; // 237
export const IN_STAGGER = 5;
export const IN_DURATION = SWAP_END_FRAME - IN_START - IN_STAGGER; // 19 -> last word rests at 261

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export const easeInCubic = (t: number) => t * t * t;
export const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export type WordPose = {opacity: number; y: number; blur: number};

/** Outgoing word k: rises, softens and fades. y in em. */
export const outPose = (frame: number, k: number): WordPose => {
  const t = clamp01((frame - (OUT_START + k * OUT_STAGGER)) / OUT_DURATION);
  const e = easeInCubic(t);
  return {opacity: 1 - easeOutCubic(t), y: -0.3 * e, blur: 10 * e};
};

/** Incoming word k: rises from below into place, sharpens, rests exactly at f261. */
export const inPose = (frame: number, k: number): WordPose => {
  const t = clamp01((frame - (IN_START + k * IN_STAGGER)) / IN_DURATION);
  const e = easeOutQuint(t);
  // Opacity lags the rise slightly so a word is never visible while it still sits low
  // enough to touch the line below.
  return {opacity: easeOutCubic(clamp01((t - 0.06) / 0.94)), y: 0.18 * (1 - e), blur: 10 * (1 - e)};
};

/** Width (px) the lead-line protection capsule should cover at this frame. */
export const leadProtectWidth = (frame: number, oldW: number, newW: number) =>
  oldW + (Math.max(oldW, newW) - oldW) * smooth(OUT_START - 8, IN_START, frame);
