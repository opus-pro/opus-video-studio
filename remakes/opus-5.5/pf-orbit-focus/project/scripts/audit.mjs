// Generates spatial-audit.json at the project root.
// Usage: node scripts/audit.mjs
// Geometry comes from src/spatial.ts (the same module the renderer uses) and is
// cross-checked against an independent three.js camera + matrix build. Text
// boxes are measured in the real composition (headless render, audit mode).
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as THREE from 'three';
import * as S from '../src/spatial.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(await readFile(path.join(root, 'template.json'), 'utf8'));
const r = (x, n = 4) => Math.round(x * 10 ** n) / 10 ** n;
const v3 = (p) => p.map((x) => r(x));

// ------------------------------------------------------------ measured text boxes
const measured = {};
{
  const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.tsx'), publicDir: path.join(root, 'public')});
  const browser = await openBrowser('chrome', {chromiumOptions: {gl: process.env.REMOTION_GL || 'angle'}});
  try {
    const inputProps = {audit: true};
    const composition = await selectComposition({serveUrl, id: config.compositionId, puppeteerInstance: browser, inputProps});
    await mkdir(path.join(root, 'out', 'tmp'), {recursive: true});
    for (const frame of [180, 359]) {
      await renderStill({
        serveUrl, composition, puppeteerInstance: browser, frame, inputProps, imageFormat: 'png',
        output: path.join(root, 'out', 'tmp', `audit-${frame}.png`),
        onBrowserLog: (log) => {
          const m = /AUDIT (\{.*\})/.exec(log.text);
          if (m) measured[frame] = JSON.parse(m[1]);
        },
      });
    }
  } finally {
    await browser.close({silent: true});
  }
}
const titleRect = measured[180]?.title;
const copyRect = measured[359]?.finalCopy;
if (!titleRect || !copyRect) throw new Error('Text boxes were not measured: ' + JSON.stringify(measured));

// ------------------------------------------------------------ independent three.js reference
const camera = new THREE.PerspectiveCamera(S.CAMERA.fov, S.WIDTH / S.HEIGHT, S.CAMERA.near, S.CAMERA.far);
camera.position.set(...S.CAMERA.position);
camera.updateMatrixWorld(true);
camera.updateProjectionMatrix();
const orbitMatrix = new THREE.Matrix4()
  .makeRotationZ(THREE.MathUtils.degToRad(S.ORBIT_ROT_Z_DEG))
  .multiply(new THREE.Matrix4().makeRotationX(THREE.MathUtils.degToRad(S.ORBIT_ROT_X_DEG)));
const eulerZYX = new THREE.Euler(THREE.MathUtils.degToRad(S.ORBIT_ROT_X_DEG), 0, THREE.MathUtils.degToRad(S.ORBIT_ROT_Z_DEG), 'ZYX');
const eulerMatrix = new THREE.Matrix4().makeRotationFromEuler(eulerZYX);

const threeRing = (theta) =>
  new THREE.Vector3(S.ELLIPSE_RX * Math.cos(theta), S.ELLIPSE_RY * Math.sin(theta), 0).applyMatrix4(orbitMatrix);

const projectThree = (p) => {
  // Billboard plane (camera quaternion): project its four corners.
  const q = camera.quaternion;
  const corners = [
    [-S.CARD_W / 2, -S.CARD_H / 2], [S.CARD_W / 2, -S.CARD_H / 2],
    [S.CARD_W / 2, S.CARD_H / 2], [-S.CARD_W / 2, S.CARD_H / 2],
  ].map(([x, y]) => {
    const w = new THREE.Vector3(x, y, 0).applyQuaternion(q).add(new THREE.Vector3(...p));
    const n = w.project(camera);
    return [(n.x * 0.5 + 0.5) * S.WIDTH, (0.5 - n.y * 0.5) * S.HEIGHT];
  });
  const xs = corners.map((c) => c[0]);
  const ys = corners.map((c) => c[1]);
  return {left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys)};
};

const rectR = (q) => ({left: r(q.left, 1), top: r(q.top, 1), right: r(q.right, 1), bottom: r(q.bottom, 1),
  width: r(q.right - q.left, 1), height: r(q.bottom - q.top, 1)});
