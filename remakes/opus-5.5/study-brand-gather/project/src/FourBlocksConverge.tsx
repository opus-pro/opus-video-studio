import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {symbolPath} from './geometry';
import {T, lerp, progress} from './timing';

export type FourBlocksProps = {
  brand: string;
  background: string;
  ink: string;
  accent: string;
  symbol: {construction: 'four-capsule-union'; diameter: number; capsuleWidth: number};
  showWordmark: boolean;
};

export const defaultFourBlocksProps: FourBlocksProps = {
  brand: 'forma',
  background: '#f8f8f6',
  ink: '#222626',
  accent: '#d85548',
  symbol: {construction: 'four-capsule-union', diameter: 130, capsuleWidth: 30},
  showWordmark: false,
};

// Layout (px, 960x540 frame).
const CENTER = {x: 480, y: 270};
const SQUARE = 30;
const SQUARE_RADIUS = 2;
const STARTS = [
  {x: 180, y: 270}, // left   (300px horizontal travel)
  {x: 780, y: 270}, // right
  {x: 480, y: 60}, // top    (210px vertical travel)
  {x: 480, y: 480}, // bottom
] as const;

// Motion blur: the frame is the exact average of full-scene sub-frame samples taken
// across a trailing shutter window. Each sample is opaque (it carries the paper), so
// stacking sample i at opacity 1/i is a running mean: no additive 8-bit drift, and
// resting pixels keep their exact brand colors.
const SHUTTER = 0.35; // frames (~126 degree shutter keeps the turning corners legible)
const SAMPLES = 16;

type SceneState = {
  markScale: number;
  markBlur: number;
  squares: {x: number; y: number; rotate: number}[];
  squareScale: number;
  squareOpacity: number;
};

const sceneAt = (t: number): SceneState => {
  const k = progress(t, ...T.travel);
  const release = progress(t, ...T.release);
  return {
    // Center mark: scale .12 -> 1 over f0-19, blur 6 -> 0 by f14, opacity 1, no rotation.
    markScale: lerp(0.12, 1, progress(t, ...T.markGrow)),
    markBlur: lerp(6, 0, progress(t, ...T.markBlur)),
    // Straight-line travel: every square moves on its own axis with identical progress,
    // turning 0 -> 90 degrees on that same progress.
    squares: STARTS.map((s) => ({x: lerp(s.x, CENTER.x, k), y: lerp(s.y, CENTER.y, k), rotate: 90 * k})),
    // f28-35: scale 1 -> .72, opacity 1 -> 0.
    squareScale: lerp(1, 0.72, release),
    squareOpacity: 1 - release,
  };
};

const differs = (a: SceneState, b: SceneState) =>
  Math.abs(a.markScale - b.markScale) * 65 > 0.03 ||
  Math.abs(a.markBlur - b.markBlur) > 0.02 ||
  Math.abs(a.squareScale - b.squareScale) * 15 > 0.03 ||
  Math.abs(a.squareOpacity - b.squareOpacity) > 0.002 ||
  a.squares.some((s, i) => Math.abs(s.x - b.squares[i].x) > 0.03 || Math.abs(s.y - b.squares[i].y) > 0.03 || Math.abs(s.rotate - b.squares[i].rotate) > 0.02);

type Look = {background: string; ink: string; accent: string; path: string; diameter: number};

const Scene: React.FC<{s: SceneState; look: Look; uid: string; width: number; height: number}> = ({s, look, uid, width, height}) => {
  const d = look.diameter;
  const blurred = s.markBlur > 0.01;
  const showSquares = s.squareOpacity > 0.0005;
  return (
    <AbsoluteFill style={{backgroundColor: look.background}}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{position: 'absolute', inset: 0}}>
        <defs>
          {blurred ? (
            <filter id={`mark-blur-${uid}`} filterUnits="userSpaceOnUse" x={0} y={0} width={width} height={height}>
              <feGaussianBlur stdDeviation={s.markBlur} />
            </filter>
          ) : null}
          {showSquares ? (
            // Soft contact shadow sells the "above the symbol" layering while the blocks fly.
            <filter id={`sq-shadow-${uid}`} filterUnits="userSpaceOnUse" x={0} y={0} width={width} height={height} colorInterpolationFilters="sRGB">
              <feDropShadow dx={0} dy={2.5} stdDeviation={3} floodColor={look.ink} floodOpacity={0.16} />
            </filter>
          ) : null}
        </defs>

        {/* The ink symbol: one nonzero path, the union of four capsules. */}
        <g filter={blurred ? `url(#mark-blur-${uid})` : undefined}>
          <g transform={`translate(${CENTER.x} ${CENTER.y}) scale(${s.markScale}) translate(${-d / 2} ${-d / 2})`}>
            <path d={look.path} fill={look.ink} fillRule="nonzero" />
          </g>
        </g>

        {/* Coral blocks sit above the symbol and never touch its geometry. */}
        {showSquares ? (
          <g opacity={s.squareOpacity} filter={`url(#sq-shadow-${uid})`}>
            {s.squares.map((q, i) => (
              <g key={i} transform={`translate(${q.x} ${q.y}) rotate(${q.rotate}) scale(${s.squareScale})`}>
                <rect x={-SQUARE / 2} y={-SQUARE / 2} width={SQUARE} height={SQUARE} rx={SQUARE_RADIUS} ry={SQUARE_RADIUS} fill={look.accent} />
              </g>
            ))}
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};

export const FourBlocksConverge: React.FC<FourBlocksProps> = (props) => {
  const {background, ink, accent, symbol, showWordmark, brand} = {...defaultFourBlocksProps, ...props};
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  const path = useMemo(() => symbolPath(symbol.diameter, symbol.capsuleWidth), [symbol.diameter, symbol.capsuleWidth]);
  const look: Look = {background, ink, accent, path, diameter: symbol.diameter};

  const samples = useMemo(() => {
    const trail = Array.from({length: SAMPLES}, (_, i) => sceneAt(Math.max(0, frame - (SHUTTER * i) / (SAMPLES - 1))));
    return differs(trail[0], trail[SAMPLES - 1]) ? trail : [trail[0]];
  }, [frame]);

  const wordmarkIn = progress(frame, 36, 50);

  return (
    <AbsoluteFill style={{backgroundColor: background}}>
      {samples.map((s, i) => (
        <AbsoluteFill key={i} style={i === 0 ? undefined : {opacity: 1 / (i + 1)}}>
          <Scene s={s} look={look} uid={String(i)} width={width} height={height} />
        </AbsoluteFill>
      ))}

      {showWordmark ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: CENTER.y + symbol.diameter / 2 + 34,
            textAlign: 'center',
            fontFamily: '-apple-system, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontWeight: 600,
            fontSize: 30,
            letterSpacing: '-0.01em',
            color: ink,
            opacity: wordmarkIn,
            transform: `translateY(${lerp(8, 0, wordmarkIn)}px)`,
          }}
        >
          {brand}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
