import React, {useEffect, useState} from 'react';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {Headline} from './Headline';
import {SwirlScene} from './SwirlScene';
import {CAMERA_FAR, CAMERA_FOV, CAMERA_NEAR, CAMERA_Z, HEIGHT, TEXTURES, TextureName, WIDTH} from './spiral';
import {leadProtectWidth} from './swap';
import {Capsule, FONT_FAMILY, measureText, protectionCapsules, TextMetrics} from './typography';

type Assets = {textures: Record<TextureName, THREE.Texture>; metrics: TextMetrics};

const useAssets = (): Assets | null => {
  const [handle] = useState(() => delayRender('Loading font and card textures'));
  const [assets, setAssets] = useState<Assets | null>(null);
  useEffect(() => {
    let cancelled = false;
    const font = new FontFace(FONT_FAMILY, `url(${staticFile('assets/GeistVF.woff2')}) format('woff2')`, {
      weight: '100 900',
      style: 'normal',
    });
    const loader = new THREE.TextureLoader();
    Promise.all([
      font.load().then((f) => {
        (document.fonts as unknown as {add: (f: FontFace) => void}).add(f);
        return document.fonts.ready;
      }),
      Promise.all(
        TEXTURES.map((name) =>
          loader.loadAsync(staticFile(`assets/${name}.jpg`)).then((t) => {
            t.colorSpace = THREE.SRGBColorSpace;
            t.generateMipmaps = true;
            t.minFilter = THREE.LinearMipmapLinearFilter;
            t.magFilter = THREE.LinearFilter;
            t.wrapS = THREE.ClampToEdgeWrapping;
            t.wrapT = THREE.ClampToEdgeWrapping;
            return [name, t] as const;
          }),
        ),
      ),
    ])
      .then(([, entries]) => {
        if (cancelled) return;
        setAssets({textures: Object.fromEntries(entries) as Record<TextureName, THREE.Texture>, metrics: measureText()});
        continueRender(handle);
      })
      .catch((err) => {
        console.error(err);
      });
    return () => {
      cancelled = true;
    };
  }, [handle]);
  return assets;
};

export const DepthSwirl: React.FC<{audit?: boolean}> = ({audit}) => {
  const frame = useCurrentFrame();
  const assets = useAssets();
  if (!assets) return <AbsoluteFill style={{backgroundColor: '#07090d'}} />;
  const capsules = protectionCapsules(
    assets.metrics,
    leadProtectWidth(frame, assets.metrics.leadOld, assets.metrics.leadNew),
  );
  return (
    <AbsoluteFill style={{backgroundColor: '#07090d'}}>
      {audit ? <LayoutProbe frame={frame} metrics={assets.metrics} capsules={capsules} /> : null}
      <ThreeCanvas
        width={WIDTH}
        height={HEIGHT}
        camera={{position: [0, 0, CAMERA_Z], fov: CAMERA_FOV, near: CAMERA_NEAR, far: CAMERA_FAR}}
        gl={{antialias: false, alpha: false, powerPreference: 'high-performance'}}
        dpr={1}
        flat
      >
        <SwirlScene textures={assets.textures} capsules={capsules} />
      </ThreeCanvas>
      <Headline metrics={assets.metrics} audit={audit} />
    </AbsoluteFill>
  );
};

// Audit mode only: report the exact text metrics and protection capsules the shader used.
const LayoutProbe: React.FC<{frame: number; metrics: TextMetrics; capsules: Capsule[]}> = ({frame, metrics, capsules}) => {
  React.useLayoutEffect(() => {
    console.log(`AUDIT_LAYOUT ${frame} ${JSON.stringify({metrics, capsules})}`);
  }, [frame, metrics, capsules]);
  return null;
};