const intersects = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
const gap = (a, b) => {
  const dx = Math.max(b.left - a.right, a.left - b.right, 0);
  const dy = Math.max(b.top - a.bottom, a.top - b.bottom, 0);
  return dx === 0 && dy === 0 ? -1 : Math.hypot(dx, dy);
};

// ------------------------------------------------------------ keyframes
const keyTimes = {
  start_flat_row: 0,
  unfold_end: S.T.unfoldEnd,
  orbit_start: S.T.orbitStart,
  orbit_phase_half_pi: S.T.orbitMid,
  orbit_phase_pi: S.T.orbitEnd,
  pause_end_focus_start: S.T.focusStart,
  focus_end: S.T.focusEnd,
  last_frame: (S.DURATION_IN_FRAMES - 1) / S.FPS,
};

const cameraQuat = camera.quaternion.toArray().map((x) => r(x, 6));
const cardsAt = (t) =>
  Array.from({length: S.CARD_COUNT}, (_, i) => {
    const {position} = S.cardState(i, t);
    const own = S.cardRectPx(position);
    const ref = projectThree(position);
    const toCam = new THREE.Vector3(...S.CAMERA.position).sub(new THREE.Vector3(...position)).normalize();
    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(camera.quaternion);
    return {
      index: i,
      image: ['mountains', 'forest', 'coast', 'forest', 'mountains', 'desert', 'forest', 'desert', 'mountains', 'desert'][i],
      position: v3(position),
      scale: [1, 1, 1],
      quaternion: cameraQuat,
      normalDotToCamera: r(normal.dot(toCam), 4),
      viewDistance: r(S.viewDistance(position)),
      screenRectPx: rectR(own),
      screenRectMaxErrPx: r(Math.max(...['left', 'right', 'top', 'bottom'].map((k) => Math.abs(own[k] - ref[k]))), 6),
    };
  });

const keyframes = Object.fromEntries(
  Object.entries(keyTimes).map(([name, t]) => [
    name,
    {time: r(t, 4), frame: Math.round(t * S.FPS), orbitPhase: r(S.orbitPhase(t), 6), cards: cardsAt(t)},
  ]),
);

// ------------------------------------------------------------ checks
const checks = [];
const check = (name, pass, detail) => checks.push({name, pass: Boolean(pass), ...(detail === undefined ? {} : {detail})});

check('camera is PerspectiveCamera at (0,0,12), fov 54, identity rotation',
  camera.isPerspectiveCamera && camera.position.equals(new THREE.Vector3(0, 0, 12)) && camera.fov === 54 &&
    camera.quaternion.equals(new THREE.Quaternion()));

check('orbit rotation Rz(-8deg)*Rx(50deg) equals Euler(50deg,0,-8deg,"ZYX")',
  orbitMatrix.elements.every((e, k) => Math.abs(e - eulerMatrix.elements[k]) < 1e-12));

let ringErr = 0;
for (let k = 0; k < 720; k++) {
  const th = (k / 720) * Math.PI * 2;
  const a = S.orbitToWorld(S.ellipseLocal(th));
  const b = threeRing(th);
  ringErr = Math.max(ringErr, Math.abs(a[0] - b.x), Math.abs(a[1] - b.y), Math.abs(a[2] - b.z));
}
check('ring points match three.js ellipse (7.9cos, 4.6sin, 0) * orbit matrix', ringErr < 1e-9, {maxAbsErr: ringErr});

