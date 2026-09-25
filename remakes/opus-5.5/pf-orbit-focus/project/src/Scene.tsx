import {useFrame, useThree} from '@react-three/fiber';
import React, {useEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {CARDS, IMAGES, type ImageKey} from './cards';
import {
  CARD_COUNT,
  CARD_H,
  CARD_W,
  FPS,
  HEIGHT,
  HERO_INDEX,
  T,
  WIDTH,
  cardRectPx,
  cardState,
  clamp01,
  coverScale,
  heroImageScale,
  viewDistance,
  type Vec3,
} from './spatial';

// 180-degree shutter, centred on the frame time.
const SHUTTER = 0.5;
const MAX_SAMPLES = 64;
const PX_PER_SAMPLE = 1.25;

const cardVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const cardFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec2 uCenter;
  uniform vec2 uScale;
  uniform vec2 uSize;
  uniform float uBrightness;
  uniform float uRadius;
  uniform float uEdge;
  varying vec2 vUv;

  float sdRoundBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    vec2 local = (vUv - 0.5) * uSize;
    vec2 uv = uCenter + local * uScale;
    vec3 col = texture2D(uMap, uv).rgb;

    // Soft top light + gentle vignette so each print has some body.
    vec2 n = local / (uSize * 0.5);
    float vig = 1.0 - 0.16 * smoothstep(0.35, 1.35, length(n * vec2(0.9, 1.0)));
    col *= vig * (1.0 + 0.05 * n.y);

    col *= uBrightness;

    float d = sdRoundBox(local, uSize * 0.5, uRadius);
    float aa = max(fwidth(d), 1e-5);
    float alpha = 1.0 - smoothstep(-aa, aa, d);

    // Hairline inner edge, constant ~1px on screen.
    float edge = 1.0 - smoothstep(0.0, aa * 1.1, abs(d + aa * 1.4));
    col = mix(col, vec3(1.0), edge * uEdge);

    gl_FragColor = vec4(col * alpha, alpha);
  }
`;

const quadVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const accumFragment = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uWeight;
  varying vec2 vUv;
  void main() {
    gl_FragColor = texture2D(uTex, vUv) * uWeight;
  }
`;

const compositeFragment = /* glsl */ `
  uniform sampler2D uAccum;
  uniform vec2 uRes;
  uniform float uGlow;
  varying vec2 vUv;

  vec3 toLinear(vec3 c) {
    return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
  }
  vec3 toSrgb(vec3 c) {
    c = max(c, 0.0);
    return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
  }

  void main() {
    vec4 acc = texture2D(uAccum, vUv);
    vec2 p = (vUv - vec2(0.5, 0.54)) * vec2(uRes.x / uRes.y, 1.0);
    float r = length(p * vec2(0.8, 1.0));
    vec3 inner = vec3(0.092, 0.098, 0.118);
    vec3 outer = vec3(0.016, 0.017, 0.022);
    vec3 bg = mix(inner, outer, smoothstep(0.0, 0.95, r));
    // A faint cool bloom behind the ring, breathing with the orbit.
    bg += vec3(0.010, 0.020, 0.026) * uGlow * (1.0 - smoothstep(0.0, 0.6, r));
    vec3 lin = acc.rgb + toLinear(bg) * (1.0 - acc.a);
    vec3 outc = toSrgb(lin);
    float noise = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    outc += (noise - 0.5) / 255.0;
    gl_FragColor = vec4(outc, 1.0);
  }
`;

const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Depth cue: far prints sit back in the dark. */
const depthBrightness = (d: number) => {
  const near = 1 - 0.34 * smooth(9, 16, d);
  const far = 1 - 0.55 * smooth(15.5, 24, d);
  return near * far;
};

type Props = {
  frame: number;
  textures: Record<ImageKey, THREE.Texture>;
};

