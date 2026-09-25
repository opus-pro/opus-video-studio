import React, {useMemo} from 'react';
import {FONT_FAMILY, measureText} from './font';
import {CENTER_X, riseState, T, TILE, TILE_SCALE_END, TILE_Y_END} from './timing';

// Typography ------------------------------------------------------------------
const WORD = 'FORM';
const WORD_SIZE = 144;
const WORD_WEIGHT = 620;
const WORD_TRACK = -0.012 * WORD_SIZE;
const WORD_COLOR = '#F3F5F8';

const TAG = 'Make room for ideas.';
const TAG_SIZE = 32;
const TAG_WEIGHT = 420;
const TAG_TRACK = -0.004 * TAG_SIZE;
const TAG_COLOR = '#99A2AD';

// Vertical rhythm of the resting lockup (screen px).
const TILE_BOTTOM = TILE_Y_END + (TILE * TILE_SCALE_END) / 2; // 469.84
const GAP_TILE_TO_WORD = 70; // tile bottom -> cap top of FORM
const GAP_WORD_TO_TAG = 40; // FORM baseline -> ink top of the tagline

const RISE_WORD = 72;
const RISE_TAG = 40;

type Layout = {
  wordX: number;
  wordBaseline: number;
  wordSplits: number[];
  tagX: number;
  tagBaseline: number;
  wordHeight: number;
};

const useLayout = (): Layout =>
  useMemo(() => {
    const w = measureText(WORD, WORD_SIZE, WORD_WEIGHT, WORD_TRACK);
    const tg = measureText(TAG, TAG_SIZE, TAG_WEIGHT, TAG_TRACK);
    // Centre on ink, not advance width, and snap origins to whole pixels.
    const wordX = Math.round(CENTER_X - (w.inkLeft + w.inkRight) / 2);
    const tagX = Math.round(CENTER_X - (tg.inkLeft + tg.inkRight) / 2);
    const wordBaseline = Math.round(TILE_BOTTOM + GAP_TILE_TO_WORD + w.ascent);
    const tagBaseline = Math.round(wordBaseline + GAP_WORD_TO_TAG + tg.ascent);
    return {wordX, wordBaseline, wordSplits: w.splits, tagX, tagBaseline, wordHeight: w.ascent + w.descent};
  }, []);

const textProps = (size: number, weight: number, track: number, color: string) => ({
  fontFamily: FONT_FAMILY,
  fontSize: size,
  fontWeight: weight,
  letterSpacing: track,
  fill: color,
  style: {fontKerning: 'normal' as const, textRendering: 'geometricPrecision' as const},
});

/** Vertical-only Gaussian: blur along the direction of travel. */
const VBlur: React.FC<{id: string; sigma: number}> = ({id, sigma}) => (
  <filter id={id} x="-10%" y="-120%" width="120%" height="340%">
    <feGaussianBlur stdDeviation={`0 ${sigma}`} />
  </filter>
);

export const Wordmark: React.FC<{t: number; width: number; height: number}> = ({t, width, height}) => {
  const L = useLayout();
  const letters = [...WORD];
  const bounds = [-4000, ...L.wordSplits, 4000];

  const tag = riseState(t, T.tagStart, T.tagDur, RISE_TAG, 0.8);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{position: 'absolute', inset: 0}}>
      <defs>
        {letters.map((_, j) => (
          // Each layer draws the full, properly kerned word and is clipped to one glyph's column.
          <clipPath key={j} id={`col-${j}`} clipPathUnits="userSpaceOnUse">
            <rect x={L.wordX + bounds[j]} y={-2000} width={bounds[j + 1] - bounds[j]} height={6000} />
          </clipPath>
        ))}
      </defs>
      {letters.map((_, j) => {
        const s = riseState(t, T.wordStart + j * T.letterStagger, T.wordDur, RISE_WORD, 0.9);
        if (s.opacity <= 0) return null;
        const fid = `vb-word-${j}`;
        const blurred = s.blur > 0.04;
        return (
          <g key={j} clipPath={`url(#col-${j})`}>
            {blurred ? (
              <defs>
                <VBlur id={fid} sigma={s.blur} />
              </defs>
            ) : null}
            <g opacity={s.opacity} filter={blurred ? `url(#${fid})` : undefined}>
              <text
                x={L.wordX}
                y={L.wordBaseline + s.dy}
                {...textProps(WORD_SIZE, WORD_WEIGHT, WORD_TRACK, WORD_COLOR)}
              >
                {WORD}
              </text>
            </g>
          </g>
        );
      })}
      {tag.opacity > 0 ? (
        <g>
          {tag.blur > 0.04 ? (
            <defs>
              <VBlur id="vb-tag" sigma={tag.blur} />
            </defs>
          ) : null}
          <g opacity={tag.opacity} filter={tag.blur > 0.04 ? 'url(#vb-tag)' : undefined}>
            <text x={L.tagX} y={L.tagBaseline + tag.dy} {...textProps(TAG_SIZE, TAG_WEIGHT, TAG_TRACK, TAG_COLOR)}>
              {TAG}
            </text>
          </g>
        </g>
      ) : null}
    </svg>
  );
};
