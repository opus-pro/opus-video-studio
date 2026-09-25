import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {getPosterCanvas} from './poster';
import {
  EASE,
  FORM_RS,
  FORM_SCALE,
  HEIGHT,
  HERO_X,
  HERO_Y,
  INK,
  LINE_RS,
  LINE_SCALE,
  POSTER_H,
  POSTER_W,
  TL,
  WIDTH,
  lerp,
  prog,
} from './timing';

export const CAMERA_FOV = 30;
export const CAMERA_Z = HEIGHT / 2 / Math.tan(((CAMERA_FOV / 2) * Math.PI) / 180);

const NS = 128; // around the tube (poster width)
const NT = 220; // along the ring (poster height)

export type HeroState = {
  a: number; // roll
  b: number; // bend
  rs: number; // cross-section scale
  S: number; // global scale
  rx: number;
  ry: number;
  rz: number;
  flat: number;
  mapMix: number;
  metal: number;
  rough: number;
  ink: number;
};

export const heroState = (f: number): HeroState => {
  const a = prog(f, TL.roll[0], TL.roll[1], EASE.inOut);
  const b = prog(f, TL.bend[0], TL.bend[1], EASE.inOut);
  const thin = prog(f, TL.thin[0], TL.thin[1], EASE.inOut);
  const grow = prog(f, TL.grow[0], TL.grow[1], EASE.inOutSoft);
  const line = prog(f, TL.line[0], TL.line[1], EASE.inOut);
  const lineGrow = prog(f, TL.line[0] - 6, TL.line[1], EASE.inOut);
  const rsForm = lerp(1, FORM_RS, thin);
  const rs = Math.exp(lerp(Math.log(rsForm), Math.log(LINE_RS), line));
  const S = lerp(lerp(1, FORM_SCALE, grow), LINE_SCALE, lineGrow);

  // Orientation: face-on (matches DOM) -> 3/4 while curling -> tilted form -> face-on line.
  const r1 = prog(f, TL.roll[0], TL.roll[1] + 10, EASE.inOutSoft);
  const r2 = prog(f, TL.bend[0], TL.bend[1] + 20, EASE.inOutSoft);
  const drift = prog(f, TL.bend[0], TL.line[0], EASE.linear);
  const back = prog(f, TL.line[0] - 4, TL.line[1] - 2, EASE.inOut);
  let rx = lerp(0, -0.1, r1) + lerp(0, -0.62, r2) + 0.08 * Math.sin(drift * Math.PI * 1.3);
  let ry = lerp(0, 0.62, r1) + lerp(0, -0.38, r2) + 0.2 * Math.sin(drift * Math.PI);
  let rz = lerp(0, 0.18, r2) - 0.06 * Math.sin(drift * Math.PI);
  rx *= 1 - back;
  ry *= 1 - back;
  rz *= 1 - back;

  const flat = 1 - 0.45 * prog(f, TL.flatOff[0], TL.flatOff[0] + 64, EASE.inOutSoft) - 0.55 * prog(f, TL.metal[0] + 8, TL.metal[1] + 8, EASE.inOut);
  const metal = prog(f, TL.metal[0], TL.metal[1], EASE.inOut);
  const mapOff = prog(f, TL.metal[0] + 14, TL.metal[1] + 14, EASE.inOut);
  const ink = prog(f, TL.ink[0], TL.ink[1], EASE.inOut);
  return {
    a,
    b,
    rs,
    S,
    rx,
    ry,
    rz,
    flat,
    mapMix: 1 - mapOff,
    metal,
    rough: lerp(0.62, 0.13, metal),
    ink,
  };
};

const sinc = (x: number) => (Math.abs(x) < 1e-6 ? 1 - (x * x) / 6 : Math.sin(x) / x);

