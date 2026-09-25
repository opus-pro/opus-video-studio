import React from 'react';
import {Img, staticFile} from 'remotion';
import {INK, type Poster as PosterData} from './data';
import {FONT_STACK} from './font';

export const POSTER_W = 560;
export const POSTER_H = 720;
const PAD = 32;

const label: React.CSSProperties = {
  fontSize: 12.5,
  fontWeight: 560,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  lineHeight: '16px',
};

export const Poster: React.FC<{data: PosterData; index: number; total: number}> = ({data, index, total}) => {
  const n = String(index + 1).padStart(2, '0');
  return (
    <div
      style={{
        position: 'relative',
        width: POSTER_W,
        height: POSTER_H,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: data.color,
        color: INK,
        fontFamily: FONT_STACK,
        fontFeatureSettings: '"tnum" 1, "ss01" 1',
        boxShadow: '0 2px 0 rgba(255,255,255,0.06) inset, 0 44px 90px -30px rgba(0,0,0,0.75), 0 18px 36px -18px rgba(0,0,0,0.55)',
      }}
    >
      {/* paper sheen */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(160deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 38%, rgba(0,0,0,0.16) 100%)',
        }}
      />

      {/* header */}
      <div style={{position: 'absolute', left: PAD, right: PAD, top: 30, display: 'flex', justifyContent: 'space-between', ...label}}>
        <span>N° {n}</span>
        <span style={{opacity: 0.72}}>{data.kicker}</span>
      </div>

      {/* photo */}
      <div
        style={{
          position: 'absolute',
          left: PAD,
          top: 66,
          width: POSTER_W - PAD * 2,
          height: 448,
          borderRadius: 10,
          overflow: 'hidden',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.18)',
        }}
      >
        <Img
          src={staticFile(data.image)}
          style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: data.focus, display: 'block'}}
        />
      </div>

      {/* title block */}
      <div
        style={{
          position: 'absolute',
          left: PAD - 3,
          top: 540,
          fontSize: 64,
          fontWeight: 620,
          letterSpacing: '-0.04em',
          lineHeight: '64px',
          whiteSpace: 'nowrap',
        }}
      >
        {data.title}
      </div>
      <div
        style={{
          position: 'absolute',
          left: PAD,
          top: 616,
          fontSize: 17,
          fontWeight: 420,
          letterSpacing: '-0.005em',
          lineHeight: '22px',
          opacity: 0.78,
        }}
      >
        {data.caption}
      </div>

      {/* footer */}
      <div style={{position: 'absolute', left: PAD, right: PAD, top: 660, height: 1, backgroundColor: INK, opacity: 0.22}} />
      <div style={{position: 'absolute', left: PAD, right: PAD, top: 674, display: 'flex', justifyContent: 'space-between', ...label}}>
        <span style={{opacity: 0.72}}>Selected Work 2026</span>
        <span>
          {n}
          <span style={{opacity: 0.5}}> / {String(total).padStart(2, '0')}</span>
        </span>
      </div>
    </div>
  );
};
