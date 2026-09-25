import React from 'react';

export type FontSpec = {family: string; weight: number; italic: boolean};

export const SERIF = 'Didot, "Bodoni 72", "Bodoni MT", Georgia, serif';
export const SANS = '"Avenir Next", "Helvetica Neue", Helvetica, Arial, sans-serif';

export const ITALIC: FontSpec = {family: SERIF, weight: 400, italic: true};
export const ROMAN: FontSpec = {family: SERIF, weight: 400, italic: false};
export const BOLD: FontSpec = {family: SERIF, weight: 700, italic: false};

const REF = 200;
let ctx: CanvasRenderingContext2D | null = null;
const getCtx = () => {
  if (!ctx) ctx = document.createElement('canvas').getContext('2d')!;
  return ctx;
};
const fontStr = (f: FontSpec, size: number) => `${f.italic ? 'italic ' : ''}${f.weight} ${size}px ${f.family}`;
const key = (f: FontSpec) => `${f.family}|${f.weight}|${f.italic}`;

export type Metrics = {asc: number; desc: number; capH: number; xH: number};
const mCache = new Map<string, Metrics>();
export const metrics = (f: FontSpec): Metrics => {
  const k = key(f);
  const hit = mCache.get(k);
  if (hit) return hit;
  const c = getCtx();
  c.font = fontStr(f, REF);
  const H = c.measureText('H');
  const x = c.measureText('x');
  const m = {
    asc: H.fontBoundingBoxAscent / REF,
    desc: H.fontBoundingBoxDescent / REF,
    capH: H.actualBoundingBoxAscent / REF,
    xH: x.actualBoundingBoxAscent / REF,
  };
  mCache.set(k, m);
  return m;
};

export type Layout = {chars: {ch: string; x: number}[]; width: number};
const lCache = new Map<string, Layout>();
/** Kerned per-character x offsets (em) from prefix measurement. */
export const layout = (text: string, f: FontSpec, tracking = 0): Layout => {
  const k = `${key(f)}|${tracking}|${text}`;
  const hit = lCache.get(k);
  if (hit) return hit;
  const c = getCtx();
  c.font = fontStr(f, REF);
  const chars = [...text].map((ch, i) => ({ch, x: c.measureText(text.slice(0, i)).width / REF + i * tracking}));
  const width = c.measureText(text).width / REF + (text.length - 1) * tracking;
  const l = {chars, width};
  lCache.set(k, l);
  return l;
};

export const textWidth = (text: string, f: FontSpec, size: number, tracking = 0) => layout(text, f, tracking).width * size;

/** Gloss palette: stops positioned relative to cap height (0 = cap top, 1 = baseline). */
export type Gloss = [number, string][];

export const PEARL: Gloss = [
  [-0.5, '#ffffff'],
  [0.0, '#fffaf2'],
  [0.3, '#efe6d8'],
  [0.56, '#b5a48d'],
  [0.6, '#5d5043'],
  [0.68, '#8c7a64'],
  [0.9, '#e6d7c1'],
  [1.15, '#fff8ec'],
  [1.5, '#cbb89c'],
];
export const PEARL_SOFT: Gloss = [
  [-0.5, '#f4eee6'],
  [0.2, '#efe8de'],
  [0.6, '#cfc3b2'],
  [1.0, '#e9dfd1'],
  [1.5, '#d9ccb9'],
];
export const GOLD: Gloss = [
  [-0.5, '#fffdf6'],
  [0.0, '#fff6df'],
  [0.3, '#f5dfae'],
  [0.54, '#d2a25a'],
  [0.585, '#5e3f1b'],
  [0.66, '#9a6d36'],
  [0.88, '#efcd8e'],
  [1.1, '#fff1cf'],
  [1.5, '#c99a55'],
];

export type LetterFx = {dx?: number; dy?: number; opacity?: number; blur?: number; scale?: number};

