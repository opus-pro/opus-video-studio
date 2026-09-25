import {useFrame, useThree} from '@react-three/fiber';
import React, {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {continueRender, delayRender, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {CARDS} from './cards';
import {
  CARD_COUNT,
  CARD_HEIGHT,
  CARD_WIDTH,
  FPS,
  SHUTTER_SECONDS,
  cardPosition,
  depthShade,
  phaseAt,
  relayProgress,
  shutterWeight,
} from './motion';

const FULLSCREEN_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Renders the world-space z of each card fragment (encoded to [0,1]); alpha marks coverage.
const DEPTH_VERT = /* glsl */ `
  varying float vZ;
  void main() {
    vZ = (modelMatrix * vec4(position, 1.0)).z;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const DEPTH_FRAG = /* glsl */ `
  varying float vZ;
  void main() {
    gl_FragColor = vec4((vZ + 10.0) / 20.0, 0.0, 0.0, 1.0);
  }
`;

// One shutter sample: backdrop + cards (premultiplied, linear) + depth-aware soft contact shadows,
// weighted into the accumulation buffer.
const ACCUM_FRAG = /* glsl */ `
  uniform sampler2D tSample;
  uniform sampler2D tDepth;
  uniform vec2 texel;
  uniform float weight;
  uniform vec3 bgInner;
  uniform vec3 bgOuter;
  varying vec2 vUv;

  float zAt(vec2 uv) {
    vec4 d = texture2D(tDepth, uv);
    return d.a > 0.5 ? d.r * 20.0 - 10.0 : -10.0;
  }

  void main() {
    vec4 c = texture2D(tSample, vUv);
    float zs = zAt(vUv);

    // Key light from the upper left: occluders sit up-left of the shadow they cast.
    const int TAPS = 28;
    const float GOLDEN = 2.39996323;
    vec2 lightOffset = vec2(-15.0, 22.0);
    float occ = 0.0;
    float wsum = 0.0;
    for (int i = 0; i < TAPS; i++) {
      float fi = float(i) + 0.5;
      float r = sqrt(fi / float(TAPS));
      float a = fi * GOLDEN;
      vec2 o = vec2(cos(a), sin(a)) * r * 34.0;
      float zt = zAt(vUv + (lightOffset + o) * texel);
      float w = exp(-2.2 * r * r);
      occ += w * smoothstep(0.15, 1.2, zt - zs);
      wsum += w;
    }
    occ /= wsum;

    vec2 p = vUv - 0.5;
    float rr = length(p);
    vec3 bg = mix(bgInner, bgOuter, smoothstep(0.0, 0.74, rr));
    vec3 col = bg * (1.0 - c.a) * (1.0 - 0.55 * occ) + c.rgb * (1.0 - 0.42 * occ);
    gl_FragColor = vec4(col * weight, weight);
  }
`;

// Converts the accumulated linear image to sRGB and dithers it against banding.
const COMPOSITE_FRAG = /* glsl */ `
  uniform sampler2D tAccum;
  uniform float seed;
  varying vec2 vUv;

  vec3 toSRGB(vec3 c) {
    c = max(c, vec3(0.0));
    return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c));
  }
  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }
  void main() {
    vec3 s = toSRGB(texture2D(tAccum, vUv).rgb);
    s += (hash(gl_FragCoord.xy + seed) + hash(gl_FragCoord.yx * 1.37 + seed) - 1.0) / 255.0;
    gl_FragColor = vec4(s, 1.0);
  }