/** Sheet (s,t) -> 3D. Rolls width into a tube, bends the tube into a ring. */
const mapPoint = (s: number, t: number, st: HeroState, out: number[]) => {
  // Roll (curl edges away from camera)
  let x: number;
  let z: number;
  if (st.a < 1e-5) {
    x = s;
    z = 0;
  } else {
    const rho = POSTER_W / (2 * Math.PI * st.a);
    const th = s / rho;
    x = rho * Math.sin(th);
    z = -rho * (1 - Math.cos(th)) + rho * (1 - sinc(Math.PI * st.a));
  }
  x *= st.rs;
  z *= st.rs;
  // Bend the tube axis in the xy plane
  let X: number;
  let Y: number;
  if (st.b < 1e-5) {
    X = x;
    Y = t;
  } else {
    const rhoB = POSTER_H / (2 * Math.PI * st.b);
    const ph = t / rhoB;
    X = rhoB - (rhoB - x) * Math.cos(ph) - rhoB * (1 - sinc(Math.PI * st.b));
    Y = (rhoB - x) * Math.sin(ph);
  }
  out[0] = X;
  out[1] = Y;
  out[2] = z;
};

const buildGeometry = () => {
  const g = new THREE.BufferGeometry();
  const count = (NS + 1) * (NT + 1);
  const pos = new Float32Array(count * 3);
  const nor = new Float32Array(count * 3);
  const uv = new Float32Array(count * 2);
  for (let j = 0; j <= NT; j++) {
    for (let i = 0; i <= NS; i++) {
      const k = j * (NS + 1) + i;
      uv[k * 2] = i / NS;
      uv[k * 2 + 1] = j / NT;
    }
  }
  const idx: number[] = [];
  for (let j = 0; j < NT; j++) {
    for (let i = 0; i < NS; i++) {
      const a = j * (NS + 1) + i;
      const b = a + 1;
      const c = a + (NS + 1);
      const d = c + 1;
      idx.push(a, b, d, a, d, c);
    }
  }
  g.setIndex(idx);
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return g;
};

const fillGeometry = (g: THREE.BufferGeometry, st: HeroState) => {
  const pos = g.getAttribute('position') as THREE.BufferAttribute;
  const nor = g.getAttribute('normal') as THREE.BufferAttribute;
  const P = pos.array as Float32Array;
  const N = nor.array as Float32Array;
  const p = [0, 0, 0];
  const a = [0, 0, 0];
  const b = [0, 0, 0];
  const e = 0.05;
  for (let j = 0; j <= NT; j++) {
    const t = -POSTER_H / 2 + (POSTER_H * j) / NT;
    for (let i = 0; i <= NS; i++) {
      const s = -POSTER_W / 2 + (POSTER_W * i) / NS;
      const k = (j * (NS + 1) + i) * 3;
      mapPoint(s, t, st, p);
      P[k] = p[0];
      P[k + 1] = p[1];
      P[k + 2] = p[2];
      mapPoint(s + e, t, st, a);
      mapPoint(s - e, t, st, b);
      const sx = a[0] - b[0];
      const sy = a[1] - b[1];
      const sz = a[2] - b[2];
      mapPoint(s, t + e, st, a);
      mapPoint(s, t - e, st, b);
      const tx = a[0] - b[0];
      const ty = a[1] - b[1];
      const tz = a[2] - b[2];
      let nx = sy * tz - sz * ty;
      let ny = sz * tx - sx * tz;
      let nz = sx * ty - sy * tx;
      const len = Math.hypot(nx, ny, nz) || 1;
      nx /= len;
      ny /= len;
      nz /= len;
      N[k] = nx;
      N[k + 1] = ny;
      N[k + 2] = nz;
    }
  }
  pos.needsUpdate = true;
  nor.needsUpdate = true;
};

