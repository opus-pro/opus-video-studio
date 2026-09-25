import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, LOGO, SANS, SERIF} from './layout';
import {blurCss, EIO, EOUT, lerp, prog} from './lib';

const NAME = 'Casefile';
const TAGLINE = 'Answers you can check.';

export const Brand: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < 200) return null;

  const cx = LOGO.x + LOGO.w / 2;
  const cy = LOGO.y + LOGO.h / 2;
  const dot = spring({frame: f - 212, fps, config: {damping: 13, stiffness: 190, mass: 0.7}});
  const ring = prog(f, 214, 244, EOUT);
  const tag = prog(f, 229, 246, EOUT);

  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* impact ring */}
      {ring > 0 && ring < 1 && (
        <div
          style={{
            position: 'absolute',
            left: cx - lerp(10, 70, ring),
            top: cy - lerp(10, 70, ring),
            width: lerp(20, 140, ring),
            height: lerp(20, 140, ring),
            borderRadius: '50%',
            border: `1.5px solid rgba(246,198,128,${(0.5 * (1 - ring)).toFixed(3)})`,
          }}
        />
      )}
      {/* focus dot */}
      <div
        style={{
          position: 'absolute',
          left: cx - 6,
          top: cy - 6,
          width: 12,
          height: 12,
          borderRadius: 6,
          background: 'radial-gradient(circle at 40% 35%, #ffe2b0, #f0a650 70%)',
          boxShadow: '0 0 12px rgba(255,170,80,0.7)',
          transform: `scale(${Math.max(0, dot).toFixed(4)})`,
        }}
      />
      {/* wordmark */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: 960,
          top: 256,
          textAlign: 'center',
          fontFamily: SERIF,
          fontSize: 54,
          lineHeight: '60px',
          fontWeight: 600,
          letterSpacing: '-0.012em',
          color: C.cream,
          whiteSpace: 'nowrap',
          textShadow: '0 2px 18px rgba(0,0,0,0.35)',
        }}
      >
        {NAME.split('').map((ch, i) => {
          const s = 214 + i * 1.5;
          const p = prog(f, s, s + 15, EOUT);
          const o = prog(f, s, s + 11, EIO);
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                opacity: o,
                transform: p < 1 ? `translateY(${((1 - p) * 16).toFixed(2)}px)` : undefined,
                filter: blurCss((1 - p) * 7),
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
      {/* warm light glint across the wordmark, finished before the hold */}
      {f >= 233 && f <= 250 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: 960,
            top: 256,
            textAlign: 'center',
            fontFamily: SERIF,
            fontSize: 54,
            lineHeight: '60px',
            fontWeight: 600,
            letterSpacing: '-0.012em',
            whiteSpace: 'nowrap',
            color: 'transparent',
            backgroundImage:
              'linear-gradient(105deg, rgba(255,186,100,0) 0%, rgba(255,186,100,0) 38%, rgba(255,196,112,0.85) 47%, rgba(255,226,170,1) 50%, rgba(255,196,112,0.85) 53%, rgba(255,186,100,0) 62%, rgba(255,186,100,0) 100%)',
            backgroundSize: '320px 100%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: `${lerp(150, 500, prog(f, 233, 250, EIO)).toFixed(1)}px 0`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
          }}
        >
          {NAME}
        </div>
      )}
      {/* tagline */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: 960,
          top: 330,
          textAlign: 'center',
          fontFamily: SANS,
          fontSize: 17,
          lineHeight: '22px',
          fontWeight: 500,
          letterSpacing: '0.01em',
          color: 'rgba(246,231,208,0.74)',
          opacity: tag,
          transform: tag < 1 ? `translateY(${((1 - tag) * 8).toFixed(2)}px)` : undefined,
          filter: blurCss((1 - tag) * 4),
        }}
      >
        {TAGLINE}
      </div>
    </div>
  );
};
