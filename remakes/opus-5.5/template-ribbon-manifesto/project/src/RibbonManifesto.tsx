import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {E, S, brakeTail, lerp, progress} from './motion';
import {SANS, SERIF, fitOneLine} from './measure';

export type RibbonManifestoProps = {
  phrases: [string, string, string];
  closing: string;
  brand: string;
  cta: string;
};

export const defaultRibbonProps: RibbonManifestoProps = {
  phrases: ['Be heard', 'Make noise', 'Move people'],
  closing: 'Say it in color.',
  brand: 'Common Signal',
  cta: 'Join the campaign',
};

// ---------------------------------------------------------------------------
// Palette: one pale field, three flat primaries.
const FIELD = '#F3EFE6';
const INK = '#17161D';

type RowSpec = {
  y0: number; // diagonal center y
  rot0: number; // diagonal rotation (deg)
  enterDx: number; // entrance x offset
  dir: -1 | 1; // text flow direction (-1 = left)
  speed: number; // px / frame
  yEnd: number; // compact center y
  defaultWidth: number; // compact width for the default phrase
  bg: string;
  fg: string;
  z: number;
};

const ROWS: RowSpec[] = [
  {y0: 121, rot0: -5, enterDx: -180, dir: -1, speed: 3.6, yEnd: 133, defaultWidth: 424, bg: '#F2461F', fg: '#FFF4E6', z: 1},
  {y0: 270, rot0: 4, enterDx: 180, dir: 1, speed: 4.2, yEnd: 254, defaultWidth: 522, bg: '#2B3FE4', fg: '#F7F2E8', z: 3},
  {y0: 403, rot0: -4, enterDx: -180, dir: -1, speed: 3.9, yEnd: 375, defaultWidth: 580, bg: '#FFC82C', fg: INK, z: 2},
];

// Geometry
const CX = 480;
const RIBBON_W = 1480;
const RIBBON_H = 102;
const COMPACT_H = 104;
const LINE_H = 102;
const BAND_FONT = 87;
const BAND_FONT_MIN = 44;
const GAP = 82; // gap between repeats
const PAD = 26; // compact horizontal padding
const COMPACT_MAX = 780;
const SLIVER_FADE_PX = 64; // a cropped repeat narrower than this dissolves

const smoothstep = (t: number) => {
  const c = t < 0 ? 0 : t > 1 ? 1 : t;
  return c * c * (3 - 2 * c);
};

// Timing (frames)
const ENTER_DUR = 11;
const OPACITY_DUR = 5;
const BRAKE_START = 96;
const ROW_STAGGER = 3;
const BRAKE_DUR = 18; // rows 96-114, 99-117, 102-120
const CROP_START = 108;
const CROP_DUR = 20; // 108-128
const LEFTOVER_FADE_START = 120; // last 8 frames of the crop
const LEFTOVER_FADE_DUR = 8;
const EXIT_START = 166;
const EXIT_DUR = 9; // rows 166-175, 169-178, 172-181
const EXIT_RISE = 58;
const CLOSE_START = 179;
const CLOSE_DUR = 16; // 179-195
const FOOT_START = 201;
const FOOT_DUR = 12; // 201-213

type RowLayout = {
  phrase: string;
  fontSize: number;
  textW: number;
  period: number;
  compactW: number;
};

const layoutRow = (phrase: string, spec: RowSpec, isDefault: boolean): RowLayout => {
  const fit = fitOneLine(phrase, COMPACT_MAX - 2 * PAD, BAND_FONT, BAND_FONT_MIN, SANS);
  const measuredCompact = Math.min(COMPACT_MAX, fit.width + 2 * PAD);
  return {
    phrase,
    fontSize: fit.fontSize,
    textW: fit.width,
    period: fit.width + GAP,
    compactW: isDefault ? spec.defaultWidth : measuredCompact,
  };
};

/**
 * Signed offset of the "hero" copy (k = 0) from the ribbon center, along the
 * ribbon axis. It is the remaining travel of the train, so the hero copy lands
 * exactly on center when the E-based brake reaches zero velocity: no snapping.
 */
const trainOffset = (frame: number, spec: RowSpec, index: number) => {
  const brakeStart = BRAKE_START + ROW_STAGGER * index;
  let remaining: number;
  if (frame < brakeStart) {
    remaining = spec.speed * (brakeStart - frame) + spec.speed * BRAKE_DUR * brakeTail(0);
  } else {
    remaining = spec.speed * BRAKE_DUR * brakeTail((frame - brakeStart) / BRAKE_DUR);
  }
  return -spec.dir * remaining;
};