export const buildEnvironment = (gl: THREE.WebGLRenderer) => {
  const scene = new THREE.Scene();
  const sphere = new THREE.SphereGeometry(50, 128, 64);
  const stops: [number, string][] = [
    [-1, '#141518'],
    [-0.5, '#1F2024'],
    [-0.2, '#474A50'],
    [-0.17, '#B6BAC0'],
    [-0.02, '#A7ABB1'],
    [0.5, '#999DA4'],
    [1, '#C4C7CC'],
  ];
  const cols: number[] = [];
  const pa = sphere.getAttribute('position');
  const c = new THREE.Color();
  const c2 = new THREE.Color();
  for (let i = 0; i < pa.count; i++) {
    const y = pa.getY(i) / 50;
    let k = 0;
    while (k < stops.length - 2 && y > stops[k + 1][0]) k++;
    const [y0, h0] = stops[k];
    const [y1, h1] = stops[k + 1];
    const tt = Math.max(0, Math.min(1, (y - y0) / (y1 - y0)));
    c.set(h0).lerp(c2.set(h1), tt);
    cols.push(c.r, c.g, c.b);
  }
  sphere.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  scene.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({vertexColors: true, side: THREE.BackSide})));
  const box = (w: number, h: number, p: [number, number, number], intensity: number, tint = '#ffffff') => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({color: new THREE.Color(tint).multiplyScalar(intensity), side: THREE.DoubleSide}),
    );
    m.position.set(...p);
    m.lookAt(0, 0, 0);
    scene.add(m);
  };
  box(54, 16, [0, 36, 6], 7); // key overhead
  box(7, 50, [-36, 4, 20], 5); // left strip
  box(5, 44, [34, 6, 18], 3.2); // right strip
  box(8, 40, [30, 0, -26], 4); // right back rim
  box(30, 2.2, [0, 22, 40], 1.8); // thin front bar (behind camera, high)
  box(18, 10, [-20, -6, -40], 1.4, '#FF7A4E'); // warm card, echoes the poster
  const pmrem = new THREE.PMREMGenerator(gl);
  const rt = pmrem.fromScene(scene, 0.02);
  pmrem.dispose();
  return rt.texture;
};

const buildMaterial = (map: THREE.Texture, env: THREE.Texture) => {
  const uniforms = {
    uFlat: {value: 1},
    uMapMix: {value: 1},
    uInk: {value: 0},
    uInkColor: {value: new THREE.Color(INK)},
    uBackColor: {value: new THREE.Color('#EADFD0')},
    uMetalTint: {value: new THREE.Color('#F2F3F5')},
  };
  const m = new THREE.MeshStandardMaterial({
    map,
    envMap: env,
    envMapIntensity: 1,
    metalness: 0,
    roughness: 0.6,
    side: THREE.DoubleSide,
  });
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
uniform float uFlat; uniform float uMapMix; uniform float uInk;
uniform vec3 uInkColor; uniform vec3 uBackColor; uniform vec3 uMetalTint;`,
      )
      .replace(
        '#include <map_fragment>',
        `vec3 flatCol = uBackColor;
#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D( map, vMapUv );
  if ( !gl_FrontFacing ) sampledDiffuseColor = vec4( uBackColor, 1.0 );
  flatCol = sampledDiffuseColor.rgb;
  diffuseColor *= sampledDiffuseColor;
#endif
diffuseColor.rgb = mix( uMetalTint, diffuseColor.rgb, uMapMix );`,
      )
      .replace(
        '#include <colorspace_fragment>',
        `gl_FragColor.rgb = mix( gl_FragColor.rgb, flatCol, uFlat );
gl_FragColor.rgb = mix( gl_FragColor.rgb, uInkColor, uInk );
#include <colorspace_fragment>`,
      );
  };
  m.customProgramCacheKey = () => 'hero-morph-v1';
  return {material: m, uniforms};
};

export const Hero3D: React.FC = () => {
  const frame = useCurrentFrame();
  const gl = useThree((s) => s.gl);
  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(getPosterCanvas('ring', 3));
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    t.needsUpdate = true;
    return t;
  }, []);
  const env = useMemo(() => buildEnvironment(gl), [gl]);
  const {material, uniforms} = useMemo(() => buildMaterial(texture, env), [texture, env]);
  const geometry = useMemo(() => buildGeometry(), []);

  const st = heroState(frame);
  fillGeometry(geometry, st);
  uniforms.uFlat.value = st.flat;
  uniforms.uMapMix.value = st.mapMix;
  uniforms.uInk.value = st.ink;
  material.metalness = st.metal;
  material.roughness = st.rough;
  material.envMapIntensity = lerp(1.5, 1, st.metal);

  const visible = frame >= TL.swap[0] && frame < TL.svg[1];
  return (
    <group position={[HERO_X - WIDTH / 2, HEIGHT / 2 - HERO_Y, 0]} rotation={[st.rx, st.ry, st.rz]} scale={st.S}>
      <mesh geometry={geometry} material={material} frustumCulled={false} visible={visible} />
    </group>
  );
};
