import {useEffect, useState} from 'react';
import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';

export const FONT_FAMILY = 'GeistPF';

let fontPromise: Promise<void> | null = null;

const loadFont = () => {
  if (!fontPromise) {
    const face = new FontFace(FONT_FAMILY, `url(${staticFile('assets/GeistVF.woff2')}) format('woff2')`, {
      weight: '100 900',
      style: 'normal',
    });
    fontPromise = face.load().then((loaded) => {
      document.fonts.add(loaded);
    });
  }
  return fontPromise;
};

/** Blocks the render until Geist is loaded and ready for canvas + SVG text. */
export const useGeist = () => {
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('Loading Geist'));
  useEffect(() => {
    loadFont()
      .then(() => document.fonts.ready)
      .then(() => {
        setReady(true);
        continueRender(handle);
      })
      .catch((err) => cancelRender(err));
  }, [handle]);
  return ready;
};

export type TextMetrics2 = {
  /** Ink extents relative to the text origin (x) and baseline (y, positive up). */
  inkLeft: number;
  inkRight: number;
  ascent: number;
  descent: number;
  /** Per-glyph split points (x, relative to origin) between consecutive glyph inks. */
  splits: number[];
};

let ctx: CanvasRenderingContext2D | null = null;

export const measureText = (text: string, size: number, weight: number, letterSpacingPx: number): TextMetrics2 => {
  if (!ctx) ctx = document.createElement('canvas').getContext('2d');
  const c = ctx as CanvasRenderingContext2D & {letterSpacing?: string};
  c.font = `${weight} ${size}px ${FONT_FAMILY}`;
  c.letterSpacing = `${letterSpacingPx}px`;
  const m = c.measureText(text);
  const splits: number[] = [];
  const chars = [...text];
  for (let j = 0; j < chars.length - 1; j++) {
    const prefix = chars.slice(0, j + 1).join('');
    const withNext = chars.slice(0, j + 2).join('');
    const inkRightJ = c.measureText(prefix).actualBoundingBoxRight;
    const next = c.measureText(chars[j + 1]);
    const originNext = c.measureText(withNext).width - next.width;
    const inkLeftNext = originNext - next.actualBoundingBoxLeft;
    splits.push((inkRightJ + inkLeftNext) / 2);
  }
  return {
    inkLeft: -m.actualBoundingBoxLeft,
    inkRight: m.actualBoundingBoxRight,
    ascent: m.actualBoundingBoxAscent,
    descent: m.actualBoundingBoxDescent,
    splits,
  };
};
