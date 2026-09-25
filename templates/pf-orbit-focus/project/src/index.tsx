import React, {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {AbsoluteFill, Composition, Easing, Img, cancelRender, continueRender, delayRender, interpolate, registerRoot, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';

type Kind = 'carousel' | 'swirl' | 'orbit';
type Point = [number, number, number];
type Card = {position: Point; roll: number; opacity: number; shade: number};
type Props = {
  kind: Kind; background: string; photos: string[]; titles: string[]; bands: string[];
  eyebrow: string; volumes: string[]; heading: string[]; finalHeading: string[];
  footer: string; subtitle: string; auditEnabled: boolean; disableEffects: boolean;
};

const common = {
  photos: ['coast.jpg', 'forest.jpg', 'desert.jpg', 'mountains.jpg'],
  titles: ['Along the coast.', 'Into the green.', 'A little further.', 'Above it all.'],
  bands: ['#cce789', '#184c3a', '#f4876e', '#dae5ef'],
  eyebrow: 'FIELD NOTES', volumes: ['VOL.01', 'VOL.02', 'VOL.03', 'VOL.04'],
  heading: ['A wider', 'perspective.'], finalHeading: ['Find your', 'perspective.'],
  footer: 'FIELD.STUDIO', subtitle: 'A different point of view.',
  auditEnabled: false, disableEffects: false,
};

const configs = {
  carousel: {id: 'pf-carousel-diagonal', width: 1200, height: 1200, seconds: 4.8, cameraZ: 10, fov: 40, count: 4, geometry: [2.7, 3.5] as const},
  swirl: {id: 'pf-depth-swirl', width: 1920, height: 1080, seconds: 5.8, cameraZ: 12, fov: 48, count: 12, geometry: [2, 2] as const},
  orbit: {id: 'pf-orbit-focus', width: 1920, height: 1080, seconds: 6, cameraZ: 12, fov: 54, count: 10, geometry: [1.75, 2.15] as const},
};

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const out = Easing.bezier(.16, 1, .3, 1);
const ease = (t: number, start: number, end: number, curve = out) => interpolate(t, [start, end], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: curve});
const mix = (a: number, b: number, p: number) => a + (b - a) * p;

function carouselPhase(t: number) {
  let phase = mix(-.08, 0, ease(t, 0, .4));
  const starts = [.9, 2.05, 3.2];
  for (const start of starts) phase += Math.PI / 2 * ease(t, start, start + .64, Easing.bezier(.22, .85, .2, 1));
  return phase;
}

// Integral of a trapezoidal velocity profile; position and velocity meet continuously.
function travelClock(t: number) {
  const c = Math.max(0, Math.min(4.6, t));
  if (c < .4) return c * c / .8;
  if (c > 4.2) return 4.2 - (4.6 - c) ** 2 / .8;
  return c - .2;
}

function ringPosition(i: number, phase: number): Point {
  const a = 2 * Math.PI * i / 10 + phase;
  const x = 7.9 * Math.cos(a), y = 4.6 * Math.sin(a);
  const tx = 50 * Math.PI / 180, tz = -8 * Math.PI / 180;
  const ry = y * Math.cos(tx), rz = y * Math.sin(tx);
  return [x * Math.cos(tz) - ry * Math.sin(tz), x * Math.sin(tz) + ry * Math.cos(tz), rz];
}

function cardsAt(kind: Kind, t: number, props: Props): Card[] {
  const {count} = configs[kind];
  return Array.from({length: count}, (_, i) => {
    if (kind === 'carousel') {
      const theta = i * Math.PI / 2 - carouselPhase(t);
      const s = 2.9 * Math.sin(theta) / Math.SQRT2;
      return {position: [s, s, -1 + 2.6 * Math.cos(theta)], roll: 0, opacity: 1, shade: 1};
    }
    if (kind === 'swirl') {
      const travel = .46 * travelClock(t) / 4.2;
      const u = (i / 12 + travel) % 1;
      const angleTime = travel / .1;
      const angle = 2 * Math.PI * (1.5 * u + i / 12) + .3 * angleTime;
      const z = -22 + 31 * u, depth = 12 - z;
      const x = 3.8 * Math.cos(angle), y = 3.8 * Math.sin(angle);
      return {position: [x, y, z], roll: .12 * Math.sin(angle), opacity: props.disableEffects ? 1 : clamp(u / .035), shade: props.disableEffects ? 1 : mix(1, .64, clamp((depth - 12) / 22))};
    }
    const phase = Math.PI / 2 * ease(t, .9, 1.95, Easing.bezier(.66, 0, 1, .51)) + Math.PI / 2 * ease(t, 1.95, 2.8, Easing.bezier(.15, .8, .2, 1));
    const ring = ringPosition(i, phase);
    const open = ease(t, 0, .8);
    let position: Point = [mix((i - 4.5), ring[0], open), mix(-.7, ring[1], open), mix(-1, ring[2], open)];
    if (t >= 3.2) {
      const p = ease(t, 3.2, 4.45);
      const from = ringPosition(i, Math.PI);
      if (i === 0) {
        const endZ = 11.1 + .025 * ease(t, 4.9, 6);
        position = [mix(from[0], 0, p), mix(from[1], 0, p) + .85 * Math.sin(Math.PI * p), mix(from[2], endZ, p)];
      } else {
        position = [mix(from[0], from[0] * .12, p), mix(from[1], from[1] * .12, p), mix(from[2], -12, p)];
      }
    }
    return {position, roll: 0, opacity: 1, shade: 1};
  });
}

function crop(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const ratio = Math.max(width / img.naturalWidth, height / img.naturalHeight);
  const sw = width / ratio, sh = height / ratio;
  ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, x, y, width, height);
}

function fitCanvasLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, startSize: number) {
  for (let size = startSize; size >= 20; size--) {
    ctx.font = `500 ${size}px Geist, Arial`;
    const words = text.split(/\s+/), lines: string[] = [];
    let line = '';
    for (const word of words) {
      const proposed = line ? `${line} ${word}` : word;
      if (ctx.measureText(proposed).width > maxWidth && line) {lines.push(line); line = word;} else line = proposed;
    }
    if (line) lines.push(line);
    if (lines.length <= 2 && lines.every(l => ctx.measureText(l).width <= maxWidth)) return {lines, size};
  }
  return {lines: [text], size: 20};
}

function TextureLoader({props, onReady}: {props: Props; onReady: (textures: THREE.CanvasTexture[]) => void}) {
  const [handle] = useState(() => delayRender('Load local photos, Geist and sRGB plane textures'));
  const images = useRef<(HTMLImageElement | null)[]>([]);
  const [loaded, setLoaded] = useState(0);
  const [fontReady, setFontReady] = useState(false);
  useEffect(() => {
    const font = new FontFace('Geist', `url("${staticFile('assets/GeistVF.woff2')}")`, {weight: '100 900'});
    font.load().then(f => (document.fonts as FontFaceSet & {add: (font: FontFace) => void}).add(f)).catch(() => undefined).then(() => document.fonts.ready).then(() => setFontReady(true)).catch(cancelRender);
  }, []);
  useEffect(() => {
    if (loaded !== props.photos.length || !fontReady) return;
    const textures = images.current.map((img, i) => {
      if (!img || !img.naturalWidth) throw new Error(`Texture ${i} was empty`);
      const canvas = document.createElement('canvas');
      const poster = props.kind === 'carousel';
      canvas.width = poster ? 1120 : 1400;
      canvas.height = poster ? 1440 : props.kind === 'orbit' ? 1720 : 1400;
      const ctx = canvas.getContext('2d')!;
      if (poster) {
        ctx.scale(2, 2); ctx.beginPath(); ctx.roundRect(0, 0, 560, 720, 8); ctx.clip();
        crop(ctx, img, 0, 0, 560, 538);
        ctx.fillStyle = props.bands[i]; ctx.fillRect(0, 538, 560, 182);
        ctx.fillStyle = i === 1 ? '#ffffff' : '#17281d';
        ctx.textBaseline = 'top'; ctx.font = '500 18px Geist, Arial';
        ctx.fillText(props.eyebrow, 36, 562);
        ctx.textAlign = 'right'; ctx.fillText(props.volumes[i], 524, 562); ctx.textAlign = 'left';
        const title = fitCanvasLines(ctx, props.titles[i], 488, 50);
        ctx.font = `500 ${title.size}px Geist, Arial`;
        title.lines.forEach((line, n) => ctx.fillText(line, 36, 599 + n * (title.size + 2)));
      } else crop(ctx, img, 0, 0, canvas.width, canvas.height);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8; texture.name = props.photos[i]; texture.needsUpdate = true;
      return texture;
    });
    onReady(textures); continueRender(handle);
    return () => textures.forEach(t => t.dispose());
  }, [loaded, fontReady, props, handle, onReady]);
  return <div style={{position: 'absolute', opacity: 0, pointerEvents: 'none', width: 1, height: 1, overflow: 'hidden'}}>
    {props.photos.map((photo, i) => <Img key={photo} ref={img => {images.current[i] = img;}} src={staticFile(`assets/${photo}`)} onLoad={() => setLoaded(n => n + 1)} onError={() => cancelRender(new Error(`Failed to load ${photo}`))} />)}
  </div>;
}

