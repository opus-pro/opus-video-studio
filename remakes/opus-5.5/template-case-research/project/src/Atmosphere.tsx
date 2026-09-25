import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {camX, img} from './layout';
import {bump, ESM, interp} from './lib';

// Evidence room plate: defocused behind the query, racked into focus for the proof,
// then softened again for the brand ending.
export const Background: React.FC = () => {
  const f = useCurrentFrame();
  const keys = [0, 120, 158, 188, 224];
  const blur = interp(f, keys, [26, 24, 2.2, 2.6, 22], ESM);
  const bright = interp(f, keys, [0.56, 0.58, 0.82, 0.8, 0.36], ESM);
  const scale = interp(f, [0, 120, 158, 252], [1.2, 1.175, 1.1, 1.14], ESM);
  const halo = interp(f, keys, [0.12, 0.12, 0.26, 0.26, 0.1]);
  const dx = camX(f) * 0.32;
  const base: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 960,
    height: 540,
    objectFit: 'cover',
    transform: `translateX(${dx.toFixed(2)}px) scale(${scale.toFixed(4)})`,
  };
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Img
        src={staticFile(img('evidence-room'))}
        style={{...base, filter: `blur(${blur.toFixed(2)}px) brightness(${bright.toFixed(3)}) saturate(1.08)`}}
      />
      {/* halation: lifted highlights bloom through the lens */}
      <Img
        src={staticFile(img('evidence-room'))}
        style={{
          ...base,
          filter: `blur(${(blur + 22).toFixed(1)}px) brightness(1.5) saturate(1.3)`,
          mixBlendMode: 'screen',
          opacity: halo,
        }}
      />
    </AbsoluteFill>
  );
};

// Soft warm pools of light behind the focal element + a slow drifting light shaft.
export const WarmLight: React.FC = () => {
  const f = useCurrentFrame();
  const cardGlow = interp(f, [0, 20, 120, 150], [0.4, 1, 1, 0]);
  const brandGlow = interp(f, [194, 232], [0, 1], ESM);
  const beamX = interp(f, [0, 252], [-260, 220]);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 46% 52% at 50% 52%, rgba(255,160,80,0.26), rgba(255,140,60,0) 70%)',
          opacity: cardGlow,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 36% 44% at 50% 47%, rgba(255,170,90,0.30), rgba(255,140,60,0.06) 55%, rgba(255,140,60,0) 80%)',
          opacity: brandGlow,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -200 + beamX,
          top: -120,
          width: 1400,
          height: 780,
          background:
            'linear-gradient(112deg, rgba(255,190,120,0) 40%, rgba(255,196,130,0.07) 46%, rgba(255,214,160,0.13) 50%, rgba(255,196,130,0.07) 54%, rgba(255,190,120,0) 60%)',
          mixBlendMode: 'screen',
          filter: 'blur(14px)',
        }}
      />
    </AbsoluteFill>
  );
};

const Leak: React.FC<{f: number; a: number; b: number; x0: number; x1: number; y: number; peak: number}> = ({
  f,
  a,
  b,
  x0,
  x1,
  y,
  peak,
}) => {
  if (f < a || f > b) return null;
  const t = (f - a) / (b - a);
  const o = bump(f, a, b) * peak;
  const x = x0 + (x1 - x0) * t;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 420,
        top: y - 320,
        width: 840,
        height: 640,
        background:
          'radial-gradient(closest-side, rgba(255,214,150,0.9), rgba(255,150,60,0.55) 35%, rgba(230,90,30,0.18) 65%, rgba(200,60,20,0) 100%)',
        mixBlendMode: 'screen',
        opacity: o,
      }}
    />
  );
};

export const LightLeaks: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
      <Leak f={f} a={116} b={168} x0={1120} x1={560} y={90} peak={0.34} />
      <Leak f={f} a={184} b={232} x0={-140} x1={420} y={500} peak={0.26} />
    </AbsoluteFill>
  );
};

// Lens softness: edges of frame fall off slightly out of focus.
export const LensSoftness: React.FC = () => (
  <AbsoluteFill
    style={{
      backdropFilter: 'blur(2.2px)',
      WebkitBackdropFilter: 'blur(2.2px)',
      maskImage: 'radial-gradient(ellipse 72% 70% at 50% 50%, transparent 62%, black 100%)',
      WebkitMaskImage: 'radial-gradient(ellipse 72% 70% at 50% 50%, transparent 62%, black 100%)',
      pointerEvents: 'none',
    }}
  />
);

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background: 'radial-gradient(ellipse 78% 74% at 50% 48%, rgba(10,5,2,0) 52%, rgba(10,5,2,0.62) 100%)',
      pointerEvents: 'none',
    }}
  />
);

export const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <svg
      width={960}
      height={540}
      style={{position: 'absolute', inset: 0, mixBlendMode: 'overlay', opacity: 0.11, pointerEvents: 'none'}}
    >
      <filter id="grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 97} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
};

export const Fade: React.FC = () => {
  const f = useCurrentFrame();
  const o = interp(f, [0, 14], [0.4, 0]);
  if (o <= 0) return null;
  return <AbsoluteFill style={{background: '#0a0503', opacity: o, pointerEvents: 'none'}} />;
};
