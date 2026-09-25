import {Easing, interpolate} from 'remotion';

export const FPS = 60;
export const W = 1080;
export const H = 1920;
export const DURATION = 252;

// Seconds -> frames.
export const s = (sec: number) => sec * FPS;

// Beats (frames @ 60fps).
export const FLASH_START = s(0.68); // 40.8
export const FLASH_END = s(0.76); // 45.6
export const CUT_CLOSE = 42; // under the flash peak
export const CUT_DETAIL = 57;
export const CUT_WIDE = 73;
export const CUT_FINAL = 89; // 1.483s: last cut, settle on close
export const CHROME_OUT_START = 86;
export const CHROME_GONE = 102; // 1.70s — every piece of camera UI is gone before 1.72s

// Camera chrome geometry.
export const TOP_BAR = 140;
export const BOTTOM_BAR = 300;
export const FOCUS_W = 420;
export const FOCUS_H = 340;
export const SHUTTER = 104;

export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1), // expo-ish out
  outCubic: Easing.bezier(0.33, 1, 0.68, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.55, 0, 0.9, 0.35),
  gentle: Easing.bezier(0.3, 0.05, 0.25, 1),
};

export const clampInterp = (
  frame: number,
  input: number[],
  output: number[],
  easing?: (t: number) => number,
) =>
  interpolate(frame, input, output, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

export type ShotKey = 'wide' | 'close' | 'detail';

export const shotAt = (frame: number): {key: ShotKey; start: number; burst: boolean} => {
  if (frame < CUT_CLOSE) return {key: 'wide', start: 0, burst: false};
  if (frame < CUT_DETAIL) return {key: 'close', start: CUT_CLOSE, burst: true};
  if (frame < CUT_WIDE) return {key: 'detail', start: CUT_DETAIL, burst: true};
  if (frame < CUT_FINAL) return {key: 'wide', start: CUT_WIDE, burst: true};
  return {key: 'close', start: CUT_FINAL, burst: false};
};

// Horizontal crop of each 1024x1536 source inside the 1080x1920 frame (object-position x, %).
// Cover scale is 1.25 -> 1280px wide, 200px of horizontal slack.
export const SHOTS: Record<ShotKey, {file: string; posX: number}> = {
  wide: {file: 'assets/editorial-silver-wide.png', posX: 50},
  close: {file: 'assets/editorial-silver-close.png', posX: 30},
  detail: {file: 'assets/editorial-silver-detail.png', posX: 30},
};

// Focus-frame centre (canvas px) tracking the face in each shot.
export const FOCUS_CENTER: Record<ShotKey, [number, number]> = {
  wide: [537, 432],
  close: [420, 610],
  detail: [668, 706], // lock on the near eye
};
