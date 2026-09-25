// Pure timeline math for the carousel. No imports, so `node scripts/audit.mjs`
// can load it directly (type stripping) and verify the spec numbers.

export const FPS = 60;
export const WIDTH = 1440;
export const HEIGHT = 1080;
export const DURATION = 288;

export const PHONE_W = 330;
export const PHONE_H = 720;
export const CENTER_X = 720;
export const CENTER_Y = 540;
export const SIDE_SCALE = 0.78;
export const HERO_SCALE = 1;
export const SETTLED_HERO_SCALE = 1.03;
export const SIDE_PUSH = 25;
export const SLOT_PITCH = 490; // 720 - 230 = 1210 - 720
export const MAX_OVERSHOOT_PX = 24;
export const PEAK_BLUR = 4;

// 4 physical phones: three visible slots plus one staged off-screen right.
export const POOL = 4;

const s = (sec: number) => Math.round(sec * FPS);
export const TIMING = {
  openEnd: s(0.5), // 30
  shifts: [
    {start: s(1.0), end: s(1.65)}, // 60 -> 99
    {start: s(2.3), end: s(2.95)}, // 138 -> 177
  ],
  settle: {start: s(3.4), end: s(3.95)}, // 204 -> 237
};

export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const mod = (n: number, m: number) => ((n % m) + m) % m;

// CSS-style cubic-bezier(x1, y1, x2, y2). y may leave [0, 1] (overshoot).
export const cubicBezier = (x1: number, y1: number, x2: number, y2: number) => {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sx = (u: number) => ((ax * u + bx) * u + cx) * u;
  const sy = (u: number) => ((ay * u + by) * u + cy) * u;
  const dx = (u: number) => (3 * ax * u + 2 * bx) * u + cx;
  const solve = (x: number) => {
    let u = x;
    for (let i = 0; i < 8; i++) {
      const err = sx(u) - x;
      if (Math.abs(err) < 1e-7) return u;
      const d = dx(u);
      if (Math.abs(d) < 1e-6) break;
      u -= err / d;
    }
    let lo = 0;
    let hi = 1;
    u = x;
    for (let i = 0; i < 40; i++) {
      const v = sx(u);
      if (Math.abs(v - x) < 1e-7) break;
      if (v < x) lo = u;
      else hi = u;
      u = (lo + hi) / 2;
    }
    return u;
  };
  return (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : sy(solve(t)));
};

// The spec'd shift curve.
const shiftCurve = cubicBezier(0.8, 0, 0.5, 1.18);
const sampleMax = (fn: (t: number) => number) => {
  let m = -Infinity;
  for (let i = 0; i <= 2000; i++) m = Math.max(m, fn(i / 2000));
  return m;
};
const CURVE_PEAK = sampleMax(shiftCurve); // ~1.019
// Keep the natural overshoot, but never let a phone travel more than 24px past its slot.
const OVERSHOOT_GAIN = Math.min(1, MAX_OVERSHOOT_PX / ((CURVE_PEAK - 1) * SLOT_PITCH));
export const shiftProgress = (t: number) => {
  const p = shiftCurve(t);
  return p <= 1 ? p : 1 + (p - 1) * OVERSHOOT_GAIN;
};
export const SHIFT_OVERSHOOT_PX = (CURVE_PEAK - 1) * OVERSHOOT_GAIN * SLOT_PITCH;

// Motion blur follows speed: 0 at rest, 4px at peak velocity, 0 again on landing.
const speed = (t: number) => {
  const h = 1e-3;
  return Math.abs(shiftProgress(clamp(t + h)) - shiftProgress(clamp(t - h))) / (2 * h);
};
// Normalise on the frames that actually render (39-frame windows) so the
// fastest rendered frame lands on exactly 4px.
const SHIFT_FRAMES = TIMING.shifts[0].end - TIMING.shifts[0].start;
let PEAK_SPEED = 0;
for (let i = 0; i <= SHIFT_FRAMES; i++) PEAK_SPEED = Math.max(PEAK_SPEED, speed(i / SHIFT_FRAMES));
export const shiftBlur = (t: number) => {
  if (t <= 0 || t >= 1) return 0;
  const landing = clamp((1 - t) / 0.12); // taper the tiny overshoot return to exactly 0
  return (PEAK_BLUR * speed(t) * landing) / PEAK_SPEED;
};

