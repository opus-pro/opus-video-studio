import {HEIGHT, WIDTH} from './spiral';

// All type is positioned with explicit pixel boxes so the overlay and the text-protection
// mask in the card shader agree exactly.
export const FONT_FAMILY = 'Geist';

export const HEADLINE_SIZE = 128;
export const HEADLINE_LINE = 132; // line box height (px)
export const HEADLINE_TRACKING = -0.045; // em
export const LEAD_WEIGHT = 300; // "A wider" / "Find your"
export const KEY_WEIGHT = 640; // "perspective."

export const EYEBROW_SIZE = 20;
export const EYEBROW_LINE = 24;
export const EYEBROW_TRACKING = 0.42; // em
export const EYEBROW_WEIGHT = 540;
export const EYEBROW_GAP = 34; // eyebrow line box -> first headline line box

export const TEXT_COLOR = '#F6F3EE';

export const LEAD_OLD = 'A wider';
export const LEAD_NEW = 'Find your';
export const KEY_LINE = 'perspective.';
export const EYEBROW = 'FIELD NOTES';

const BLOCK_HEIGHT = EYEBROW_LINE + EYEBROW_GAP + HEADLINE_LINE * 2;
// Optical centre: nudge the block up a touch so the headline mass sits on the centre line.
const OPTICAL_OFFSET = -6;
export const BLOCK_TOP = Math.round(HEIGHT / 2 - BLOCK_HEIGHT / 2 + OPTICAL_OFFSET);
export const EYEBROW_TOP = BLOCK_TOP;
export const LINE1_TOP = BLOCK_TOP + EYEBROW_LINE + EYEBROW_GAP;
export const LINE2_TOP = LINE1_TOP + HEADLINE_LINE;

export type TextMetrics = {
  leadOld: number;
  leadNew: number;
  key: number;
  eyebrow: number;
};

const measure = (text: string, weight: number, size: number, trackingEm: number): number => {
  const span = document.createElement('span');
  span.textContent = text;
  Object.assign(span.style, {
    position: 'absolute',
    visibility: 'hidden',
    whiteSpace: 'pre',
    fontFamily: FONT_FAMILY,
    fontWeight: String(weight),
    fontSize: `${size}px`,
    letterSpacing: `${trackingEm}em`,
    fontKerning: 'normal',
  } satisfies Partial<CSSStyleDeclaration>);
  document.body.appendChild(span);
  // Trailing letter-spacing is not ink; remove it from the measured advance.
  const w = span.getBoundingClientRect().width - trackingEm * size;
  span.remove();
  return w;
};

export const measureText = (): TextMetrics => ({
  leadOld: measure(LEAD_OLD, LEAD_WEIGHT, HEADLINE_SIZE, HEADLINE_TRACKING),
  leadNew: measure(LEAD_NEW, LEAD_WEIGHT, HEADLINE_SIZE, HEADLINE_TRACKING),
  key: measure(KEY_LINE, KEY_WEIGHT, HEADLINE_SIZE, HEADLINE_TRACKING),
  eyebrow: measure(EYEBROW, EYEBROW_WEIGHT, EYEBROW_SIZE, EYEBROW_TRACKING),
});

// Text-protection capsules (px, top-left origin): one soft pill per line, smooth-unioned
// in the card shader and feathered. [centerX, centerY, halfWidth, halfHeight].
export type Capsule = [number, number, number, number];

export const PROTECT_PAD_X = 48;
export const PROTECT_PAD_Y = 18;
export const PROTECT_FEATHER = 190; // px from capsule edge to full card opacity
export const PROTECT_MIN_OPACITY = 0.1;
export const PROTECT_SMOOTH_UNION = 70; // px

export const protectionCapsules = (m: TextMetrics, leadWidth: number): Capsule[] => {
  const cx = WIDTH / 2;
  const glyphHalf = HEADLINE_SIZE * 0.4;
  return [
    [cx, EYEBROW_TOP + EYEBROW_LINE / 2, m.eyebrow / 2 + PROTECT_PAD_X, EYEBROW_SIZE * 0.5 + PROTECT_PAD_Y],
    [cx, LINE1_TOP + HEADLINE_LINE / 2 + 2, leadWidth / 2 + PROTECT_PAD_X, glyphHalf + PROTECT_PAD_Y],
    [cx, LINE2_TOP + HEADLINE_LINE / 2 + 2, m.key / 2 + PROTECT_PAD_X, glyphHalf + PROTECT_PAD_Y],
  ];
};
