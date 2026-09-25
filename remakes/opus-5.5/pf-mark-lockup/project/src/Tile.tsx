import React from 'react';
import {mix, TILE, TileState} from './timing';

// Continuous-corner app tile: straight sides joined by quarter-superellipse corners.
// A superellipse arc (n > 2) has zero curvature where it meets the straight edge, so
// the outline is curvature-continuous like an app icon rather than a bulgy full superellipse.
const squirclePath = (size: number, corner = 0.305 * size, n = 4.2, steps = 90) => {
  const pts: string[] = [];
  const corners: [number, number, number][] = [
    [size - corner, corner, -90], // top-right
    [size - corner, size - corner, 0], // bottom-right
    [corner, size - corner, 90], // bottom-left
    [corner, corner, 180], // top-left
  ];
  for (const [cx, cy, start] of corners) {
    for (let i = 0; i <= steps; i++) {
      const th = ((start + (90 * i) / steps) * Math.PI) / 180;
      const c = Math.cos(th);
      const s = Math.sin(th);
      const x = cx + corner * Math.sign(c) * Math.abs(c) ** (2 / n);
      const y = cy + corner * Math.sign(s) * Math.abs(s) ** (2 / n);
      pts.push(`${x.toFixed(3)} ${y.toFixed(3)}`);
    }
  }
  return `M${pts.join('L')}Z`;
};

export const SQUIRCLE = squirclePath(TILE);

// Mark geometry, in tile units (384 box, centre 192,192).
const C = TILE / 2;
const PETAL_W = 80;
const PETAL_R0 = 27; // inner end: (w + gap) / sqrt(2) - w / 2 keeps a ~14px gap between neighbours
const PETAL_R1 = 150; // outer end
const PETAL_ANGLES = [-45, 45, 135, 225]; // top-right first, then clockwise

export const CORAL = '#FF6A55';

const Petal: React.FC<{angle: number; p: number; fill: string}> = ({angle, p, fill}) => {
  // Each petal unfurls: swings in from -20deg, slides out from the hub and grows along its axis.
  const a = angle + mix(-20, 0, p);
  const len = PETAL_R1 - PETAL_R0;
  const grow = mix(0.35, 1, p);
  const inset = mix(-22, 0, p);
  const cx = PETAL_R0 + len / 2 + inset;
  const opacity = Math.min(1, p * 2.4);
  if (opacity <= 0) return null;
  return (
    <g transform={`rotate(${a} ${C} ${C})`} opacity={opacity}>
      <g transform={`translate(${C + cx} ${C}) scale(${grow} ${mix(0.6, 1, p)})`}>
        <rect x={-len / 2} y={-PETAL_W / 2} width={len} height={PETAL_W} rx={PETAL_W / 2} fill={fill} />
      </g>
    </g>
  );
};

/**
 * One rendered sample of the tile, drawn into a full-frame SVG.
 * `uid` keeps filter / gradient ids unique when several samples are stacked for motion blur.
 */
export const TileFrame: React.FC<{
  state: TileState;
  /** Extra directional blur (screen px, Gaussian sigma) from motion across the shutter. */
  motion: {x: number; y: number};
  uid: string;
  width: number;
  height: number;
}> = ({state, motion, uid, width, height}) => {
  const {cx, cy, scale, rot, blur, petals} = state;
  const k = scale; // screen px per tile unit
  const place = `translate(${cx} ${cy}) rotate(${rot}) scale(${k}) translate(${-C} ${-C})`;
  // Shadow is offset straight down in screen space (key light from above), not along the tile's own axis.
  const shadowPlace = (dy: number) => `translate(${cx} ${cy + dy * k}) rotate(${rot}) scale(${k}) translate(${-C} ${-C})`;
  const id = (name: string) => `${name}-${uid}`;
  // Spec blur (isotropic) and motion blur (directional) combine as independent Gaussians.
  const sx = Math.sqrt(blur * blur + motion.x * motion.x);
  const sy = Math.sqrt(blur * blur + motion.y * motion.y);
  const blurred = sx > 0.03 || sy > 0.03;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <defs>
        <linearGradient id={id('tileFill')} x1="0" y1="0" x2="0" y2={TILE} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F9FBFD" />
          <stop offset="0.55" stopColor="#EEF2F6" />
          <stop offset="1" stopColor="#E1E7EE" />
        </linearGradient>
        <linearGradient id={id('rim')} x1="0" y1="0" x2="0" y2={TILE} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="0.35" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="0.75" stopColor="#8A97A6" stopOpacity="0" />
          <stop offset="1" stopColor="#8A97A6" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id={id('coral')} x1="0" y1="54" x2="0" y2="330" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FF8367" />
          <stop offset="0.5" stopColor={CORAL} />
          <stop offset="1" stopColor="#F04E3E" />
        </linearGradient>
        <mask id={id('petals')} maskUnits="userSpaceOnUse" x={0} y={0} width={TILE} height={TILE}>
          {PETAL_ANGLES.map((angle, i) => (
            <Petal key={angle} angle={angle} p={petals[i].p} fill="#FFFFFF" />
          ))}
        </mask>
        <clipPath id={id('tileClip')}>
          <path d={SQUIRCLE} />
        </clipPath>
        <filter id={id('shadowFar')} filterUnits="userSpaceOnUse" x={-300} y={-300} width={984} height={984}>
          <feGaussianBlur stdDeviation={46} />
        </filter>
        <filter id={id('shadowNear')} filterUnits="userSpaceOnUse" x={-100} y={-100} width={584} height={584}>
          <feGaussianBlur stdDeviation={9} />
        </filter>
        <filter id={id('petalShadow')} filterUnits="userSpaceOnUse" x={0} y={0} width={TILE} height={TILE}>
          <feDropShadow dx="0" dy="5" stdDeviation="7" floodColor="#C2412E" floodOpacity="0.22" />
        </filter>
        {blurred ? (
          <filter id={id('introBlur')} filterUnits="userSpaceOnUse" x={0} y={0} width={width} height={height}>
            <feGaussianBlur stdDeviation={`${sx.toFixed(3)} ${sy.toFixed(3)}`} />
          </filter>
        ) : null}
      </defs>
      <g filter={blurred ? `url(#${id('introBlur')})` : undefined}>
        {/* Depth: a wide ambient shadow and a tight contact shadow. */}
        <g transform={shadowPlace(34)} filter={`url(#${id('shadowFar')})`}>
          <path d={SQUIRCLE} fill="#000" opacity={0.62} />
        </g>
        <g transform={shadowPlace(8)} filter={`url(#${id('shadowNear')})`}>
          <path d={SQUIRCLE} fill="#000" opacity={0.42} />
        </g>
        <g transform={place}>
          <path d={SQUIRCLE} fill={`url(#${id('tileFill')})`} />
          <g clipPath={`url(#${id('tileClip')})`}>
            <path d={SQUIRCLE} fill="none" stroke={`url(#${id('rim')})`} strokeWidth={4} />
          </g>
          {/* Petals mask one tile-space gradient so the mark reads as a single lit object. */}
          <g filter={`url(#${id('petalShadow')})`}>
            <rect x={0} y={0} width={TILE} height={TILE} fill={`url(#${id('coral')})`} mask={`url(#${id('petals')})`} />
          </g>
        </g>
      </g>
    </svg>
  );
};
