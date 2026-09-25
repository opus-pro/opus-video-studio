import {Easing} from 'remotion';

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const prog = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export const outExpo = Easing.bezier(0.16, 1, 0.3, 1);
export const outCubic = Easing.bezier(0.33, 1, 0.68, 1);
export const outQuart = Easing.bezier(0.25, 1, 0.5, 1);
export const inCubic = Easing.bezier(0.55, 0, 0.85, 0.35);
export const inOutCubic = Easing.bezier(0.65, 0, 0.35, 1);
export const inOutSine = Easing.bezier(0.37, 0, 0.63, 1);
// Long, cinematic push: slow start, fast middle, long silky settle.
export const push = Easing.bezier(0.6, 0, 0.18, 1);

export type Pt = {x: number; y: number};
/** Zoom point p about centre z by factor s. */
export const zoom = (p: Pt, z: Pt, s: number): Pt => ({x: z.x + (p.x - z.x) * s, y: z.y + (p.y - z.y) * s});
