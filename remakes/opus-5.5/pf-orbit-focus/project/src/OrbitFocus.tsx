import {ThreeCanvas} from '@remotion/three';
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {IMAGES, type ImageKey} from './cards';
import {Overlay} from './Overlay';
import {Scene} from './Scene';
import {CAMERA, HEIGHT, WIDTH} from './spatial';

export const FONT_FAMILY = 'GeistOrbit';

const useFont = () => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const handle = delayRender('Loading Geist');
    const face = new FontFace(FONT_FAMILY, `url(${staticFile('assets/GeistVF.woff2')}) format('woff2')`, {
      weight: '100 900',
      style: 'normal',
    });
    face
      .load()
      .then((loaded) => {
        (document.fonts as unknown as {add: (f: FontFace) => void}).add(loaded);
        return document.fonts.ready;
      })
      .then(() => {
        setReady(true);
        continueRender(handle);
      })
      .catch((err) => {
        console.error(err);
        continueRender(handle);
      });
  }, []);
  return ready;
};

const useTextures = () => {
  const [textures, setTextures] = useState<Record<ImageKey, THREE.Texture> | null>(null);
  useEffect(() => {
    const handle = delayRender('Loading card textures');
    const loader = new THREE.TextureLoader();
    const keys = Object.keys(IMAGES) as ImageKey[];
    Promise.all(keys.map((k) => loader.loadAsync(staticFile(IMAGES[k].file))))
      .then((list) => {
        const out = {} as Record<ImageKey, THREE.Texture>;
        list.forEach((tex, idx) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = 8;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.wrapS = THREE.ClampToEdgeWrapping;
          tex.wrapT = THREE.ClampToEdgeWrapping;
          tex.generateMipmaps = true;
          tex.needsUpdate = true;
          out[keys[idx]] = tex;
        });
        setTextures(out);
        continueRender(handle);
      })
      .catch((err) => {
        console.error(err);
        continueRender(handle);
      });
  }, []);
  return textures;
};

export const OrbitFocus: React.FC<{audit?: boolean}> = ({audit = false}) => {
  const frame = useCurrentFrame();
  const fontReady = useFont();
  const textures = useTextures();

  return (
    <AbsoluteFill style={{backgroundColor: '#050608'}}>
      {textures ? (
        <ThreeCanvas
          width={WIDTH}
          height={HEIGHT}
          dpr={1}
          flat
          linear
          camera={{position: CAMERA.position, fov: CAMERA.fov, near: CAMERA.near, far: CAMERA.far}}
        >
          <Scene frame={frame} textures={textures} />
        </ThreeCanvas>
      ) : null}
      {fontReady ? <Overlay frame={frame} audit={audit} /> : null}
    </AbsoluteFill>
  );
};
