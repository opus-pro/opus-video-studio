import React from 'react';
import {getPosterUrl, PosterVariant} from './poster';
import {GRID_POSTER_W, INK, POSTER_H, POSTER_W} from './timing';

export type Kind =
  | {type: 'poster'; variant: PosterVariant}
  | {type: 'sphere'}
  | {type: 'pill'}
  | {type: 'ringChrome'}
  | {type: 'blob'}
  | {type: 'wave'}
  | {type: 'zigzag'}
  | {type: 'triangle'}
  | {type: 'spark'}
  | {type: 'circle'};

export type GridItem = {id: string; x: number; y: number; kind: Kind; match?: string; selected?: boolean};

export const ITEMS: GridItem[] = [
  {id: 'p-sun', x: 150, y: 176, kind: {type: 'poster', variant: 'sun'}},
  {id: 'sphere', x: 318, y: 168, kind: {type: 'sphere'}},
  {id: 'wave', x: 482, y: 176, kind: {type: 'wave'}},
  {id: 'ringChrome', x: 646, y: 170, kind: {type: 'ringChrome'}, match: 'Form'},
  {id: 'p-bars', x: 812, y: 180, kind: {type: 'poster', variant: 'bars'}},
  {id: 'pill', x: 162, y: 304, kind: {type: 'pill'}},
  {id: 'p-ring', x: 322, y: 306, kind: {type: 'poster', variant: 'ring'}, match: 'Surface', selected: true},
  {id: 'zigzag', x: 650, y: 302, kind: {type: 'zigzag'}},
  {id: 'knot', x: 814, y: 310, kind: {type: 'blob'}},
  {id: 'triangle', x: 236, y: 428, kind: {type: 'triangle'}},
  {id: 'p-square', x: 400, y: 434, kind: {type: 'poster', variant: 'square'}},
  {id: 'spark', x: 566, y: 426, kind: {type: 'spark'}},
  {id: 'circle', x: 732, y: 430, kind: {type: 'circle'}, match: 'Line'},
];

export const isChrome = (item: GridItem) =>
  item.kind.type === 'sphere' || item.kind.type === 'pill' || item.kind.type === 'ringChrome' || item.kind.type === 'blob';

export const itemHalfHeight = (k: Kind) => {
  switch (k.type) {
    case 'poster':
      return (GRID_POSTER_W * POSTER_H) / POSTER_W / 2;
    case 'ringChrome':
      return 20;
    case 'pill':
      return 32;
    default:
      return 29;
  }
};

