import React, {useLayoutEffect, useRef} from 'react';
import {useCurrentFrame} from 'remotion';

// Deterministic film grain: one seeded noise tile, re-offset every frame.
const TILE = 256;
let tile: HTMLCanvasElement | null = null;

const getTile = () => {
  if (tile) return tile;
  const c = document.createElement('canvas');
  c.width = TILE;
  c.height = TILE;
  const ctx = c.getContext('2d');
  if (!ctx) return c;
  const img = ctx.createImageData(TILE, TILE);
  let seed = 0x2f6b1d3;
  for (let i = 0; i < TILE * TILE; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const v = 128 + ((seed >>> 24) - 128) * 0.9;
    img.data[i * 4] = v;
    img.data[i * 4 + 1] = v;
    img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  tile = c;
  return c;
};

const hash = (n: number) => {
  let x = (n * 2654435761) >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x45d9f3b) >>> 0;
  x ^= x >>> 16;
  return x;
};

export const Grain: React.FC<{opacity: number; zIndex: number}> = ({opacity, zIndex}) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const w = 540;
  const h = 960;

  useLayoutEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pattern = ctx.createPattern(getTile(), 'repeat');
    if (!pattern) return;
    const ox = hash(frame + 1) % TILE;
    const oy = hash(frame + 977) % TILE;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.translate(-ox, -oy);
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, w + TILE, h + TILE);
  }, [frame]);

  return (
    <canvas
      ref={ref}
      width={w}
      height={h}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity,
        mixBlendMode: 'overlay',
        zIndex,
        pointerEvents: 'none',
      }}
    />
  );
};
