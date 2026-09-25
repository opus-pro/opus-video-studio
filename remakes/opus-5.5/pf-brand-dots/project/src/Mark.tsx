import React from 'react';

// FIELD mark: a quarter-field (quarter disc, right angle bottom-left) and a point (top-right).
// Drawn in a 100x100 box. Rotating 90deg reads clearly: the field swings, the point travels.
export const FIELD_R = 84;
export const POINT = {cx: 86, cy: 14, r: 14};

// Quarter disc as a pie wedge swept clockwise from the vertical edge; sweep in [0, 1].
export const fieldPath = (sweep = 1) => {
  const s = Math.max(0.0001, Math.min(1, sweep));
  const th = (s * Math.PI) / 2;
  const x = FIELD_R * Math.sin(th);
  const y = 100 - FIELD_R * Math.cos(th);
  return `M0 100 L0 ${100 - FIELD_R} A${FIELD_R} ${FIELD_R} 0 0 1 ${x.toFixed(3)} ${y.toFixed(3)} Z`;
};

export const MarkShapes: React.FC<{
  field: string;
  point: string;
  sweep?: number;
  pointScale?: number;
}> = ({field, point, sweep = 1, pointScale = 1}) => (
  <>
    <path d={fieldPath(sweep)} fill={field} />
    {pointScale > 0.001 ? <circle cx={POINT.cx} cy={POINT.cy} r={POINT.r * pointScale} fill={point} /> : null}
  </>
);
