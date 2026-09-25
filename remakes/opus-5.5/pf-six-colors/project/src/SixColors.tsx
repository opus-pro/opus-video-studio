import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {bandEase, clamp01, textEase} from './easing';
import {FONT, TAG, TAG_TRACK, TAG_WEIGHT, TypeMetrics, useTypeMetrics, WORD, WORD_TRACK, WORD_WEIGHT} from './font';

// ---------------------------------------------------------------------------------------------
// Spec constants (60 fps timeline)
// ---------------------------------------------------------------------------------------------
const W = 1920;
const H = 1080;
const FPS = 60;
const BAND = 180; // 6 x 180 = 1080, the bands tile the frame exactly
const HALF = W / 2;

const BANDS = [
  {hex: '#173f36', name: 'PINE', ink: '#cfeb8d'},
  {hex: '#cfeb8d', name: 'LIME', ink: '#173f36'},
  {hex: '#f58870', name: 'CORAL', ink: '#1c2421'},
  {hex: '#c8dfea', name: 'AIR', ink: '#173f36'},
  {hex: '#f8f8f5', name: 'CHALK', ink: '#1c2421'},
  {hex: '#1c2421', name: 'INK', ink: '#f8f8f5'},
] as const;

const INK = '#1c2421';

// Intro: every band travels its full width into x = 0, 0.075 s apart, cubic-bezier(.5,0,0,1).
// The clock is offset so the first two bands are already mid-flight on frame 0 and band 03
// departs exactly on frame 0.
const STAGGER = 0.075 * FPS; // 4.5 frames
const SLIDE = 0.45 * FPS; // 27 frames per band
const introStart = (i: number) => (i - 2) * STAGGER;
const introX = (i: number, f: number) => W * (1 - bandEase((f - introStart(i)) / SLIDE));

// Push: 1.8 s - 2.45 s. The right half of band n moves left by n x 180 px (0, 180 ... 900),
// shearing the right edge into a 45-degree stair (180 px treads on 180 px risers).
const PUSH_START = 1.8 * FPS; // frame 108
const PUSH_END = 2.45 * FPS; // frame 147
const pushP = (f: number) => bandEase((f - PUSH_START) / (PUSH_END - PUSH_START));
const pushX = (i: number, f: number) => i * BAND * pushP(f);

// Brand lock-up: shifts 96 px left and settles at scale .9 on the same clock as the push.
const BRAND_SHIFT = 96;
const BRAND_SCALE = 0.9;

// FIELD: cap height 270 px, centred on the frame's horizontal midline (straddles CORAL / AIR).
const WORD_CAP = 270;
const WORD_BASELINE = H / 2 + WORD_CAP / 2; // 675
const WORD_START = 26;
const WORD_STAGGER = 4;
const WORD_DUR = 36;

// Tagline: optically centred inside the CHALK band.
const TAG_SIZE = 54;
// Centred in the CHALK band. The lock-up shifts and scales as one, but the tagline scales about
// its own line so it stays centred in its band both before and after the settle.
const TAG_CENTER_Y = 4 * BAND + BAND / 2; // 810
const TAG_START = 52;
const TAG_STAGGER = 6;
const TAG_DUR = 34;

// 180-degree shutter: blur spans half a frame of travel, centred on the sampled instant.
const SHUTTER = 0.5;
const boxToSigma = 1 / Math.sqrt(12);
const blurOf = (fn: (f: number) => number, f: number) =>
  Math.abs(fn(f + SHUTTER / 2) - fn(f - SHUTTER / 2)) * boxToSigma;

const MIN_BLUR = 0.06;

// ---------------------------------------------------------------------------------------------
// Bands
// ---------------------------------------------------------------------------------------------
const Label: React.FC<{i: number}> = ({i}) => {
  const b = BANDS[i];
  return (
    <div
      style={{
        position: 'absolute',
        left: 64,
        top: 0,
        height: BAND,
        display: 'flex',
        alignItems: 'center',
        gap: 22,
        color: b.ink,
        fontFamily: FONT,
        fontSize: 24,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        fontFeatureSettings: '"tnum" 1',
      }}
    >
      <span style={{fontWeight: 500, opacity: 0.62, letterSpacing: '0.04em'}}>{String(i + 1).padStart(2, '0')}</span>
      <span style={{fontWeight: 600, letterSpacing: '0.16em'}}>{b.name}</span>
    </div>
  );
};

