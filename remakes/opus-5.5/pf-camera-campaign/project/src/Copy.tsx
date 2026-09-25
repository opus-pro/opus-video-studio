import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FONT} from './font';
import {clampInterp, ease} from './timeline';

const WHITE = '#F5F6F8';
const SHADOW = '0 1px 2px rgba(0,0,0,0.18), 0 2px 22px rgba(0,0,0,0.22)';
const SILVER = 'rgba(232, 235, 240, 0.80)';

// Masked line reveal: rises out of its own line box, sharpening as it lands.
const Line: React.FC<{
  at: number;
  dur?: number;
  rise?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  trackFrom?: number;
  trackTo?: number;
}> = ({at, dur = 26, rise = 0.9, children, style, trackFrom, trackTo}) => {
  const frame = useCurrentFrame();
  const p = clampInterp(frame, [at, at + dur], [0, 1], ease.out);
  const o = clampInterp(frame, [at, at + dur * 0.55], [0, 1], ease.outCubic);
  const blur = clampInterp(frame, [at, at + dur * 0.6], [6, 0], ease.outCubic);
  const ls =
    trackFrom !== undefined && trackTo !== undefined
      ? `${trackFrom + (trackTo - trackFrom) * p}em`
      : undefined;
  const settled = p >= 0.999;
  return (
    <div style={{overflow: settled ? 'visible' : 'hidden', paddingBottom: '0.08em', marginBottom: '-0.08em'}}>
      <div
        style={{
          ...style,
          letterSpacing: ls ?? style?.letterSpacing,
          opacity: o,
          transform: settled ? undefined : `translateY(${(1 - p) * rise * 100}%)`,
          filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
};

const Rule: React.FC<{at: number; width: number}> = ({at, width}) => {
  const frame = useCurrentFrame();
  const p = clampInterp(frame, [at, at + 22], [0, 1], ease.out);
  return (
    <div
      style={{
        width: width * p,
        height: 1.5,
        backgroundColor: 'rgba(240,242,246,0.7)',
      }}
    />
  );
};

export const COPY_START = 100;

export const Copy: React.FC = () => {
  const frame = useCurrentFrame();
  const scrim = clampInterp(frame, [COPY_START - 8, COPY_START + 30], [0, 1], ease.outCubic);
  const t0 = COPY_START;

  const small: React.CSSProperties = {
    fontFamily: FONT,
    fontSize: 19,
    fontWeight: 500,
    color: SILVER,
    letterSpacing: '0.26em',
    whiteSpace: 'nowrap',
    lineHeight: 1.2,
    textShadow: SHADOW,
  };
  const headline: React.CSSProperties = {
    fontFamily: FONT,
    fontSize: 60,
    fontWeight: 400,
    color: WHITE,
    letterSpacing: '-0.025em',
    lineHeight: 1.04,
    whiteSpace: 'nowrap',
    textShadow: SHADOW,
  };

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* Legibility scrims: soft, top and bottom only */}
      <AbsoluteFill
        style={{
          opacity: scrim,
          background:
            'linear-gradient(180deg, rgba(8,9,11,0.46) 0px, rgba(8,9,11,0.18) 200px, rgba(8,9,11,0) 380px),' +
            'linear-gradient(0deg, rgba(8,9,11,0.58) 0px, rgba(8,9,11,0.30) 300px, rgba(8,9,11,0) 640px)',
        }}
      />

      {/* Top-left: brand */}
      <div style={{position: 'absolute', left: 64, top: 86}}>
        <Line at={t0} dur={30} trackFrom={0.62} trackTo={0.4} style={{fontFamily: FONT, fontSize: 40, fontWeight: 600, color: WHITE, lineHeight: 1, textShadow: SHADOW}}>
          SERA
        </Line>
      </div>

      {/* Top-right: collection */}
      <div style={{position: 'absolute', right: 64 - 0.26 * 19, top: 100, textAlign: 'right'}}>
        <Line at={t0 + 10} style={small}>
          OPTICAL COLLECTION 01
        </Line>
      </div>

      {/* Lower column, on the sweater — clear of hand, wrist and shoulder */}
      <div style={{position: 'absolute', left: 492, top: 1486}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <Rule at={t0 + 12} width={36} />
          <Line at={t0 + 14} style={{...small, color: WHITE}}>
            SILVER CONTOUR
          </Line>
        </div>
        <div style={{height: 26}} />
        <Line at={t0 + 20} dur={30} style={headline}>
          See in a
        </Line>
        <Line at={t0 + 27} dur={30} style={headline}>
          different light.
        </Line>
      </div>

      {/* Bottom: URL */}
      <div style={{position: 'absolute', left: 492, top: 1826}}>
        <Line at={t0 + 38} style={{...small, fontSize: 18, letterSpacing: '0.3em'}}>
          SERA.STUDIO
        </Line>
      </div>
    </AbsoluteFill>
  );
};
