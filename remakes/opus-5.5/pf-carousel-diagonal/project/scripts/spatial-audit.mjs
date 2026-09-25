// Writes spatial-audit.json from the same motion module the scene renders with.
// Usage: node scripts/spatial-audit.mjs   (Node >= 23.6 strips the .ts types natively)
import {writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as THREE from 'three';
import {
  CAMERA,
  CARD_COUNT,
  CARD_HEIGHT,
  CARD_WIDTH,
  DURATION_IN_FRAMES,
  FPS,
  HEIGHT,
  LOOP_RADIUS,
  LOOP_Z_CENTER,
  LOOP_Z_RADIUS,
  SEGMENTS,
  SHUTTER_SECONDS,
  cardPosition,
  phaseAt,
  relayProgress,
  thetaFor,
  WIDTH,
} from '../src/motion.ts';
import {CARDS} from '../src/cards.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const r = (v, d = 4) => Number(v.toFixed(d));

const camera = new THREE.PerspectiveCamera(CAMERA.fov, WIDTH / HEIGHT, CAMERA.near, CAMERA.far);
camera.position.set(...CAMERA.position);
camera.lookAt(0, 0, 0);
camera.updateMatrixWorld(true);
camera.updateProjectionMatrix();

const geometry = new THREE.PlaneGeometry(CARD_WIDTH, CARD_HEIGHT);
geometry.computeBoundingBox();
const meshes = Array.from({length: CARD_COUNT}, () => new THREE.Mesh(geometry));

const pose = (seconds) => {
  const phase = phaseAt(seconds);
  meshes.forEach((mesh, i) => {
    mesh.position.set(...cardPosition(i, phase));
    mesh.quaternion.copy(camera.quaternion);
    mesh.scale.set(1, 1, 1);
    mesh.updateMatrixWorld(true);
  });
  return phase;
};

const corners = [
  [-CARD_WIDTH / 2, CARD_HEIGHT / 2],
  [CARD_WIDTH / 2, CARD_HEIGHT / 2],
  [CARD_WIDTH / 2, -CARD_HEIGHT / 2],
  [-CARD_WIDTH / 2, -CARD_HEIGHT / 2],
];

const project = (mesh) => {
  const px = corners.map(([x, y]) => {
    const v = new THREE.Vector3(x, y, 0).applyMatrix4(mesh.matrixWorld).project(camera);
    return {x: (v.x + 1) * 0.5 * WIDTH, y: (1 - v.y) * 0.5 * HEIGHT, ndcZ: v.z};
  });
  const xs = px.map((p) => p.x);
  const ys = px.map((p) => p.y);
  const b = {left: Math.min(...xs), top: Math.min(...ys), right: Math.max(...xs), bottom: Math.max(...ys)};
  return {
    left: r(b.left, 2),
    top: r(b.top, 2),
    right: r(b.right, 2),
    bottom: r(b.bottom, 2),
    width: r(b.right - b.left, 2),
    height: r(b.bottom - b.top, 2),
    centerPx: [r((b.left + b.right) / 2, 2), r((b.top + b.bottom) / 2, 2)],
    insideFrame: b.left >= 0 && b.top >= 0 && b.right <= WIDTH && b.bottom <= HEIGHT,
  };
};

const snapshot = (seconds) => {
  const phase = pose(seconds);
  const cards = meshes.map((mesh, i) => {
    const view = mesh.position.clone().applyMatrix4(camera.matrixWorldInverse);
    const center = mesh.position.clone().project(camera);
    return {
      index: i,
      poster: CARDS[i].file,
      title: CARDS[i].title,
      theta: r(thetaFor(i, phase), 5),
      worldPosition: mesh.position.toArray().map((v) => r(v)),
      scale: mesh.scale.toArray(),
      quaternion: mesh.quaternion.toArray().map((v) => r(v, 6)),
      geometry: {type: 'PlaneGeometry', width: geometry.parameters.width, height: geometry.parameters.height},
      cameraDepth: {
        viewSpaceZ: r(view.z),
        distanceAlongViewAxis: r(-view.z),
        euclideanDistance: r(mesh.position.distanceTo(camera.position)),
        ndcZ: r(center.z, 6),
      },
      projectedBoundsPx: project(mesh),
    };
  });
  const nearestFirst = [...cards].sort((a, b) => a.cameraDepth.distanceAlongViewAxis - b.cameraDepth.distanceAlongViewAxis);
  return {
    seconds,
    frame: Math.round(seconds * FPS),
    phase: r(phase, 6),
    relayProgress: r(relayProgress(seconds), 6),
    frontCard: nearestFirst[0].index,
    depthOrderNearToFar: nearestFirst.map((c) => c.index),
    cards,
  };
};

// Whole-timeline sweep (frame times + motion-blur shutter extremes) for the extreme projected extents.
let extremes = {minLeft: Infinity, minTop: Infinity, maxRight: -Infinity, maxBottom: -Infinity};
for (let f = 0; f < DURATION_IN_FRAMES; f++) {
  for (const dt of [-SHUTTER_SECONDS / 2, 0, SHUTTER_SECONDS / 2]) {
    pose(f / FPS + dt);
    for (const m of meshes) {
      const b = project(m);
      extremes = {
        minLeft: Math.min(extremes.minLeft, b.left),
        minTop: Math.min(extremes.minTop, b.top),
        maxRight: Math.max(extremes.maxRight, b.right),
        maxBottom: Math.max(extremes.maxBottom, b.bottom),
      };
    }
  }
}

const audit = {
  composition: {id: 'pf-carousel-diagonal', width: WIDTH, height: HEIGHT, fps: FPS, durationInFrames: DURATION_IN_FRAMES},
  camera: {
    type: camera.type,
    position: camera.position.toArray(),
    fov: camera.fov,
    aspect: camera.aspect,
    near: camera.near,
    far: camera.far,
    quaternion: camera.quaternion.toArray().map((v) => r(v, 6)),
  },
  cards: {
    count: CARD_COUNT,
    geometry: {type: 'PlaneGeometry', width: CARD_WIDTH, height: CARD_HEIGHT, sharedByAllMeshes: true},
    scale: [1, 1, 1],
    orientation: 'camera-facing billboard (mesh.quaternion copies camera.quaternion every sample)',
    material: 'MeshBasicMaterial, opaque, depthTest: true, depthWrite: true (occlusion by depth buffer only; no renderOrder)',
  },
  loop: {
    x: `${LOOP_RADIUS} * sin(theta) / sqrt(2)`,
    y: `${LOOP_RADIUS} * sin(theta) / sqrt(2)`,
    z: `${LOOP_Z_CENTER} + ${LOOP_Z_RADIUS} * cos(theta)`,
    theta: 'i * PI / 2 - phase',
  },
  phaseTiming: {
    easing: 'cubic-bezier(.22,.85,.2,1)',
    stepRadians: r(Math.PI / 2, 6),
    segmentsSeconds: SEGMENTS,
    finalPhase: r(phaseAt(DURATION_IN_FRAMES / FPS), 6),
    finalFrontCard: 3,
  },
  motionBlur: {shutterWindowSeconds: r(SHUTTER_SECONDS, 6), weighting: 'Hann (cos^2), centred on frame time; spread equivalent to a 180deg box shutter', method: 'multi-sample accumulation of full scene renders (up to 72 samples per frame)'},
  snapshots: [0, 1, 2, 3, 4].map(snapshot),
  timelineExtremesPx: {
    minLeft: r(extremes.minLeft, 2),
    minTop: r(extremes.minTop, 2),
    maxRight: r(extremes.maxRight, 2),
    maxBottom: r(extremes.maxBottom, 2),
    note: 'Fixed by the spec (camera, fov, loop, plane size): mid hand-off, near theta = +/-65deg, a card edge reaches up to ~0.8px past the top/bottom frame edge while moving at speed. All rest poses sit >= 31px inside the frame.',
  },
};

await writeFile(path.join(root, 'spatial-audit.json'), `${JSON.stringify(audit, null, 2)}\n`);
console.log('wrote spatial-audit.json');
console.log(JSON.stringify(audit.timelineExtremesPx));
for (const s of audit.snapshots) {
  console.log(s.seconds, 'front', s.frontCard, s.cards.map((c) => `${c.index}:${c.projectedBoundsPx.left},${c.projectedBoundsPx.top}-${c.projectedBoundsPx.right},${c.projectedBoundsPx.bottom}`).join('  '));
}