`;

const srgbToLinear = (hex: string) => new THREE.Color().setStyle(hex, THREE.SRGBColorSpace);

const BG_NEUTRAL = srgbToLinear('#1B1C1F');
const BG_OUTER = srgbToLinear('#08080A');
// The backdrop takes a faint cast of whichever plate holds the front slot.
const BG_INNERS = CARDS.map((c) => BG_NEUTRAL.clone().lerp(srgbToLinear(c.accent), 0.028));

type Props = {canvases: HTMLCanvasElement[]};

export const Scene: React.FC<Props> = ({canvases}) => {
  const frame = useCurrentFrame();
  const frameRef = useRef(frame);
  frameRef.current = frame;

  const {gl, camera, advance} = useThree();
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const [firstFrame] = useState(() => delayRender('Scene first frame'));

  const geometry = useMemo(() => new THREE.PlaneGeometry(CARD_WIDTH, CARD_HEIGHT), []);

  const materials = useMemo(() => {
    const aniso = gl.capabilities.getMaxAnisotropy();
    return canvases.map((canvas) => {
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = aniso;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.needsUpdate = true;
      // Opaque cards: occlusion is decided purely by the depth buffer.
      return new THREE.MeshBasicMaterial({map: tex, transparent: false, depthTest: true, depthWrite: true, toneMapped: false});
    });
  }, [canvases, gl]);

  const pipeline = useMemo(() => {
    const size = gl.getDrawingBufferSize(new THREE.Vector2());
    const opts = {
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      depthBuffer: true,
      generateMipmaps: false,
    } as const;
    const sampleRT = new THREE.WebGLRenderTarget(size.x, size.y, {...opts, samples: 8});
    const depthRT = new THREE.WebGLRenderTarget(size.x, size.y, {...opts});
    const accumRT = new THREE.WebGLRenderTarget(size.x, size.y, {...opts, depthBuffer: false});
    const depthMat = new THREE.ShaderMaterial({vertexShader: DEPTH_VERT, fragmentShader: DEPTH_FRAG});
    const quad = new THREE.PlaneGeometry(2, 2);
    const orthoCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const accumMat = new THREE.ShaderMaterial({
      uniforms: {
        tSample: {value: sampleRT.texture},
        tDepth: {value: depthRT.texture},
        texel: {value: new THREE.Vector2(1 / size.x, 1 / size.y)},
        weight: {value: 1},
        bgInner: {value: BG_INNERS[0].clone()},
        bgOuter: {value: BG_OUTER.clone()},
      },
      vertexShader: FULLSCREEN_VERT,
      fragmentShader: ACCUM_FRAG,
      depthTest: false,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
      blendSrcAlpha: THREE.OneFactor,
      blendDstAlpha: THREE.OneFactor,
    });
    const accumScene = new THREE.Scene();
    const accumQuad = new THREE.Mesh(quad, accumMat);
    accumQuad.frustumCulled = false;
    accumScene.add(accumQuad);

    const compositeMat = new THREE.ShaderMaterial({
      uniforms: {tAccum: {value: accumRT.texture}, seed: {value: 0}},
      vertexShader: FULLSCREEN_VERT,
      fragmentShader: COMPOSITE_FRAG,
      depthTest: false,
      depthWrite: false,
      blending: THREE.NoBlending,
    });
    const compositeScene = new THREE.Scene();
    const compositeQuad = new THREE.Mesh(quad, compositeMat);
    compositeQuad.frustumCulled = false;
    compositeScene.add(compositeQuad);

    return {sampleRT, depthRT, depthMat, accumRT, accumMat, accumScene, compositeMat, compositeScene, orthoCam};
  }, [gl]);

  useEffect(
    () => () => {
      pipeline.sampleRT.dispose();
      pipeline.depthRT.dispose();
      pipeline.accumRT.dispose();
    },
    [pipeline],
  );

  const shadeColor = useMemo(() => new THREE.Color(), []);

  const applyPose = (seconds: number) => {
    const phase = phaseAt(seconds);
    for (let i = 0; i < CARD_COUNT; i++) {
      const mesh = meshes.current[i];
      if (!mesh) continue;
      const [x, y, z] = cardPosition(i, phase);
      mesh.position.set(x, y, z);
      mesh.quaternion.copy(camera.quaternion); // camera-facing billboard
      mesh.scale.set(1, 1, 1);
      const shade = depthShade(z);
      (mesh.material as THREE.MeshBasicMaterial).color.copy(shadeColor.setRGB(shade, shade, shade, THREE.SRGBColorSpace));
    }
  };

  useFrame(({scene}) => {
    const t = frameRef.current / FPS;
    const t0 = t - SHUTTER_SECONDS / 2;
    const t1 = t + SHUTTER_SECONDS / 2;
    // Sample count scales with how far the fastest card travels while the shutter is open.
    const travelPx = Math.abs(phaseAt(t1) - phaseAt(t0)) * 620;
    const samples = travelPx < 0.05 ? 1 : Math.min(72, Math.max(6, Math.ceil(travelPx / 1.1)));

    const {sampleRT, depthRT, depthMat, accumRT, accumMat, accumScene, compositeMat, compositeScene, orthoCam} = pipeline;
    const progress = relayProgress(t);
    const k = Math.min(CARD_COUNT - 2, Math.floor(progress));
    (accumMat.uniforms.bgInner.value as THREE.Color).copy(BG_INNERS[k]).lerp(BG_INNERS[k + 1], progress - k);
    const prevAutoClear = gl.autoClear;
    gl.autoClear = false;
    gl.setClearColor(0x000000, 0);

    gl.setRenderTarget(accumRT);
    gl.clear(true, true, true);
    let weightSum = 0;
    for (let s = 0; s < samples; s++) weightSum += samples === 1 ? 1 : shutterWeight((s + 0.5) / samples);
    for (let s = 0; s < samples; s++) {
      const u = (s + 0.5) / samples;
      accumMat.uniforms.weight.value = (samples === 1 ? 1 : shutterWeight(u)) / weightSum;
      applyPose(samples === 1 ? t : t0 + u * (t1 - t0));
      gl.setRenderTarget(sampleRT);
      gl.clear(true, true, true);
      gl.render(scene, camera);
      gl.setRenderTarget(depthRT);
      gl.clear(true, true, true);
      scene.overrideMaterial = depthMat;
      gl.render(scene, camera);
      scene.overrideMaterial = null;
      gl.setRenderTarget(accumRT);
      gl.render(accumScene, orthoCam);
    }
    // Leave the scene graph at the canonical frame time (this is what the audit reports).
    applyPose(t);

    compositeMat.uniforms.seed.value = (frameRef.current % 64) * 7.123;

    gl.setRenderTarget(null);
    gl.clear(true, true, true);
    gl.render(compositeScene, orthoCam);
    gl.autoClear = prevAutoClear;
  }, 1);

  useLayoutEffect(() => {
    applyPose(frameRef.current / FPS);
  });

  useEffect(() => {
    advance(performance.now());
    continueRender(firstFrame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {materials.map((material, i) => (
        <mesh
          key={i}
          ref={(m) => {
            meshes.current[i] = m;
          }}
          geometry={geometry}
          material={material}
          scale={[1, 1, 1]}
        />
      ))}
    </>
  );
};