const Band: React.FC<{i: number; f: number}> = ({i, f}) => {
  const b = BANDS[i];
  const x = introX(i, f);
  const introBlur = blurOf((t) => introX(i, t), f);
  const push = pushX(i, f);
  const pushBlur = blurOf((t) => pushX(i, t), f);
  // Seam shadow: only while the right sheet is travelling, so the push reads as one layer
  // sliding over another, and the rested frame stays perfectly flat.
  const speed = Math.abs(pushX(i, f + 0.5) - pushX(i, f - 0.5)); // px / frame
  const seam = clamp01(speed / 40) * (i === 5 ? 0.22 : 0.08);

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: i * BAND,
        width: W,
        height: BAND,
        transform: `translateX(${x}px)`,
        filter: introBlur > MIN_BLUR ? `url(#mb-band-${i})` : undefined,
        visibility: x >= W - 0.01 ? 'hidden' : 'visible',
      }}
    >
      <div style={{position: 'absolute', left: 0, top: 0, width: HALF + 1, height: BAND, background: b.hex}} />
      <div
        style={{
          position: 'absolute',
          left: HALF,
          top: 0,
          width: HALF,
          height: BAND,
          background: b.hex,
          transform: `translateX(${-push}px)`,
          filter: pushBlur > MIN_BLUR ? `url(#mb-push-${i})` : undefined,
        }}
      >
        {seam > 0 ? (
          <div
            style={{
              position: 'absolute',
              right: '100%',
              top: 0,
              width: 34,
              height: BAND,
              background: `linear-gradient(to left, rgba(8,14,12,${seam}), rgba(8,14,12,0))`,
            }}
          />
        ) : null}
      </div>
      <Label i={i} />
    </div>
  );
};

// Contact shadow of the whole stack on the ground plane. It sits under every band, so it
// only ever lands on exposed ground: the intro's leading edges and the stair after the push.
const GroundShadow: React.FC<{f: number}> = ({f}) => (
  <>
    {BANDS.map((_, i) => {
      const x = introX(i, f);
      if (x >= W - 0.01) return null;
      const width = W - pushX(i, f);
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            top: i * BAND,
            width,
            height: BAND,
            transform: `translateX(${x}px)`,
            boxShadow: '18px 10px 56px rgba(0, 0, 0, 0.55), 4px 2px 10px rgba(0, 0, 0, 0.35)',
          }}
        />
      );
    })}
  </>
);

// ---------------------------------------------------------------------------------------------
// Brand lock-up (SVG so baselines are exact)
// ---------------------------------------------------------------------------------------------
const wordRise = (k: number, f: number, dist: number) =>
  (1 - textEase((f - WORD_START - k * WORD_STAGGER) / WORD_DUR)) * dist;
const tagRise = (k: number, f: number, dist: number) =>
  (1 - textEase((f - TAG_START - k * TAG_STAGGER) / TAG_DUR)) * dist;

const TAG_WORDS = TAG.split(' ');

