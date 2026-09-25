// Route geometry: a smooth Catmull-Rom trail that passes exactly through the
// spec knots, sampled into a dense polyline so partial draws, head position and
// arc length are all deterministic (no DOM measuring).

export type Pt = {x: number; y: number};

export const KNOTS: Pt[] = [
  {x: 150, y: 850},
  {x: 340, y: 520},
  {x: 620, y: 680},
  {x: 850, y: 260},
];

const SAMPLES_PER_SEGMENT = 140;
// < 1 tightens the turns so each bend peaks close to its knot.
const TENSION = 0.78;

const bezier = (a: Pt, b: Pt, c: Pt, d: Pt, t: number): Pt => {
  const u = 1 - t;
  const w0 = u * u * u;
  const w1 = 3 * u * u * t;
  const w2 = 3 * u * t * t;
  const w3 = t * t * t;
  return {x: w0 * a.x + w1 * b.x + w2 * c.x + w3 * d.x, y: w0 * a.y + w1 * b.y + w2 * c.y + w3 * d.y};
};

const buildSamples = (): Pt[] => {
  const k = KNOTS;
  const first = {x: 2 * k[0].x - k[1].x, y: 2 * k[0].y - k[1].y};
  const last = {x: 2 * k[k.length - 1].x - k[k.length - 2].x, y: 2 * k[k.length - 1].y - k[k.length - 2].y};
  const ext = [first, ...k, last];
  const out: Pt[] = [];
  for (let i = 0; i < k.length - 1; i++) {
    const p0 = ext[i];
    const p1 = ext[i + 1];
    const p2 = ext[i + 2];
    const p3 = ext[i + 3];
    const c1 = {x: p1.x + ((p2.x - p0.x) / 6) * TENSION, y: p1.y + ((p2.y - p0.y) / 6) * TENSION};
    const c2 = {x: p2.x - ((p3.x - p1.x) / 6) * TENSION, y: p2.y - ((p3.y - p1.y) / 6) * TENSION};
    for (let s = 0; s < SAMPLES_PER_SEGMENT; s++) {
      out.push(bezier(p1, c1, c2, p2, s / SAMPLES_PER_SEGMENT));
    }
  }
  out.push(k[k.length - 1]);
  return out;
};

// Subtle GPS-like meander, faded to zero at every knot so the route still
// passes exactly through the spec points.
const WOBBLE_PX = 3.2;
const addMeander = (base: Pt[]): Pt[] => {
  const cum = [0];
  for (let i = 1; i < base.length; i++) cum.push(cum[i - 1] + Math.hypot(base[i].x - base[i - 1].x, base[i].y - base[i - 1].y));
  const knotIdx = KNOTS.map((_, i) => Math.min(i * SAMPLES_PER_SEGMENT, base.length - 1));
  return base.map((pt, i) => {
    const a = base[Math.max(0, i - 1)];
    const b = base[Math.min(base.length - 1, i + 1)];
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const nx = -(b.y - a.y) / len;
    const ny = (b.x - a.x) / len;
    const s = cum[i];
    const nearest = Math.min(...knotIdx.map((k) => Math.abs(cum[k] - s)));
    const w = Math.min(1, nearest / 60);
    const win = w * w * (3 - 2 * w);
    const d = WOBBLE_PX * win * (0.62 * Math.sin(s / 34 + 1.3) + 0.38 * Math.sin(s / 11.5 + 0.4));
    return {x: pt.x + nx * d, y: pt.y + ny * d};
  });
};

export const SAMPLES = addMeander(buildSamples());

export const CUMULATIVE: number[] = (() => {
  const c = [0];
  for (let i = 1; i < SAMPLES.length; i++) {
    const dx = SAMPLES[i].x - SAMPLES[i - 1].x;
    const dy = SAMPLES[i].y - SAMPLES[i - 1].y;
    c.push(c[i - 1] + Math.hypot(dx, dy));
  }
  return c;
})();

export const TOTAL_LENGTH = CUMULATIVE[CUMULATIVE.length - 1];

const fmt = (n: number) => n.toFixed(2);

/** SVG path for the first `progress` (0..1) of the route, plus the head point. */
export const partialRoute = (progress: number): {d: string; head: Pt} | null => {
  const p = Math.min(1, Math.max(0, progress));
  if (p <= 0) return null;
  const target = p * TOTAL_LENGTH;
  let d = `M${fmt(SAMPLES[0].x)} ${fmt(SAMPLES[0].y)}`;
  let head = SAMPLES[0];
  for (let i = 1; i < SAMPLES.length; i++) {
    if (CUMULATIVE[i] <= target) {
      d += `L${fmt(SAMPLES[i].x)} ${fmt(SAMPLES[i].y)}`;
      head = SAMPLES[i];
    } else {
      const segLen = CUMULATIVE[i] - CUMULATIVE[i - 1];
      const t = segLen > 0 ? (target - CUMULATIVE[i - 1]) / segLen : 0;
      head = {
        x: SAMPLES[i - 1].x + (SAMPLES[i].x - SAMPLES[i - 1].x) * t,
        y: SAMPLES[i - 1].y + (SAMPLES[i].y - SAMPLES[i - 1].y) * t,
      };
      d += `L${fmt(head.x)} ${fmt(head.y)}`;
      break;
    }
  }
  return {d, head};
};
