import {ThreeCanvas} from '@remotion/three';
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, cancelRender, continueRender, delayRender, staticFile} from 'remotion';
import {CARDS, FONT_FAMILY} from './cards';
import {CAMERA, HEIGHT, WIDTH} from './motion';
import {Overlay} from './Overlay';
import {drawPoster} from './posters';
import {Scene} from './Scene';

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });

let fontPromise: Promise<void> | null = null;
const loadGeist = () => {
  if (!fontPromise) {
    const face = new FontFace(FONT_FAMILY, `url(${staticFile('assets/GeistVF.woff2')}) format('woff2')`, {
      weight: '100 900',
      style: 'normal',
    });
    fontPromise = face.load().then((loaded) => {
      (document.fonts as unknown as {add: (f: FontFace) => void}).add(loaded);
    });
  }
  return fontPromise;
};

export const Relay: React.FC = () => {
  const [handle] = useState(() => delayRender('Loading Geist + poster plates'));
  const [canvases, setCanvases] = useState<HTMLCanvasElement[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadGeist(), ...CARDS.map((c) => loadImage(staticFile(`assets/${c.file}`)))])
      .then(async ([, ...images]) => {
        // Make sure every weight used on the plates is resolved before painting them.
        await Promise.all(
          [500, 540, 600, 620, 640].map((w) => document.fonts.load(`${w} 40px ${FONT_FAMILY}`)),
        );
        if (cancelled) return;
        setCanvases(CARDS.map((card, i) => drawPoster(card, i, images[i] as HTMLImageElement)));
        continueRender(handle);
      })
      .catch((err) => cancelRender(err));
    return () => {
      cancelled = true;
    };
  }, [handle]);

  return (
    <AbsoluteFill style={{backgroundColor: '#08080A'}}>
      {canvases ? (
        <>
          <ThreeCanvas
            width={WIDTH}
            height={HEIGHT}
            dpr={1}
            flat
            gl={{antialias: false, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance'}}
            camera={{position: CAMERA.position, fov: CAMERA.fov, near: CAMERA.near, far: CAMERA.far}}
          >
            <Scene canvases={canvases} />
          </ThreeCanvas>
          <Overlay />
        </>
      ) : null}
    </AbsoluteFill>
  );
};