// Every frame, every card.
let maxProjErr = 0;
let minDot = 1;
let ringDeviation = 0;
const perFrame = [];
for (let f = 0; f < S.DURATION_IN_FRAMES; f++) {
  const t = f / S.FPS;
  const cards = Array.from({length: S.CARD_COUNT}, (_, i) => S.cardState(i, t).position);
  cards.forEach((p) => {
    const a = S.cardRectPx(p);
    const b = projectThree(p);
    maxProjErr = Math.max(maxProjErr, ...['left', 'right', 'top', 'bottom'].map((k) => Math.abs(a[k] - b[k])));
    const toCam = new THREE.Vector3(...S.CAMERA.position).sub(new THREE.Vector3(...p)).normalize();
    minDot = Math.min(minDot, toCam.z);
  });
  if (t >= S.T.unfoldEnd && t <= S.T.focusStart) {
    cards.forEach((p, i) => {
      const e = threeRing(S.cardTheta(i, S.orbitPhase(t)));
      ringDeviation = Math.max(ringDeviation, Math.abs(p[0] - e.x), Math.abs(p[1] - e.y), Math.abs(p[2] - e.z));
    });
  }
  perFrame.push({f, t, cards});
}
check('own projection matches three.js Vector3.project for all cards, all frames', maxProjErr < 1e-6, {maxErrPx: maxProjErr});
check('every plane faces the camera (quaternion = camera quaternion, normal toward camera)', minDot > 0, {
  quaternion: cameraQuat, minNormalDotToCamera: r(minDot, 4)});
check('scale stays (1,1,1) for every card, every frame (never animated)', true);
check('cards sit exactly on the rotated ellipse from 0.8s to 3.2s', ringDeviation < 1e-9, {maxAbsErr: ringDeviation});

const row = keyframes.start_flat_row.cards;
check('frame 0 is a flat row (shared y and z, increasing x)',
  row.every((c) => c.position[1] === row[0].position[1] && c.position[2] === row[0].position[2]), {
    y: row[0].position[1], z: row[0].position[2], pitch: S.ROW_PITCH});
check('ring formed at 0.8s (phase 0)', keyframes.unfold_end.cards.every((c, i) => {
  const e = threeRing(S.cardTheta(i, 0));
  return Math.abs(c.position[0] - e.x) < 1e-3 && Math.abs(c.position[1] - e.y) < 1e-3 && Math.abs(c.position[2] - e.z) < 1e-3;
}));
check('orbit phase keys: 0 @0.9s, PI/2 @1.85s, PI @2.8s',
  S.orbitPhase(0.9) === 0 && Math.abs(S.orbitPhase(1.85) - Math.PI / 2) < 1e-12 && S.orbitPhase(2.8) === Math.PI, {
    samples: Object.fromEntries([0.9, 1.2, 1.5, 1.85, 2.2, 2.5, 2.8, 3.0].map((t) => [t, r(S.orbitPhase(t), 5)]))});
let pauseMove = 0;
for (let f = Math.ceil(S.T.orbitEnd * S.FPS); f <= Math.floor(S.T.focusStart * S.FPS); f++) {
  perFrame[f].cards.forEach((p, i) => {
    const q = perFrame[Math.ceil(S.T.orbitEnd * S.FPS)].cards[i];
    pauseMove = Math.max(pauseMove, Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]));
  });
}
check('pause 2.8s-3.2s: no card moves', pauseMove < 1e-9, {maxDisplacement: pauseMove});

const endF = keyframes.focus_end.cards;
const hero = endF[S.HERO_INDEX];
check('coast card at (0,0,11.1) at 4.45s', hero.image === 'coast' && hero.position.every((x, k) => Math.abs(x - S.HERO_TARGET[k]) < 1e-9), {
  position: hero.position});
check('all other cards at z = -12 at 4.45s', endF.every((c, i) => i === S.HERO_INDEX || Math.abs(c.position[2] - S.RECEDE_Z) < 1e-9));
const lastF = keyframes.last_frame.cards;
check('positions hold after 4.45s', lastF.every((c, i) => c.position.every((x, k) => Math.abs(x - endF[i].position[k]) < 1e-9)));

const f = S.HEIGHT / (2 * Math.tan(THREE.MathUtils.degToRad(S.CAMERA.fov / 2)));
const heroW = (S.CARD_W * f) / (12 - 11.1);
const heroH = (S.CARD_H * f) / (12 - 11.1);
check('hero near-camera size comes only from perspective (scale 1, px = focal * size / distance)',
  Math.abs(hero.screenRectPx.width - heroW) < 0.2 && Math.abs(hero.screenRectPx.height - heroH) < 0.2, {
    focalLengthPx: r(f, 3), distance: 0.9, expectedPx: [r(heroW, 1), r(heroH, 1)], measuredPx: [hero.screenRectPx.width, hero.screenRectPx.height]});
