import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {capsulesFor, Capsules, SymbolSpec, unionDistance} from './geometry';

export type LogoBloomProps = {
  brand: string;
  background: string;
  ink: string;
  accent: string;
  symbol: SymbolSpec;
  showWordmark: boolean;
};

export const defaultLogoBloomProps: LogoBloomProps = {
  brand: 'forma',
  background: '#faf8fa',
  ink: '#28232c',
  accent: '#ad3870', // editable, intentionally not drawn in this variant
  symbol: {construction: 'four-capsule-union', diameter: 130, capsuleWidth: 30},
  showWordmark: false,
};

// ---- Layout & timing (frames @30fps) ----------------------------------------
const CENTER_X = 480;
const CENTER_Y = 270;
const SCALE_FROM = 0.12;
const SCALE_END = 19; // scale .12 -> 1
const ROTATE_FROM = -95;
const ROTATE_END = 21; // angle fully settled by f21
const BLUR_FROM = 7;
const BLUR_END = 15; // blur 7px -> 0
const HOLD_START = 22; // exact, static, crisp from here on

// "E": a brisk bloom curve. A short acceleration out of the seed (so f0 reads as
// a point rather than a cut into motion), peak speed around f2-3, then a long,
// overshoot-free deceleration that lands softly on exactly 1.
const E = Easing.bezier(0.25, 0.4, 0.05, 1);
// Focus pull: stays soft through the fastest part of the bloom, then resolves.
const FOCUS = Easing.bezier(0.33, 0, 0.3, 1);

const clampOpts = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Continuous (sub-frame) pose, so motion blur can sample between frames. */
const poseAt = (t: number) => {
  const scale = t >= SCALE_END ? 1 : interpolate(t, [0, SCALE_END], [SCALE_FROM, 1], {...clampOpts, easing: E});
  const rotation = t >= ROTATE_END ? 0 : interpolate(t, [0, ROTATE_END], [ROTATE_FROM, 0], {...clampOpts, easing: E});
  return {scale: Math.min(scale, 1), rotation};
};

const blurAt = (t: number) => interpolate(t, [0, BLUR_END], [BLUR_FROM, 0], {...clampOpts, easing: FOCUS});

// Motion blur: 180deg shutter, trailing (samples t-0.5 .. t), so f0 and the
// hold are exact and untouched.
const SHUTTER = 0.5;
const TIME_SAMPLES = 16;
// Spatial antialiasing: 4x4 sub-pixel grid, each sub-sample box-filtered via SDF.
const SS = 4;

/** Tip travel (px) across the shutter interval ending at frame t. */
const smearPx = (t: number, radius: number) => {
  const a = poseAt(t);
  const b = poseAt(Math.max(0, t - SHUTTER));
  return (
    Math.abs(a.scale - b.scale) * radius + ((Math.abs(a.rotation - b.rotation) * Math.PI) / 180) * radius * a.scale
  );
};

const resolveRgb = (color: string): [number, number, number] => {
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return [0, 0, 0];
  ctx.fillStyle = '#000';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2]];
};

type Pose = {scale: number; rotation: number};

/**
 * Rasterise the (optionally motion-blurred) mark into RGBA: ink colour, alpha =
 * exact time-averaged area coverage.
 */
