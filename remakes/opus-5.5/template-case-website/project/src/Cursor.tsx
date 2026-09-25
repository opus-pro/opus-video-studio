import React from 'react';
import {cursorPos} from './timeline';

const ARROW = 'M1 1 L1 18.2 L5.3 14.3 L8.2 21 L11.3 19.7 L8.5 13.2 L14.4 13.2 Z';

const Arrow: React.FC<{opacity: number}> = ({opacity}) => (
  <svg width="18.4" height="26.45" viewBox="0 0 16 23" style={{position: 'absolute', left: -1.15, top: -1.15, opacity, overflow: 'visible'}}>
    <path d={ARROW} fill="#FFFFFF" stroke="#0B0C0E" strokeWidth="1.25" strokeLinejoin="round" />
  </svg>
);

/**
 * Cursor with a sampled motion-blur trail (180deg shutter) and a press squash.
 */
export const Cursor: React.FC<{frame: number; press: number; opacity: number}> = ({frame, press, opacity}) => {
  if (opacity <= 0.001) return null;
  const p = cursorPos(frame);
  const prev = cursorPos(frame - 0.5);
  const speed = Math.hypot(p.x - prev.x, p.y - prev.y) * 2; // px / frame
  const samples = speed > 1.5 ? 9 : 0;
  const trail = Math.min(1, (speed - 1.5) / 10);
  const scale = 1 - 0.16 * press;
  const ghosts = [];
  for (let k = samples; k >= 1; k--) {
    const q = cursorPos(frame - (k / samples) * 0.6);
    ghosts.push(
      <div key={k} style={{position: 'absolute', left: q.x, top: q.y, transform: `scale(${scale})`, transformOrigin: '0 0'}}>
        <Arrow opacity={trail * 0.34 * (1 - k / (samples + 1))} />
      </div>,
    );
  }
  return (
    <div style={{position: 'absolute', inset: 0, opacity, pointerEvents: 'none'}}>
      {ghosts}
      <div
        style={{
          position: 'absolute',
          left: p.x,
          top: p.y,
          transform: `scale(${scale})`,
          transformOrigin: '0 0',
          filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.35)) drop-shadow(0 1px 1px rgba(0,0,0,0.3))',
        }}
      >
        <Arrow opacity={1} />
      </div>
    </div>
  );
};

export const Ripple: React.FC<{x: number; y: number; t: number; color: string}> = ({x, y, t, color}) => {
  if (t <= 0 || t >= 1) return null;
  const r = 5 + 30 * (1 - Math.pow(1 - t, 3));
  const o = (1 - t) * 0.9;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: x - r,
          top: y - r,
          width: r * 2,
          height: r * 2,
          borderRadius: 999,
          boxShadow: `inset 0 0 0 ${2 * (1 - t) + 0.6}px ${color}`,
          opacity: o,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: x - r * 0.55,
          top: y - r * 0.55,
          width: r * 1.1,
          height: r * 1.1,
          borderRadius: 999,
          background: color,
          opacity: o * 0.25,
        }}
      />
    </>
  );
};
