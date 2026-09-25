// Pure spatial model for the depth spiral. No React / Remotion / three imports so the
// same code drives the renderer and scripts/audit.mjs (run by Node with type stripping).

export const WIDTH = 1920;
export const HEIGHT = 1080;
export const FPS = 60;
export const DURATION_FRAMES = 348;

export const CAMERA_Z = 12;
export const CAMERA_FOV = 48; // vertical, degrees
export const CAMERA_NEAR = 0.1;
export const CAMERA_FAR = 100;
export const ASPECT = WIDTH / HEIGHT;

export const CARD_COUNT = 12;
export const CARD_SIZE = 2; // PlaneGeometry(2, 2), scale (1, 1, 1)
export const SPIRAL_RADIUS = 3.8;
export const Z_FAR = -22;
export const Z_SPAN = 31; // z = -22 + 31u  ->  [-22, 9]

export const TRAVEL_END = 0.46;
export const TRAVEL_SECONDS = 4.6;
export const TRAVEL_END_FRAME = TRAVEL_SECONDS * FPS; // 276

export const TEXTURES = ['coast', 'forest', 'desert', 'mountains'] as const;
export type TextureName = (typeof TEXTURES)[number];
export const textureForCard = (i: number): TextureName => TEXTURES[i % TEXTURES.length];

// Travel ease: gentle launch, long glide, zero velocity into the hold at 4.6s.
export const TRAVEL_BEZIER: [number, number, number, number] = [0.4, 0, 0.14, 1];

const cubicBezier = (x1: number, y1: number, x2: number, y2: number) => {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dsx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number): number => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let k = 0; k < 8; k++) {
      const err = sx(t) - x;
      const d = dsx(t);
      if (Math.abs(err) < 1e-9) return sy(t);
      if (Math.abs(d) < 1e-7) break;
      t -= err / d;
    }
    let lo = 0;
    let hi = 1;
    t = x;
    for (let k = 0; k < 60; k++) {
      const v = sx(t);
      if (Math.abs(v - x) < 1e-10) break;
      if (v < x) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return sy(t);
  };
};

const travelEase = cubicBezier(...TRAVEL_BEZIER);

/** Travel at a (possibly fractional) frame. 0 -> 0.46 over frames 0..276, then held. */
export const travelAtFrame = (frame: number): number => {
  const p = Math.min(1, Math.max(0, frame / TRAVEL_END_FRAME));
  return TRAVEL_END * travelEase(p);
};

const TAN_HALF_FOV = Math.tan((CAMERA_FOV * Math.PI) / 360);
/** Pixels per world unit at distance 1 from the camera. */
export const FOCAL_PX = HEIGHT / 2 / TAN_HALF_FOV;

export type ScreenRect = {left: number; top: number; right: number; bottom: number};

/** Screen-space rect (px, top-left origin) of a camera-facing 2x2 card centred at (x, y, z). */
export const projectCard = (x: number, y: number, z: number): ScreenRect | null => {
  const d = CAMERA_Z - z;
  if (d <= CAMERA_NEAR) return null; // at/behind the camera: not drawn
  const s = FOCAL_PX / d;
  const cx = WIDTH / 2 + x * s;
  const cy = HEIGHT / 2 - y * s;
  const h = (CARD_SIZE / 2) * s;
  return {left: cx - h, top: cy - h, right: cx + h, bottom: cy + h};
};

/** A card counts as "fully left frame" only when it clears every edge by this many px. */
export const OFFSCREEN_MARGIN_PX = 8;

export const isFullyOutOfFrame = (rect: ScreenRect | null, margin = OFFSCREEN_MARGIN_PX): boolean => {
  if (!rect) return true;
  return rect.left > WIDTH + margin || rect.right < -margin || rect.top > HEIGHT + margin || rect.bottom < -margin;
};

export const rectVisibleFraction = (rect: ScreenRect | null): number => {
  if (!rect) return 0;
  const w = Math.max(0, Math.min(WIDTH, rect.right) - Math.max(0, rect.left));
  const h = Math.max(0, Math.min(HEIGHT, rect.bottom) - Math.max(0, rect.top));
  return (w * h) / ((rect.right - rect.left) * (rect.bottom - rect.top));
};

/** Spec position for a given u (u may exceed 1 while a near card is still exiting frame). */
export const positionFor = (i: number, u: number, travel: number) => {
  const z = Z_FAR + Z_SPAN * u;
  const angle = 2 * Math.PI * (1.5 * u + i / CARD_COUNT) + 0.3 * (travel / 0.1);
  return {x: SPIRAL_RADIUS * Math.cos(angle), y: SPIRAL_RADIUS * Math.sin(angle), z, angle};
};

