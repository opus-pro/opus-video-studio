// Spatial / timing audit of the carousel motion (reads src/motion.ts directly
// via Node's type stripping). Writes spatial-audit.json at the project root.
// Usage: node scripts/audit.mjs
import {writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as m from '../src/motion.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCREENS = 3;
// Box-shadow reach beyond the frame (largest layer: 54px offset + 90px blur - 24px spread).
const SHADOW_X = 66;

const bounds = (s) => {
  const hw = (m.PHONE_W * s.scale) / 2;
  const hh = (m.PHONE_H * s.scale) / 2;
  return {left: s.x - hw, right: s.x + hw, top: s.y - hh, bottom: s.y + hh};
};
const offscreen = (b) => b.right + SHADOW_X < 0 || b.left - SHADOW_X > m.WIDTH;

const recycles = [];
const failures = [];
let peakBlur = 0;
let maxOvershoot = 0;
let minGap = Infinity;
for (let f = 0; f < m.DURATION; f++) {
  const states = [...Array(m.POOL).keys()].map((e) => m.phoneState(e, f, SCREENS));
  if (f > 0) {
    for (let e = 0; e < m.POOL; e++) {
      const prev = m.phoneState(e, f - 1, SCREENS);
      const cur = states[e];
      if (Math.abs(cur.x - prev.x) > 600 || cur.content !== prev.content) {
        const ok = offscreen(bounds(prev)) && offscreen(bounds(cur));
        recycles.push({phone: e, frame: f, fromX: +prev.x.toFixed(1), toX: +cur.x.toFixed(1), fromContent: prev.content, toContent: cur.content, fullyOffscreen: ok});
        if (!ok) failures.push(`phone ${e} recycled while visible at frame ${f}`);
      }
    }
  }
  for (const s of states) peakBlur = Math.max(peakBlur, s.blur);
  const a = m.activeShift(f);
  if (a) {
    for (const s of states) {
      const target = m.slotX(s.slot - 1);
      maxOvershoot = Math.max(maxOvershoot, target - s.x); // moving left: overshoot = past target
    }
  }
  if (f >= m.TIMING.openEnd) {
    const vis = states.map(bounds).filter((b) => !(b.right < 0 || b.left > m.WIDTH)).sort((p, q) => p.left - q.left);
    for (let i = 1; i < vis.length; i++) minGap = Math.min(minGap, vis[i].left - vis[i - 1].right);
  }
}

const snap = (f) =>
  [...Array(m.POOL).keys()].map((e) => {
    const s = m.phoneState(e, f, SCREENS);
    const b = bounds(s);
    return {phone: e, content: s.content, x: +s.x.toFixed(2), y: +s.y.toFixed(2), scale: +s.scale.toFixed(4), blur: +s.blur.toFixed(2), visible: !(b.right < 0 || b.left > m.WIDTH)};
  });

const blurAt = (w) => [0, 0.25, 0.5, 0.65, 0.75, 0.9, 1].map((t) => +m.shiftBlur(t).toFixed(2));
const report = {
  composition: {width: m.WIDTH, height: m.HEIGHT, fps: m.FPS, frames: m.DURATION},
  phone: {width: m.PHONE_W, height: m.PHONE_H},
  timing: m.TIMING,
  shiftCurve: 'cubic-bezier(0.8, 0, 0.5, 1.18)',
  maxOvershootPx: +maxOvershoot.toFixed(2),
  overshootLimitPx: m.MAX_OVERSHOOT_PX,
  peakBlurPx: +peakBlur.toFixed(2),
  blurProfile_t_0_25_50_65_75_90_100: blurAt(),
  minGapBetweenVisiblePhonesPx: +minGap.toFixed(1),
  recycles,
  keyframes: {
    'f0 closed stack': snap(0),
    'f30 stack open (0.5s)': snap(30),
    'f99 after shift 1 (1.65s)': snap(99),
    'f177 after shift 2 (2.95s)': snap(177),
    'f237 settled (3.95s)': snap(237),
  },
  failures,
};
await writeFile(path.join(root, 'spatial-audit.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({maxOvershootPx: report.maxOvershootPx, peakBlurPx: report.peakBlurPx, minGap: report.minGapBetweenVisiblePhonesPx, recycles, failures}, null, 1));
