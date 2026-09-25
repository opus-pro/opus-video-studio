import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {useGeist} from './font';
import {TileFrame} from './Tile';
import {TILE, tileState} from './timing';
import {Wordmark} from './Wordmark';

const BG = '#151719';

// Motion blur for the tile: a directional Gaussian whose size tracks how far the tile's
// edges travel across a trailing 180-degree shutter (half a frame). Measuring over the
// trailing interval keeps frame 66 (t = 1.1s) pristine even though the spec curve
// cubic-bezier(0,0,0,1) starts with infinite velocity.
const SHUTTER = 0.5; // fraction of a frame
const SIGMA_PER_PX = 0.34; // a box smear of length L reads like a Gaussian of sigma ~0.3 L

const motionBlur = (t: number, fps: number) => {
  const a = tileState(t);
  const b = tileState(Math.max(0, t - SHUTTER / fps));
  const half = (TILE / 2) * Math.abs(a.scale - b.scale); // edges spreading from the centre
  const dy = Math.abs(a.cy - b.cy);
  // Rotation smear at the tile's corner radius (only meaningful during the intro, where the
  // 10px spec blur already dominates).
  const rotPx = (Math.abs(a.rot - b.rot) * Math.PI) / 180 * (TILE / 2) * a.scale;
  return {
    x: SIGMA_PER_PX * Math.hypot(half, rotPx),
    y: SIGMA_PER_PX * (dy + half * 0.5) + SIGMA_PER_PX * rotPx * 0.5,
  };
};

export const MarkLockup: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const ready = useGeist();
  const t = frame / fps;

  const state = tileState(t);
  const motion = motionBlur(t, fps);

  return (
    <AbsoluteFill style={{backgroundColor: BG, overflow: 'hidden'}}>
      <TileFrame state={state} motion={motion} uid="tile" width={width} height={height} />
      {ready ? <Wordmark t={t} width={width} height={height} /> : null}
    </AbsoluteFill>
  );
};