const rasterise = (
  out: Uint8ClampedArray,
  size: number,
  originX: number,
  originY: number,
  caps: Capsules,
  poses: Pose[],
  rgb: [number, number, number],
) => {
  const extent = caps.half + caps.radius;
  const prepared = poses.map(({scale, rotation}) => {
    const r = (-rotation * Math.PI) / 180; // inverse rotation
    return {inv: 1 / scale, scale, cos: Math.cos(r), sin: Math.sin(r), reach: extent * scale + 1.5};
  });
  const step = 1 / SS;
  const nSub = SS * SS;
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const px = originX + i + 0.5 - CENTER_X;
      const py = originY + j + 0.5 - CENTER_Y;
      const rr = Math.sqrt(px * px + py * py);
      let acc = 0;
      for (const p of prepared) {
        if (rr > p.reach) continue;
        // pixel-centre distance in screen px (uniform scale keeps it a true SDF)
        const lx = (px * p.cos - py * p.sin) * p.inv;
        const ly = (px * p.sin + py * p.cos) * p.inv;
        const dc = unionDistance(caps, lx, ly) * p.scale;
        if (dc <= -0.75) {
          acc += 1;
          continue;
        }
        if (dc >= 0.75) continue;
        // edge pixel: 4x4 sub-samples, each with a box filter of width `step`
        let cov = 0;
        for (let sy = 0; sy < SS; sy++) {
          for (let sx = 0; sx < SS; sx++) {
            const qx = px + (sx + 0.5) * step - 0.5;
            const qy = py + (sy + 0.5) * step - 0.5;
            const ux = (qx * p.cos - qy * p.sin) * p.inv;
            const uy = (qx * p.sin + qy * p.cos) * p.inv;
            const d = unionDistance(caps, ux, uy) * p.scale;
            const c = 0.5 - d / step;
            cov += c <= 0 ? 0 : c >= 1 ? 1 : c;
          }
        }
        acc += cov / nSub;
      }
      const o = (j * size + i) * 4;
      out[o] = rgb[0];
      out[o + 1] = rgb[1];
      out[o + 2] = rgb[2];
      out[o + 3] = Math.round((acc / prepared.length) * 255);
    }
  }
};

const MarkCanvas: React.FC<{frame: number; symbol: SymbolSpec; ink: string}> = ({frame, symbol, ink}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const caps = useMemo(() => capsulesFor(symbol), [symbol]);
  // Canvas covers the mark's largest footprint with a small margin, placed on
  // whole pixels so it maps 1:1 onto the frame (no resampling).
  const size = Math.ceil(symbol.diameter + 20);
  const originX = Math.round(CENTER_X - size / 2);
  const originY = Math.round(CENTER_Y - size / 2);

  useLayoutEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const moving = frame > 0 && frame < HOLD_START && smearPx(frame, symbol.diameter / 2) > 0.02;
    const poses: Pose[] = moving
      ? Array.from({length: TIME_SAMPLES}, (_, i) => poseAt(Math.max(0, frame - (SHUTTER * i) / (TIME_SAMPLES - 1))))
      : [poseAt(frame)];
    const img = ctx.createImageData(size, size);
    rasterise(img.data, size, originX, originY, caps, poses, resolveRgb(ink));
    ctx.putImageData(img, 0, 0);
  }, [frame, caps, ink, size, originX, originY, symbol.diameter]);

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      style={{position: 'absolute', left: originX, top: originY, width: size, height: size}}
    />
  );
};

export const LogoBloom: React.FC<LogoBloomProps> = (props) => {
  const {brand, background, ink, symbol, showWordmark} = {...defaultLogoBloomProps, ...props};
  const frame = useCurrentFrame();
  const blur = blurAt(frame);

  // Optional lockup (off in this variant): wordmark settles in under the mark.
  const wordIn = interpolate(frame, [14, 30], [0, 1], {...clampOpts, easing: Easing.bezier(0.2, 0.7, 0.2, 1)});

  return (
    <AbsoluteFill style={{backgroundColor: background}}>
      {/* Blur lives on an untransformed full-frame layer so it is in screen px. */}
      <AbsoluteFill style={{filter: blur > 0.005 ? `blur(${blur.toFixed(3)}px)` : undefined}}>
        <MarkCanvas frame={frame} symbol={symbol} ink={ink} />
      </AbsoluteFill>
      {showWordmark ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: CENTER_Y + symbol.diameter / 2 + 28,
            textAlign: 'center',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
            fontWeight: 600,
            fontSize: 40,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            color: ink,
            opacity: wordIn,
            transform: `translateY(${(1 - wordIn) * 10}px)`,
          }}
        >
          {brand}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
