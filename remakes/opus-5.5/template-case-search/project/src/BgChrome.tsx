import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {buildEnvironment} from './Hero3D';
import {gridPose} from './grid';
import {ITEMS, isChrome} from './objects';
import {HEIGHT, WIDTH} from './timing';

const CHROME = ITEMS.map((item, index) => ({item, index})).filter(({item}) => isChrome(item));

const makeGeometry = (type: string) => {
  switch (type) {
    case 'sphere':
      return new THREE.SphereGeometry(26, 96, 48);
    case 'ringChrome':
      return new THREE.TorusGeometry(21, 8.5, 64, 128);
    case 'pill':
      return new THREE.CapsuleGeometry(12.5, 34, 24, 48);
    default:
      return new THREE.TorusKnotGeometry(15, 5.2, 220, 32, 2, 3);
  }
};

const baseRotation = (type: string, f: number, i: number): [number, number, number] => {
  const t = f / 60;
  switch (type) {
    case 'ringChrome':
      return [-1.12 + 0.05 * Math.sin(t * 0.9), 0.1 * Math.sin(t * 0.6 + 1), 0.08];
    case 'pill':
      return [0.35, 0.2 + 0.25 * Math.sin(t * 0.5), -0.58];
    case 'sphere':
      return [0.2, t * 0.3, 0];
    default:
      return [0.5 + t * 0.22, 0.3 + t * 0.31 + i, 0.1];
  }
};

export const BgChrome: React.FC = () => {
  const f = useCurrentFrame();
  const gl = useThree((s) => s.gl);
  const env = useMemo(() => buildEnvironment(gl), [gl]);
  const parts = useMemo(
    () =>
      CHROME.map(({item}) => ({
        geometry: makeGeometry(item.kind.type),
        material: new THREE.MeshStandardMaterial({
          color: new THREE.Color('#F1F2F4'),
          metalness: 1,
          roughness: 0.1,
          envMap: env,
          envMapIntensity: 1.35,
          transparent: true,
        }),
      })),
    [env],
  );
  return (
    <>
      {CHROME.map(({item, index}, k) => {
        const p = gridPose(item, index, f);
        const part = parts[k];
        part.material.opacity = p.opacity;
        return (
          <mesh
            key={item.id}
            geometry={part.geometry}
            material={part.material}
            position={[p.x - WIDTH / 2, HEIGHT / 2 - p.y, 0]}
            rotation={baseRotation(item.kind.type, f, k)}
            scale={p.scale}
            visible={p.opacity > 0.002}
          />
        );
      })}
    </>
  );
};
