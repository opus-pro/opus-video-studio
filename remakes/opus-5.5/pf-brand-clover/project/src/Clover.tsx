import React from 'react';
import {MARK_SIZE, PETAL_L, PETAL_T} from './system';

const D = ((MARK_SIZE / 2 - PETAL_T / 2) * Math.SQRT2 + 109) / 2 / Math.SQRT2;
const DIRS: [number, number, number][] = [
  [-1, -1, 45],
  [1, -1, -45],
  [1, 1, 45],
  [-1, 1, -45],
];

// Static/vector version of the four-capsule mark (NW, NE, SE, SW petal order).
export const Clover: React.FC<{
  size: number;
  colors: [string, string, string, string];
  rotation?: number;
  petalScale?: [number, number, number, number];
  spread?: [number, number, number, number];
  style?: React.CSSProperties;
}> = ({size, colors, rotation = 0, petalScale = [1, 1, 1, 1], spread = [1, 1, 1, 1], style}) => (
  <svg
    width={size}
    height={size}
    viewBox={`0 0 ${MARK_SIZE} ${MARK_SIZE}`}
    style={{display: 'block', overflow: 'visible', ...style}}
  >
    <g transform={`rotate(${rotation} ${MARK_SIZE / 2} ${MARK_SIZE / 2})`}>
      {DIRS.map(([dx, dy, a], i) => {
        const cx = MARK_SIZE / 2 + dx * D * spread[i];
        const cy = MARK_SIZE / 2 + dy * D * spread[i];
        const s = petalScale[i];
        if (s <= 0.001) return null;
        return (
          <rect
            key={i}
            x={cx - PETAL_L / 2}
            y={cy - PETAL_T / 2}
            width={PETAL_L}
            height={PETAL_T}
            rx={PETAL_T / 2}
            fill={colors[i]}
            transform={`rotate(${a} ${cx} ${cy}) translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`}
          />
        );
      })}
    </g>
  </svg>
);
