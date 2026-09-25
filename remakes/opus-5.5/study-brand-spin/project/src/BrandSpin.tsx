import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

export type BrandSpinProps = {
  brand: string;
  background: string;
  ink: string;
  accent: string;
  symbol: {
    construction: 'four-capsule-union';
    diameter: number;
    capsuleWidth: number;
  };
  showWordmark: boolean;
};

export const brandSpinDefaults: BrandSpinProps = {
  brand: 'forma',
  background: '#f7f8fa',
  ink: '#151619',
  accent: '#3455db',
  symbol: {construction: 'four-capsule-union', diameter: 130, capsuleWidth: 30},
  showWordmark: false,
};

// Timing (frames). E is a decisive ease-out: fast release from the seed, long soft landing.
const E = Easing.bezier(0.33, 0.55, 0.25, 1);
const SCALE_END = 20;
const ROTATE_END = 24;
const BLUR_END = 15;
const SCALE_FROM = 0.12;
const ROTATE_FROM = -180;
const BLUR_FROM = 7;

// Trailing sub-frame shutter for rotational/zoom motion blur (fraction of a frame). Trailing keeps
// the true pose as the leading sample, so f0 is exactly the spec'd seed state.
const SHUTTER = 0.75;
const SAMPLES: number = 16;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const scaleAt = (f: number) => interpolate(f, [0, SCALE_END], [SCALE_FROM, 1], {...clamp, easing: E});
const rotationAt = (f: number) => interpolate(f, [0, ROTATE_END], [ROTATE_FROM, 0], {...clamp, easing: E});
const blurAt = (f: number) =>
  interpolate(f, [0, BLUR_END], [BLUR_FROM, 0], {...clamp, easing: Easing.out(Easing.quad)});

// Four identical capsules (x=0, y=(d-w)/2, d x w, r=w/2) at 0/45/90/135 degrees about the center.
const Symbol: React.FC<{diameter: number; capsuleWidth: number; fill: string}> = ({diameter, capsuleWidth, fill}) => {
  const c = diameter / 2;
  const r = capsuleWidth / 2;
  return (
    <>
      {[0, 45, 90, 135].map((angle) => (
        <rect
          key={angle}
          x={0}
          y={c - r}
          width={diameter}
          height={capsuleWidth}
          rx={r}
          ry={r}
          fill={fill}
          transform={angle === 0 ? undefined : `rotate(${angle} ${c} ${c})`}
        />
      ))}
    </>
  );
};

export const BrandSpin: React.FC<BrandSpinProps> = (props) => {
  const {background, ink, symbol, showWordmark, brand} = {...brandSpinDefaults, ...props};
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const cx = width / 2;
  const cy = height / 2;
  const d = symbol.diameter;
  const size = d; // final on-screen size: the union is authored at its own diameter, so scale 1 == spec size

  // Motion-blur samples: only while the mark is still moving; the hold renders a single exact copy.
  const moving = frame < ROTATE_END;
  const times = moving
    ? Array.from({length: SAMPLES}, (_, i) =>
        Math.max(0, frame - (SAMPLES === 1 ? 0 : (i / (SAMPLES - 1)) * SHUTTER)),
      )
    : [frame];

  const blur = blurAt(frame);

  const wordmarkOpacity = interpolate(frame, [22, 34], [0, 1], {...clamp, easing: E});

  return (
    <AbsoluteFill style={{backgroundColor: background}}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{position: 'absolute', inset: 0, filter: blur > 0.01 ? `blur(${blur}px)` : undefined}}
      >
        {times.map((t, i) => (
          <g
            key={i}
            // Running average: sample k composited at 1/k gives every sample equal weight.
            opacity={1 / (i + 1)}
            transform={`translate(${cx} ${cy}) rotate(${rotationAt(t)}) scale(${scaleAt(t)}) translate(${-d / 2} ${-d / 2})`}
          >
            <Symbol diameter={d} capsuleWidth={symbol.capsuleWidth} fill={ink} />
          </g>
        ))}
      </svg>
      {showWordmark ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: cy + size / 2 + 28,
            textAlign: 'center',
            color: ink,
            opacity: wordmarkOpacity,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontWeight: 600,
            fontSize: 30,
            letterSpacing: '-0.01em',
          }}
        >
          {brand}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
