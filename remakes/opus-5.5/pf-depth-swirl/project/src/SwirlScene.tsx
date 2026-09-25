import React, {useEffect, useMemo, useRef} from 'react';
import {useFrame, useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {useCurrentFrame} from 'remotion';
import {
  blurSamplesForFrame,
  CARD_COUNT,
  cardState,
  SHUTTER_FRAMES,
  textureForCard,
  TextureName,
  travelAtFrame,
} from './spiral';
import {Capsule, PROTECT_FEATHER, PROTECT_MIN_OPACITY, PROTECT_SMOOTH_UNION} from './typography';

// Linear-light colours (the whole pipeline accumulates in linear and encodes once at the end).
const srgbToLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const hex = (h: string) => {
  const n = parseInt(h.slice(1), 16);
  return new THREE.Vector3(srgbToLinear(((n >> 16) & 255) / 255), srgbToLinear(((n >> 8) & 255) / 255), srgbToLinear((n & 255) / 255));
};
export const BG_CORE = hex('#16202c');
export const BG_EDGE = hex('#05070b');
const HAZE = hex('#1a2430');

const cardVertex = /* glsl */ `
varying vec2 vUv;
varying vec2 vLocal;
void main() {
  vUv = uv;
  vLocal = position.xy; // PlaneGeometry(2,2): -1..1
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const cardFragment = /* glsl */ `
uniform sampler2D map;
uniform vec2 uvScale;
uniform vec2 uvOffset;
uniform float uFade;
uniform float uHaze;
uniform vec3 uHazeColor;
uniform vec2 uResolution;
uniform vec4 uCaps[3];
uniform float uFeather;
uniform float uMinOpacity;
uniform float uUnion;
uniform float uCorner;
varying vec2 vUv;
varying vec2 vLocal;

float capsule(vec2 p, vec4 c) {
  vec2 q = abs(p - c.xy);
  q.x = max(q.x - (c.z - c.w), 0.0);
  return length(q) - c.w;
}
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}
float roundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  vec2 uv = vUv * uvScale + uvOffset;
  vec3 col = texture2D(map, uv).rgb;
  // Gentle, uniform grade so four different photos read as one set.
  float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(l), col, 0.9);
  col *= 1.0 - 0.16 * smoothstep(0.35, 1.45, length(vLocal));
  col = mix(col, uHazeColor, uHaze);

  float sd = roundedBox(vLocal, vec2(1.0), uCorner);
  float aa = max(fwidth(sd), 1e-4);
  float shape = clamp(0.5 - sd / aa, 0.0, 1.0);

  // Text protection: feathered, smooth-unioned capsules around each line of type.
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
  float d = capsule(frag, uCaps[0]);
  d = smin(d, capsule(frag, uCaps[1]), uUnion);
  d = smin(d, capsule(frag, uCaps[2]), uUnion);
  float protect = mix(uMinOpacity, 1.0, smoothstep(0.0, uFeather, d));

  gl_FragColor = vec4(col, shape * uFade * protect);
}`;

const quadVertex = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const accumFragment = /* glsl */ `
uniform sampler2D tSrc;
uniform float uWeight;
varying vec2 vUv;
void main() { gl_FragColor = texture2D(tSrc, vUv) * uWeight; }`;

const compositeFragment = /* glsl */ `
uniform sampler2D tAccum;
uniform vec3 uCore;
uniform vec3 uEdge;
uniform vec2 uResolution;
uniform float uSeed;
varying vec2 vUv;

