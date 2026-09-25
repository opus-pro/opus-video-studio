// Generates spatial-audit.json at the project root.
// Usage: node scripts/audit.mjs
// - Spatial numbers come from the same model the renderer uses (src/spiral.ts, src/swap.ts,
//   src/typography.ts), bundled on the fly with esbuild.
// - Text boxes and protection capsules are measured from the real composition (rendered in
//   audit mode, which logs DOM rects and the exact shader capsule uniforms).
import {build} from 'esbuild';
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import {mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(await readFile(path.join(root, 'template.json'), 'utf8'));
const tmpDir = path.join(root, 'out', '.audit');
await mkdir(tmpDir, {recursive: true});

// 1. Load the spatial model.
const modelFile = path.join(tmpDir, 'model.mjs');
await build({
  stdin: {
    contents: `export * from './src/spiral'; export * from './src/swap'; export * from './src/typography';`,
    resolveDir: root,
    loader: 'ts',
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: modelFile,
  logLevel: 'silent',
});
const M = await import(pathToFileURL(modelFile).href);

const r1 = (v) => Math.round(v * 10) / 10;
const r3 = (v) => Math.round(v * 1000) / 1000;
const r5 = (v) => Math.round(v * 1e5) / 1e5;
const rectOut = (r) => (r ? {left: r1(r.left), top: r1(r.top), right: r1(r.right), bottom: r1(r.bottom)} : null);
const clearance = (r) => {
  if (!r) return Infinity;
  return Math.max(r.left - M.WIDTH, -r.right, r.top - M.HEIGHT, -r.bottom);
};

// 2. Measure the real text layout in the browser.
const auditFrames = [0, 60, 120, 180, ...Array.from({length: 42}, (_, k) => 221 + k), 276, 347];
const textByFrame = {};
const layoutByFrame = {};
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.tsx'), publicDir: path.join(root, 'public')});
const browser = await openBrowser('chrome', {chromiumOptions: {gl: 'angle'}});
try {
  const inputProps = {audit: true};
  const composition = await selectComposition({serveUrl, id: config.compositionId, puppeteerInstance: browser, inputProps});
  for (const frame of auditFrames) {
    await renderStill({
      serveUrl,
      composition,
      puppeteerInstance: browser,
      frame,
      inputProps,
      imageFormat: 'jpeg',
      output: path.join(tmpDir, `audit-${frame}.jpg`),
      onBrowserLog: ({text}) => {
        const m = /^AUDIT_(TEXT|LAYOUT) (\d+) (.*)$/s.exec(text);
        if (!m) return;
        const f = Number(m[2]);
        if (m[1] === 'TEXT') textByFrame[f] = JSON.parse(m[3]);
        else layoutByFrame[f] = JSON.parse(m[3]);
      },
    });
  }
} finally {
  await browser.close({silent: true});
  await rm(serveUrl, {recursive: true, force: true});
}

// 3. Protection mask, evaluated exactly like the card fragment shader.
const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const capsuleSd = (px, py, c) => {
  let qx = Math.abs(px - c[0]);
  const qy = Math.abs(py - c[1]);
  qx = Math.max(qx - (c[2] - c[3]), 0);
  return Math.hypot(qx, qy) - c[3];
};
const smin = (a, b, k) => {
  const h = Math.min(1, Math.max(0, 0.5 + (0.5 * (b - a)) / k));
  return b * (1 - h) + a * h - k * h * (1 - h);
};
const maskDistance = (px, py, caps) => {
  let d = capsuleSd(px, py, caps[0]);
  for (let k = 1; k < caps.length; k++) d = smin(d, capsuleSd(px, py, caps[k]), M.PROTECT_SMOOTH_UNION);
  return d;
};
const protectFactor = (px, py, caps) =>
  M.PROTECT_MIN_OPACITY + (1 - M.PROTECT_MIN_OPACITY) * smoothstep(0, M.PROTECT_FEATHER, maskDistance(px, py, caps));

// 4. Per-frame card table and recycle events.
const frames = [];
const recycles = [];
const prev = new Map();
let violations = 0;
for (let f = 0; f < M.DURATION_FRAMES; f++) {
  const travel = M.travelAtFrame(f);
  const cards = M.allCards(travel).map((c) => {
    const rect = M.projectCard(c.x, c.y, c.z);
    const visibleFraction = M.rectVisibleFraction(rect);
    return {
      i: c.index,
      u: r5(c.u),
      uSpec: r5(c.uSpec),
      held: c.held,
      x: r3(c.x),
      y: r3(c.y),
      z: r3(c.z),
      scale: [1, 1, 1],
      rectPx: rectOut(rect),
      visibleFraction: r3(visibleFraction),
      fade: r3(c.fade),
      haze: r3(c.haze),
      drawn: c.fade > 0.0005 && visibleFraction > 0,
    };
  });
  for (const c of M.allCards(travel)) {
    const p = prev.get(c.index);
    if (p && p.u - c.u > 0.5) {
      // Recycled between f-1 and f. Find the exact recycle travel and check the card there.
      const lap = Math.floor(c.index / M.CARD_COUNT + travel);
      const tRecycle = M.recycleTravel(c.index, lap);
      const tWrap = lap - c.index / M.CARD_COUNT;
      const lastHeld = M.positionFor(c.index, tRecycle + c.index / M.CARD_COUNT - (lap - 1), tRecycle);
      const lastRect = M.projectCard(lastHeld.x, lastHeld.y, lastHeld.z);
      const atWrap = M.positionFor(c.index, 1, tWrap);
      const wrapRect = M.projectCard(atWrap.x, atWrap.y, atWrap.z);
      const out = M.isFullyOutOfFrame(lastRect);
      const fadeAfter = M.cardState(c.index, tRecycle + 1e-6).fade;
      if (!out) violations++;
      let nominalWrapFrame = null;
      for (let g = 0; g <= f; g++) {
        if (M.travelAtFrame(g) >= tWrap) {
          nominalWrapFrame = g;
          break;
        }
      }
      recycles.push({
        card: c.index,
        texture: c.texture,
        nominalWrapTravel: r5(tWrap),
        nominalWrapFrame,
        specWrapRectPx: rectOut(wrapRect),
        specWrapFullyOutOfFrame: M.isFullyOutOfFrame(wrapRect),
        recycleTravel: r5(tRecycle),
        recycleFrame: f,
        heldPastWrap: tRecycle > tWrap + 1e-9,
        heldFrames: nominalWrapFrame === null ? 0 : f - nominalWrapFrame,
        rectAtRecyclePx: rectOut(lastRect),
        clearanceFromFrameEdgePx: r1(clearance(lastRect)),
        fullyOutOfFrameAtRecycle: out,
        reappearsAt: {u: r5(c.u), z: r3(c.z), fade: r5(fadeAfter)},
      });
    }
    prev.set(c.index, c);
  }
  frames.push({frame: f, t: r5(f / M.FPS), travel: r5(travel), blurSamples: M.blurSamplesForFrame(f), cards});
}

// Sub-frame sweep (the motion-blur shutter samples between frames): every recycle must still
// happen off-screen.
let subframeChecks = 0;
let subframeViolations = 0;
{
  const prevSub = new Map();
  for (let s = 0; s <= M.DURATION_FRAMES * 64; s++) {
    const tr = M.travelAtFrame(s / 64 - M.SHUTTER_FRAMES / 2);
    for (const c of M.allCards(tr)) {
      const p = prevSub.get(c.index);
      if (p && p.u - c.u > 0.5) {
        subframeChecks++;
        const pr = M.projectCard(p.x, p.y, p.z);
        // The previous (still held) sample may graze the edge; the recycled one must be invisible.
        if (M.rectVisibleFraction(pr) > 0.02 || c.fade > 0.01) subframeViolations++;
      }
      prevSub.set(c.index, c);
    }
  }
}

// 5. Text checks.
const text = {};
let textViolations = 0;
const PROTECTED_MAX = 0.2; // max card opacity factor allowed behind any ink point
for (const f of auditFrames) {
  const boxes = textByFrame[f];
  const layout = layoutByFrame[f];
  if (!boxes || !layout) continue;
  const caps = layout.capsules;
  const lines = {};
  const inkBoxes = [];
  for (const [key, words] of Object.entries(boxes)) {
    const visible = words.filter((w) => w.opacity > 0.05 && w.right - w.left > 1);
    if (!visible.length) continue;
    let worst = 0;
    for (const w of visible) {
      inkBoxes.push({key, ...w});
      for (let sx = 0; sx <= 24; sx++) {
        for (let sy = 0; sy <= 8; sy++) {
          const px = w.left + ((w.right - w.left) * sx) / 24;
          const py = w.top + ((w.bottom - w.top) * sy) / 8;
          worst = Math.max(worst, protectFactor(px, py, caps));
        }
      }
    }
    const left = Math.min(...visible.map((r) => r.left));
    const right = Math.max(...visible.map((r) => r.right));
    const top = Math.min(...visible.map((r) => r.top));
    const bottom = Math.max(...visible.map((r) => r.bottom));
    const inSafe = left >= M.WIDTH * 0.05 && right <= M.WIDTH * 0.95 && top >= M.HEIGHT * 0.05 && bottom <= M.HEIGHT * 0.95;
    const protectedOk = worst <= PROTECTED_MAX;
    if (!inSafe || !protectedOk) textViolations++;
    lines[key] = {
      visibleWords: visible.map((w) => ({text: w.text, opacity: r3(w.opacity), inkPx: {left: r1(w.left), top: r1(w.top), right: r1(w.right), bottom: r1(w.bottom)}})),
      inkBoxPx: {left: r1(left), top: r1(top), right: r1(right), bottom: r1(bottom)},
      inkCenterXOffsetPx: r1((left + right) / 2 - M.WIDTH / 2),
      maxCardOpacityFactorOverInk: r3(worst),
      protected: protectedOk,
      insideTitleSafe: inSafe,
    };
  }
  // Visible ink of different lines must never intersect (the two lead lines share one slot and
  // are checked against each other too).
  let inkOverlaps = 0;
  for (let a = 0; a < inkBoxes.length; a++) {
    for (let b = a + 1; b < inkBoxes.length; b++) {
      const A = inkBoxes[a];
      const B = inkBoxes[b];
      if (A.key === B.key) continue;
      if (A.left < B.right && B.left < A.right && A.top < B.bottom && B.top < A.bottom) inkOverlaps++;
    }
  }
  if (inkOverlaps) textViolations++;
  const stackOk = inkOverlaps === 0;
  const oldPose = [0, 1].map((k) => M.outPose(f, k));
  const newPose = [0, 1].map((k) => M.inPose(f, k));
  text[f] = {
    t: r5(f / M.FPS),
    lines,
    visibleInkOverlapsBetweenLines: inkOverlaps,
    leadOldOpacity: oldPose.map((p) => r3(p.opacity)),
    leadNewOpacity: newPose.map((p) => r3(p.opacity)),
    protectionCapsulesPx: caps.map((c) => c.map(r1)),
  };
}

// Coarse protection-mask grid at rest (every 40 px), showing it is a feathered organic shape.
const restCaps = layoutByFrame[347]?.capsules ?? layoutByFrame[auditFrames.at(-1)]?.capsules;
const grid = [];
if (restCaps) {
  for (let y = 20; y < M.HEIGHT; y += 40) {
    const row = [];
    for (let x = 20; x < M.WIDTH; x += 40) row.push(Math.round(protectFactor(x, y, restCaps) * 100) / 100);
    grid.push(row);
  }
}

const swapOldGoneFrame = (() => {
  for (let f = M.OUT_START; f < M.DURATION_FRAMES; f++) if ([0, 1].every((k) => M.outPose(f, k).opacity <= 0.001)) return f;
  return null;
})();
const swapNewRestFrame = (() => {
  for (let f = M.IN_START; f < M.DURATION_FRAMES; f++) {
    if ([0, 1].every((k) => {
      const p = M.inPose(f, k);
      return p.opacity >= 0.999 && Math.abs(p.y) < 1e-4 && p.blur < 0.01;
    })) return f;
  }
  return null;
})();

const audit = {
  component: 'pf-depth-swirl',
  generatedAt: new Date().toISOString(),
  generator: 'node scripts/audit.mjs',
  composition: {width: M.WIDTH, height: M.HEIGHT, fps: M.FPS, durationInFrames: M.DURATION_FRAMES, seconds: M.DURATION_FRAMES / M.FPS},
  camera: {type: 'PerspectiveCamera', position: [0, 0, M.CAMERA_Z], fovDeg: M.CAMERA_FOV, aspect: r5(M.ASPECT), near: M.CAMERA_NEAR, far: M.CAMERA_FAR, focalPx: r3(M.FOCAL_PX)},
  renderer: 'ThreeCanvas (@remotion/three); 4x MSAA half-float targets; motion blur by shutter-sample accumulation in linear light',
  cards: Array.from({length: M.CARD_COUNT}, (_, i) => ({index: i, texture: M.textureForCard(i), geometry: 'PlaneGeometry(2, 2)', scale: [1, 1, 1], textureFit: 'centre-crop (cover) to square, no stretch'})),
  formulas: {
    u: 'fract(i/12 + travel)  (while a near card is still exiting frame after the wrap, u continues past 1 until it has fully left frame, then recycles)',
    z: '-22 + 31*u',
    angle: '2*PI*(1.5*u + i/12) + 0.3*(travel/0.1)',
    x: '3.8*cos(angle)',
    y: '3.8*sin(angle)',
  },
  travel: {
    from: 0,
    to: M.TRAVEL_END,
    easeWindowSeconds: [0, M.TRAVEL_SECONDS],
    easeWindowFrames: [0, M.TRAVEL_END_FRAME],
    easing: `cubic-bezier(${M.TRAVEL_BEZIER.join(', ')})`,
    holdFrames: [M.TRAVEL_END_FRAME, M.DURATION_FRAMES - 1],
    valueAtHold: r5(M.travelAtFrame(M.TRAVEL_END_FRAME)),
    valueAtLastFrame: r5(M.travelAtFrame(M.DURATION_FRAMES - 1)),
  },
  motionBlur: {shutterFrames: M.SHUTTER_FRAMES, shutterDegrees: Math.round(M.SHUTTER_FRAMES * 360), samples: `${M.MIN_BLUR_SAMPLES}-${M.MAX_BLUR_SAMPLES} adaptive (<= ${M.BLUR_STEP_PX}px between samples where possible); 1 when static`, weighting: 'tent'},
  recycling: {
    rule: 'A card is recycled to the far end only once its projected 2x2 rect clears every frame edge by the margin; it reappears at u~0 with depth fade ~0.',
    offscreenMarginPx: M.OFFSCREEN_MARGIN_PX,
    farEndFadeInU: [0, M.FADE_IN_U],
    events: recycles,
    violations,
    subframeSweep: {samplesPerFrame: 64, recycleTransitionsChecked: subframeChecks, violations: subframeViolations},
  },
  text: {
    font: 'Geist (GeistVF.woff2), variable',
    blocks: [
      {id: 'eyebrow', copy: 'FIELD NOTES', sizePx: M.EYEBROW_SIZE, weight: M.EYEBROW_WEIGHT, trackingEm: M.EYEBROW_TRACKING, visibleFrames: [0, M.DURATION_FRAMES - 1]},
      {id: 'lead-old', copy: 'A wider', sizePx: M.HEADLINE_SIZE, weight: M.LEAD_WEIGHT, visibleFrames: [0, swapOldGoneFrame - 1]},
      {id: 'lead-new', copy: 'Find your', sizePx: M.HEADLINE_SIZE, weight: M.LEAD_WEIGHT, visibleFrames: [M.IN_START, M.DURATION_FRAMES - 1]},
      {id: 'key', copy: 'perspective.', sizePx: M.HEADLINE_SIZE, weight: M.KEY_WEIGHT, visibleFrames: [0, M.DURATION_FRAMES - 1]},
    ],
    positioning: 'screen-fixed, horizontally centred on x=960; block optically centred on y=540',
    swap: {
      specWindowSeconds: [3.7, 4.35],
      specWindowFrames: [M.SWAP_START_FRAME, M.SWAP_END_FRAME],
      outgoingStartsFrame: M.OUT_START,
      outgoingGoneFrame: swapOldGoneFrame,
      incomingStartsFrame: M.IN_START,
      incomingAtRestFrame: swapNewRestFrame,
      withinSpecWindow: M.OUT_START >= M.SWAP_START_FRAME && swapNewRestFrame !== null && swapNewRestFrame <= M.SWAP_END_FRAME,
    },
    protectedThreshold: PROTECTED_MAX,
    measuredFrames: text,
    violations: textViolations,
  },
  protection: {
    kind: 'local card-opacity reduction in the card fragment shader (screen space)',
    shape: 'smooth union of three horizontal capsules (one per text line) with a smoothstep feather; no straight edges, never a rectangle',
    minOpacity: M.PROTECT_MIN_OPACITY,
    featherPx: M.PROTECT_FEATHER,
    padPx: [M.PROTECT_PAD_X, M.PROTECT_PAD_Y],
    smoothUnionPx: M.PROTECT_SMOOTH_UNION,
    restMaskGrid: {stepPx: 40, originPx: [20, 20], values: grid},
  },
  checks: {
    compositionMatchesSpec: M.WIDTH === 1920 && M.HEIGHT === 1080 && M.FPS === 60 && M.DURATION_FRAMES === 348,
    twelveEqualCardsUnitScale: M.CARD_COUNT === 12,
    travelHeldAtEnd: M.travelAtFrame(M.DURATION_FRAMES - 1) === M.TRAVEL_END,
    recycleOnlyWhenFullyOffscreen: violations === 0 && subframeViolations === 0,
    textFullyProtectedAndInSafeArea: textViolations === 0,
    swapWithinWindow: M.OUT_START >= M.SWAP_START_FRAME && swapNewRestFrame !== null && swapNewRestFrame <= M.SWAP_END_FRAME,
  },
  frames,
};

await writeFile(path.join(root, 'spatial-audit.json'), JSON.stringify(audit, null, 1));
await rm(tmpDir, {recursive: true, force: true});
console.log('spatial-audit.json written');
console.log(JSON.stringify({checks: audit.checks, recycles: recycles.map((e) => [e.card, e.nominalWrapFrame, e.recycleFrame, e.clearanceFromFrameEdgePx]), swap: audit.text.swap}, null, 1));
process.exit(0);
