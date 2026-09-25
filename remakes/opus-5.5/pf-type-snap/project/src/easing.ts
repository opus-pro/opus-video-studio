// Cubic-bezier easing that allows y outside [0, 1] (needed for overshoot curves).
export type Ease = (t: number) => number;

export const cubicBezier = (x1: number, y1: number, x2: number, y2: number): Ease => {
  const bx = (s: number) => 3 * (1 - s) * (1 - s) * s * x1 + 3 * (1 - s) * s * s * x2 + s * s * s;
  const by = (s: number) => 3 * (1 - s) * (1 - s) * s * y1 + 3 * (1 - s) * s * s * y2 + s * s * s;
  return (t: number) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    // x(s) is monotonic for x1, x2 in [0, 1]; bisection is robust and cheap.
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 48; i++) {
      const mid = (lo + hi) / 2;
      if (bx(mid) < t) lo = mid;
      else hi = mid;
    }
    return by((lo + hi) / 2);
  };
};

// Peak value of an easing over [0, 1] (sampled), used to cap overshoot in pixels.
export const peakOf = (ease: Ease, samples = 4000): number => {
  let max = -Infinity;
  for (let i = 0; i <= samples; i++) max = Math.max(max, ease(i / samples));
  return max;
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// Peak value of an easing and the normalized time at which it occurs.
export const peakWithTime = (ease: Ease, samples = 6000) => {
  let p = -Infinity;
  let u = 0;
  for (let i = 0; i <= samples; i++) {
    const v = ease(i / samples);
    if (v > p) {
      p = v;
      u = i / samples;
    }
  }
  return {p, u};
};

// Builds an offset function (px from rest) for a word that travels `distance`
// px on `ease`, capping the overshoot past rest at `maxOvershoot` px.
//  - Before the curve's peak the overshoot is folded through tanh, so velocity
//    stays continuous where the word crosses its rest position.
//  - After the peak the return is mapped quadratically, so the word eases back
//    to rest with zero velocity instead of clunking into place.
export const cappedTravel = (ease: Ease, distance: number, maxOvershoot: number) => {
  const peak = peakWithTime(ease);
  const excess = Math.max(1e-9, peak.p - 1);
  const peakPx = maxOvershoot * Math.tanh((distance * excess) / maxOvershoot);
  const fn = (u: number) => {
    const p = ease(clamp01(u));
    if (p <= 1 || peak.p <= 1) return distance * (1 - Math.min(1, p));
    const e = p - 1;
    if (u < peak.u) return -maxOvershoot * Math.tanh((distance * e) / maxOvershoot);
    return -peakPx * (e / excess) * (e / excess);
  };
  return {fn, peakPx};
};

// Two-phase "snap" progress: an ease-in-out travel that lands at 1 + overshoot
// with zero velocity at `split`, then a cosine settle back to exactly 1.
export const snapProgress = (travel: Ease, overshoot: number, split: number): Ease => (u: number) => {
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  if (u < split) return (1 + overshoot) * travel(u / split);
  return 1 + overshoot * 0.5 * (1 + Math.cos((Math.PI * (u - split)) / (1 - split)));
};