const Ribbon: React.FC<{frame: number; spec: RowSpec; index: number; layout: RowLayout}> = ({
  frame,
  spec,
  index,
  layout,
}) => {
  // Entrance
  const enter = E(progress(frame, 0, ENTER_DUR));
  const dx = spec.enterDx * (1 - enter);
  const blur = 7 * (1 - enter);
  const enterOpacity = lerp(0.5, 1, E(progress(frame, 0, OPACITY_DUR)));

  // Re-orientation (same staggered window as the brake)
  const turn = S(progress(frame, BRAKE_START + ROW_STAGGER * index, BRAKE_DUR));
  const rot = spec.rot0 * (1 - turn);
  const cy = lerp(spec.y0, spec.yEnd, turn);

  // Crop to the compact label
  const crop = E(progress(frame, CROP_START, CROP_DUR));
  const w = lerp(RIBBON_W, layout.compactW, crop);
  const h = lerp(RIBBON_H, COMPACT_H, crop);
  const leftover = 1 - S(progress(frame, LEFTOVER_FADE_START, LEFTOVER_FADE_DUR));

  // Exit
  const exit = S(progress(frame, EXIT_START + ROW_STAGGER * index, EXIT_DUR));
  const dy = -EXIT_RISE * exit;
  const opacity = enterOpacity * (1 - exit);
  const exitBlur = 2.4 * exit; // soft dissolve while the label lifts away
  if (opacity <= 0.001) return null;

  // Text train
  const offset = trainOffset(frame, spec, index);
  const P = layout.period;
  const reach = w / 2 + layout.textW / 2;
  const kMin = Math.ceil((-reach - offset) / P) - 1;
  const kMax = Math.floor((reach - offset) / P) + 1;
  const copies: React.ReactNode[] = [];
  for (let k = kMin; k <= kMax; k++) {
    const center = offset + k * P;
    const hero = k === 0;
    // Leftover repeats fade over the last 8 crop frames; while the crop edge is
    // closing in, a repeat that has shrunk to a thin sliver also dissolves so no
    // hairline glyph fragments flash at the label edges.
    let o = hero ? 1 : leftover;
    if (!hero && w < RIBBON_W) {
      const visible = Math.min(center + layout.textW / 2, w / 2) - Math.max(center - layout.textW / 2, -w / 2);
      o *= smoothstep(visible / SLIVER_FADE_PX);
    }
    if (o <= 0.001) continue;
    copies.push(
      <div
        key={k}
        style={{
          position: 'absolute',
          left: w / 2 + center - layout.textW / 2,
          top: (h - LINE_H) / 2,
          width: layout.textW,
          height: LINE_H,
          lineHeight: `${LINE_H}px`,
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: layout.fontSize,
          whiteSpace: 'nowrap',
          color: spec.fg,
          opacity: o,
          textAlign: 'center',
        }}
      >
        {layout.phrase}
      </div>,
    );
  }

  const transforms: string[] = [];
  if (Math.abs(dx) > 1e-4 || Math.abs(dy) > 1e-4) transforms.push(`translate(${dx}px, ${dy}px)`);
  if (Math.abs(rot) > 1e-4) transforms.push(`rotate(${rot}deg)`);

  return (
    <div
      style={{
        position: 'absolute',
        left: CX - w / 2,
        top: cy - h / 2,
        width: w,
        height: h,
        background: spec.bg,
        overflow: 'hidden',
        opacity,
        transform: transforms.length ? transforms.join(' ') : undefined,
        filter: blur + exitBlur > 0.02 ? `blur(${blur + exitBlur}px)` : undefined,
        zIndex: spec.z,
      }}
    >
      {copies}
    </div>
  );
};

const Arrow: React.FC<{x: number; cy: number; size: number; color: string}> = ({x, cy, size, color}) => {
  const head = size * 0.38;
  const tip = x + size - 0.9;
  return (
    <path
      d={`M${x} ${cy} H${tip - 0.6} M${tip - head} ${cy - head} L${tip} ${cy} L${tip - head} ${cy + head}`}
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="butt"
      strokeLinejoin="miter"
    />
  );
};

export const RibbonManifesto: React.FC<RibbonManifestoProps> = ({phrases, closing, brand, cta}) => {
  const frame = useCurrentFrame();

  const layouts = useMemo(
    () => ROWS.map((spec, i) => layoutRow(phrases[i], spec, phrases[i] === defaultRibbonProps.phrases[i])),
    [phrases],
  );

  const closingFit = useMemo(() => fitOneLine(closing, 810, 78, 42, SERIF), [closing]);
  const closingLine = (90 * closingFit.fontSize) / 78;
  // A single vermilion full stop ties the serif sign-off back to the ribbons.
  const markMatch = /[.!?]$/.exec(closing);
  const closingMark = markMatch ? markMatch[0] : '';
  const closingBody = markMatch ? closing.slice(0, -1) : closing;

  // Closing sentence
  const c = E(progress(frame, CLOSE_START, CLOSE_DUR));
  const closingVisible = frame >= CLOSE_START;

  // Footer
  const g = E(progress(frame, FOOT_START, FOOT_DUR));
  const footVisible = frame >= FOOT_START;

  return (
    <AbsoluteFill style={{backgroundColor: FIELD, overflow: 'hidden'}}>
      {ROWS.map((spec, i) => (
        <Ribbon key={i} frame={frame} spec={spec} index={i} layout={layouts[i]} />
      ))}

      {closingVisible ? (
        <div
          style={{
            position: 'absolute',
            left: 75,
            top: 210,
            width: 810,
            height: 108,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: c,
            transform: c < 1 ? `translateY(${22 * (1 - c)}px)` : undefined,
            filter: c < 0.995 ? `blur(${8 * (1 - c)}px)` : undefined,
            zIndex: 5,
          }}
        >
          <span
            style={{
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: closingFit.fontSize,
              lineHeight: `${closingLine}px`,
              whiteSpace: 'nowrap',
              color: INK,
              letterSpacing: 0,
            }}
          >
            {closingBody}
            {closingMark ? <span style={{color: ROWS[0].bg}}>{closingMark}</span> : null}
          </span>
        </div>
      ) : null}

      {footVisible ? (
        <svg
          width={960}
          height={540}
          viewBox="0 0 960 540"
          style={{position: 'absolute', left: 0, top: 0, zIndex: 6, opacity: g}}
        >
          <g transform={g < 1 ? `translate(0 ${8 * (1 - g)})` : undefined}>
            <text x={96} y={490} fontFamily={SANS} fontWeight={700} fontSize={18} fill={INK}>
              {brand}
            </text>
            <text x={838} y={490} textAnchor="end" fontFamily={SANS} fontWeight={400} fontSize={15} fill={INK}>
              {cta}
            </text>
            <Arrow x={853} cy={485} size={14} color={INK} />
          </g>
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};
