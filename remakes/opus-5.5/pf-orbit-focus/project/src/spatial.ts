// Pure spatial model for pf-orbit-focus. No imports: the renderer (src/Scene.tsx)
// and the audit script (scripts/audit.mjs, via Node type stripping) share it.

export type Vec3 = [number, number, number];

export const WIDTH = 1920;
export const HEIGHT = 1080;
export const FPS = 60;
export const DURATION_IN_FRAMES = 360;

export const CAMERA = {
  position: [0, 0, 12] as Vec3,
  fov: 54, // vertical, degrees
  near: 0.1,
  far: 100,
};

export const CARD_COUNT = 10;
export const CARD_W = 1.75;
export const CARD_H = 2.15;

export const ELLIPSE_RX = 7.9;
export const ELLIPSE_RY = 4.6;
export const ORBIT_ROT_X_DEG = 50;
export const ORBIT_ROT_Z_DEG = -8;

// Seconds.
export const T = {
  unfoldStart: 0,
  unfoldEnd: 0.8,
  orbitStart: 0.9,
  orbitMid: 1.85,
  orbitEnd: 2.8,
  focusStart: 3.2,
  focusEnd: 4.45,
};

export const HERO_INDEX = 2; // the coast card
export const HERO_TARGET: Vec3 = [0, 0, 11.1];
export const RECEDE_Z = -12;

// Flat row that the ring unfolds from.
export const ROW_Z = -2.2;
export const ROW_PITCH = 2.2;

// ---------------------------------------------------------------- easing

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** CSS-style cubic-bezier easing. */
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
  return (xIn: number) => {
    const x = clamp01(xIn);
    if (x === 0 || x === 1) return x;
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
        if (v < x) lo = s;
        else hi = s;
        s = (lo + hi) / 2;
      }
    }
    return sy(s);
  };
};

const easeUnfold = bezier(0.62, 0, 0.28, 1);
const easeRecede = bezier(0.5, 0, 0.35, 1);
const easeHeroDepth = bezier(0.58, 0, 0.2, 1);
const easeHeroPan = bezier(0.55, 0, 0.2, 1);
const easeDim = bezier(0.4, 0, 0.2, 1);

/**
 * Quintic Hermite segment: value 0 -> 1, velocities v0 -> v1 (in units of the
 * segment span per unit s), zero acceleration at both ends so segments join C2.
 */
const quinticHermite = (s: number, v0: number, v1: number) => {
  const t = clamp01(s);
  const t2 = t * t;
  const t3 = t2 * t;
  const t4 = t3 * t;
  const t5 = t4 * t;
  const h01 = 10 * t3 - 15 * t4 + 6 * t5;
  const h10 = t - 6 * t3 + 8 * t4 - 3 * t5;
  const h11 = -4 * t3 + 7 * t4 - 3 * t5;
  return h01 + v0 * h10 + v1 * h11;
};

// Orbit phase keyframes: 0 at 0.9s, PI/2 at 1.85s, PI at 2.8s. The carousel
// keeps some momentum through PI/2 (a "breath", not a dead stop).
const ORBIT_MID_VELOCITY = 0.55; // relative to each segment's average speed

export const orbitPhase = (t: number): number => {
  if (t <= T.orbitStart) return 0;
  if (t >= T.orbitEnd) return Math.PI;
  if (t <= T.orbitMid) {
    const s = (t - T.orbitStart) / (T.orbitMid - T.orbitStart);
    return (Math.PI / 2) * quinticHermite(s, 0, ORBIT_MID_VELOCITY);
  }
  const s = (t - T.orbitMid) / (T.orbitEnd - T.orbitMid);
  return Math.PI / 2 + (Math.PI / 2) * quinticHermite(s, ORBIT_MID_VELOCITY, 0);
};

// ---------------------------------------------------------------- orbit frame

const RX = (ORBIT_ROT_X_DEG * Math.PI) / 180;
const RZ = (ORBIT_ROT_Z_DEG * Math.PI) / 180;