// Starts from the resting closed stack (zero velocity), lands softly by 0.5s.
const openCurve = cubicBezier(0.5, 0, 0.2, 1);
const openSpeed = (t: number) => {
  const h = 1e-3;
  return Math.abs(openCurve(clamp(t + h)) - openCurve(clamp(t - h))) / (2 * h);
};
let OPEN_PEAK = 0;
for (let i = 0; i <= 30; i++) OPEN_PEAK = Math.max(OPEN_PEAK, openSpeed(i / 30));
const OPEN_BLUR = 3;
const settleCurve = cubicBezier(0.25, 0.9, 0.3, 1);

export const slotX = (k: number) => CENTER_X + (k - 1) * SLOT_PITCH;
export const slotScale = (k: number) => (k === 1 ? HERO_SCALE : SIDE_SCALE);

export type PhoneState = {
  x: number;
  y: number;
  scale: number;
  rotate: number;
  blur: number; // screen-space horizontal blur in px
  slot: number; // resting slot after completed shifts (0 left, 1 hero, 2 right, 3 staged)
  content: number; // index into the screens array
};

export const shiftsDone = (f: number) => TIMING.shifts.filter((w) => f >= w.end).length;
export const activeShift = (f: number) => TIMING.shifts.find((w) => f >= w.start && f < w.end);

// Content is bound per slot so that the hero walks A -> B -> C. A phone only
// changes content when it wraps from slot 0 (parked off-screen left) to slot 3.
const CONTENT_OFFSET = 2;

export const phoneState = (e: number, f: number, screens: number): PhoneState => {
  const done = shiftsDone(f);
  const k = mod(e - done, POOL);
  let x = slotX(k);
  let scale = slotScale(k);
  let y = CENTER_Y;
  let rotate = 0;
  let blur = 0;

  const a = activeShift(f);
  if (a) {
    const t = (f - a.start) / (a.end - a.start);
    const p = shiftProgress(t);
    x = lerp(slotX(k), slotX(k - 1), p);
    scale = lerp(slotScale(k), slotScale(k - 1), p);
    blur = shiftBlur(t);
  }

  // Open the stack (0 -> 0.5s): the side phones fan out from behind the hero.
  if (done === 0 && f < TIMING.openEnd && k !== 3) {
    const ot = clamp(f / TIMING.openEnd);
    const o = openCurve(ot);
    const dir = k - 1; // -1 left, 0 hero, +1 right
    if (dir === 0) {
      scale = lerp(0.9, HERO_SCALE, o);
      y = lerp(CENTER_Y + 18, CENTER_Y, o);
    } else {
      x = lerp(CENTER_X + dir * 64, slotX(k), o);
      scale = lerp(0.72, SIDE_SCALE, o);
      y = lerp(CENTER_Y + 30, CENTER_Y, o);
      rotate = lerp(dir * 7, 0, o);
      blur = ot > 0 && ot < 1 ? (OPEN_BLUR * openSpeed(ot)) / OPEN_PEAK : 0;
    }
  }

  // 3.4 -> 3.95s: sides step out 25px, hero settles at 1.03.
  const q = settleCurve(clamp((f - TIMING.settle.start) / (TIMING.settle.end - TIMING.settle.start)));
  if (!a && q > 0) {
    if (k === 0) x -= SIDE_PUSH * q;
    if (k === 2) x += SIDE_PUSH * q;
    if (k === 1) scale = lerp(HERO_SCALE, SETTLED_HERO_SCALE, q);
  }

  return {
    x,
    y,
    scale,
    rotate,
    blur,
    slot: k,
    content: mod(k + done + CONTENT_OFFSET, screens),
  };
};
