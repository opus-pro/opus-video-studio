import React from 'react';
import {rand} from './math';

export type Kind = 'lighthouse' | 'tree' | 'houses' | 'windmill';
export type Pal = {
  skyTop: string;
  skyMid: string;
  skyLow: string;
  sun: string;
  glow: string;
  cloud: string;
  cloudShade: string;
  rock: string;
  rockDark: string;
  grass: string;
  grassDark: string;
  accent: string;
  roof: string;
  wall: string;
  stars?: boolean;
  moon?: boolean;
};

export const PAL: Record<string, Pal> = {
  dusk: {
    skyTop: '#2B2462',
    skyMid: '#9A4492',
    skyLow: '#FF9D78',
    sun: '#FFE3B0',
    glow: '#FFB48A',
    cloud: '#FFC6C8',
    cloudShade: '#D682A8',
    rock: '#7B5487',
    rockDark: '#35244F',
    grass: '#5FB894',
    grassDark: '#3B8A78',
    accent: '#FFE39A',
    roof: '#E4574E',
    wall: '#FFF6EE',
    stars: true,
  },
  dawn: {
    skyTop: '#86A9EC',
    skyMid: '#F4BCD6',
    skyLow: '#FFE6C8',
    sun: '#FFFBEA',
    glow: '#FFE2C0',
    cloud: '#FFFFFF',
    cloudShade: '#E2CBEA',
    rock: '#A08CC0',
    rockDark: '#5E4F8A',
    grass: '#86D3A3',
    grassDark: '#57AE86',
    accent: '#FFD26B',
    roof: '#F07A6A',
    wall: '#FFFFFF',
  },
  night: {
    skyTop: '#0D1334',
    skyMid: '#26336E',
    skyLow: '#5664A8',
    sun: '#F3F0FF',
    glow: '#9BA8F0',
    cloud: '#8E9AD6',
    cloudShade: '#4E5A9A',
    rock: '#454A7E',
    rockDark: '#1C1E42',
    grass: '#3F8C82',
    grassDark: '#2B6663',
    accent: '#FFE08A',
    roof: '#C8506A',
    wall: '#E8E6FF',
    stars: true,
    moon: true,
  },
  aurora: {
    skyTop: '#082A3C',
    skyMid: '#177068',
    skyLow: '#8BE3C4',
    sun: '#EFFFF6',
    glow: '#9CF5D2',
    cloud: '#BDEFE0',
    cloudShade: '#5CA8A6',
    rock: '#3E6E7C',
    rockDark: '#173646',
    grass: '#8BE08F',
    grassDark: '#4BA86F',
    accent: '#FFE9A0',
    roof: '#3FB6A8',
    wall: '#F2FFF9',
    stars: true,
  },
  mint: {
    skyTop: '#6FCBE6',
    skyMid: '#B8EAF1',
    skyLow: '#FFF3DA',
    sun: '#FFFFFF',
    glow: '#FFF1C8',
    cloud: '#FFFFFF',
    cloudShade: '#BFDCEB',
    rock: '#8FA6C4',
    rockDark: '#51668C',
    grass: '#7ED39A',
    grassDark: '#48A673',
    accent: '#FFC857',
    roof: '#FF8A5B',
    wall: '#FFFFFF',
  },
  peach: {
    skyTop: '#FF7F7A',
    skyMid: '#FFB28C',
    skyLow: '#FFE9B8',
    sun: '#FFFBE8',
    glow: '#FFE0A8',
    cloud: '#FFF1E6',
    cloudShade: '#F5B3A8',
    rock: '#B77A8E',
    rockDark: '#6E3D62',
    grass: '#9ED48C',
    grassDark: '#6BAE6E',
    accent: '#FFF2B0',
    roof: '#8E5BD8',
    wall: '#FFFFFF',
  },
};

const Puff: React.FC<{x: number; y: number; s: number; fill: string; opacity: number}> = ({x, y, s, fill, opacity}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <ellipse cx={0} cy={4} rx={26} ry={7} fill={fill} />
    <circle cx={-12} cy={0} r={9} fill={fill} />
    <circle cx={0} cy={-5} r={12} fill={fill} />
    <circle cx={13} cy={-1} r={9} fill={fill} />
  </g>
);

