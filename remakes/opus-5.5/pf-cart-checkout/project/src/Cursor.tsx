import React from 'react';
import {Easing, interpolate} from 'remotion';
import {T, ease, tw} from './timing';

// Standard arrow pointer, tip at (0,0) of the 24-unit viewBox after the translate below.
const ARROW = 'M1.5 1.5 L1.5 19.2 L6.1 14.9 L9.1 21.7 L12.3 20.3 L9.4 13.6 L15.6 13.6 Z';
const SIZE = 64; // rendered px for 24 units
const K = SIZE / 24;

export const CURSOR_TARGET = {x: 1166, y: 836};
const START = {x: 1560, y: 1250};
const CTRL = {x: 1390, y: 930};
const EXIT = {x: 1300, y: 1040};

const bez = (a: number, c: number, b: number, t: number) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * c + t * t * b;

/** Cursor position at (possibly fractional) frame f. */
export const cursorAt = (f: number) => {
  if (f <= T.pressStart) {
    const t = interpolate(f, [T.cursorIn, T.pressStart], [0, 1], {
      easing: Easing.bezier(0.33, 0, 0.12, 1),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    return {x: bez(START.x, CTRL.x, CURSOR_TARGET.x, t), y: bez(START.y, CTRL.y, CURSOR_TARGET.y, t)};
  }
  const t = interpolate(f, [T.pressEnd + 1, T.pressEnd + 26], [0, 1], {
    easing: Easing.bezier(0.55, 0, 0.6, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return {x: CURSOR_TARGET.x + (EXIT.x - CURSOR_TARGET.x) * t, y: CURSOR_TARGET.y + (EXIT.y - CURSOR_TARGET.y) * t};
};

const Arrow: React.FC<{x: number; y: number; scale: number; opacity: number; shadow: boolean}> = ({x, y, scale, opacity, shadow}) => (
  <svg
    width={SIZE}
    height={SIZE}
    viewBox="0 0 24 24"
    style={{
      position: 'absolute',
      left: x - 1.5 * K,
      top: y - 1.5 * K,
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: `${1.5 * K}px ${1.5 * K}px`,
      overflow: 'visible',
      filter: shadow ? 'drop-shadow(0 3px 4px rgba(20,24,18,0.28)) drop-shadow(0 10px 14px rgba(20,24,18,0.14))' : undefined,
    }}
  >
    <path d={ARROW} fill="#111" stroke="#fff" strokeWidth={1.35} strokeLinejoin="round" />
  </svg>
);

export const Cursor: React.FC<{frame: number}> = ({frame}) => {
  const fadeIn = tw(frame, T.cursorIn, T.cursorIn + 8, 0, 1, ease.out);
  const fadeOut = tw(frame, T.pressEnd + 6, T.pressEnd + 22, 1, 0, ease.inOut);
  const opacity = fadeIn * fadeOut;
  if (opacity <= 0.001) return null;

  // press: 1.10s -> 1.35s
  const down = tw(frame, T.pressStart, T.pressStart + 6, 0, 1, ease.out);
  const up = tw(frame, T.pressEnd - 5, T.pressEnd, 0, 1, ease.inOut);
  const scale = 1 - 0.14 * (down - up);

  // Motion blur: trailing sub-frame samples across a 180-degree shutter.
  const p = cursorAt(frame);
  const samples = 6;
  const ghosts = [];
  for (let i = samples; i >= 1; i--) {
    const q = cursorAt(frame - (i / samples) * 0.9);
    const d = Math.hypot(q.x - p.x, q.y - p.y);
    if (d < 0.6) continue;
    ghosts.push(<Arrow key={i} x={q.x} y={q.y} scale={scale} opacity={opacity * 0.2} shadow={false} />);
  }
  return (
    <>
      {ghosts}
      <Arrow x={p.x} y={p.y} scale={scale} opacity={opacity} shadow />
    </>
  );
};