function RenderEvidence({props}: {props: Props}) {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {gl, scene, camera} = useThree();
  useLayoutEffect(() => {
    scene.updateMatrixWorld(true); camera.updateMatrixWorld(true);
    gl.render(scene, camera);
    if (!props.auditEnabled) return;
    const cards: unknown[] = [];
    scene.traverse(object => {
      if (!(object instanceof THREE.Mesh) || !object.userData.photo) return;
      const mesh = object as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
      const {width: w, height: h} = mesh.geometry.parameters;
      const corners = [[-w / 2, -h / 2], [-w / 2, h / 2], [w / 2, -h / 2], [w / 2, h / 2]].map(([x, y]) => new THREE.Vector3(x, y, 0).applyMatrix4(mesh.matrixWorld).project(camera));
      const xs = corners.map(v => (v.x + 1) * width / 2), ys = corners.map(v => (1 - v.y) * height / 2);
      const world = mesh.getWorldPosition(new THREE.Vector3());
      const cameraSpace = world.clone().applyMatrix4(camera.matrixWorldInverse);
      const textureCanvas = mesh.material.map?.image as HTMLCanvasElement;
      const texturePixels = textureCanvas.getContext('2d')!.getImageData(textureCanvas.width / 3, textureCanvas.height / 3, 4, 4).data;
      cards.push({index: mesh.userData.index, photo: mesh.userData.photo, geometry: [w, h], scale: mesh.scale.toArray(), worldPosition: world.toArray(), cameraSpaceDepth: -cameraSpace.z, projectedBounds: {left: Math.min(...xs), top: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys)}, projectedEdgeWidth: Math.hypot(xs[2] - xs[0], ys[2] - ys[0]), texture: {width: textureCanvas.width, height: textureCanvas.height, nonEmpty: texturePixels.some((v, index) => index % 4 < 3 && v !== 0), colorSpace: mesh.material.map?.colorSpace}, depthTest: mesh.material.depthTest, depthWrite: mesh.material.depthWrite, renderOrder: mesh.renderOrder});
    });
    const context = gl.getContext();
    const pixels = new Uint8Array(64 * 4);
    const base = new Uint8Array(4);
    context.readPixels(0, 0, 1, 1, context.RGBA, context.UNSIGNED_BYTE, base);
    let varying = 0;
    for (let row = 0; row < 8; row++) for (let col = 0; col < 8; col++) {
      const offset = (row * 8 + col) * 4;
      context.readPixels(Math.floor(context.drawingBufferWidth * (col + .5) / 8), Math.floor(context.drawingBufferHeight * (row + .5) / 8), 1, 1, context.RGBA, context.UNSIGNED_BYTE, pixels.subarray(offset, offset + 4));
      if (Math.abs(pixels[offset] - base[0]) + Math.abs(pixels[offset + 1] - base[1]) + Math.abs(pixels[offset + 2] - base[2]) > 12) varying++;
    }
    console.log('SPATIAL_AUDIT:' + JSON.stringify({id: configs[props.kind].id, frame, seconds: frame / fps, camera: {type: camera.type, position: camera.position.toArray(), fov: (camera as THREE.PerspectiveCamera).fov, near: (camera as THREE.PerspectiveCamera).near, far: (camera as THREE.PerspectiveCamera).far}, cards, canvas: {width: context.drawingBufferWidth, height: context.drawingBufferHeight, sampledPixels: 64, pixelsDifferentFromCorner: varying, nonBlank: varying > 0}, effectsDisabled: props.disableEffects}));
  }, [frame, props, gl, scene, camera, width, height, fps]);
  return null;
}

