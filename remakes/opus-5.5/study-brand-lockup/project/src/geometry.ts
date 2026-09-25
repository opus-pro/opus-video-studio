// Geometry and timing constants for the Symbol to Wordmark lockup.
// Every number here is taken from the spec; nothing is eyeballed.
import {Easing} from 'remotion';

export const CANVAS = {width: 960, height: 540, fps: 30, frames: 66} as const;

// "E": one shared ease for every move. A soft start with a long, quiet settle,
// so each object arrives gently and is fully at rest on its end frame.
export const E = Easing.bezier(0.45, 0, 0.15, 1);

export const MARK = {
  nominal: 80, // rendered diameter at scale 1
  start: {x: 480, y: 270},
  end: {x: 370, y: 270}, // settled bbox (330,230,80,80)
  scaleFrom: 0.2,
  scaleTo: 1,
  scaleFrames: [0, 18] as const,
  blurFrom: 5,
  blurFrames: [0, 12] as const,
  travelFrames: [25, 40] as const,
};

export const WORD = {
  box: {x: 455, y: 239, width: 300, height: 62},
  fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
  fontWeight: 700,
  fontSize: 48,
  minFontSize: 25,
  lineHeight: 62,
  // Light wordmark tracking (+30): opens the bold lowercase a touch and lands
  // the default word's visible width on the spec's ~138px.
  letterSpacingEm: 0.03,
  revealFrames: [27, 42] as const,
  blurFrom: 12,
  shiftFrom: 18,
};

// Soft mask that keeps the word out from under the mark while it slides away:
// the word is hidden left of (mark's right lobe tip + GAP) and fully visible
// FEATHER px further right. At rest the mask edge sits at 438, left of x455.
export const REVEAL_MASK = {gap: 8, feather: 20};

// Shutter for the directional motion blur on the traveling mark (180 degrees).
export const SHUTTER = 0.5;