const Structure: React.FC<{kind: Kind; pal: Pal; frame: number; id: string}> = ({kind, pal, frame, id}) => {
  if (kind === 'lighthouse') {
    const c = Math.cos(frame * 0.055);
    const len = 170 * c;
    return (
      <g>
        {/* beam */}
        <polygon
          points={`112,96 ${112 - len},${78} ${112 - len},${116}`}
          fill={`url(#${id}-beam)`}
          opacity={0.25 + 0.35 * Math.abs(c)}
          style={{mixBlendMode: 'screen'}}
        />
        {/* small tree */}
        <rect x={84} y={156} width={2.5} height={12} fill={pal.rockDark} />
        <circle cx={85} cy={152} r={8} fill={pal.grassDark} />
        <circle cx={89} cy={156} r={6} fill={pal.grass} />
        {/* tower */}
        <polygon points="103,168 121,168 117.5,106 106.5,106" fill={pal.wall} />
        <polygon points="112,168 121,168 117.5,106 112,106" fill="rgba(40,20,70,0.16)" />
        <polygon points="104.6,150 119.4,150 118.8,140 105.2,140" fill={pal.roof} />
        <polygon points="105.8,128 118.2,128 117.8,118 106.2,118" fill={pal.roof} />
        <rect x={102} y={102} width={20} height={4.5} rx={1} fill={pal.rockDark} />
        <circle cx={112} cy={96} r={16} fill={pal.accent} opacity={0.35} filter={`url(#${id}-soft)`} />
        <rect x={106} y={90} width={12} height={12} fill={pal.accent} />
        <rect x={111} y={90} width={1.4} height={12} fill={pal.rockDark} opacity={0.5} />
        <polygon points="104,90.5 120,90.5 112,80" fill={pal.roof} />
        <polygon points="112,90.5 120,90.5 112,80" fill="rgba(40,20,70,0.2)" />
        {/* cottage */}
        <rect x={129} y={154} width={20} height={14} fill={pal.wall} />
        <rect x={139} y={154} width={10} height={14} fill="rgba(40,20,70,0.12)" />
        <polygon points="126,156 152,156 139,145" fill={pal.roof} />
        <rect x={133} y={159} width={4} height={4} fill={pal.accent} />
        <rect x={142} y={159} width={4} height={4} fill={pal.accent} opacity={0.9} />
      </g>
    );
  }
  if (kind === 'tree') {
    return (
      <g>
        <path d="M118 168 C117 150 116 138 112 124 L122 124 C121 138 122 152 124 168 Z" fill={pal.rockDark} />
        <path d="M117 136 C108 128 100 126 94 128" stroke={pal.rockDark} strokeWidth={2.5} fill="none" />
        <circle cx={118} cy={104} r={26} fill={pal.grassDark} />
        <circle cx={98} cy={116} r={18} fill={pal.grassDark} />
        <circle cx={138} cy={114} r={19} fill={pal.grass} />
        <circle cx={114} cy={96} r={20} fill={pal.grass} />
        <circle cx={106} cy={90} r={8} fill="rgba(255,255,255,0.18)" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle key={i} cx={96 + rand(i + 3) * 46} cy={92 + rand(i + 9) * 30} r={2.6} fill={pal.accent} />
        ))}
        <rect x={138} y={160} width={10} height={8} fill={pal.wall} />
        <polygon points="136,161 150,161 143,154" fill={pal.roof} />
      </g>
    );
  }
  if (kind === 'houses') {
    return (
      <g>
        <rect x={92} y={140} width={22} height={28} fill={pal.wall} />
        <rect x={103} y={140} width={11} height={28} fill="rgba(40,20,70,0.14)" />
        <polygon points="89,142 117,142 103,124" fill={pal.roof} />
        <rect x={97} y={148} width={5} height={6} fill={pal.accent} />
        <rect x={106} y={148} width={5} height={6} fill={pal.accent} />
        <rect x={120} y={150} width={26} height={18} fill={pal.wall} />
        <rect x={133} y={150} width={13} height={18} fill="rgba(40,20,70,0.14)" />
        <polygon points="117,152 149,152 133,138" fill={pal.roof} />
        <rect x={126} y={156} width={5} height={5} fill={pal.accent} />
        <rect x={137} y={156} width={5} height={5} fill={pal.accent} />
        <circle cx={80} cy={158} r={9} fill={pal.grassDark} />
        <circle cx={156} cy={160} r={7} fill={pal.grass} />
      </g>
    );
  }
  // windmill
  const a = frame * 2.2;
  return (
    <g>
      <polygon points="104,168 122,168 118,112 108,112" fill={pal.wall} />
      <polygon points="113,168 122,168 118,112 113,112" fill="rgba(40,20,70,0.15)" />
      <polygon points="104,114 122,114 113,100" fill={pal.roof} />
      <rect x={110} y={150} width={6} height={18} rx={3} fill={pal.rockDark} />
      <g transform={`rotate(${a} 113 112)`}>
        {[0, 90, 180, 270].map((r) => (
          <g key={r} transform={`rotate(${r} 113 112)`}>
            <rect x={111.8} y={80} width={2.4} height={32} fill={pal.rockDark} />
            <rect x={114.2} y={82} width={8} height={26} fill={pal.wall} opacity={0.92} />
          </g>
        ))}
      </g>
      <circle cx={113} cy={112} r={3} fill={pal.rockDark} />
      <circle cx={140} cy={160} r={8} fill={pal.grassDark} />
      <circle cx={86} cy={160} r={7} fill={pal.grass} />
    </g>
  );
};