function PhotoMaterial({props, card, texture}: {props: Props; card: Card; texture: THREE.CanvasTexture}) {
  const {width, height} = useVideoConfig();
  const material = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({map: texture, toneMapped: false, depthTest: true, depthWrite: true, transparent: props.kind === 'swirl', alphaTest: props.kind === 'carousel' ? .5 : 0});
    if (props.kind === 'swirl' && !props.disableEffects) {
      // Feather alpha in screen space, preserving each plane's physical geometry and trajectory.
      mat.onBeforeCompile = shader => {
        shader.uniforms.uCompositionSize = {value: new THREE.Vector2(width, height)};
        shader.vertexShader = 'varying float vProtectionDepth;\n' + shader.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\nvProtectionDepth = -mvPosition.z;');
        shader.fragmentShader = 'uniform vec2 uCompositionSize;\nvarying float vProtectionDepth;\n' + shader.fragmentShader.replace('#include <opaque_fragment>', `#include <opaque_fragment>
          vec2 pixel = vec2(gl_FragCoord.x, uCompositionSize.y - gl_FragCoord.y);
          vec2 q = abs(pixel - vec2(960.0, 520.0)) - vec2(340.0, 140.0);
          float distanceToZone = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
          float protection = (1.0 - smoothstep(0.0, 45.0, distanceToZone)) * step(12.0, vProtectionDepth);
          gl_FragColor.a *= mix(1.0, 0.12, protection);
        `);
      };
      mat.customProgramCacheKey = () => 'field-notes-local-alpha-protection-v1';
    }
    return mat;
  }, [texture, props.kind, props.disableEffects, width, height]);
  material.opacity = card.opacity; material.color.setRGB(card.shade, card.shade, card.shade);
  useEffect(() => () => material.dispose(), [material]);
  return <primitive object={material} attach="material" />;
}

function Scene({props, textures}: {props: Props; textures: THREE.CanvasTexture[]}) {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig();
  const cfg = configs[props.kind];
  const cards = cardsAt(props.kind, frame / fps, props);
  const geometry = useMemo(() => new THREE.PlaneGeometry(...cfg.geometry), [cfg]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <>
    <color attach="background" args={[props.background]} />
    {cards.map((card, i) => <mesh key={i} geometry={geometry} position={card.position} rotation={[0, 0, card.roll]} scale={[1, 1, 1]} userData={{index: i, photo: props.photos[i % props.photos.length]}}>
      <PhotoMaterial props={props} card={card} texture={textures[i % textures.length]} />
    </mesh>)}
    <RenderEvidence props={props} />
  </>;
}

function Overlay({props}: {props: Props}) {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  if (props.kind === 'carousel') return null;
  if (props.kind === 'swirl') return <AbsoluteFill style={{color: '#ffffff'}}>
    <div style={{position: 'absolute', top: 400, left: 550, width: 820, textAlign: 'center', fontSize: 22}}>{props.eyebrow}</div>
    <div style={{position: 'absolute', left: 650, top: 454, width: 620, fontSize: 80, lineHeight: '86px', fontWeight: 500, textAlign: 'center'}}>
      {props.heading.map((line, i) => {
        const entry = ease(t, .07 * i, .6 + .07 * i), replace = ease(t, 3.7 + .07 * i, 4.1 + .07 * i);
        const size = Math.min(80, 620 / Math.max(line.length, props.finalHeading[i].length) * 1.62);
        return <div key={i} style={{height: 86, overflow: 'hidden', position: 'relative', fontSize: size}}>
          <div style={{position: 'absolute', width: '100%', top: mix(32, 0, entry) - 86 * replace, filter: `blur(${8 * (1 - entry)}px)`, opacity: entry}}>{line}</div>
          <div style={{position: 'absolute', width: '100%', top: 86 * (1 - replace)}}>{props.finalHeading[i]}</div>
        </div>;
      })}
    </div>
    <div style={{position: 'absolute', left: 80, top: 980, fontSize: 22, opacity: ease(t, 4.4, 4.6)}}>{props.footer}</div>
  </AbsoluteFill>;
  const entry = ease(t, .15, .6), exit = ease(t, 3.2, 3.65), final = ease(t, 4.45, 4.9);
  return <AbsoluteFill>
    <div style={{position: 'absolute', width: 400, left: 760, top: 486 + 24 * (1 - entry) - 100 * exit, textAlign: 'center', color: '#202521', fontSize: 50, lineHeight: '54px', fontWeight: 500, opacity: entry * (1 - exit), filter: `blur(${8 * (1 - entry)}px)`}}>{props.heading.map((line, i) => <div key={i}>{line}</div>)}</div>
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.45), transparent 43%)', opacity: final}} />
    <div style={{position: 'absolute', left: 96, top: 850 + 24 * (1 - final), width: 1500, color: '#ffffff', opacity: final}}>
      <div style={{fontSize: 72, lineHeight: '82px', fontWeight: 500}}>{props.eyebrow}</div>
      <div style={{fontSize: 30, lineHeight: '40px', marginTop: 12}}>{props.subtitle}</div>
    </div>
  </AbsoluteFill>;
}

