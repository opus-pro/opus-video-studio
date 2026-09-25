import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clampInterp, ease} from './timeline';

// "See in a different light": one soft, wide band of light drifts across the hold once.
export const LightSweep: React.FC<{from: number; to: number}> = ({from, to}) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to) return null;
  const p = clampInterp(frame, [from, to], [0, 1], ease.inOut);
  const fade = clampInterp(frame, [from, from + 14, to - 14, to], [0, 1, 1, 0]);
  const x = -60 + p * 220; // % travel of the band centre
  return (
    <AbsoluteFill
      style={{
        mixBlendMode: 'soft-light',
        opacity: 0.55 * fade,
        background: `linear-gradient(115deg, rgba(255,255,255,0) ${x - 22}%, rgba(255,255,255,0.55) ${x}%, rgba(255,255,255,0) ${x + 22}%)`,
      }}
    />
  );
};
