import {rng} from './util';

// ---------- S1: 24h checkout conversion, 15-min buckets (i=0 -> 16:45 yesterday, i=95 -> 16:30 today)
export const N1 = 96;
export const ANOM_START = 85; // 14:00 bucket
export const ANOM_IDX = 88; // flagged point
const r1 = rng(7);
export const forecast1: number[] = [];
export const actual1: number[] = [];
for (let i = 0; i < N1; i++) {
  const f = 4.12 + 0.42 * Math.sin((2 * Math.PI * i) / 96 - 0.6) + 0.06 * Math.sin((2 * Math.PI * i) / 12);
  forecast1.push(f);
  const noise = (r1() - 0.5) * 0.16 + (r1() - 0.5) * 0.06;
  let drop = 1;
  if (i >= ANOM_START) {
    const k = i - ANOM_START;
    drop = [0.94, 0.84, 0.79, 0.766, 0.775, 0.77, 0.768, 0.779, 0.772, 0.776, 0.771][Math.min(k, 10)];
  }
  actual1.push(i >= ANOM_START ? f * drop + noise * 0.3 : f + noise);
}
// pin the flagged point so the label reads true
actual1[ANOM_IDX] = forecast1[ANOM_IDX] * 0.766;

// ---------- sparklines
export const spark = (seed: number, n: number, base: number, amp: number, tail?: number) => {
  const r = rng(seed);
  const out: number[] = [];
  let v = base;
  for (let i = 0; i < n; i++) {
    v += (r() - 0.5) * amp;
    v += (base - v) * 0.2;
    let t = v;
    if (tail !== undefined && i >= n - 6) t = v + tail * ((i - (n - 7)) / 6);
    out.push(t);
  }
  return out;
};

// ---------- heatmap 8 regions x 24 hours
export const REGIONS = ['APAC-N', 'APAC-S', 'EU-C', 'EU-N', 'EU-W', 'LATAM', 'NA-E', 'NA-W'];
const r2 = rng(19);
export const heat: number[][] = REGIONS.map((_, ri) =>
  Array.from({length: 24}, (_, h) => {
    const v = 0.45 + 0.35 * Math.sin((h / 24) * Math.PI * 2 + ri * 0.7) + (r2() - 0.5) * 0.25;
    return Math.max(0.05, Math.min(1, v));
  }),
);

// ---------- S2 region deltas (alphabetical, then sorted)
export const REGION_DELTAS: {name: string; d: number}[] = [
  {name: 'APAC North', d: -0.6},
  {name: 'APAC South', d: +0.4},
  {name: 'EU Central', d: -1.1},
  {name: 'EU North', d: -0.8},
  {name: 'EU West', d: -23.4},
  {name: 'LATAM', d: +0.9},
  {name: 'NA East', d: -0.3},
  {name: 'NA West', d: +1.6},
];

// ---------- S3: 12:00 -> 16:40 at 5-min resolution (57 pts)
export const N3 = 57;
export const DEPLOY_T = 122 / 280; // 14:02 fraction of window
const r3 = rng(41);
export const conv3: number[] = [];
export const err3: number[] = [];
for (let i = 0; i < N3; i++) {
  const t = i / (N3 - 1);
  const after = t > DEPLOY_T + 0.005;
  const ramp = after ? Math.min(1, (t - DEPLOY_T) / 0.05) : 0;
  conv3.push(4.3 + 0.12 * Math.sin(i * 0.5) + (r3() - 0.5) * 0.12 - ramp * 1.0);
  err3.push(0.4 + (r3() - 0.5) * 0.18 + ramp * (3.2 + (r3() - 0.5) * 0.5));
}

// scatter: error rate vs conversion
const r4 = rng(77);
export const scatter: {x: number; y: number; post: boolean}[] = [];
for (let i = 0; i < 42; i++) {
  const post = i % 2 === 1 && i > 8;
  const x = post ? 2.6 + r4() * 1.3 : 0.2 + r4() * 0.8;
  const y = 4.55 - x * 0.3 + (r4() - 0.5) * 0.28;
  scatter.push({x, y, post});
}