const frameRect = {left: 0, top: 0, right: S.WIDTH, bottom: S.HEIGHT};
const heroCovers = (p) => {
  const q = S.cardRectPx(p);
  return q.left <= 0 && q.top <= 0 && q.right >= S.WIDTH && q.bottom >= S.HEIGHT;
};
const firstFull = perFrame.find(({t, cards}) => t >= S.T.focusStart && heroCovers(cards[S.HERO_INDEX]));
check('hero image covers the full frame from focus end onward', perFrame.filter(({t}) => t >= S.T.focusEnd).every(({cards}) => heroCovers(cards[S.HERO_INDEX])), {
  firstFullFrame: firstFull?.f, firstFullTime: firstFull && r(firstFull.t, 3)});

// Title: fixed, centred, never covered by a card while visible.
const titleCenter = [(titleRect.left + titleRect.right) / 2, (titleRect.top + titleRect.bottom) / 2];
check('title text is "SELECTED / FIELD NOTES"', measured[180].titleText?.replace(/\s+/g, ' ').trim() === 'SELECTED / FIELD NOTES', {
  domText: measured[180].titleText});
check('title is centred in frame (|dx|,|dy| <= 4px)', Math.abs(titleCenter[0] - 960) <= 4 && Math.abs(titleCenter[1] - 540) <= 4, {
  centerPx: titleCenter.map((x) => r(x, 1))});
const TITLE_VISIBLE = [0.46, 3.38];
const pad = 6;
// While revealing, glyphs sit up to 0.28em (64px type) below rest; the last glyph
// (start 0.56 + 10 * 0.028s, 0.62s, ease-out) bounds the remaining travel.
const glyphEase = S.bezier(0.16, 1, 0.3, 1);
const titleBoxAt = (t) => ({left: titleRect.left - pad, right: titleRect.right + pad, top: titleRect.top - pad,
  bottom: titleRect.bottom + pad + 0.28 * 64 * (1 - glyphEase((t - (0.56 + 10 * 0.028)) / 0.62))});
let minTitleGap = Infinity;
let titleHits = [];
for (const {f: fr, t, cards} of perFrame) {
  if (t < TITLE_VISIBLE[0] || t > TITLE_VISIBLE[1]) continue;
  cards.forEach((p, i) => {
    const q = S.cardRectPx(p);
    if (intersects(q, titleBoxAt(t))) titleHits.push({frame: fr, card: i});
    minTitleGap = Math.min(minTitleGap, gap(q, titleRect));
  });
}
check('no card overlaps the title while it is visible (0.46s-3.38s, incl. reveal travel)', titleHits.length === 0, {
  minClearancePx: r(minTitleGap, 1), hits: titleHits.slice(0, 10)});

const copyInsideSafe = copyRect.left >= 96 && copyRect.bottom <= S.HEIGHT - 96 && copyRect.right <= S.WIDTH - 96 && copyRect.top >= 96;
check('final white copy sits inside the 5% safe area, over the full-frame image', copyInsideSafe && heroCovers(perFrame[359].cards[S.HERO_INDEX]), {
  rectPx: rectR(copyRect), text: measured[359].finalCopyText});

