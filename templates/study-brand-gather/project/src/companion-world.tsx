import React, { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas as RemotionThreeCanvas } from "@remotion/three";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { MarchingCubes } from "three/examples/jsm/objects/MarchingCubes.js";
import { progress } from "./shared";
const ThreeCanvas: React.FC<
  React.ComponentProps<typeof RemotionThreeCanvas>
> = (props) => (
  <RemotionThreeCanvas {...props}>
    {props.children}
    {typeof props.camera === "object" &&
      "fov" in props.camera &&
      props.camera.fov === 38 && (
        <CameraFit width={props.width} height={props.height} />
      )}
  </RemotionThreeCanvas>
);
const Sphere: React.FC<{
  r: number;
  position?: [number, number, number];
  scale?: [number, number, number];
  color: string;
  roughness?: number;
  opacity?: number;
  metalness?: number;
}> = ({
  r,
  position,
  scale,
  color,
  roughness = 0.4,
  opacity = 1,
  metalness = 0,
}) => (
  <mesh position={position} scale={scale}>
    <sphereGeometry args={[r, 40, 32]} />
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={metalness}
      transparent={opacity < 1}
      opacity={opacity}
    />
  </mesh>
);
const skinCache = new Map<boolean, THREE.BufferGeometry>();
const Skin: React.FC<{ color: string; friend: boolean }> = ({
  color,
  friend,
}) => {
  const geometry = useMemo(() => {
    const cached = skinCache.get(friend);
    if (cached) return cached;
    const resolution = 64;
    const surface = new MarchingCubes(
      resolution,
      new THREE.MeshStandardMaterial(),
      false,
      false,
      50000,
    );
    surface.isolation = 0;
    const scale = 1.4;
    const parts = [
      [0, -0.04, 0, 0.82, 0.82 * 0.96, 0.82 * 0.7],
      [0, -0.43, 0.06, 0.68 * 1.15, 0.68 * 0.67, 0.68 * 0.76],
      ...[
        [-0.38, 0.64, 0.26],
        [0, 0.77, 0.28],
        [0.38, 0.63, 0.25],
      ].map(([x, y, r]) => [
        x,
        y,
        0,
        r * (friend ? 0.9 : 1),
        r * (friend ? 0.9 : 1),
        r * (friend ? 0.9 : 1),
      ]),
    ];
    // A smooth implicit union removes intersection creases between the specified spheres.
    for (let z = 0; z < resolution; z++)
      for (let y = 0; y < resolution; y++)
        for (let x = 0; x < resolution; x++) {
          const point = [
            ((x / resolution) * 2 - 1) * scale,
            ((y / resolution) * 2 - 1) * scale,
            ((z / resolution) * 2 - 1) * scale,
          ];
          let distance = 100;
          for (const [cx, cy, cz, rx, ry, rz] of parts) {
            const d =
              (Math.hypot(
                (point[0] - cx) / rx,
                (point[1] - cy) / ry,
                (point[2] - cz) / rz,
              ) -
                1) *
              Math.min(rx, ry, rz);
            const k = 0.13;
            const h = Math.max(0, k - Math.abs(distance - d)) / k;
            distance = Math.min(distance, d) - h * h * k * 0.25;
          }
          surface.field[x + y * resolution + z * resolution * resolution] =
            -distance;
        }
    surface.update();
    const generated = surface.geometry.clone();
    generated.scale(scale, scale, scale);
    skinCache.set(friend, generated);
    return generated;
  }, [friend]);
  return (
    <mesh geometry={geometry} dispose={null}>
      <meshStandardMaterial color={color} roughness={0.4} metalness={0} />
    </mesh>
  );
};
export const Character: React.FC<{ color: string; friend?: boolean }> = ({
  color,
  friend = false,
}) => {
  const smile = useMemo(
    () =>
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-0.12, -0.14, 0.655),
        new THREE.Vector3(0, -0.29, 0.705),
        new THREE.Vector3(0.12, -0.14, 0.655),
      ),
    [],
  );
  return (
    <group>
      <Skin color={color} friend={friend} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Sphere
            r={0.072}
            scale={[0.8, 1.24, 0.52]}
            position={[s * 0.26, 0.08, 0.59]}
            color="#141022"
            roughness={0.1}
          />
          <Sphere
            r={0.018}
            position={[s * 0.26 - 0.015, 0.102, 0.624]}
            color="#ffffff"
            roughness={0.1}
          />
          <Sphere
            r={0.1}
            position={[s * 0.36, -0.12, 0.55]}
            scale={[1, 0.65, 0.05]}
            color="#efa4cf"
            opacity={0.15}
          />
        </group>
      ))}
      <mesh>
        <tubeGeometry args={[smile, 24, 0.014, 8, false]} />
        <meshStandardMaterial color="#5d2c71" roughness={0.5} />
      </mesh>
    </group>
  );
};
export const Avatar: React.FC<{
  size: number;
  color: string;
  friend?: boolean;
}> = ({ size, color, friend = false }) => (
  <ThreeCanvas
    width={Math.max(1, Math.round(size))}
    height={Math.max(1, Math.round(size))}
    camera={{ position: [0, 0.12, 4.5], fov: 35 }}
    gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
    onCreated={({ camera }) => camera.lookAt(0, 0.1, 0)}
    style={{ width: size, height: size }}
  >
    <ambientLight intensity={1.1} />
    <directionalLight position={[-3, 5, 4]} intensity={2.2} color="#fff0f9" />
    <directionalLight position={[3, -1, 2]} intensity={0.7} color="#a8ead9" />
    <Sphere
      r={1.18}
      scale={[1, 1, 0.12]}
      position={[0, 0, -0.45]}
      color={friend ? "#def4df" : "#f3e7ff"}
      roughness={0.19}
      opacity={0.86}
    />
    <mesh position={[0, 0, -0.2]}>
      <torusGeometry args={[1.17, 0.045, 16, 96]} />
      <meshPhysicalMaterial
        color="#ffffff"
        transparent
        opacity={0.55}
        roughness={0.1}
        metalness={0.1}
      />
    </mesh>
    <group scale={0.87} position={[0, -0.01, 0]}>
      <Character color={color} friend={friend} />
    </group>
    <mesh position={[0, 0, 0.15]} rotation={[0, 0, 0.3]}>
      <torusGeometry args={[1.13, 0.012, 8, 72, 1.2]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
    </mesh>
  </ThreeCanvas>
);
const Box: React.FC<{
  dimensions: [number, number, number];
  position?: [number, number, number];
  color: string;
  radius?: number;
  emissive?: string;
  intensity?: number;
}> = ({
  dimensions,
  position,
  color,
  radius = 0.08,
  emissive,
  intensity = 0,
}) => {
  const geometry = useMemo(
    () => new RoundedBoxGeometry(...dimensions, 3, radius),
    [...dimensions, radius],
  );
  return (
    <mesh geometry={geometry} position={position} castShadow receiveShadow>
      <meshStandardMaterial
        color={color}
        roughness={0.52}
        emissive={emissive ?? "#000000"}
        emissiveIntensity={intensity}
      />
    </mesh>
  );
};
const Rail: React.FC<{ z: number }> = ({ z }) => {
  const curve = useMemo(
    () =>
      new THREE.LineCurve3(
        new THREE.Vector3(-7, -1.12, 1.5 + z),
        new THREE.Vector3(7, -0.66, -0.5 + z),
      ),
    [z],
  );
  return (
    <mesh>
      <tubeGeometry args={[curve, 1, 0.016, 8, false]} />
      <meshStandardMaterial color="#a6b5b3" roughness={0.4} metalness={0.55} />
    </mesh>
  );
};
const CameraFit: React.FC<{ width: number; height: number }> = ({
  width,
  height,
}) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.aspect = width / height;
    c.zoom = 1;
    c.lookAt(0, 0.2, 0);
    c.updateMatrixWorld();
    c.updateProjectionMatrix();
    if (width < height) {
      let extent = 0;
      for (const box of [
        [
          [-3.7, -1.18, -0.25],
          [3.33, 0.42, 0.8],
        ],
        [
          [2.33, 1.48, -3.62],
          [4.37, 3.52, -1.58],
        ],
      ]) {
        for (const x of [box[0][0], box[1][0]])
          for (const y of [box[0][1], box[1][1]])
            for (const z of [box[0][2], box[1][2]]) {
              const q = new THREE.Vector3(x, y, z).project(c);
              extent = Math.max(extent, Math.abs(q.x), Math.abs(q.y));
            }
      }
      c.zoom = Math.min(1, 0.9 / extent);
      c.updateProjectionMatrix();
    }
  }, [camera, width, height]);
  return null;
};
export const TrainWorld: React.FC<{
  width: number;
  height: number;
  tint?: string;
}> = ({ width, height, tint = "#103d42" }) => {
  const f = useCurrentFrame();
  const craters = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const seed = (n: number) => {
          const v = Math.sin(n * 127.1 + 79 * 311.7) * 43758.5453;
          return v - Math.floor(v);
        };
        const x = (seed(i + 1) - 0.5) * 1.35,
          y = (seed(i + 18) - 0.5) * 1.35,
          z = Math.sqrt(Math.max(0.01, 1.02 * 1.02 - x * x - y * y));
        return { x, y, z, r: 0.05 + 0.08 * seed(i + 32) };
      }),
    [],
  );
  return (
    <ThreeCanvas
      width={Math.max(2, Math.round(width))}
      height={Math.max(2, Math.round(height))}
      camera={{
        position: [0, 3.2, 12],
        fov: 38,
        zoom: Math.min(1, width / height / 1.45),
      }}
      onCreated={({ camera }) => camera.lookAt(0, 0.2, 0)}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      style={{ width, height }}
    >
      <color attach="background" args={[tint]} />
      <fog attach="fog" args={[tint, 13, 28]} />
      <ambientLight intensity={0.65} color="#afccc4" />
      <hemisphereLight args={["#e6e6bf", "#153438", 0.65]} />
      <directionalLight position={[-3, 7, 6]} intensity={2.1} color="#fff0c4" />
      <pointLight
        position={[3.35, 2.5, -1.9]}
        intensity={8}
        color="#f4e9b7"
        distance={10}
      />
      <mesh position={[0, -1.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color={tint} roughness={1} />
      </mesh>
      <mesh position={[3.35, 2.5, -2.6]}>
        <sphereGeometry args={[1.02, 56, 40]} />
        <meshStandardMaterial
          color="#f5eccb"
          emissive="#f7edc8"
          emissiveIntensity={0.3}
          roughness={0.95}
        />
      </mesh>
      {craters.map((c, i) => (
        <mesh
          key={i}
          position={[3.35 + c.x, 2.5 + c.y, -2.6 + c.z]}
          rotation={[-c.y * 0.4, c.x * 0.4, 0]}
        >
          <circleGeometry args={[c.r, 16]} />
          <meshBasicMaterial color="#9a9e86" transparent opacity={0.06} />
        </mesh>
      ))}
      <Rail z={-0.45} />
      <Rail z={0.4} />
      {Array.from({ length: 24 }, (_, i) => {
        const x = -7 + i * 0.61;
        return (
          <mesh
            key={i}
            position={[x, -1.12 + (x + 7) * 0.0328, 0.5 - x / 7]}
            rotation={[0, 0.14, 0.033]}
          >
            <boxGeometry args={[0.14, 0.045, 0.96]} />
            <meshStandardMaterial color="#778680" roughness={0.9} />
          </mesh>
        );
      })}
      <group
        position={[0.35 * progress(f, 104, 286), 0, 0]}
        rotation={[0, -0.035, 0.03]}
      >
        {[-2.4, -0.2, 2].map((x, i) => (
          <group key={i} position={[x, -0.48, 0.2]}>
            <Box
              dimensions={[1.85, 0.66, 0.64]}
              color="#b8d3ba"
              radius={0.11}
            />
            <mesh position={[0, 0.33, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry
                args={[0.38, 0.38, 1.93, 40, 1, false, 0, Math.PI]}
              />
              <meshStandardMaterial color="#eadfba" roughness={0.56} />
            </mesh>
            {[-0.56, 0, 0.56].map((wx) => (
              <group key={wx}>
                <Box
                  dimensions={[0.37, 0.36, 0.05]}
                  position={[wx, 0.03, 0.342]}
                  color="#809e8f"
                  radius={0.025}
                />
                <Box
                  dimensions={[0.31, 0.3, 0.04]}
                  position={[wx, 0.03, 0.375]}
                  color="#fff0ba"
                  emissive="#ffe7a1"
                  intensity={0.55}
                  radius={0.018}
                />
              </group>
            ))}
            {[-0.62, 0.62].map((wx) => (
              <group
                key={wx}
                position={[wx, -0.43, 0.36]}
                rotation={[0, 0, -f * 0.026]}
              >
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.16, 0.16, 0.075, 24]} />
                  <meshStandardMaterial color="#243c3c" roughness={0.55} />
                </mesh>
                <mesh position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.043, 0.043, 0.022, 20]} />
                  <meshStandardMaterial
                    color="#bfc7ba"
                    metalness={0.7}
                    roughness={0.35}
                  />
                </mesh>
                <mesh position={[0.065, 0, 0.063]}>
                  <boxGeometry args={[0.1, 0.016, 0.01]} />
                  <meshStandardMaterial color="#7a8a83" />
                </mesh>
              </group>
            ))}
            {i < 2 && (
              <Box
                dimensions={[0.38, 0.07, 0.1]}
                position={[1.07, -0.24, 0]}
                color="#738a80"
                radius={0.02}
              />
            )}{" "}
            {i === 0 && (
              <>
                <Box
                  dimensions={[0.26, 0.46, 0.56]}
                  position={[-0.98, -0.07, 0]}
                  color="#a6c3aa"
                  radius={0.1}
                />
                <Sphere
                  r={0.075}
                  position={[-1.11, -0.12, 0.22]}
                  color="#fff1b7"
                  roughness={0.2}
                />
              </>
            )}
          </group>
        ))}
      </group>
    </ThreeCanvas>
  );
};