vec3 toSRGB(vec3 c) {
  c = max(c, 0.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}
float hash(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p.yx + 19.19);
  return fract((p.x + p.y) * p.x);
}
void main() {
  vec2 p = (vUv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  float r = length(p * vec2(0.82, 1.0));
  vec3 bg = mix(uCore, uEdge, smoothstep(0.0, 0.95, r));
  vec4 acc = texture2D(tAccum, vUv);
  vec3 c = bg * (1.0 - acc.a) + acc.rgb;
  // Lens vignette over everything, cards included.
  c *= 1.0 - 0.42 * smoothstep(0.45, 1.25, r);
  vec3 s = toSRGB(c);
  s += (hash(gl_FragCoord.xy + uSeed) - 0.5) / 255.0;
  gl_FragColor = vec4(s, 1.0);
}`;

type Props = {
  textures: Record<TextureName, THREE.Texture>;
  capsules: Capsule[];
};

export const SwirlScene: React.FC<Props> = ({textures, capsules}) => {
  const frame = useCurrentFrame();
  const frameRef = useRef(frame);
  frameRef.current = frame;
  const capsRef = useRef(capsules);
  capsRef.current = capsules;

  const {gl, size} = useThree();
  const meshes = useRef<(THREE.Mesh | null)[]>([]);

  const materials = useMemo(() => {
    const maxAniso = gl.capabilities.getMaxAnisotropy();
    return Array.from({length: CARD_COUNT}, (_, i) => {
      const tex = textures[textureForCard(i)];
      tex.anisotropy = maxAniso;
      const img = tex.image as {width: number; height: number};
      // Centre-crop ("cover") the 3:2 photo into the square card; never stretch.
      const sx = img.width > img.height ? img.height / img.width : 1;
      const sy = img.height > img.width ? img.width / img.height : 1;
      return new THREE.ShaderMaterial({
        vertexShader: cardVertex,
        fragmentShader: cardFragment,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        side: THREE.FrontSide,
        uniforms: {
          map: {value: tex},
          uvScale: {value: new THREE.Vector2(sx, sy)},
          uvOffset: {value: new THREE.Vector2((1 - sx) / 2, (1 - sy) / 2)},
          uFade: {value: 1},
          uHaze: {value: 0},
          uHazeColor: {value: HAZE},
          uResolution: {value: new THREE.Vector2(1920, 1080)},
          uCaps: {value: [new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4()]},
          uFeather: {value: PROTECT_FEATHER},
          uMinOpacity: {value: PROTECT_MIN_OPACITY},
          uUnion: {value: PROTECT_SMOOTH_UNION},
          uCorner: {value: 0.075},
        },
      });
    });
  }, [gl, textures]);

  const pipeline = useMemo(() => {
    const dpr = gl.getPixelRatio();
    const w = Math.round(size.width * dpr);
    const h = Math.round(size.height * dpr);
    const sample = new THREE.WebGLRenderTarget(w, h, {
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      depthBuffer: true,
      samples: 4,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      generateMipmaps: false,
    });
    const accum = new THREE.WebGLRenderTarget(w, h, {
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      depthBuffer: false,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      generateMipmaps: false,
    });
    const quad = new THREE.PlaneGeometry(2, 2);
    const ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const accumMat = new THREE.ShaderMaterial({
      vertexShader: quadVertex,
      fragmentShader: accumFragment,
      uniforms: {tSrc: {value: sample.texture}, uWeight: {value: 1}},
      depthTest: false,
      depthWrite: false,
      transparent: true,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
      blendEquationAlpha: THREE.AddEquation,
      blendSrcAlpha: THREE.OneFactor,
      blendDstAlpha: THREE.OneFactor,
    });
    const compositeMat = new THREE.ShaderMaterial({
      vertexShader: quadVertex,
      fragmentShader: compositeFragment,
      uniforms: {
        tAccum: {value: accum.texture},
        uCore: {value: BG_CORE},
        uEdge: {value: BG_EDGE},
        uResolution: {value: new THREE.Vector2(w, h)},
        uSeed: {value: 0},
      },
      depthTest: false,
      depthWrite: false,
    });
    const accumScene = new THREE.Scene();
    const accumMesh = new THREE.Mesh(quad, accumMat);
    accumMesh.frustumCulled = false;
    accumScene.add(accumMesh);
    const compositeScene = new THREE.Scene();
    const compositeMesh = new THREE.Mesh(quad, compositeMat);
    compositeMesh.frustumCulled = false;
    compositeScene.add(compositeMesh);
    return {sample, accum, ortho, accumMat, compositeMat, accumScene, compositeScene, w, h};
  }, [gl, size]);

  useEffect(
    () => () => {
      pipeline.sample.dispose();
      pipeline.accum.dispose();
    },
    [pipeline],
  );

  useFrame(({scene, camera}) => {
    const f = frameRef.current;
    const caps = capsRef.current;
    for (const m of materials) {
      m.uniforms.uResolution.value.set(pipeline.w, pipeline.h);
      const dpr = pipeline.w / 1920;
      caps.forEach((c, k) => (m.uniforms.uCaps.value[k] as THREE.Vector4).set(c[0] * dpr, c[1] * dpr, c[2] * dpr, c[3] * dpr));
      m.uniforms.uFeather.value = PROTECT_FEATHER * dpr;
      m.uniforms.uUnion.value = PROTECT_SMOOTH_UNION * dpr;
    }

    const n = blurSamplesForFrame(f);
    const weights: number[] = [];
    for (let s = 0; s < n; s++) {
      const x = n === 1 ? 0 : ((s + 0.5) / n) * 2 - 1;
      weights.push(1 - 0.6 * Math.abs(x)); // soft tent shutter: no hard trail ends
    }
    const total = weights.reduce((a, b) => a + b, 0);

    const prevAutoClear = gl.autoClear;
    gl.autoClear = false;
    gl.setClearColor(0x000000, 0);
    gl.setRenderTarget(pipeline.accum);
    gl.clear(true, false, false);

    for (let s = 0; s < n; s++) {
      const offset = n === 1 ? 0 : ((s + 0.5) / n - 0.5) * SHUTTER_FRAMES;
      const travel = travelAtFrame(f + offset);
      for (let i = 0; i < CARD_COUNT; i++) {
        const mesh = meshes.current[i];
        if (!mesh) continue;
        const c = cardState(i, travel);
        mesh.position.set(c.x, c.y, c.z);
        mesh.visible = c.fade > 0.0005;
        const u = materials[i].uniforms;
        u.uFade.value = c.fade;
        u.uHaze.value = c.haze;
      }
      gl.setRenderTarget(pipeline.sample);
      gl.clear(true, true, false);
      gl.render(scene, camera);
      pipeline.accumMat.uniforms.uWeight.value = weights[s] / total;
      gl.setRenderTarget(pipeline.accum);
      gl.render(pipeline.accumScene, pipeline.ortho);
    }

    gl.setRenderTarget(null);
    gl.clear(true, true, false);
    pipeline.compositeMat.uniforms.uSeed.value = (f % 97) * 3.17;
    gl.render(pipeline.compositeScene, pipeline.ortho);
    gl.autoClear = prevAutoClear;
  }, 1);

  return (
    <>
      {materials.map((mat, i) => (
        <mesh
          key={i}
          ref={(m) => {
            meshes.current[i] = m;
          }}
          material={mat}
          scale={[1, 1, 1]}
        >
          <planeGeometry args={[2, 2]} />
        </mesh>
      ))}
    </>
  );
};
