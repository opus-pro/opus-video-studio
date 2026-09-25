import React from 'react';
import {useCurrentFrame} from 'remotion';
import {heroExitP, heroFrameRect, LOGO, surfaceRect, T} from './layout';
import {Easing} from 'remotion';
import {
  EIO,
  ESNAP,
  interp,
  lerp,
  mixRect,
  padRect,
  prog,
  Rect,
  rgb,
  scaleRect,
  RGB,
} from './lib';

type MState = {r: Rect; L: number; sw: number};

const mixState = (a: MState, b: MState, t: number): MState => ({
  r: mixRect(a.r, b.r, t),
  L: lerp(a.L, b.L, t),
  sw: lerp(a.sw, b.sw, t),
});

const T0: MState = {r: {x: 104, y: 60, w: 752, h: 420}, L: 30, sw: 2};

const tSurface = (f: number): MState => {
  const ph = prog(f, T.expandH[0], T.expandH[1]);
  return {r: padRect(surfaceRect(f), 14), L: lerp(15, 22, ph), sw: 2};
};
// The markers set the hero's final frame first; the photo then grows into it.
const heroFrame = (f: number) => scaleRect(heroFrameRect(f), lerp(1, 0.84, heroExitP(f)));
const tHero = (f: number): MState => ({r: padRect(heroFrame(f), 13), L: 22, sw: 2});
const tLogo = (): MState => ({r: LOGO, L: 17, sw: 3.2});

// Progress of each hand-off. Chained mixing keeps the path continuous.
const pIn = (f: number) => prog(f, -3, 30, Easing.bezier(0.3, 0.55, 0.25, 1));
const pHero = (f: number) => prog(f, 121, 150, EIO);
const pLogo = (f: number) => prog(f, T.markToLogo[0], T.markToLogo[1], ESNAP);

export const markerState = (f: number): MState => {
  let s = T0;
  s = mixState(s, tSurface(f), pIn(f));
  s = mixState(s, tHero(f), pHero(f));
  s = mixState(s, tLogo(), pLogo(f));
  return s;
};

const GOLD: RGB = [246, 198, 128];

// Per-corner lag (frames): TL, TR, BR, BL
const LAG = [0, 1.4, 2.8, 1.4];
const SIGN: [number, number][] = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
];

const cornerPoint = (f: number, i: number) => {
  const s = markerState(f - LAG[i]);
  const amp = interp(f, [0, 196, 222], [1.9, 1.9, 0.7]);
  const breathe =
    amp * Math.sin((2 * Math.PI * f) / 52 + i * (Math.PI / 2)) + amp * 0.45 * Math.sin((2 * Math.PI * f) / 31 + i * 1.3);
  const [sx, sy] = SIGN[i];
  const x = (sx < 0 ? s.r.x : s.r.x + s.r.w) + sx * breathe;
  const y = (sy < 0 ? s.r.y : s.r.y + s.r.h) + sy * breathe;
  return {x, y, L: s.L, sw: s.sw};
};

const cornerPath = (x: number, y: number, L: number, i: number) => {
  const [sx, sy] = SIGN[i];
  // arm along y (away from corner, into the frame), corner, arm along x
  return `M ${x.toFixed(2)} ${(y - sy * L).toFixed(2)} L ${x.toFixed(2)} ${y.toFixed(2)} L ${(x - sx * L).toFixed(2)} ${y.toFixed(2)}`;
};

const SHUTTER = 0.8; // frames (~290 degree shutter)

export const Markers: React.FC = () => {
  const f = useCurrentFrame();
  const color = GOLD;
  const glow = 0.55 + 0.25 * prog(f, 214, 232);
  const opacity = interp(f, [0, 6], [0.75, 1]);

  // Motion blur: dense sub-frame samples with a tapering alpha build a continuous smear.
  const corners = [0, 1, 2, 3].map((i) => {
    const now = cornerPoint(f, i);
    const samples = [] as {d: string; o: number}[];
    const past = cornerPoint(f - SHUTTER, i);
    const moved = Math.hypot(now.x - past.x, now.y - past.y) + Math.abs(now.L - past.L);
    if (moved > 0.6) {
      const n = Math.min(48, Math.ceil(moved / 0.6));
      // Energy spreads over the smear: denser coverage for short moves, thinner for long ones.
      const target = Math.min(0.62, Math.max(0.14, (1.7 * now.sw) / (now.sw + moved)));
      const spacing = moved / n;
      const a = 1 - Math.pow(1 - target, Math.min(1, spacing / now.sw));
      for (let k = n; k >= 1; k--) {
        const p = cornerPoint(f - (SHUTTER * k) / n, i);
        samples.push({d: cornerPath(p.x, p.y, p.L, i), o: a * (1 - k / (n + 1))});
      }
    }
    return {now, samples};
  });

  return (
    <svg
      width={960}
      height={540}
      viewBox="0 0 960 540"
      style={{
        position: 'absolute',
        inset: 0,
        opacity,
        filter: `drop-shadow(0 0 ${lerp(3, 7, glow).toFixed(1)}px rgba(255,170,80,${glow.toFixed(2)}))`,
      }}
    >
      {corners.map(({now, samples}, i) => (
        <g key={i} fill="none" stroke={rgb(color)} strokeLinecap="round" strokeLinejoin="round">
          {samples.map((s, k) => (
            <path key={k} d={s.d} strokeWidth={now.sw} opacity={s.o} />
          ))}
          <path d={cornerPath(now.x, now.y, now.L, i)} strokeWidth={now.sw} />
        </g>
      ))}
    </svg>
  );
};
