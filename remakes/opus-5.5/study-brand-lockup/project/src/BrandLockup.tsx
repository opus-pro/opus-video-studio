import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {CANVAS, E, MARK, REVEAL_MASK, SHUTTER, WORD} from './geometry';

export type BrandLockupProps = {
  brand: string;
  background: string;
  ink: string;
  accent: string;
  symbol: {construction: 'four-capsule-union'; diameter: number; capsuleWidth: number};
  showWordmark: boolean;
};

export const defaultBrandLockupProps: BrandLockupProps = {
  brand: 'forma',
  background: '#eaf2f5',
  ink: '#17272f',
  accent: '#246b99',
  symbol: {construction: 'four-capsule-union', diameter: 130, capsuleWidth: 30},
  showWordmark: true,
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const ease = (frame: number, [a, b]: readonly [number, number], from: number, to: number) =>
  interpolate(frame, [a, b], [from, to], {...clamp, easing: E});

/** Horizontal center of the mark at a (possibly fractional) frame. */
const markX = (frame: number, travels: boolean) =>
  travels ? ease(frame, MARK.travelFrames, MARK.start.x, MARK.end.x) : MARK.start.x;

/**
 * Fit the word to the fixed 300px box: 48px unless the word is wider than the
 * box, then shrink proportionally, never below 25px. Single line always.
 */
const useFittedFontSize = (text: string) =>
  useMemo(() => {
    if (typeof document === 'undefined') return WORD.fontSize;
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return WORD.fontSize;
    ctx.font = `${WORD.fontWeight} ${WORD.fontSize}px ${WORD.fontFamily}`;
    const tracking = WORD.letterSpacingEm * WORD.fontSize * Math.max(0, [...text].length - 1);
    const width = ctx.measureText(text).width + tracking;
    if (width <= WORD.box.width) return WORD.fontSize;
    return Math.max(WORD.minFontSize, Math.floor((WORD.fontSize * WORD.box.width) / width));
  }, [text]);

/**
 * Eight-petal symbol: the solid union of four identical capsules. Authored in
 * a D x D space (D = diameter): a rounded rect (0, (D-W)/2, D, W, r = W/2),
 * plus copies rotated 45, 90 and 135 degrees about the center. The 90-degree
 * copy is the vertical capsule, so a lobe points straight up.
 */
const EightPetalMark: React.FC<{diameter: number; capsuleWidth: number; fill: string}> = ({
  diameter: D,
  capsuleWidth: W,
  fill,
}) => (
  <g fill={fill}>
    {[0, 45, 90, 135].map((angle) => (
      <rect
        key={angle}
        x={0}
        y={(D - W) / 2}
        width={D}
        height={W}
        rx={W / 2}
        ry={W / 2}
        transform={angle ? `rotate(${angle} ${D / 2} ${D / 2})` : undefined}
      />
    ))}
  </g>
);

export const BrandLockup: React.FC<BrandLockupProps> = (props) => {
  const {brand, background, ink, symbol, showWordmark} = {...defaultBrandLockupProps, ...props};
  const frame = useCurrentFrame();
  const fontSize = useFittedFontSize(brand);
  const travels = showWordmark;

  // --- Mark -------------------------------------------------------------
  const scale = ease(frame, MARK.scaleFrames, MARK.scaleFrom, MARK.scaleTo);
  const focusBlur = ease(frame, MARK.blurFrames, MARK.blurFrom, 0);
  const cx = markX(frame, travels);
  const cy = MARK.start.y;

  // Directional motion blur: the distance the mark covers while a 180-degree
  // shutter is open, turned into the equivalent Gaussian sigma of a box smear.
  const smear = Math.abs(markX(frame + SHUTTER / 2, travels) - markX(frame - SHUTTER / 2, travels));
  const motionSigma = smear / Math.sqrt(12);
  const sigmaX = Math.sqrt(focusBlur ** 2 + motionSigma ** 2);
  const sigmaY = focusBlur;
  const blurred = sigmaX > 0.05 || sigmaY > 0.05;

  const unit = (MARK.nominal * scale) / symbol.diameter;
  const markTransform = `translate(${cx} ${cy}) scale(${unit}) translate(${-symbol.diameter / 2} ${-symbol.diameter / 2})`;

  // --- Wordmark ---------------------------------------------------------
  const reveal = ease(frame, WORD.revealFrames, 0, 1);
  const wordBlur = WORD.blurFrom * (1 - reveal);
  const wordShift = WORD.shiftFrom * (1 - reveal);
  const wordSettled = reveal >= 1;

  // Right lobe tip of the mark, plus a soft edge: the word only exists to the
  // right of it, so it emerges from behind the icon and never sits under it.
  const tip = cx + (MARK.nominal * scale) / 2;
  const maskFrom = tip + REVEAL_MASK.gap;
  const maskTo = maskFrom + REVEAL_MASK.feather;
  const mask = `linear-gradient(to right, transparent ${maskFrom}px, #000 ${maskTo}px)`;

  return (
    <AbsoluteFill style={{backgroundColor: background}}>
      <svg
        width={CANVAS.width}
        height={CANVAS.height}
        viewBox={`0 0 ${CANVAS.width} ${CANVAS.height}`}
        style={{position: 'absolute', inset: 0}}
        shapeRendering="geometricPrecision"
      >
        {blurred ? (
          <defs>
            <filter
              id="mark-blur"
              filterUnits="userSpaceOnUse"
              x={0}
              y={0}
              width={CANVAS.width}
              height={CANVAS.height}
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur stdDeviation={`${sigmaX} ${sigmaY}`} edgeMode="none" />
            </filter>
          </defs>
        ) : null}
        {/* Filter group has no transform, so blur radii are canvas pixels. */}
        <g filter={blurred ? 'url(#mark-blur)' : undefined}>
          <g transform={markTransform}>
            <EightPetalMark diameter={symbol.diameter} capsuleWidth={symbol.capsuleWidth} fill={ink} />
          </g>
        </g>
      </svg>

      {showWordmark && reveal > 0 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            WebkitMaskImage: wordSettled ? undefined : mask,
            maskImage: wordSettled ? undefined : mask,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: WORD.box.x,
              top: WORD.box.y,
              width: WORD.box.width,
              height: WORD.box.height,
              display: 'flex',
              alignItems: 'center',
              fontFamily: WORD.fontFamily,
              fontWeight: WORD.fontWeight,
              fontSize,
              lineHeight: `${WORD.lineHeight}px`,
              whiteSpace: 'nowrap',
              color: ink,
              WebkitFontSmoothing: 'antialiased',
              textRendering: 'geometricPrecision',
              fontKerning: 'normal',
              letterSpacing: `${WORD.letterSpacingEm}em`,
              opacity: reveal,
              filter: wordBlur > 0.01 ? `blur(${wordBlur}px)` : undefined,
              transform: wordShift > 0.01 ? `translateX(${wordShift}px)` : undefined,
            }}
          >
            {brand}
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