/** Point on the local ellipse (z = 0 plane). */
export const ellipseLocal = (theta: number): Vec3 => [
  ELLIPSE_RX * Math.cos(theta),
  ELLIPSE_RY * Math.sin(theta),
  0,
];

/**
 * Orbit frame: rotate 50deg about world X, then -8deg about world Z.
 * world = Rz(-8deg) * Rx(50deg) * local   (three.js Euler(50deg, 0, -8deg, 'ZYX'))
 */
export const orbitToWorld = ([x, y, z]: Vec3): Vec3 => {
  const cx = Math.cos(RX);
  const sx = Math.sin(RX);
  const y1 = y * cx - z * sx;
  const z1 = y * sx + z * cx;
  const cz = Math.cos(RZ);
  const sz = Math.sin(RZ);
  return [x * cz - y1 * sz, x * sz + y1 * cz, z1];
};

export const cardTheta = (i: number, phase: number) => (2 * Math.PI * i) / CARD_COUNT + phase;

export const ringPosition = (i: number, phase: number): Vec3 =>
  orbitToWorld(ellipseLocal(cardTheta(i, phase)));

// Row slot for each card: the row is ordered by the card's x on the formed
// ring, so the unfold splits the strip into an upper and a lower arc with no
// crossing paths.
const ROW_SLOT: number[] = (() => {
  const order = Array.from({length: CARD_COUNT}, (_, i) => i).sort(
    (a, b) => ringPosition(a, 0)[0] - ringPosition(b, 0)[0],
  );
  const slots = new Array<number>(CARD_COUNT);
  order.forEach((card, slot) => {
    slots[card] = slot;
  });
  return slots;
})();

export const rowSlot = (i: number) => ROW_SLOT[i];

export const rowPosition = (i: number): Vec3 => [
  (ROW_SLOT[i] - (CARD_COUNT - 1) / 2) * ROW_PITCH,
  0,
  ROW_Z,
];

// ---------------------------------------------------------------- camera / projection

const TAN_HALF_FOV = Math.tan(((CAMERA.fov / 2) * Math.PI) / 180);
const ASPECT = WIDTH / HEIGHT;

export const viewDistance = (p: Vec3) => CAMERA.position[2] - p[2];

/** Pixels per world unit for a camera-facing plane at this depth. */
export const pxPerUnit = (p: Vec3) => HEIGHT / (2 * viewDistance(p) * TAN_HALF_FOV);

/** Screen position in px (origin top-left). */
export const projectPx = (p: Vec3): [number, number] => {
  const d = viewDistance(p);
  const ndcX = (p[0] - CAMERA.position[0]) / (d * TAN_HALF_FOV * ASPECT);
  const ndcY = (p[1] - CAMERA.position[1]) / (d * TAN_HALF_FOV);
  return [(ndcX * 0.5 + 0.5) * WIDTH, (0.5 - ndcY * 0.5) * HEIGHT];
};

export type Rect = {left: number; top: number; right: number; bottom: number};

export const cardRectPx = (p: Vec3): Rect => {
  const [cx, cy] = projectPx(p);
  const k = pxPerUnit(p);
  return {
    left: cx - (CARD_W / 2) * k,
    right: cx + (CARD_W / 2) * k,
    top: cy - (CARD_H / 2) * k,
    bottom: cy + (CARD_H / 2) * k,
  };
};

// ---------------------------------------------------------------- per-card state

export type CardState = {
  position: Vec3;
  /** Extra brightness multiplier (selection dim), 1 = untouched. */
  dim: number;
};

export const UNFOLD = {stagger: 0.022, splitLead: 0.45, lift: 0.2};

/** Linear 0..1 time progress of one card's unfold (centre-out stagger). */
const unfoldTime = (i: number, t: number) => {
  const rank = Math.abs(ROW_SLOT[i] - (CARD_COUNT - 1) / 2) - 0.5; // 0..4
  const start = T.unfoldStart + rank * UNFOLD.stagger;
  const dur = T.unfoldEnd - T.unfoldStart - 4 * UNFOLD.stagger;
  return clamp01((t - start) / dur);
};

