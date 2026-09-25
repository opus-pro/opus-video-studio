import React, {useLayoutEffect, useRef, useState} from 'react';
import {cancelRender, continueRender, delayRender} from 'remotion';

export type Box = {x: number; y: number; width: number; height: number};
export type TextBox = Box & {size: number; min: number; lineHeight: number; lines: number; weight?: number; align?: 'left' | 'center' | 'right'; family?: string};
export const sans = 'Arial, Helvetica, sans-serif';
export const serif = 'Georgia, "Times New Roman", serif';
export const clamp = (v: number) => Math.max(0, Math.min(1, v));
export const progress = (f: number, interval: number[]) => clamp((f - interval[0]) / (interval[1] - interval[0]));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Solve the curve's x coordinate first; y(t) alone is not CSS cubic-bezier easing.
export const cubicBezier = (x: number, x1: number, y1: number, x2: number, y2: number) => {
  if (x <= 0 || x >= 1) return clamp(x);
  const cubic = (t: number, a: number, b: number) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (cubic(mid, x1, x2) < x) lo = mid;
    else hi = mid;
  }
  return cubic((lo + hi) / 2, y1, y2);
};
export const E = (x: number) => cubicBezier(x, .16, 1, .3, 1);
export const S = (x: number) => cubicBezier(x, .65, 0, .35, 1);
export const ease = (f: number, interval: number[]) => E(progress(f, interval));
export const position = (b: Box): React.CSSProperties => ({position: 'absolute', left: b.x, top: b.y, width: b.width, height: b.height});
export const mixBox = (a: Box, b: Box, t: number): Box => ({x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), width: lerp(a.width, b.width, t), height: lerp(a.height, b.height, t)});
export const mixColor = (a: string, b: string, t: number) => {
  const channels = (c: string) => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const aa = channels(a);
  const bb = channels(b);
  return `rgb(${aa.map((v, i) => Math.round(lerp(v, bb[i], t))).join(',')})`;
};

type FitTextProps = {text: string; box: TextBox; color?: string; style?: React.CSSProperties; children?: React.ReactNode};
export const FitText: React.FC<FitTextProps> = ({text, box, color, style, children}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [handle] = useState(() => delayRender(`Measure text: ${text}`));
  useLayoutEffect(() => {
    let active = true;
    document.fonts.ready.then(() => {
      if (!active || !ref.current) return;
      const node = ref.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Text measurement context unavailable');
      let chosen = box.size;
      const allowed = Math.min(box.height, box.lineHeight * box.lines);
      for (; chosen >= box.min; chosen -= .1) {
        node.style.fontSize = `${chosen}px`;
        node.style.lineHeight = `${box.lineHeight * chosen / box.size}px`;
        ctx.font = `${box.weight ?? 400} ${chosen}px ${box.family ?? sans}`;
        const singleWidth = ctx.measureText(text).width;
        if (box.lines === 1) {
          if (singleWidth <= box.width + .2 && node.scrollHeight <= box.height + 1) break;
        } else if (node.scrollWidth <= box.width + 1 && node.scrollHeight <= allowed + 1) break;
      }
      chosen = Math.max(box.min, chosen);
      node.style.fontSize = `${chosen}px`;
      node.style.lineHeight = `${box.lineHeight * chosen / box.size}px`;
      ctx.font = `${box.weight ?? 400} ${chosen}px ${box.family ?? sans}`;
      if ((box.lines === 1 && ctx.measureText(text).width > box.width + 1) || node.scrollHeight > box.height + 1 || node.scrollWidth > box.width + 1) {
        cancelRender(new Error(`Edited text does not fit its fixed box at minimum font size: ${text}`));
      } else continueRender(handle);
    }).catch(cancelRender);
    return () => {active = false;};
  }, [text, box.width, box.height, box.size, box.min, box.lineHeight, box.lines, box.weight, box.family, handle]);
  return <div style={{...position(box), color, ...style}}><div ref={ref} data-fit-text={text} style={{fontFamily: box.family ?? sans, fontSize: box.size, lineHeight: `${box.lineHeight}px`, fontWeight: box.weight ?? 400, textAlign: box.align ?? 'left', whiteSpace: box.lines === 1 ? 'nowrap' : 'normal', overflowWrap: 'normal', letterSpacing: 0}}>{children ?? text}</div></div>;
};

export const box = (x: number, y: number, width: number, height: number): Box => ({x, y, width, height});
export const textBox = (x: number, y: number, width: number, height: number, size: number, min = size, lines = 1, weight = 400, lineHeight = height): TextBox => ({x, y, width, height, size, min, lines, weight, lineHeight});