export const Isle: React.FC<{id: string; pal: Pal; kind: Kind; frame: number; seed?: number}> = ({
  id,
  pal,
  kind,
  frame,
  seed = 0,
}) => {
  const bob = Math.sin((frame + seed * 37) / 26) * 2.4;
  const drift = (base: number, speed: number) => ((((base + frame * speed) % 320) + 320) % 320) - 40;
  const sunX = pal.moon ? 64 : 172;
  const sunY = pal.moon ? 70 : 214;
  return (
    <svg viewBox="0 0 240 300" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{display: 'block'}}>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={pal.skyTop} />
          <stop offset="0.52" stopColor={pal.skyMid} />
          <stop offset="0.82" stopColor={pal.skyLow} />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor={pal.glow} stopOpacity="0.95" />
          <stop offset="0.45" stopColor={pal.glow} stopOpacity="0.35" />
          <stop offset="1" stopColor={pal.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-rock`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={pal.rock} />
          <stop offset="1" stopColor={pal.rockDark} />
        </linearGradient>
        <linearGradient id={`${id}-sea`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={pal.cloud} />
          <stop offset="1" stopColor={pal.cloudShade} />
        </linearGradient>
        <linearGradient id={`${id}-beam`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor={pal.accent} stopOpacity="0.9" />
          <stop offset="1" stopColor={pal.accent} stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${id}-vig`} cx="0.5" cy="0.45" r="0.75">
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#10082a" stopOpacity="0.28" />
        </radialGradient>
        <filter id={`${id}-soft`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <rect x={0} y={0} width={240} height={300} fill={`url(#${id}-sky)`} />
      {pal.stars &&
        Array.from({length: 26}).map((_, i) => (
          <circle
            key={i}
            cx={rand(i + seed * 50) * 240}
            cy={rand(i * 3 + 7 + seed) * 120}
            r={0.5 + rand(i * 5) * 0.9}
            fill="#fff"
            opacity={0.35 + 0.55 * (0.5 + 0.5 * Math.sin(frame * 0.12 + i * 1.7))}
          />
        ))}
      <circle cx={sunX} cy={sunY} r={96} fill={`url(#${id}-glow)`} />
      <circle cx={sunX} cy={sunY} r={pal.moon ? 15 : 24} fill={pal.sun} />
      {pal.moon && <circle cx={sunX + 6} cy={sunY - 4} r={13} fill={pal.skyTop} opacity={0.9} />}
      {/* far clouds */}
      <Puff x={drift(30 + seed * 20, 0.12)} y={126} s={1} fill={pal.cloud} opacity={0.55} />
      <Puff x={drift(190 + seed * 30, 0.09)} y={96} s={0.7} fill={pal.cloud} opacity={0.45} />
      <Puff x={drift(260 + seed * 10, 0.15)} y={150} s={0.85} fill={pal.cloud} opacity={0.5} />
      {/* back sea of clouds */}
      <g>
        {Array.from({length: 14}).map((_, i) => (
          <circle key={i} cx={-10 + i * 20} cy={236 + rand(i + 2) * 6} r={15 + rand(i + 11) * 9} fill={pal.cloudShade} opacity={0.85} />
        ))}
        <rect x={0} y={238} width={240} height={62} fill={pal.cloudShade} opacity={0.85} />
      </g>
      {/* island */}
      <g transform={`translate(0 ${bob})`}>
        <g transform={`translate(${Math.sin(frame / 20 + 1) * 1.5} ${Math.sin(frame / 18) * 3})`}>
          <path d="M40 204 L58 204 L50 222 Z" fill={`url(#${id}-rock)`} />
          <path d="M39 204 Q49 199 59 204 Z" fill={pal.grass} />
        </g>
        <g transform={`translate(0 ${Math.sin(frame / 22 + 2) * 3})`}>
          <path d="M188 214 L204 214 L197 229 Z" fill={`url(#${id}-rock)`} />
          <path d="M187 214 Q196 209 205 214 Z" fill={pal.grass} />
        </g>
        <path
          d="M64 174 C90 184 150 184 178 172 C172 196 156 214 140 226 C132 240 126 256 120 268 C114 252 104 236 96 222 C82 208 70 192 64 174 Z"
          fill={`url(#${id}-rock)`}
        />
        <path
          d="M64 174 C80 182 100 184 118 184 L120 268 C110 246 96 226 86 210 C76 196 68 186 64 174 Z"
          fill="#ffffff"
          opacity={0.1}
        />
        {[74, 96, 132, 156].map((x, i) => (
          <path
            key={x}
            d={`M${x} 180 q ${i % 2 ? 2 : -2} 10 0 ${14 + i * 3}`}
            stroke={pal.grassDark}
            strokeWidth={1.4}
            fill="none"
            opacity={0.8}
          />
        ))}
        <path d="M60 172 C80 159 160 157 182 170 C178 180 70 183 60 172 Z" fill={pal.grassDark} />
        <path d="M62 170 C82 158 158 156 180 168 C170 174 74 176 62 170 Z" fill={pal.grass} />
        <Structure kind={kind} pal={pal} frame={frame} id={id} />
      </g>
      {/* birds */}
      {[0, 1, 2].map((i) => {
        const bx = 40 + i * 14 + Math.sin(frame / 30 + i) * 4 + frame * 0.05;
        const by = 70 + i * 8 + Math.sin(frame / 12 + i * 2) * 1.5;
        const flap = 2 + Math.sin(frame * 0.5 + i) * 1.5;
        return (
          <path
            key={i}
            d={`M${bx - 4} ${by - flap} Q${bx - 2} ${by - 0.5} ${bx} ${by} Q${bx + 2} ${by - 0.5} ${bx + 4} ${by - flap}`}
            stroke={pal.rockDark}
            strokeWidth={1}
            fill="none"
            opacity={0.55}
          />
        );
      })}
      {/* front sea of clouds */}
      <g>
        {Array.from({length: 12}).map((_, i) => (
          <circle
            key={i}
            cx={drift(i * 26, 0.06) }
            cy={268 + rand(i + 21) * 8}
            r={16 + rand(i + 31) * 10}
            fill={`url(#${id}-sea)`}
          />
        ))}
        <rect x={0} y={272} width={240} height={28} fill={pal.cloudShade} />
      </g>
      <rect x={0} y={0} width={240} height={300} fill={`url(#${id}-vig)`} />
    </svg>
  );
};
