export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const out4 = (t: number, a: number, d: number) =>
  1 - (1 - clamp01((t - a) / d)) ** 4;
export const smooth = (t: number, a: number, d: number) => {
  const q = clamp01((t - a) / d);
  return q * q * (3 - 2 * q);
};
export const mix = (a: number, b: number, q: number) => a + (b - a) * q;
