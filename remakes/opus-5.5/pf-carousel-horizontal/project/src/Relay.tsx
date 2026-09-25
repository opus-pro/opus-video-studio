import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ensureFont, FONT_FAMILY} from './font';
import {FOOTER_H, IMAGE_H, POSTER_H, POSTER_W, POSTERS, type PosterData} from './posters';
import {motionBlurAt, relayPosition} from './timing';

ensureFont();

const BG = '#ebeeeb';
const HERO_X = 600;
const HERO_Y = 600;
const SPACING = 690;
const NEIGHBOR_SCALE = 0.78;
const PARALLAX = 64; // px the photo drifts inside its frame per poster step
const BLEED = 120; // extra photo width on each side to absorb the parallax
const FILTER_ID = 'relay-motion-blur';

const Poster: React.FC<{data: PosterData; index: number; offset: number; blur: number}> = ({
  data,
  index,
  offset,
  blur,
}) => {
  const dist = Math.abs(offset);
  const x = HERO_X + SPACING * offset;
  const scale = interpolate(dist, [0, 1], [1, NEIGHBOR_SCALE], {extrapolateRight: 'clamp'});
  // Photo lags behind its frame a little: the frame moves, the view drifts.
  const drift = -PARALLAX * Math.max(-1.6, Math.min(1.6, offset));
  // Depth: the hero lifts off the page, neighbors sit closer to it.
  const lift = interpolate(dist, [0, 1], [1, 0.45], {extrapolateRight: 'clamp'});
  // Atmospheric depth: posters off the hero slot sink slightly into the page.
  const wash = interpolate(dist, [0, 1], [0, 0.12], {extrapolateRight: 'clamp'});

  const shadow = [
    `0 1px 2px rgba(22, 34, 26, ${0.08 * lift})`,
    `0 10px 22px -8px rgba(22, 34, 26, ${0.18 * lift})`,
    `0 38px 70px -26px rgba(22, 34, 26, ${0.34 * lift})`,
  ].join(', ');

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: POSTER_W,
        height: POSTER_H,
        transform: `translate(${x - POSTER_W / 2}px, ${HERO_Y - POSTER_H / 2}px)`,
        filter: blur > 0.01 ? `url(#${FILTER_ID})` : undefined,
        zIndex: Math.round(1000 - dist * 100),
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${scale})`,
          transformOrigin: '50% 50%',
          borderRadius: 6,
          overflow: 'hidden',
          boxShadow: shadow,
        }}
      >
        {/* Photo runs 2px under the footer so no seam can open between them at fractional scales. */}
        <div style={{position: 'absolute', left: 0, top: 0, width: POSTER_W, height: IMAGE_H + 2, overflow: 'hidden'}}>
          <Img
            src={staticFile(`assets/${data.image}`)}
            style={{
              position: 'absolute',
              top: 0,
              left: -BLEED + drift,
              width: POSTER_W + BLEED * 2,
              height: IMAGE_H + 2 + (data.cropBottom ?? 0),
              objectFit: 'cover',
              objectPosition: `${data.focus[0]}% ${data.focus[1]}%`,
            }}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: IMAGE_H,
            width: POSTER_W,
            height: FOOTER_H,
            backgroundColor: data.footer,
            color: data.ink,
            fontFamily: `${FONT_FAMILY}, sans-serif`,
            boxSizing: 'border-box',
            padding: '28px 36px 34px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 7,
              fontSize: 15,
              fontWeight: 550,
              letterSpacing: '0.03em',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1,
            }}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            <span style={{opacity: 0.5}}>/</span>
            <span style={{opacity: 0.5}}>{String(POSTERS.length).padStart(2, '0')}</span>
          </div>
          <div
            style={{
              fontSize: 50,
              fontWeight: 620,
              letterSpacing: '-0.036em',
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            {data.title}
          </div>
        </div>
        {/* Hairline keeps pale footers crisp against the page. */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 6,
            boxShadow: 'inset 0 0 0 1px rgba(20, 32, 26, 0.07)',
          }}
        />
        {wash > 0.001 ? (
          <div style={{position: 'absolute', inset: 0, backgroundColor: BG, opacity: wash}} />
        ) : null}
      </div>
    </div>
  );
};

export const Relay: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const p = relayPosition(t);
  const blur = motionBlurAt(t);

  return (
    <AbsoluteFill style={{backgroundColor: BG, overflow: 'hidden'}}>
      <svg width={0} height={0} style={{position: 'absolute'}} aria-hidden>
        <defs>
          <filter
            id={FILTER_ID}
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation={`${blur.toFixed(3)} 0`} />
          </filter>
        </defs>
      </svg>
      {POSTERS.map((data, i) => {
        const offset = i - p;
        if (Math.abs(offset) > 2.2) return null;
        return <Poster key={data.image} data={data} index={i} offset={offset} blur={blur} />;
      })}
    </AbsoluteFill>
  );
};
