import React from 'react';
import {AbsoluteFill} from 'remotion';

/**
 * Real sub-frame motion blur: renders the scene at several shutter-offset times and
 * accumulates them additively inside an isolated group (exact average of premultiplied
 * samples), so resting frames are identical to a single render.
 */
export const MotionBlur: React.FC<{
  t: number;
  samples: number;
  shutter: number;
  active: boolean;
  render: (t: number) => React.ReactNode;
}> = ({t, samples, shutter, active, render}) => {
  if (!active || samples < 2) return <AbsoluteFill>{render(t)}</AbsoluteFill>;
  return (
    <AbsoluteFill style={{isolation: 'isolate'}}>
      {Array.from({length: samples}, (_, i) => {
        const tt = t - shutter * (i / (samples - 1) - 0.5);
        return (
          <AbsoluteFill key={i} style={{mixBlendMode: 'plus-lighter', opacity: 1 / samples}}>
            {render(tt)}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