type LineProps = {
  text: string;
  font: FontSpec;
  size: number;
  /** Horizontal anchor: centre x (align centre) or left x (align left). */
  x: number;
  baseline: number;
  align?: 'center' | 'left';
  tracking?: number;
  gloss: Gloss;
  /** Sheen band centre in % across the line (null = no sheen). */
  sheen?: number | null;
  sheenStrength?: number;
  opacity?: number;
  blur?: number;
  shadow?: number;
  glow?: string;
  letterFx?: (i: number, word: number, n: number) => LetterFx;
  wordOffset?: number;
};

export const Line: React.FC<LineProps> = ({
  text, font, size, x, baseline, align = 'center', tracking = 0, gloss, sheen = null, sheenStrength = 0.8,
  opacity = 1, blur = 0, shadow = 1, glow, letterFx, wordOffset = 0,
}) => {
  if (opacity <= 0.001 || size <= 0.5) return null;
  const m = metrics(font);
  const lay = layout(text, font, tracking);
  const S = size;
  const padX = 0.35 * S;
  const padT = 0.4 * S;
  const boxH = S + 2 * padT;
  const b = (1 + m.asc - m.desc) / 2; // baseline within a line-height:1 box
  const yb = padT + b * S; // baseline inside padding box
  const capTop = yb - m.capH * S;
  const capPx = m.capH * S;
  const left = align === 'center' ? x - (lay.width * S) / 2 : x;
  const GW = lay.width * S + 2 * padX;
  const base = `linear-gradient(180deg, ${gloss.map(([p, c]) => `${c} ${(capTop + p * capPx).toFixed(2)}px`).join(', ')})`;
  const layers: string[] = [];
  if (sheen !== null) {
    const a = sheenStrength;
    layers.push(
      `linear-gradient(104deg, rgba(255,255,255,0) ${sheen - 14}%, rgba(255,252,244,${(a * 0.35).toFixed(3)}) ${sheen - 5}%, rgba(255,255,255,${a.toFixed(3)}) ${sheen}%, rgba(255,252,244,${(a * 0.35).toFixed(3)}) ${sheen + 5}%, rgba(255,255,255,0) ${sheen + 14}%)`,
    );
  }
  layers.push(base);
  const filters: string[] = [];
  if (shadow > 0) {
    filters.push(`drop-shadow(0px ${(0.035 * S).toFixed(2)}px ${(0.06 * S).toFixed(2)}px rgba(0,0,0,${(0.6 * shadow).toFixed(3)}))`);
  }
  if (glow) filters.push(`drop-shadow(0px 0px ${(0.22 * S).toFixed(2)}px ${glow})`);
  if (blur > 0.05) filters.push(`blur(${blur.toFixed(2)}px)`);
  let word = wordOffset;
  const n = lay.chars.length;
  return (
    <div style={{position: 'absolute', inset: 0, opacity, filter: filters.length ? filters.join(' ') : undefined}}>
      {lay.chars.map(({ch, x: cx}, i) => {
        if (ch === ' ') {
          word++;
          return null;
        }
        const fx = letterFx ? letterFx(i, word, n) : {};
        const o = fx.opacity ?? 1;
        if (o <= 0.001) return null;
        const bl = fx.blur ?? 0;
        const sc = fx.scale ?? 1;
        const hasT = (fx.dx ?? 0) !== 0 || (fx.dy ?? 0) !== 0 || sc !== 1;
        return (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: left + cx * S - padX,
              top: baseline - yb,
              padding: `${padT}px ${padX}px`,
              fontFamily: font.family,
              fontWeight: font.weight,
              fontStyle: font.italic ? 'italic' : 'normal',
              fontSize: S,
              lineHeight: `${S}px`,
              whiteSpace: 'pre',
              color: 'transparent',
              backgroundImage: layers.join(', '),
              backgroundSize: `${GW}px ${boxH}px`,
              backgroundPosition: `${-cx * S}px 0px`,
              backgroundRepeat: 'no-repeat',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              opacity: o,
              filter: bl > 0.05 ? `blur(${bl.toFixed(2)}px)` : undefined,
              transform: hasT ? `translate(${(fx.dx ?? 0).toFixed(2)}px, ${(fx.dy ?? 0).toFixed(2)}px) scale(${sc})` : undefined,
              transformOrigin: `50% ${yb}px`,
              textRendering: 'geometricPrecision',
              WebkitFontSmoothing: 'antialiased',
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};
