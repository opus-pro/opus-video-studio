import React from 'react';
import {C, clamp01, outBack, seg} from './lib';

// FIELD radial mark: solid core, 12 alternating rays, an outer ring of dots that blooms in.
export const RadialMark: React.FC<{
  size: number;
  t: number;
  color?: string;
  ringFrom?: number; // frame the outer dot ring starts blooming (Infinity = hidden)
  breathe?: number; // 0..1 amount of idle ray breathing
}> = ({size, t, color = C.cream, ringFrom = Infinity, breathe = 0}) => {
  const rot = t * 0.11;
  const rays = [];
  for (let k = 0; k < 12; k++) {
    const long = k % 2 === 0;
    const wave = Math.sin(t * 0.045 - k * (Math.PI / 3)) * 2.6 * breathe;
    const r0 = 43;
    const r1 = (long ? 87 : 71) + wave;
    const a = (k / 12) * Math.PI * 2 - Math.PI / 2;
    rays.push(
      <line
        key={k}
        x1={Math.cos(a) * r0}
        y1={Math.sin(a) * r0}
        x2={Math.cos(a) * r1}
        y2={Math.sin(a) * r1}
        stroke={color}
        strokeWidth={10.5}
        strokeLinecap="round"
      />,
    );
  }
  const dots = [];
  if (Number.isFinite(ringFrom)) {
    for (let k = 0; k < 36; k++) {
      const p = seg(t, ringFrom + k * 1.15, ringFrom + k * 1.15 + 16);
      if (p <= 0) continue;
      const a = (k / 36) * Math.PI * 2 - Math.PI / 2 - t * 0.0035;
      const r = 97;
      dots.push(
        <circle
          key={k}
          cx={Math.cos(a) * r}
          cy={Math.sin(a) * r}
          r={2.3 * Math.max(0, outBack(p, 2))}
          fill={color}
          opacity={clamp01(p * 2) * 0.85}
        />,
      );
    }
  }
  return (
    <svg width={size} height={size} viewBox="-100 -100 200 200" style={{display: 'block', overflow: 'visible'}}>
      <g transform={`rotate(${rot})`}>{rays}</g>
      <circle r={24} fill={color} />
      {dots}
    </svg>
  );
};
