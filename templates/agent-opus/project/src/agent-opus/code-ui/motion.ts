import timing from "./timing.json";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const x = timing.knots.map((k) => k[1]),
  y = timing.knots.map((k) => k[0]);
const h = x.slice(1).map((a, i) => a - x[i]);
const d = y.slice(1).map((a, i) => (a - y[i]) / h[i]);
// Monotone cubic time warp: source velocity is continuous through checkpoints.
// It retains every approved cut/landing, but never jumps to a new playback rate.
const tangent = x.map((_, i) => {
  if (i === 0) return d[0];
  if (i === x.length - 1) return d[d.length - 1];
  if (d[i - 1] * d[i] <= 0) return 0;
  const a = 2 * h[i] + h[i - 1],
    b = h[i] + 2 * h[i - 1];
  return (a + b) / (a / d[i - 1] + b / d[i]);
});
export function sourceSeconds(output: number) {
  if (output <= x[0]) return y[0];
  if (output >= x[x.length - 1]) return y[y.length - 1];
  let i = 0;
  while (x[i + 1] < output) i++;
  const u = (output - x[i]) / h[i];
  return (
    (2 * u ** 3 - 3 * u * u + 1) * y[i] +
    (u ** 3 - 2 * u * u + u) * h[i] * tangent[i] +
    (-2 * u ** 3 + 3 * u * u) * y[i + 1] +
    (u ** 3 - u * u) * h[i] * tangent[i + 1]
  );
}
export function outputSeconds(source: number) {
  if (source <= y[0]) return x[0];
  if (source >= y[y.length - 1]) return x[x.length - 1];
  let lo = x[0],
    hi = x[x.length - 1];
  for (let i = 0; i < 42; i++) {
    const mid = (lo + hi) / 2;
    if (sourceSeconds(mid) < source) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
export const sourceAt = (f: number) => sourceSeconds(f / 30) * 30;
export const outputAt = (f: number) => outputSeconds(f / 30) * 30;

// A single impulse with a brief acceleration, fast travel and short braking.
// Zero endpoint velocity joins holds cleanly; there are no per-axis resets.
function bezier(u: number, a: number, b: number) {
  return 3 * (1 - u) ** 2 * u * a + 3 * (1 - u) * u * u * b + u ** 3;
}
export function sweep(t: number, a: number, b: number) {
  const p = clamp((t - a) / (b - a));
  if (p === 0 || p === 1) return p;
  let lo = 0,
    hi = 1;
  for (let i = 0; i < 18; i++) {
    const m = (lo + hi) / 2;
    if (bezier(m, 0.62, 0.18) < p) lo = m;
    else hi = m;
  }
  return bezier((lo + hi) / 2, 0, 1);
}
export const mix = (a: number, b: number, q: number) => a + (b - a) * q;
export type Pose = { scale: number; x: number; y: number };
const pose = (scale: number, x = 0, y = 0): Pose => ({ scale, x, y });
const between = (a: Pose, b: Pose, q: number): Pose => ({
  scale: mix(a.scale, b.scale, q),
  x: mix(a.x, b.x, q),
  y: mix(a.y, b.y, q),
});
const shots: [number, number, Pose, Pose][] = [
  [8.8, 9.033333, pose(1.7, 650, 0), pose(0.95)],
  [10, 10.233333, pose(0.95), pose(1.58, -180, 220)],
  [11.166667, 11.4, pose(1.58, -180, 220), pose(1)],
  [12.333333, 12.566667, pose(1), pose(1.38, 240, 95)],
  [13.766667, 14, pose(1.38, 240, 95), pose(0.93)],
];
export function canvasCamera(t: number): Pose {
  let last = shots[0][2];
  for (const [a, b, from, to] of shots) {
    if (t < a) return last;
    if (t <= b) return between(from, to, sweep(t, a, b));
    last = to;
  }
  // One continuous drift over the playing results, replacing the tiny zoom tap.
  return pose(mix(0.93, 1.03, clamp((t - 14.866667) / (19.5 - 14.866667))));
}
const cycleMotion = [
  {
    start: 24.633333,
    push: [25.12, 25.4],
    submit: [26.75, 27.12],
    reveal: [27.4, 27.666667],
  },
  {
    start: 31.433333,
    push: [31.9, 32.166667],
    submit: [33.35, 33.76],
    reveal: [33.78, 34.033333],
  },
  {
    start: 37.8,
    push: [38.28, 38.55],
    submit: [40.1, 40.58],
    reveal: [40.6, 40.866667],
  },
];
export function creationCamera(t: number, i: number): Pose {
  const c = cycleMotion[i],
    q = sweep(t, c.push[0], c.push[1]),
    leave = sweep(t, c.submit[0], c.submit[1]);
  return pose(
    1 + q * 0.95 + leave * 0.17,
    -q * 650 - leave * 90,
    q * 80 + leave * 15,
  );
}
export const resultReveal = (t: number, i: number) =>
  sweep(t, cycleMotion[i].reveal[0], cycleMotion[i].reveal[1]);
export function inputPose(t: number) {
  const zoom = sweep(t, 4.94, 5.68),
    travel = sweep(t, 5.68, 6.63);
  const z = mix(1, 2.08, zoom),
    focus = mix(394, -1251, travel);
  return { z, x: focus - 84 * z, cy: mix(616, 542, zoom) };
}
export function blurFor(current: Pose, previous: Pose) {
  const dz = Math.abs(current.scale - previous.scale) * 850;
  return {
    x: Math.min(16, (Math.abs(current.x - previous.x) + dz) * 0.13),
    y: Math.min(12, (Math.abs(current.y - previous.y) + dz) * 0.13),
  };
}