// For each card and each lap, the travel value at which the card is allowed to recycle:
// the first travel >= the nominal wrap (u = fract(...) rolling over) at which the card,
// still continuing along its path past z = 9, has fully left frame.
const recycleCache = new Map<string, number>();
export const recycleTravel = (i: number, lap: number): number => {
  const key = `${i}:${lap}`;
  const cached = recycleCache.get(key);
  if (cached !== undefined) return cached;
  const wrap = lap - i / CARD_COUNT;
  const step = 1e-5;
  let t = wrap;
  for (let k = 0; k < 200000; k++) {
    const u = t + i / CARD_COUNT - (lap - 1); // unwrapped u >= 1
    const p = positionFor(i, u, t);
    if (isFullyOutOfFrame(projectCard(p.x, p.y, p.z))) break;
    t += step;
  }
  recycleCache.set(key, t);
  return t;
};

export type CardState = {
  index: number;
  texture: TextureName;
  /** Nominal spec phase fract(i/12 + travel). */
  uSpec: number;
  /** Phase actually used; equals uSpec except while a near card is still exiting frame (> 1). */
  u: number;
  held: boolean;
  x: number;
  y: number;
  z: number;
  angle: number;
  /** Depth fade-in at the far end so recycled cards arrive from the haze, never pop. */
  fade: number;
  /** Atmospheric haze toward the background colour (0 = none). */
  haze: number;
};

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export const FADE_IN_U = 0.17;

export const cardState = (i: number, travel: number): CardState => {
  const phase = i / CARD_COUNT + travel;
  const lap = Math.floor(phase);
  const uSpec = phase - lap;
  let u = uSpec;
  let held = false;
  if (lap >= 1 && travel < recycleTravel(i, lap)) {
    u = uSpec + 1;
    held = true;
  }
  const p = positionFor(i, u, travel);
  const d = CAMERA_Z - p.z;
  const fade = held ? 1 : smoothstep(0, FADE_IN_U, u);
  const haze = 0.72 * Math.pow(smoothstep(5, 34, d), 1.15);
  return {index: i, texture: textureForCard(i), uSpec, u, held, x: p.x, y: p.y, z: p.z, angle: p.angle, fade, haze};
};

export const allCards = (travel: number): CardState[] =>
  Array.from({length: CARD_COUNT}, (_, i) => cardState(i, travel));

// ---------------------------------------------------------------------------------------
// Text timing (frames at 60 fps)
export const SWAP_START_FRAME = Math.round(3.7 * FPS); // 222
export const SWAP_END_FRAME = Math.round(4.35 * FPS); // 261

// Text protection: a feathered ellipse (px, top-left origin) that lowers card opacity
// locally behind the type. Never a rectangle.
export const PROTECT = {
  centerX: WIDTH / 2,
  centerY: HEIGHT / 2,
  radiusX: 640,
  radiusY: 300,
  inner: 0.34, // full reduction inside this normalised radius
  outer: 1.0, // no reduction beyond this normalised radius
  minOpacity: 0.2,
};

export const protectionFactor = (px: number, py: number): number => {
  const qx = (px - PROTECT.centerX) / PROTECT.radiusX;
  const qy = (py - PROTECT.centerY) / PROTECT.radiusY;
  const r = Math.hypot(qx, qy);
  return PROTECT.minOpacity + (1 - PROTECT.minOpacity) * smoothstep(PROTECT.inner, PROTECT.outer, r);
};

// Motion blur: centred shutter, in frames.
export const SHUTTER_FRAMES = 0.55; // ~200 degree shutter
export const MIN_BLUR_SAMPLES = 8;
export const MAX_BLUR_SAMPLES = 48;
export const BLUR_STEP_PX = 1.1; // max on-screen travel between two shutter samples

/** Largest on-screen displacement (px) of any drawn card edge across the shutter. */
export const shutterTravelPx = (frame: number): number => {
  const half = SHUTTER_FRAMES / 2;
  const a = travelAtFrame(frame - half);
  const b = travelAtFrame(frame + half);
  if (Math.abs(b - a) < 1e-9) return 0;
  let worst = 0;
  for (let i = 0; i < CARD_COUNT; i++) {
    const ca = cardState(i, a);
    const cb = cardState(i, b);
    if (Math.abs(ca.u - cb.u) > 0.5) continue; // recycled inside the shutter: far end is invisible
    const ra = projectCard(ca.x, ca.y, ca.z);
    const rb = projectCard(cb.x, cb.y, cb.z);
    if (!ra || !rb) continue;
    if (rectVisibleFraction(ra) <= 0 && rectVisibleFraction(rb) <= 0) continue;
    worst = Math.max(worst, Math.abs(ra.left - rb.left), Math.abs(ra.right - rb.right), Math.abs(ra.top - rb.top), Math.abs(ra.bottom - rb.bottom));
  }
  return worst;
};

export const blurSamplesForFrame = (frame: number): number => {
  const px = shutterTravelPx(frame);
  if (px < 0.05) return 1;
  return Math.min(MAX_BLUR_SAMPLES, Math.max(MIN_BLUR_SAMPLES, Math.ceil(px / BLUR_STEP_PX)));
};
