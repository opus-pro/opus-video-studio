import React from 'react';
import {AbsoluteFill, Easing, useCurrentFrame} from 'remotion';
import {FLASH_END, FLASH_START, clampInterp} from './timeline';

// One flash, strictly inside 0.68s–0.76s: hard attack, exponential-feeling tail.
export const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < FLASH_START || frame > FLASH_END) return null;
  const attack = clampInterp(frame, [FLASH_START, FLASH_START + 0.2], [0, 1]);
  const decay = clampInterp(frame, [42.6, FLASH_END], [1, 0], Easing.out(Easing.quad));
  const opacity = Math.min(attack, decay);
  if (opacity <= 0.001) return null;
  return (
    <AbsoluteFill
      style={{
        opacity,
        background: 'radial-gradient(ellipse 90% 70% at 50% 40%, #ffffff 0%, #fbfcfe 55%, #eef1f5 100%)',
      }}
    />
  );
};