const Brand: React.FC<{f: number; m: TypeMetrics}> = ({f, m}) => {
  const wordSize = WORD_CAP / m.capRatio;
  const wordX = W / 2 - wordSize * ((m.wordInkLeft + m.wordInkRight) / 2);
  const wordRiseDist = WORD_CAP + 24;

  const tagCap = TAG_SIZE * m.capRatio;
  const tagBaseline = TAG_CENTER_Y + tagCap / 2;
  const tagX = W / 2 - TAG_SIZE * ((m.tagInkLeft + m.tagInkRight) / 2);
  const tagDesc = TAG_SIZE * m.descRatio;
  const tagRiseDist = tagCap + tagDesc + 18;

  const bp = pushP(f);
  const tx = -BRAND_SHIFT * bp;
  const sc = 1 + (BRAND_SCALE - 1) * bp;

  const letters = WORD.split('');
  const wordBlur = letters.map((_, k) => blurOf((t) => wordRise(k, t, wordRiseDist), f));
  const tagBlur = TAG_WORDS.map((_, k) => blurOf((t) => tagRise(k, t, tagRiseDist), f));

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
      <defs>
        <clipPath id="slot-word" clipPathUnits="userSpaceOnUse">
          <rect x={0} y={WORD_BASELINE - WORD_CAP - 80} width={W} height={WORD_CAP + 80 + 6} />
        </clipPath>
        <clipPath id="slot-tag" clipPathUnits="userSpaceOnUse">
          <rect x={0} y={tagBaseline - tagCap - 40} width={W} height={tagCap + 40 + tagDesc + 4} />
        </clipPath>
        {wordBlur.map((s, k) =>
          s > MIN_BLUR ? (
            <filter key={k} id={`mb-w-${k}`} x="-5%" y="-40%" width="110%" height="180%" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation={`0 ${s}`} />
            </filter>
          ) : null,
        )}
        {tagBlur.map((s, k) =>
          s > MIN_BLUR ? (
            <filter key={k} id={`mb-t-${k}`} x="-5%" y="-60%" width="110%" height="220%" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation={`0 ${s}`} />
            </filter>
          ) : null,
        )}
      </defs>
      <g transform={`translate(${HALF + tx} ${H / 2}) scale(${sc}) translate(${-HALF} ${-H / 2})`}>
        <g clipPath="url(#slot-word)">
          {letters.map((_, k) => {
            const dy = wordRise(k, f, wordRiseDist);
            if (dy >= wordRiseDist - 0.01) return null;
            return (
              <g key={k} transform={`translate(0 ${dy})`} filter={wordBlur[k] > MIN_BLUR ? `url(#mb-w-${k})` : undefined}>
                <text
                  x={wordX}
                  y={WORD_BASELINE}
                  fontFamily={FONT}
                  fontWeight={WORD_WEIGHT}
                  fontSize={wordSize}
                  letterSpacing={WORD_TRACK * wordSize}
                  fill={INK}
                >
                  {letters.map((ch, j) => (
                    <tspan key={j} fillOpacity={j === k ? 1 : 0}>
                      {ch}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}
        </g>
      </g>
      <g transform={`translate(${HALF + tx} ${TAG_CENTER_Y}) scale(${sc}) translate(${-HALF} ${-TAG_CENTER_Y})`}>
        <g clipPath="url(#slot-tag)">
          {TAG_WORDS.map((_, k) => {
            const dy = tagRise(k, f, tagRiseDist);
            if (dy >= tagRiseDist - 0.01) return null;
            return (
              <g key={k} transform={`translate(0 ${dy})`} filter={tagBlur[k] > MIN_BLUR ? `url(#mb-t-${k})` : undefined}>
                <text
                  x={tagX}
                  y={tagBaseline}
                  fontFamily={FONT}
                  fontWeight={TAG_WEIGHT}
                  fontSize={TAG_SIZE}
                  letterSpacing={TAG_TRACK * TAG_SIZE}
                  fill={INK}
                  style={{whiteSpace: 'pre'}}
                >
                  {TAG_WORDS.map((word, j) => (
                    <tspan key={j} fillOpacity={j === k ? 1 : 0}>
                      {j < TAG_WORDS.length - 1 ? `${word} ` : word}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}
        </g>
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------
// Motion-blur filter bank for the bands (horizontal only, so bands never bleed into neighbours)
// ---------------------------------------------------------------------------------------------
const BandFilters: React.FC<{f: number}> = ({f}) => (
  <svg width={0} height={0} style={{position: 'absolute'}} aria-hidden>
    <defs>
      {BANDS.map((_, i) => {
        const a = blurOf((t) => introX(i, t), f);
        const b = blurOf((t) => pushX(i, t), f);
        return (
          <React.Fragment key={i}>
            {a > MIN_BLUR ? (
              <filter id={`mb-band-${i}`} x="-20%" y="0%" width="140%" height="100%" colorInterpolationFilters="sRGB">
                <feGaussianBlur stdDeviation={`${a} 0`} />
              </filter>
            ) : null}
            {b > MIN_BLUR ? (
              <filter id={`mb-push-${i}`} x="-20%" y="0%" width="140%" height="100%" colorInterpolationFilters="sRGB">
                <feGaussianBlur stdDeviation={`${b} 0`} />
              </filter>
            ) : null}
          </React.Fragment>
        );
      })}
    </defs>
  </svg>
);

export const SixColors: React.FC = () => {
  const f = useCurrentFrame();
  const metrics = useTypeMetrics();

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(120% 90% at 62% 48%, #17211d 0%, #0d1311 55%, #080c0b 100%)',
        overflow: 'hidden',
      }}
    >
      <BandFilters f={f} />
      <GroundShadow f={f} />
      {BANDS.map((_, i) => (
        <Band key={i} i={i} f={f} />
      ))}
      {metrics ? <Brand f={f} m={metrics} /> : null}
    </AbsoluteFill>
  );
};