/**
 * The strip first splits open (y / z lead), then each print slides sideways
 * into its ring slot, so neighbours separate before they converge.
 */
const unfoldProgress = (i: number, t: number) => {
  const u = unfoldTime(i, t);
  const lead = UNFOLD.splitLead;
  return {
    x: easeUnfold((u - lead) / (1 - lead)),
    yz: easeUnfold(u / (1 - lead * 0.35)),
    u,
  };
};

export const heroFocusProgress = (t: number) =>
  clamp01((t - T.focusStart) / (T.focusEnd - T.focusStart));

export const cardState = (i: number, t: number): CardState => {
  // 1. unfold
  if (t < T.orbitStart) {
    const p = unfoldProgress(i, t);
    const a = rowPosition(i);
    const b = ringPosition(i, 0);
    // A slight lift toward the camera mid-unfold gives the strip some body.
    const lift = Math.sin(Math.PI * p.yz) * UNFOLD.lift;
    // Interpolate x / y in view (screen) space and depth separately, so a
    // print coming forward never balloons outward toward the frame edge.
    const da = viewDistance(a);
    const db = viewDistance(b);
    const z = lerp(a[2], b[2], p.yz) + lift;
    const d = CAMERA.position[2] - z;
    const sx = lerp(a[0] / da, b[0] / db, p.x);
    const sy = lerp(a[1] / da, b[1] / db, p.yz);
    return {position: [sx * d, sy * d, z], dim: 1};
  }
  // 2. orbit + pause
  const phase = orbitPhase(t);
  const ring = ringPosition(i, phase);
  const dimT = easeDim(clamp01((t - 2.84) / 0.36));
  if (t < T.focusStart) {
    return {position: ring, dim: i === HERO_INDEX ? 1 : lerp(1, 0.6, dimT)};
  }
  // 3. focus
  const s = heroFocusProgress(t);
  if (i === HERO_INDEX) {
    const d0 = viewDistance(ring);
    const d1 = viewDistance(HERO_TARGET);
    const d = Math.exp(lerp(Math.log(d0), Math.log(d1), easeHeroDepth(s)));
    const pan = 1 - easeHeroPan(clamp01(s / 0.9));
    // Pan in screen space so the growth stays centred on the card.
    const qx = (ring[0] / d0) * pan;
    const qy = (ring[1] / d0) * pan;
    const z = CAMERA.position[2] - d;
    return {position: [qx * d, qy * d, z], dim: 1};
  }
  const e = easeRecede(s);
  return {position: [ring[0], ring[1], lerp(ring[2], RECEDE_Z, e)], dim: lerp(0.6, 0.35, e)};
};

// ---------------------------------------------------------------- texture mapping

export type ImageInfo = {w: number; h: number};

/**
 * Image pixels per world unit so the image covers the card (portrait crop).
 */
export const coverScale = (img: ImageInfo) => Math.min(img.w / CARD_W, img.h / CARD_H);

/**
 * For the hero card: widen the image mapping so that whatever part of the card
 * is inside the frame always maps inside the photo. Once the card fills the
 * frame this equals an exact object-fit: cover of the whole photo, so the
 * full-frame image uses every source pixel. The card's own size is untouched.
 */
export const heroImageScale = (p: Vec3, img: ImageInfo) => {
  const d = viewDistance(p);
  const hh = d * TAN_HALF_FOV;
  const hw = hh * ASPECT;
  const visX0 = Math.max(-CARD_W / 2, -hw - p[0]);
  const visX1 = Math.min(CARD_W / 2, hw - p[0]);
  const visY0 = Math.max(-CARD_H / 2, -hh - p[1]);
  const visY1 = Math.min(CARD_H / 2, hh - p[1]);
  const ax = Math.max(Math.abs(visX0), Math.abs(visX1));
  const ay = Math.max(Math.abs(visY0), Math.abs(visY1));
  const base = coverScale(img);
  const fit = Math.min(img.w / (2 * ax), img.h / (2 * ay));
  return Math.max(base, fit);
};

export const round = (x: number, n = 4) => Math.round(x * 10 ** n) / 10 ** n;
export {clamp01, lerp};