export const Scene: React.FC<Props> = ({frame, textures}) => {
  const {gl, camera, scene} = useThree();
  const frameRef = useRef(frame);
  frameRef.current = frame;

  const cards = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(CARD_W, CARD_H);
    return CARDS.map((spec, i) => {
      const img = IMAGES[spec.image];
      const s = coverScale(img) / spec.zoom;
      const hx = (CARD_W / 2) * (s / img.w);
      const hy = (CARD_H / 2) * (s / img.h);
      const center = new THREE.Vector2(
        Math.min(1 - hx, Math.max(hx, spec.u)),
        Math.min(1 - hy, Math.max(hy, 1 - spec.v)),
      );
      const material = new THREE.ShaderMaterial({
        vertexShader: cardVertex,
        fragmentShader: cardFragment,
        uniforms: {
          uMap: {value: textures[spec.image]},
          uCenter: {value: center},
          uScale: {value: new THREE.Vector2(s / img.w, s / img.h)},
          uSize: {value: new THREE.Vector2(CARD_W, CARD_H)},
          uBrightness: {value: 1},
          uRadius: {value: 0.075},
          uEdge: {value: 0.1},
        },
        transparent: true,
        depthTest: true,
        depthWrite: true,
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
        blendSrcAlpha: THREE.OneFactor,
        blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = `card-${i}-${spec.image}`;
      mesh.scale.set(1, 1, 1);
      mesh.userData = {index: i, image: spec.image, baseScale: s, img};
      return mesh;
    });
  }, [textures]);

  const group = useMemo(() => {
    const g = new THREE.Group();
    g.name = 'orbit-cards';
    cards.forEach((c) => g.add(c));
    return g;
  }, [cards]);

  const pipeline = useMemo(() => {
    const sampleRT = new THREE.WebGLRenderTarget(WIDTH, HEIGHT, {
      type: THREE.HalfFloatType,
      samples: 4,
      depthBuffer: true,
    });
    const accumRT = new THREE.WebGLRenderTarget(WIDTH, HEIGHT, {
      type: THREE.HalfFloatType,
      depthBuffer: false,
    });
    const quadGeo = new THREE.PlaneGeometry(2, 2);
    const accumMat = new THREE.ShaderMaterial({
      vertexShader: quadVertex,
      fragmentShader: accumFragment,
      uniforms: {uTex: {value: sampleRT.texture}, uWeight: {value: 1}},
      depthTest: false,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
      blendSrcAlpha: THREE.OneFactor,
      blendDstAlpha: THREE.OneFactor,
    });
    const compositeMat = new THREE.ShaderMaterial({
      vertexShader: quadVertex,
      fragmentShader: compositeFragment,
      uniforms: {
        uAccum: {value: accumRT.texture},
        uRes: {value: new THREE.Vector2(WIDTH, HEIGHT)},
        uGlow: {value: 0},
      },
      depthTest: false,
      depthWrite: false,
    });
    const accumQuad = new THREE.Mesh(quadGeo, accumMat);
    accumQuad.frustumCulled = false;
    const compositeQuad = new THREE.Mesh(quadGeo, compositeMat);
    compositeQuad.frustumCulled = false;
    const accumScene = new THREE.Scene();
    accumScene.add(accumQuad);
    const compositeScene = new THREE.Scene();
    compositeScene.add(compositeQuad);
    const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    return {sampleRT, accumRT, accumMat, compositeMat, accumScene, compositeScene, quadCam};
  }, []);

  useEffect(() => {
    return () => {
      pipeline.sampleRT.dispose();
      pipeline.accumRT.dispose();
    };
  }, [pipeline]);

  const applyTime = (t: number) => {
    for (const mesh of cards) {
      const i = mesh.userData.index as number;
      const {position, dim} = cardState(i, t);
      mesh.position.set(position[0], position[1], position[2]);
      // Billboard: every plane stays parallel to the (fixed) camera's image plane.
      mesh.quaternion.copy(camera.quaternion);
      mesh.scale.set(1, 1, 1);
      const mat = mesh.material as THREE.ShaderMaterial;
      const d = viewDistance(position);
      let brightness = depthBrightness(d) * dim;
      if (i === HERO_INDEX) {
        const s = heroImageScale(position, mesh.userData.img);
        // Slow settle inside the frame once the card has landed.
        const settle = smooth(T.focusEnd - 0.25, 6.2, t);
        const sFinal = s / (1 + 0.035 * settle);
        mat.uniforms.uScale.value.set(sFinal / mesh.userData.img.w, sFinal / mesh.userData.img.h);
        brightness = Math.max(brightness, depthBrightness(d));
        mat.uniforms.uEdge.value = 0.1 * (1 - smooth(T.focusStart, T.focusStart + 0.8, t));
      }
      mat.uniforms.uBrightness.value = brightness;
    }
  };

  const sampleCount = (t: number) => {
    const dt = (SHUTTER / FPS) / 2;
    let maxMove = 0;
    for (let i = 0; i < CARD_COUNT; i++) {
      const a = cardRectPx(cardState(i, t - dt).position as Vec3);
      const b = cardRectPx(cardState(i, t + dt).position as Vec3);
      const m = Math.max(
        Math.hypot(a.left - b.left, a.top - b.top),
        Math.hypot(a.right - b.right, a.bottom - b.bottom),
      );
      // Only count what can be on screen.
      if (i === HERO_INDEX || viewDistance(cardState(i, t).position) < 23) {
        maxMove = Math.max(maxMove, Math.min(m, 4000));
      }
    }
    return Math.max(1, Math.min(MAX_SAMPLES, Math.ceil(maxMove / PX_PER_SAMPLE)));
  };

  useFrame(() => {
    const t = frameRef.current / FPS;
    const n = sampleCount(t);
    const {sampleRT, accumRT, accumMat, compositeMat, accumScene, compositeScene, quadCam} = pipeline;
    gl.autoClear = false;

    gl.setRenderTarget(accumRT);
    gl.setClearColor(0x000000, 0);
    gl.clear(true, false, false);

    accumMat.uniforms.uWeight.value = 1 / n;
    for (let k = 0; k < n; k++) {
      const tk = n === 1 ? t : t + (SHUTTER / FPS) * ((k + 0.5) / n - 0.5);
      applyTime(Math.max(0, tk));
      gl.setRenderTarget(sampleRT);
      gl.setClearColor(0x000000, 0);
      gl.clear(true, true, false);
      gl.render(scene, camera);
      gl.setRenderTarget(accumRT);
      gl.render(accumScene, quadCam);
    }
    // Leave the scene at the exact frame time.
    applyTime(t);

    compositeMat.uniforms.uGlow.value = smooth(0.3, 1.2, t) * (1 - smooth(T.focusStart, T.focusEnd - 0.4, t));
    gl.setRenderTarget(null);
    gl.setClearColor(0x000000, 1);
    gl.clear(true, true, false);
    gl.render(compositeScene, quadCam);
  }, 1);

  return <primitive object={group} />;
};