function SpatialComposition(props: Props) {
  const [textures, setTextures] = useState<THREE.CanvasTexture[] | null>(null);
  const frame = useCurrentFrame(); const {width, height, fps} = useVideoConfig();
  const cfg = configs[props.kind], t = frame / fps;
  const camera = useMemo(() => {
    const result = new THREE.PerspectiveCamera(cfg.fov, width / height, .1, 100);
    result.position.set(0, 0, cfg.cameraZ); result.up.set(0, 1, 0); result.lookAt(0, 0, 0); result.updateMatrixWorld();
    return result;
  }, [cfg, width, height]);
  let blur = 0;
  if (!props.disableEffects) {
    if (props.kind === 'carousel') blur = Math.min(1.3, Math.abs(carouselPhase(t + 1 / fps) - carouselPhase(t - 1 / fps)) * fps / 2 * .17);
    else {
      const before = cardsAt(props.kind, Math.max(0, t - 1 / fps), props), after = cardsAt(props.kind, t + 1 / fps, props);
      const focal = height / (2 * Math.tan(cfg.fov * Math.PI / 360));
      const projectedSpeed = before.reduce((max, a, i) => {
        const b = after[i], da = cfg.cameraZ - a.position[2], db = cfg.cameraZ - b.position[2];
        if (Math.abs(a.position[0] * focal / da) > width / 2 || Math.abs(a.position[1] * focal / da) > height / 2) return max;
        return Math.max(max, Math.hypot(focal * (a.position[0] / da - b.position[0] / db), focal * (a.position[1] / da - b.position[1] / db)) * fps / 2);
      }, 0);
      blur = Math.min(.75, projectedSpeed * .0015);
    }
  }
  return <AbsoluteFill style={{background: props.background, fontFamily: 'Geist, Arial, sans-serif', letterSpacing: 0, overflow: 'hidden'}}>
    <TextureLoader props={props} onReady={setTextures} />
    {textures ? <ThreeCanvas width={width} height={height} camera={camera} dpr={1} gl={{antialias: true, alpha: false, preserveDrawingBuffer: true, outputColorSpace: THREE.SRGBColorSpace, toneMapping: THREE.NoToneMapping}} style={{filter: `blur(${blur}px)`}}><Scene props={props} textures={textures} /></ThreeCanvas> : null}
    <Overlay props={props} />
  </AbsoluteFill>;
}

function Root() {
  return <>{(Object.keys(configs) as Kind[]).map(kind => {
    const cfg = configs[kind];
    const defaultProps: Props = {...common, kind, background: kind === 'carousel' ? '#ebeeeb' : kind === 'swirl' ? '#171b1c' : '#ebedf0', ...(kind === 'orbit' ? {heading: ['SELECTED', 'FIELD NOTES']} : {})};
    return <Composition key={kind} id={cfg.id} component={SpatialComposition} fps={60} width={cfg.width} height={cfg.height} durationInFrames={Math.round(cfg.seconds * 60)} defaultProps={defaultProps} />;
  })}</>;
}

registerRoot(Root);