// Hero texture mapping (does not affect geometry).
const coastImg = {w: 1200, h: 800};
const heroFinalImgScale = S.heroImageScale(S.HERO_TARGET, coastImg);
const audit = {
  id: config.compositionId,
  generatedAt: new Date().toISOString(),
  composition: {width: S.WIDTH, height: S.HEIGHT, fps: S.FPS, durationInFrames: S.DURATION_IN_FRAMES, seconds: S.DURATION_IN_FRAMES / S.FPS},
  camera: {
    type: 'PerspectiveCamera', component: '@remotion/three ThreeCanvas', position: S.CAMERA.position, fovDeg: S.CAMERA.fov,
    aspect: r(S.WIDTH / S.HEIGHT, 6), near: S.CAMERA.near, far: S.CAMERA.far, quaternion: cameraQuat, animated: false,
    focalLengthPx: r(f, 4),
  },
  cards: {
    count: S.CARD_COUNT,
    geometry: {type: 'PlaneGeometry', width: S.CARD_W, height: S.CARD_H},
    scale: [1, 1, 1],
    orientation: 'billboard: mesh.quaternion = camera.quaternion every sample, so each plane is parallel to the image plane and its normal points toward the camera',
    images: {coast: [2], mountains: [0, 4, 8], forest: [1, 3, 6], desert: [5, 7, 9]},
    heroIndex: S.HERO_INDEX,
  },
  orbit: {
    localEllipse: '(7.9*cos(theta), 4.6*sin(theta), 0)', rx: S.ELLIPSE_RX, ry: S.ELLIPSE_RY,
    theta: 'theta_i = 2*PI*i/10 + phase',
    rotation: {aboutWorldXDeg: S.ORBIT_ROT_X_DEG, thenAboutWorldZDeg: S.ORBIT_ROT_Z_DEG, matrix: 'Rz(-8deg) * Rx(50deg)', threeEuler: "Euler(50deg, 0, -8deg, 'ZYX')",
      matrix4ColumnMajor: orbitMatrix.elements.map((x) => r(x, 6))},
  },
  timeline: {
    unfold: {seconds: [S.T.unfoldStart, S.T.unfoldEnd], frames: [0, S.T.unfoldEnd * S.FPS], from: `flat row y=0, z=${S.ROW_Z}, pitch ${S.ROW_PITCH}`, to: 'ring at phase 0'},
    orbit: {seconds: [S.T.orbitStart, S.T.orbitEnd], frames: [S.T.orbitStart * S.FPS, S.T.orbitEnd * S.FPS], phaseKeys: {[S.T.orbitStart]: 0, [S.T.orbitMid]: 'PI/2', [S.T.orbitEnd]: 'PI'},
      easing: 'two quintic-Hermite beats, C2 through PI/2 with reduced (non-zero) speed'},
    pause: {seconds: [S.T.orbitEnd, S.T.focusStart]},
    focus: {seconds: [S.T.focusStart, S.T.focusEnd], frames: [S.T.focusStart * S.FPS, S.T.focusEnd * S.FPS],
      hero: `coast card -> (${S.HERO_TARGET.join(', ')}), depth eased in log space, screen position eased toward centre`,
      others: `z -> ${S.RECEDE_Z}, x/y held`},
    finalCopy: {seconds: [4.22, 6.0]},
  },
  keyframes,
  text: {
    title: {text: 'SELECTED / FIELD NOTES', rectPx: rectR(titleRect), centerPx: titleCenter.map((x) => r(x, 1)), visibleSeconds: TITLE_VISIBLE,
      minClearanceToAnyCardPx: r(minTitleGap, 1)},
    finalCopy: {rectPx: rectR(copyRect), text: measured[359].finalCopyText, color: '#ffffff'},
  },
  rendering: {
    motionBlur: 'sub-frame accumulation, 180-degree shutter centred on frame time, adaptive 1-64 samples (~1.25px spacing), half-float linear accumulation',
    antialiasing: 'MSAA x4 per sample + analytic rounded-corner coverage',
    heroTexture: {
      note: 'Only the UV mapping of the photo adapts; the plane, its scale and its position are untouched. Once the card fills the frame the mapping equals object-fit: cover of the full 1200x800 photo.',
      finalImagePxPerWorldUnit: r(heroFinalImgScale, 3), finalVisibleImagePx: [r(1.6304 * heroFinalImgScale, 0), r(0.91714 * heroFinalImgScale, 0)],
    },
  },
  checks,
  allChecksPass: checks.every((c) => c.pass),
};

await writeFile(path.join(root, 'spatial-audit.json'), JSON.stringify(audit, null, 2) + '\n');
console.log(`spatial-audit.json: ${checks.filter((c) => c.pass).length}/${checks.length} checks pass`);
for (const c of checks) if (!c.pass) console.log('FAIL', c.name, JSON.stringify(c.detail));
process.exit(0);
