import {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';

export const FONT = 'Geist';

export type TypeMetrics = {
  // Ratios per 1px of font-size, measured from the real glyph outlines.
  capRatio: number;
  descRatio: number;
  // Ink box of the tracked wordmark relative to its text origin, per 1px font-size.
  wordInkLeft: number;
  wordInkRight: number;
  tagInkLeft: number;
  tagInkRight: number;
};

export const WORD = 'FIELD';
export const WORD_WEIGHT = 700;
export const WORD_TRACK = -0.03; // em
export const TAG = 'A fresh perspective.';
export const TAG_WEIGHT = 500;
export const TAG_TRACK = -0.012; // em

let facePromise: Promise<FontFace> | null = null;
const loadFace = () => {
  if (!facePromise) {
    const face = new FontFace(FONT, `url(${staticFile('assets/GeistVF.woff2')}) format('woff2')`, {
      weight: '100 900',
      style: 'normal',
    });
    facePromise = face.load().then((f) => {
      document.fonts.add(f);
      return f;
    });
  }
  return facePromise;
};

const measure = (): TypeMetrics => {
  const ctx = document.createElement('canvas').getContext('2d')!;
  const size = 200;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  ctx.font = `${WORD_WEIGHT} ${size}px ${FONT}`;
  const capRatio = ctx.measureText('FIELDH').actualBoundingBoxAscent / size;
  (ctx as unknown as {letterSpacing: string}).letterSpacing = `${WORD_TRACK * size}px`;
  const w = ctx.measureText(WORD);

  ctx.font = `${TAG_WEIGHT} ${size}px ${FONT}`;
  (ctx as unknown as {letterSpacing: string}).letterSpacing = `${TAG_TRACK * size}px`;
  const t = ctx.measureText(TAG);
  const descRatio = ctx.measureText('p').actualBoundingBoxDescent / size;

  return {
    capRatio,
    descRatio,
    wordInkLeft: -w.actualBoundingBoxLeft / size,
    wordInkRight: w.actualBoundingBoxRight / size,
    tagInkLeft: -t.actualBoundingBoxLeft / size,
    tagInkRight: t.actualBoundingBoxRight / size,
  };
};

export const useTypeMetrics = (): TypeMetrics | null => {
  const [handle] = useState(() => delayRender('Loading Geist'));
  const [metrics, setMetrics] = useState<TypeMetrics | null>(null);

  useEffect(() => {
    let alive = true;
    loadFace()
      .then(() => document.fonts.ready)
      .then(() => {
        if (alive) setMetrics(measure());
      })
      .catch((err) => {
        console.error(err);
        continueRender(handle);
      });
    return () => {
      alive = false;
    };
  }, [handle]);

  useEffect(() => {
    if (metrics) continueRender(handle);
  }, [metrics, handle]);

  return metrics;
};
