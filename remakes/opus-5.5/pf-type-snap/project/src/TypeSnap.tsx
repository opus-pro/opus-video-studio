import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {cappedTravel, clamp01, cubicBezier, snapProgress} from './easing';
import {ensureFont, FONT_FAMILY} from './font';

ensureFont();

// ---------------------------------------------------------------- palette
const BG = '#181b1c';
const INK = '#eef0ea';
const MUTED = '#8d938f';
const ACCENT = '#c9ef8a';
const RULE = 'rgba(238, 240, 234, 0.055)';
const RULE_STRONG = 'rgba(238, 240, 234, 0.14)';

// ---------------------------------------------------------------- layout
const W = 1080;
const H = 1350;
const MARGIN = 72;
const ROW_H = 160;
const ROWS = 3;
const ROWS_TOP = Math.round((H - ROW_H * ROWS) / 2);
const FONT_SIZE = 160;
const TEXT_NUDGE_Y = 0; // optical centering of caps inside a 160px row

// ---------------------------------------------------------------- timing (seconds)
const ENTER_DIST = 1400;
const ENTER_OVERSHOOT = 24;
const ENTER_STAGGER = 0.09;
const ENTER_DUR = 0.8 - ENTER_STAGGER * (ROWS - 1); // last word rests exactly at 0.8s
const enter = cappedTravel(cubicBezier(0.18, 0.9, 0.24, 1.13), ENTER_DIST, ENTER_OVERSHOOT);

const SWAP_START = 1.85;
const SWAP_END = 2.35;
const SWAP_STAGGER = 0.07;
const SWAP_DUR = SWAP_END - SWAP_START - SWAP_STAGGER * (ROWS - 1); // last row lands exactly at 2.35s
const SWAP_DIST = 1220;
const SWAP_OVERSHOOT = 14;
const swapEase = snapProgress(cubicBezier(0.45, 0, 0.15, 1), SWAP_OVERSHOOT / SWAP_DIST, 0.8);

type Word = {text: string; accent?: boolean};
const SET_A: Word[] = [{text: 'MAKE'}, {text: 'SOMETHING'}, {text: 'MATTER.', accent: true}];
const SET_B: Word[] = [{text: 'IDEAS'}, {text: 'INTO'}, {text: 'ACTION.', accent: true}];

const swapU = (row: number, t: number) => clamp01((t - SWAP_START - row * SWAP_STAGGER) / SWAP_DUR + 1e-9);

// Horizontal offsets (px from the rest position) as a function of time.
const setAOffset = (row: number, t: number) => {
  if (t < SWAP_START + row * SWAP_STAGGER) return enter.fn((t - row * ENTER_STAGGER) / ENTER_DUR);
  return -SWAP_DIST * swapEase(swapU(row, t));
};
const setBOffset = (row: number, t: number) => SWAP_DIST * (1 - swapEase(swapU(row, t)));

// Motion styling from per-frame velocity (px/frame): a directional blur plus a
// scaleX smear. The smear is a fixed pixel length (like a shutter streak), so
// long and short words stretch by the same amount instead of the same ratio.
const motionFor = (velocity: number, width: number) => {
  const speed = Math.abs(velocity);
  const blur = Math.min(28, speed * 0.22);
  const smearPx = Math.min(84, speed * 0.85);
  const scaleX = 1 + smearPx / Math.max(1, width);
  return {blur: blur < 0.35 ? 0 : blur, scaleX: smearPx < 0.6 ? 1 : scaleX};
};

const REST = {blur: 0, scaleX: 1};

const HEAD_WEIGHT = 760;
const HEAD_TRACKING = -0.045; // em

let measureCtx: CanvasRenderingContext2D | null = null;
const measureWord = (text: string) => {
  if (typeof document === 'undefined') return text.length * FONT_SIZE * 0.62;
  if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
  if (!measureCtx) return text.length * FONT_SIZE * 0.62;
  measureCtx.font = `${HEAD_WEIGHT} ${FONT_SIZE}px ${FONT_FAMILY}`;
  // CSS letter-spacing is added after every glyph; the last one is trailing space.
  return measureCtx.measureText(text).width + HEAD_TRACKING * FONT_SIZE * (text.length - 1);
};

const BlurDefs: React.FC<{blurs: Record<string, number>}> = ({blurs}) => (
  <svg width={0} height={0} style={{position: 'absolute'}} aria-hidden>
    <defs>
      {Object.entries(blurs).map(([id, sigma]) => (
        <filter key={id} id={id} x="-60%" y="-10%" width="220%" height="120%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation={`${sigma.toFixed(2)} 0`} />
        </filter>
      ))}
    </defs>
  </svg>
);

const WordEl: React.FC<{
  word: Word;
  offset: number;
  blur: number;
  scaleX: number;
  filterId: string;
  mask?: string;
}> = ({word, offset, blur, scaleX, filterId, mask}) => {
  const atRest = Math.abs(offset) < 0.01 && blur === 0 && scaleX === 1;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: W,
        height: ROW_H,
        WebkitMaskImage: mask,
        maskImage: mask,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: MARGIN,
          top: TEXT_NUDGE_Y,
          height: ROW_H,
          lineHeight: `${ROW_H}px`,
          fontFamily: FONT_FAMILY,
          fontSize: FONT_SIZE,
          fontWeight: HEAD_WEIGHT,
          letterSpacing: `${HEAD_TRACKING}em`,
          whiteSpace: 'nowrap',
          color: word.accent ? ACCENT : INK,
          transform: atRest ? 'none' : `translateX(${offset.toFixed(3)}px) scaleX(${scaleX.toFixed(4)})`,
          transformOrigin: '0% 50%',
          filter: blur > 0 ? `url(#${filterId})` : 'none',
        }}
      >
        {word.text}
      </div>
    </div>
  );
};

