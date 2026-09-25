import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Background} from './Background';
import {Corners} from './Corners';
import {MotionBlur} from './MotionBlur';
import {Typography} from './Typography';

// Motion-blur windows: [start, end, samples]. Outside them a single crisp render.
const WINDOWS: [number, number, number][] = [
  [57, 93, 16],
  [127, 166, 12],
  [195, 230, 12],
];
const samplesAt = (t: number) => WINDOWS.find(([a, b]) => t >= a && t <= b)?.[2] ?? 1;

export const Manifesto: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <AbsoluteFill style={{backgroundColor: '#070605'}}>
      <Background t={t} />
      <MotionBlur t={t} samples={samplesAt(t)} shutter={0.6} active={samplesAt(t) > 1} render={(tt) => <Typography t={tt} />} />
      <Corners t={t} />
    </AbsoluteFill>
  );
};
