import React, {useEffect, useState} from 'react';
import {AbsoluteFill, cancelRender, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {Scene} from './Scene';

// Sub-frame samples for a 180° shutter. Only the fast-moving windows (cursor travel,
// tile flight + panel unfold) pay for extra samples; resting frames render once, sharp.
const samplesFor = (f: number) => {
  if (f >= 44 && f <= 97) return 10;
  if (f >= 1 && f <= 30) return 6;
  return 1;
};
const SHUTTER = 0.5;

const useGeist = () => {
  const [handle] = useState(() => delayRender('Loading Geist'));
  useEffect(() => {
    const face = new FontFace('Geist', `url(${staticFile('assets/GeistVF.woff2')}) format('woff2')`, {
      weight: '100 900',
      style: 'normal',
    });
    face
      .load()
      .then(() => {
        document.fonts.add(face);
        return document.fonts.ready;
      })
      .then(() => continueRender(handle))
      .catch((err) => cancelRender(err));
  }, [handle]);
};

export const Main: React.FC = () => {
  useGeist();
  const frame = useCurrentFrame();
  const n = samplesFor(frame);
  if (n === 1) return <Scene t={frame} />;
  const layers = [];
  for (let k = 0; k < n; k++) {
    const tt = frame - SHUTTER / 2 + (SHUTTER * k) / (n - 1);
    layers.push(
      <AbsoluteFill key={k} style={{opacity: 1 / (k + 1)}}>
        <Scene t={tt} />
      </AbsoluteFill>,
    );
  }
  return <AbsoluteFill style={{backgroundColor: '#090B0A'}}>{layers}</AbsoluteFill>;
};