// Seam feather: outgoing fades out just left of the seam, incoming fades in
// just right of it. The two ramps never share a pixel column.
const SEAM_GAP = 3;
const SEAM_FEATHER = 26;
const outgoingMask = (seam: number) =>
  `linear-gradient(90deg, #000 0px, #000 ${(seam - SEAM_GAP - SEAM_FEATHER).toFixed(2)}px, transparent ${(seam - SEAM_GAP).toFixed(2)}px)`;
const incomingMask = (seam: number) =>
  `linear-gradient(90deg, transparent 0px, transparent ${(seam + SEAM_GAP).toFixed(2)}px, #000 ${(seam + SEAM_GAP + SEAM_FEATHER).toFixed(2)}px)`;

export const TypeSnap: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const dt = 1 / fps;

  const blurs: Record<string, number> = {};
  const rows = [0, 1, 2].map((row) => {
    const aWidth = measureWord(SET_A[row].text);
    const bWidth = measureWord(SET_B[row].text);
    const aOff = setAOffset(row, t);
    const bOff = setBOffset(row, t);
    // A word that has reached its rest time is exactly at rest: no smear, no blur.
    const aResting =
      t < SWAP_START + row * SWAP_STAGGER && t - row * ENTER_STAGGER >= ENTER_DUR - 1e-9;
    const bResting = swapU(row, t) >= 1;
    const aMotion = aResting ? REST : motionFor(aOff - setAOffset(row, t - dt), aWidth);
    const bMotion = bResting ? REST : motionFor(bOff - setBOffset(row, t - dt), bWidth);
    const aId = `mb-a${row}`;
    const bId = `mb-b${row}`;
    if (aMotion.blur > 0) blurs[aId] = aMotion.blur;
    if (bMotion.blur > 0) blurs[bId] = bMotion.blur;
    const swapping = t >= SWAP_START + row * SWAP_STAGGER;
    const settled = swapU(row, t) >= 1;
    const outRight = MARGIN + aOff + aWidth * aMotion.scaleX;
    const inLeft = MARGIN + bOff;
    return {
      row,
      aOff,
      bOff,
      aMotion,
      bMotion,
      aId,
      bId,
      swapping,
      settled,
      seam: (outRight + inLeft) / 2,
      showA: !settled && outRight + aMotion.blur * 3 > 0,
    };
  });

  return (
    <AbsoluteFill style={{backgroundColor: BG, fontFamily: FONT_FAMILY}}>
      <BlurDefs blurs={blurs} />
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse 85% 75% at 40% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.28) 100%)',
        }}
      />

      {/* Fixed chrome */}
      <div style={{position: 'absolute', left: MARGIN, top: 92, display: 'flex', alignItems: 'center', gap: 16}}>
        <div style={{width: 14, height: 14, borderRadius: 7, backgroundColor: ACCENT}} />
        <div style={{fontSize: 30, fontWeight: 700, letterSpacing: '0.18em', color: INK, lineHeight: '36px'}}>
          FIELD DAYS
        </div>
      </div>
      <div style={{position: 'absolute', left: MARGIN, top: 158, width: W - MARGIN * 2, height: 1, backgroundColor: RULE_STRONG}} />
      <div
        style={{position: 'absolute', left: MARGIN, bottom: 158, width: W - MARGIN * 2, height: 1, backgroundColor: RULE_STRONG}}
      />
      <div
        style={{
          position: 'absolute',
          left: MARGIN,
          bottom: 92,
          fontSize: 30,
          fontWeight: 560,
          letterSpacing: '0.12em',
          color: MUTED,
          lineHeight: '36px',
          whiteSpace: 'pre',
        }}
      >
        <span style={{color: INK}}>OCT 24-25</span>
        {' / SAN FRANCISCO'}
      </div>

      {/* Row guides */}
      {[0, 1, 2, 3].map((k) => (
        <div
          key={k}
          style={{position: 'absolute', left: 0, top: ROWS_TOP + k * ROW_H, width: W, height: 1, backgroundColor: RULE}}
        />
      ))}

      {/* Row region: masked to its bounds; each 160px row is its own window */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: ROWS_TOP,
          width: W,
          height: ROW_H * ROWS,
          overflow: 'hidden',
        }}
      >
        {rows.map(({row, aOff, bOff, aMotion, bMotion, aId, bId, swapping, settled, seam, showA}) => (
          <div
            key={row}
            style={{position: 'absolute', left: 0, top: row * ROW_H, width: W, height: ROW_H, overflow: 'hidden'}}
          >
            {showA ? (
              <WordEl
                word={SET_A[row]}
                offset={aOff}
                blur={aMotion.blur}
                scaleX={aMotion.scaleX}
                filterId={aId}
                mask={swapping ? outgoingMask(seam) : undefined}
              />
            ) : null}
            {swapping ? (
              <WordEl
                word={SET_B[row]}
                offset={bOff}
                blur={bMotion.blur}
                scaleX={bMotion.scaleX}
                filterId={bId}
                mask={settled || !showA ? undefined : incomingMask(seam)}
              />
            ) : null}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
