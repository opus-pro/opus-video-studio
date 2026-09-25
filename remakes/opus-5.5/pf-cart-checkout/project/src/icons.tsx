import React from 'react';

/** Line cart glyph on a 48-unit grid. */
export const CartIcon: React.FC<{size: number; color: string; stroke?: number}> = ({size, color, stroke = 4}) => (
  <svg width={size} height={size} viewBox="0 0 48 48" style={{display: 'block', overflow: 'visible'}}>
    <path
      d="M4.5 7.5h5.2c.9 0 1.7.6 1.9 1.5l4.6 19.6c.2.9 1 1.5 1.9 1.5h18.1c.9 0 1.7-.6 1.9-1.4L42.6 15H12.9"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx={19.5} cy={39} r={3.5} fill={color} />
    <circle cx={35} cy={39} r={3.5} fill={color} />
  </svg>
);

/** Check drawn on with stroke-dash; `draw` in 0..1. */
export const CheckIcon: React.FC<{size: number; color: string; draw: number}> = ({size, color, draw}) => {
  const len = 60;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{display: 'block', overflow: 'visible', opacity: Math.min(1, draw * 5)}}>
      <path
        d="M31 51.5 L44.5 65 L70 37.5"
        fill="none"
        stroke={color}
        strokeWidth={7.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - draw)}
      />
    </svg>
  );
};
