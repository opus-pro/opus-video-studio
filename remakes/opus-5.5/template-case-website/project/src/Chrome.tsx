import React from 'react';
import {THEMES} from './themes';
import {CHIP_W, CHROME_H, SEG_H, SEG_PAD, SEG_W, SEG_X, SEG_Y, WIN_W} from './timeline';

const UI = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif';

const Lock: React.FC = () => (
  <svg width="9" height="11" viewBox="0 0 9 11" style={{display: 'block'}}>
    <rect x="0.5" y="4.5" width="8" height="6" rx="1.6" fill="#8E949C" />
    <path d="M2.3 4.7V3.2a2.2 2.2 0 0 1 4.4 0v1.5" stroke="#8E949C" strokeWidth="1.2" fill="none" />
  </svg>
);

const Arrow: React.FC<{flip?: boolean; dim?: boolean}> = ({flip, dim}) => (
  <svg width="10" height="10" viewBox="0 0 10 10" style={{display: 'block', transform: flip ? 'scaleX(-1)' : undefined}}>
    <path d="M6.5 1.5L3 5l3.5 3.5" stroke={dim ? '#5B6068' : '#A5AAB2'} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Chrome: React.FC<{
  indicator: number; // 0..2 float
  hover: number[]; // per chip 0..1
  press: number[]; // per chip 0..1
  flash: number[]; // per chip 0..1 (post-click glow)
}> = ({indicator, hover, press, flash}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: 0,
      width: WIN_W,
      height: CHROME_H,
      background: 'linear-gradient(180deg, #25282C 0%, #1D1F23 100%)',
      borderBottom: '1px solid rgba(0,0,0,0.5)',
      fontFamily: UI,
    }}
  >
    {['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => (
      <div
        key={c}
        style={{
          position: 'absolute',
          left: 16 + i * 18,
          top: 17,
          width: 12,
          height: 12,
          borderRadius: 99,
          background: c,
          boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.25)',
        }}
      />
    ))}
    <div style={{position: 'absolute', left: 82, top: 18, display: 'flex', gap: 10}}>
      <Arrow />
      <Arrow flip dim />
    </div>
    <div
      style={{
        position: 'absolute',
        left: 124,
        top: 10,
        width: 250,
        height: 26,
        borderRadius: 8,
        background: '#141619',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        paddingLeft: 11,
        boxSizing: 'border-box',
        fontSize: 11,
        color: '#C8CCD2',
        letterSpacing: '0.005em',
      }}
    >
      <Lock />
      <span>
        meridian.journal<span style={{color: '#7D838B'}}>/issue-14</span>
      </span>
    </div>
    <div
      style={{
        position: 'absolute',
        right: WIN_W - SEG_X + 12,
        top: 0,
        height: CHROME_H,
        display: 'flex',
        alignItems: 'center',
        fontSize: 10.5,
        fontWeight: 500,
        color: '#8C929A',
        letterSpacing: '0.02em',
      }}
    >
      Theme
    </div>
    <div
      style={{
        position: 'absolute',
        left: SEG_X,
        top: SEG_Y,
        width: SEG_W,
        height: SEG_H,
        borderRadius: 10,
        background: '#141619',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)',
      }}
    >
      {/* sliding active indicator */}
      <div
        style={{
          position: 'absolute',
          left: SEG_PAD + indicator * CHIP_W,
          top: SEG_PAD,
          width: CHIP_W,
          height: SEG_H - SEG_PAD * 2,
          borderRadius: 7.5,
          background: 'linear-gradient(180deg, #43474E 0%, #373A40 100%)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.09)',
        }}
      />
      {THEMES.map((t, i) => {
        const active = Math.max(0, 1 - Math.abs(indicator - i));
        const s = 1 - 0.06 * press[i];
        return (
          <div
            key={t.id}
            style={{
              position: 'absolute',
              left: SEG_PAD + i * CHIP_W,
              top: SEG_PAD,
              width: CHIP_W,
              height: SEG_H - SEG_PAD * 2,
              borderRadius: 7.5,
              background: `rgba(255,255,255,${0.1 * hover[i] * (1 - active)})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              transform: s !== 1 ? `scale(${s})` : undefined,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 99,
                background: `linear-gradient(135deg, ${t.bg} 0 50%, ${t.accent} 50% 100%)`,
                boxShadow: `0 0 0 1px rgba(255,255,255,0.22), 0 0 ${10 * flash[i]}px ${4 * flash[i]}px ${t.accent}${Math.round(
                  flash[i] * 160,
                )
                  .toString(16)
                  .padStart(2, '0')}`,
              }}
            />
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 500,
                color: active > 0.5 ? '#FFFFFF' : hover[i] > 0.5 ? '#D9DCE1' : '#A3A8B0',
                letterSpacing: '0.005em',
              }}
            >
              {t.name}
            </span>
          </div>
        );
      })}
    </div>
  </div>
);