const STROKE = {fill: 'none', stroke: INK, strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round'} as const;

const ChromeDefs: React.FC<{id: string}> = ({id}) => (
  <defs>
    <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0.25" y2="1">
      <stop offset="0" stopColor="#FFFFFF" />
      <stop offset="0.45" stopColor="#D5D8DD" />
      <stop offset="0.62" stopColor="#A4A9B1" />
      <stop offset="1" stopColor="#8C9199" />
    </linearGradient>
    <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#2B2E34" />
      <stop offset="0.55" stopColor="#4B4F57" />
      <stop offset="1" stopColor="#B9BDC4" />
    </linearGradient>
    <radialGradient id={`${id}-rim`} cx="0.5" cy="0.5" r="0.5">
      <stop offset="0.72" stopColor="#000" stopOpacity="0" />
      <stop offset="1" stopColor="#000" stopOpacity="0.28" />
    </radialGradient>
    <radialGradient id={`${id}-hl`} cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#fff" stopOpacity="1" />
      <stop offset="1" stopColor="#fff" stopOpacity="0" />
    </radialGradient>
  </defs>
);

const Sphere: React.FC<{id: string}> = ({id}) => (
  <svg width={60} height={60} viewBox="0 0 60 60" style={{overflow: 'visible'}}>
    <ChromeDefs id={id} />
    <clipPath id={`${id}-clip`}>
      <circle cx="30" cy="30" r="27" />
    </clipPath>
    <circle cx="30" cy="30" r="27" fill={`url(#${id}-sky)`} />
    <g clipPath={`url(#${id}-clip)`}>
      <ellipse cx="30" cy="52" rx="40" ry="20" fill={`url(#${id}-floor)`} />
      <ellipse cx="21" cy="17" rx="9" ry="5.5" fill={`url(#${id}-hl)`} transform="rotate(-28 21 17)" />
    </g>
    <circle cx="30" cy="30" r="27" fill={`url(#${id}-rim)`} />
  </svg>
);

const Blob: React.FC<{id: string}> = ({id}) => {
  const d = 'M31 4 C45 4 56 14 55 28 C54 41 47 55 31 56 C16 57 5 47 5 33 C5 19 14 4 31 4 Z';
  return (
    <svg width={60} height={60} viewBox="0 0 60 60" style={{overflow: 'visible'}}>
      <ChromeDefs id={id} />
      <clipPath id={`${id}-clip`}>
        <path d={d} transform="rotate(18 30 30)" />
      </clipPath>
      <path d={d} transform="rotate(18 30 30)" fill={`url(#${id}-sky)`} />
      <g clipPath={`url(#${id}-clip)`}>
        <path d="M-6 40 C 14 30, 40 28, 66 38 L 66 70 L -6 70 Z" fill={`url(#${id}-floor)`} />
        <ellipse cx="22" cy="18" rx="10" ry="4.5" fill={`url(#${id}-hl)`} transform="rotate(-20 22 18)" />
      </g>
      <path d={d} transform="rotate(18 30 30)" fill={`url(#${id}-rim)`} />
    </svg>
  );
};

const Pill: React.FC<{id: string}> = ({id}) => (
  <svg width={60} height={66} viewBox="0 0 60 66" style={{overflow: 'visible'}}>
    <defs>
      <linearGradient id={`${id}-band`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#6E737B" />
        <stop offset="0.16" stopColor="#F6F7F9" />
        <stop offset="0.3" stopColor="#C4C8CE" />
        <stop offset="0.5" stopColor="#555960" />
        <stop offset="0.64" stopColor="#2B2E33" />
        <stop offset="0.84" stopColor="#A3A8B0" />
        <stop offset="1" stopColor="#5F636B" />
      </linearGradient>
      <linearGradient id={`${id}-cap`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
        <stop offset="0.25" stopColor="#fff" stopOpacity="0" />
        <stop offset="0.8" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.25" />
      </linearGradient>
    </defs>
    <g transform="rotate(32 30 33)">
      <rect x="16" y="2" width="28" height="62" rx="14" fill={`url(#${id}-band)`} />
      <rect x="16" y="2" width="28" height="62" rx="14" fill={`url(#${id}-cap)`} />
    </g>
  </svg>
);

const RingChrome: React.FC<{id: string}> = ({id}) => (
  <svg width={66} height={46} viewBox="0 0 66 46" style={{overflow: 'visible'}}>
    <defs>
      <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="0.36" stopColor="#C9CDD3" />
        <stop offset="0.5" stopColor="#7F848C" />
        <stop offset="0.54" stopColor="#30333A" />
        <stop offset="0.78" stopColor="#5B5F67" />
        <stop offset="1" stopColor="#C3C7CD" />
      </linearGradient>
      <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3A3D44" />
        <stop offset="1" stopColor="#D9DCE0" />
      </linearGradient>
    </defs>
    <path
      fillRule="evenodd"
      fill={`url(#${id}-body)`}
      d="M33 2 C51 2 64 11 64 23 C64 35 51 44 33 44 C15 44 2 35 2 23 C2 11 15 2 33 2 Z M33 16 C25 16 19 18.6 19 21.6 C19 24.6 25 27 33 27 C41 27 47 24.6 47 21.6 C47 18.6 41 16 33 16 Z"
    />
    <path d="M19.3 20.6 C21 17.8 26.5 16 33 16 C39.5 16 45 17.8 46.7 20.6 C43 19.2 38.5 18.6 33 18.6 C27.5 18.6 23 19.2 19.3 20.6 Z" fill={`url(#${id}-wall)`} />
    <path d="M10 14 C16 7.5 25 5.2 33 5.2" fill="none" stroke="#fff" strokeOpacity="0.85" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const LineGlyph: React.FC<{type: 'wave' | 'zigzag' | 'triangle' | 'spark' | 'circle'}> = ({type}) => {
  let el: React.ReactNode = null;
  if (type === 'wave') el = <path {...STROKE} d="M4 30 C 11 16, 19 16, 24 30 S 37 44, 44 30 S 53 18, 56 24" />;
  if (type === 'zigzag') el = <path {...STROKE} d="M6 40 L 17 20 L 28 40 L 39 20 L 50 40" />;
  if (type === 'triangle') el = <path {...STROKE} d="M30 7 L 55 50 L 5 50 Z" />;
  if (type === 'spark')
    el = <path {...STROKE} d="M30 4 C 31.5 22, 38 28.5, 56 30 C 38 31.5, 31.5 38, 30 56 C 28.5 38, 22 31.5, 4 30 C 22 28.5, 28.5 22, 30 4 Z" />;
  if (type === 'circle') el = <circle {...STROKE} cx="30" cy="30" r="25" />;
  return (
    <svg width={60} height={60} viewBox="0 0 60 60" style={{overflow: 'visible'}}>
      {el}
    </svg>
  );
};

export const PosterImg: React.FC<{variant: PosterVariant; width: number}> = ({variant, width}) => (
  <img
    src={getPosterUrl(variant)}
    width={width}
    height={(width * POSTER_H) / POSTER_W}
    style={{display: 'block', width, height: (width * POSTER_H) / POSTER_W}}
  />
);

export const ObjectVisual: React.FC<{item: GridItem}> = ({item}) => {
  const k = item.kind;
  switch (k.type) {
    case 'poster':
      return (
        <div style={{boxShadow: '0 1px 2px rgba(20,20,26,0.10), 0 8px 18px -6px rgba(20,20,26,0.22)'}}>
          <PosterImg variant={k.variant} width={GRID_POSTER_W} />
        </div>
      );
    case 'sphere':
      return <Sphere id={item.id} />;
    case 'blob':
      return <Blob id={item.id} />;
    case 'pill':
      return <Pill id={item.id} />;
    case 'ringChrome':
      return <RingChrome id={item.id} />;
    default:
      return <LineGlyph type={k.type} />;
  }
};
