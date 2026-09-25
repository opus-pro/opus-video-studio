// Deterministic trail-map geometry for the FIELD screens: a height field,
// marching-squares contours, a smooth route with arc-length lookup and an
// elevation profile. Computed once at module load.

export const MAP_W = 310;
export const MAP_H = 232;

type Pt = [number, number];

// --- Height field --------------------------------------------------------
const bumps: Array<[number, number, number, number]> = [
  // x, y, amplitude, sigma
  [196, 34, 1.0, 62],
  [62, 58, 0.62, 44],
  [292, 20, 0.7, 48],
  [132, 150, 0.22, 40],
  [244, 172, -0.42, 34],
];
const height = (x: number, y: number) => {
  let h = 0.0016 * (MAP_H - y) + 0.035 * Math.sin(x * 0.043 + y * 0.021) + 0.03 * Math.cos(y * 0.06 - x * 0.017);
  for (const [bx, by, a, s] of bumps) {
    const d2 = (x - bx) ** 2 + (y - by) ** 2;
    h += a * Math.exp(-d2 / (2 * s * s));
  }
  return h;
};

const STEP = 4;
const buildContours = () => {
  const cols = Math.ceil(MAP_W / STEP) + 1;
  const rows = Math.ceil(MAP_H / STEP) + 1;
  const g: number[][] = [];
  let lo = Infinity;
  let hi = -Infinity;
  for (let j = 0; j < rows; j++) {
    g[j] = [];
    for (let i = 0; i < cols; i++) {
      const v = height(i * STEP, j * STEP);
      g[j][i] = v;
      lo = Math.min(lo, v);
      hi = Math.max(hi, v);
    }
  }
  const minor: string[] = [];
  const major: string[] = [];
  const interval = 0.062;
  let n = 0;
  for (let level = Math.ceil(lo / interval) * interval; level < hi; level += interval, n++) {
    const out = n % 5 === 0 ? major : minor;
    for (let j = 0; j < rows - 1; j++) {
      for (let i = 0; i < cols - 1; i++) {
        const a = g[j][i];
        const b = g[j][i + 1];
        const c = g[j + 1][i + 1];
        const d = g[j + 1][i];
        const x = i * STEP;
        const y = j * STEP;
        const pts: Pt[] = [];
        const edge = (v0: number, v1: number, p0: Pt, p1: Pt) => {
          if ((v0 < level) !== (v1 < level)) {
            const t = (level - v0) / (v1 - v0);
            pts.push([p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t]);
          }
        };
        edge(a, b, [x, y], [x + STEP, y]);
        edge(b, c, [x + STEP, y], [x + STEP, y + STEP]);
        edge(c, d, [x + STEP, y + STEP], [x, y + STEP]);
        edge(d, a, [x, y + STEP], [x, y]);
        for (let k = 0; k + 1 < pts.length; k += 2) {
          out.push(`M${pts[k][0].toFixed(1)} ${pts[k][1].toFixed(1)}L${pts[k + 1][0].toFixed(1)} ${pts[k + 1][1].toFixed(1)}`);
        }
      }
    }
  }
  return {minor: minor.join(''), major: major.join('')};
};
export const CONTOURS = buildContours();

// --- Route -----------------------------------------------------------------
const ROUTE_PTS: Pt[] = [
  [30, 204],
  [52, 186],
  [58, 160],
  [84, 146],
  [104, 124],
  [132, 116],
  [146, 92],
  [172, 80],
  [196, 90],
  [214, 76],
  [236, 94],
  [246, 118],
  [236, 140],
  [218, 160],
  [230, 190],
  [262, 204],
  [286, 190],
];

// Catmull-Rom -> cubic Bezier segments.
const segs: Array<[Pt, Pt, Pt, Pt]> = [];
for (let i = 0; i < ROUTE_PTS.length - 1; i++) {
  const p0 = ROUTE_PTS[Math.max(0, i - 1)];
  const p1 = ROUTE_PTS[i];
  const p2 = ROUTE_PTS[i + 1];
  const p3 = ROUTE_PTS[Math.min(ROUTE_PTS.length - 1, i + 2)];
  const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
  const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
  segs.push([p1, c1, c2, p2]);
}
export const ROUTE_D =
  `M${ROUTE_PTS[0][0]} ${ROUTE_PTS[0][1]}` +
  segs.map(([, c1, c2, p]) => `C${c1[0].toFixed(2)} ${c1[1].toFixed(2)} ${c2[0].toFixed(2)} ${c2[1].toFixed(2)} ${p[0]} ${p[1]}`).join('');

const bez = ([p0, p1, p2, p3]: [Pt, Pt, Pt, Pt], t: number): Pt => {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
};
const samples: Pt[] = [];
for (const sg of segs) for (let i = 0; i < 80; i++) samples.push(bez(sg, i / 80));
samples.push(ROUTE_PTS[ROUTE_PTS.length - 1]);
const cum: number[] = [0];
for (let i = 1; i < samples.length; i++) {
  cum.push(cum[i - 1] + Math.hypot(samples[i][0] - samples[i - 1][0], samples[i][1] - samples[i - 1][1]));
}
const TOTAL = cum[cum.length - 1];

export const pointAt = (u: number): Pt => {
  const target = Math.min(1, Math.max(0, u)) * TOTAL;
  let lo = 0;
  let hi = cum.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] < target) lo = mid;
    else hi = mid;
  }
  const t = (target - cum[lo]) / Math.max(1e-6, cum[hi] - cum[lo]);
  return [samples[lo][0] + (samples[hi][0] - samples[lo][0]) * t, samples[lo][1] + (samples[hi][1] - samples[lo][1]) * t];
};

// --- Elevation profile (metres) ---------------------------------------------
const ELEV: Pt[] = [
  [0, 1090],
  [0.1, 1128],
  [0.22, 1214],
  [0.36, 1452],
  [0.5, 1748],
  [0.58, 1862],
  [0.64, 1846],
  [0.76, 1662],
  [0.9, 1496],
  [1, 1432],
];
const slope = (i: number) => {
  const a = ELEV[Math.max(0, i - 1)];
  const b = ELEV[Math.min(ELEV.length - 1, i + 1)];
  return (b[1] - a[1]) / (b[0] - a[0]);
};
// Cubic Hermite through the keypoints (smooth, no stair-stepping).
export const elevationAt = (u: number) => {
  const x = Math.min(1, Math.max(0, u));
  let i = 0;
  while (i < ELEV.length - 2 && ELEV[i + 1][0] < x) i++;
  const [x0, y0] = ELEV[i];
  const [x1, y1] = ELEV[i + 1];
  const h = x1 - x0;
  const t = (x - x0) / h;
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    (2 * t3 - 3 * t2 + 1) * y0 + (t3 - 2 * t2 + t) * h * slope(i) + (-2 * t3 + 3 * t2) * y1 + (t3 - t2) * h * slope(i + 1)
  );
};
export const ELEV_MIN = 1000;
export const ELEV_MAX = 1960;
