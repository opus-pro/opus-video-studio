import type React from 'react';
import {Easing} from 'remotion';

export const W = 960;
export const H = 540;
export const PERSPECTIVE = 1100;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const EASE = {
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  soft: Easing.bezier(0.45, 0.05, 0.25, 1),
  out: Easing.bezier(0.16, 1, 0.3, 1),
  outBack: Easing.bezier(0.34, 1.45, 0.64, 1),
  in: Easing.bezier(0.55, 0, 0.9, 0.35),
  outSoft: Easing.bezier(0.22, 0.7, 0.28, 1),
  linear: (t: number) => t,
};

export const prog = (f: number, a: number, b: number, ease: (t: number) => number = EASE.inOut) =>
  ease(clamp((f - a) / (b - a)));

type Ease = (t: number) => number;
export type NumKey = [number, number, Ease?];

/** Piecewise keyframe track. The easing on a key applies to the segment that ends on it. */
export const track = (f: number, keys: NumKey[]): number => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [f1, v1, e] = keys[i];
    const [f0, v0] = keys[i - 1];
    if (f <= f1) return lerp(v0, v1, (e ?? EASE.inOut)((f - f0) / (f1 - f0)));
  }
  return keys[keys.length - 1][1];
};

export type Pose = {x: number; y: number; z: number; rx: number; ry: number; rz: number; s: number};
export const P = (p: Partial<Pose>): Pose => ({x: 480, y: 270, z: 0, rx: 0, ry: 0, rz: 0, s: 1, ...p});

export type PoseKey = [number, Partial<Pose>, Ease?];
/** Keyframed pose; every key inherits unspecified fields from the previous key. */
export const poseTrack = (f: number, keys: PoseKey[]): Pose => {
  const full: [number, Pose, Ease | undefined][] = [];
  let prev = P({});
  for (const [kf, p, e] of keys) {
    prev = {...prev, ...p};
    full.push([kf, prev, e]);
  }
  const out = {} as Pose;
  (Object.keys(prev) as (keyof Pose)[]).forEach((k) => {
    out[k] = track(
      f,
      full.map(([kf, p, e]) => [kf, p[k], e] as NumKey),
    );
  });
  return out;
};

export const mixPose = (a: Pose, b: Pose, t: number): Pose => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  z: lerp(a.z, b.z, t),
  rx: lerp(a.rx, b.rx, t),
  ry: lerp(a.ry, b.ry, t),
  rz: lerp(a.rz, b.rz, t),
  s: lerp(a.s, b.s, t),
});

const RAD = Math.PI / 180;

/** World position of a local point (lx, ly from the element's top-left, lz toward viewer). */
export const localPoint = (p: Pose, w: number, h: number, lx: number, ly: number, lz = 0): [number, number, number] => {
  let x = p.s * (lx - w / 2);
  let y = p.s * (ly - h / 2);
  let z = p.s * lz;
  // rotateZ
  let c = Math.cos(p.rz * RAD);
  let s = Math.sin(p.rz * RAD);
  [x, y] = [x * c - y * s, x * s + y * c];
  // rotateX
  c = Math.cos(p.rx * RAD);
  s = Math.sin(p.rx * RAD);
  [y, z] = [y * c - z * s, y * s + z * c];
  // rotateY
  c = Math.cos(p.ry * RAD);
  s = Math.sin(p.ry * RAD);
  [x, z] = [x * c + z * s, -x * s + z * c];
  return [p.x + x, p.y + y, p.z + z];
};

/** Pose of a child plane sitting at a local point of a parent plane (same orientation). */
export const childPose = (p: Pose, w: number, h: number, lx: number, ly: number, lz = 0, scale = 1): Pose => {
  const [x, y, z] = localPoint(p, w, h, lx, ly, lz);
  return {...p, x, y, z, s: p.s * scale};
};

export const tf = (p: Pose, w: number, h: number) =>
  `translate3d(${p.x}px, ${p.y}px, ${p.z}px) rotateY(${p.ry}deg) rotateX(${p.rx}deg) rotateZ(${p.rz}deg) scale(${p.s}) translate(${-w / 2}px, ${-h / 2}px)`;

export type Cam = {x: number; y: number; z: number; ry: number; rx: number; pz: number};
export const camTf = (c: Cam) =>
  `translate3d(480px, 270px, ${c.pz}px) rotateY(${c.ry}deg) rotateX(${c.rx}deg) translate3d(-480px, -270px, ${-c.pz}px) translate3d(${c.x}px, ${c.y}px, ${c.z}px)`;

export const objStyle = (cam: string, p: Pose, w: number, h: number): React.CSSProperties => ({
  position: 'absolute',
  left: 0,
  top: 0,
  width: w,
  height: h,
  transformOrigin: '0 0',
  transform: `${cam} ${tf(p, w, h)}`,
});

/** Approximate screen projection of a world point (camera translation only). */
export const project = (pt: [number, number, number], cam: Cam): [number, number] => {
  const x = pt[0] + cam.x;
  const y = pt[1] + cam.y;
  const z = pt[2] + cam.z;
  const k = PERSPECTIVE / (PERSPECTIVE - z);
  return [480 + (x - 480) * k, 270 + (y - 270) * k];
};

/** Temporal sampling for motion blur: returns sub-frame offsets and per-copy alpha. */
export const shutter = (dispPerFrame: number, angle = 0.55, maxN = 9) => {
  const smear = dispPerFrame * angle;
  const n = smear < 1.5 ? 1 : Math.max(2, Math.min(maxN, Math.ceil(smear / 1.3)));
  if (n === 1) return {offsets: [0], alpha: 1};
  const offsets = Array.from({length: n}, (_, i) => angle * (i / (n - 1) - 0.5));
  const alpha = 1 - Math.pow(0.03, 1 / n);
  return {offsets, alpha};
};

export const dist2 = (a: [number, number], b: [number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** Deterministic pseudo random. */
export const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif';
