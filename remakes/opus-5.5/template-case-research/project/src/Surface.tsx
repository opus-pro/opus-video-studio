import React from 'react';
import {Easing, Img, random, staticFile, useCurrentFrame} from 'remotion';
import {BAR, C, CARD, CARD_PAD, chipAbs, CHIP, img, SANS, SERIF, surfaceRect, T, THUMB_IN_CHIP} from './layout';
import {blurCss, bump, EIO, EOUT, ESM, lerp, mixRgb, prog, rgb, RGB} from './lib';

export const QUERY = 'Best spot for a calm-water sunrise shoot?';
const TYPE_TIMES = QUERY.split('').map(
  (ch, i) => T.typeStart + i * 0.8 + (random(`key-${i}`) - 0.5) * 0.7 - (ch === ' ' ? 0.25 : 0),
);

const INK: RGB = [42, 29, 20];
const MUTED: RGB = [128, 106, 88];

const SOURCES = [
  {src: 'rowboat-lake', title: 'Shore photo', sub: '06:42 AM · east bank'},
  {src: 'alpine-valley', title: 'Drone pass', sub: '07:10 AM · 120 m'},
  {src: 'ridge-meadow', title: 'Ridge cam', sub: '07:55 AM · north'},
];

type Tok = {w: string} | {c: number};
const BODY: Tok[] = [
  ...'Wind holds under 3 mph until 8 AM, so the water keeps a clean reflection.'.split(' ').map((w) => ({w})),
  {c: 1},
  {c: 2},
  ...'The east ridge blocks the valley draft.'.split(' ').map((w) => ({w})),
  {c: 3},
];

const reveal = (f: number, start: number, dur: number, dy = 10, blur = 6) => {
  const p = prog(f, start, start + dur, EOUT);
  const o = prog(f, start, start + dur * 0.7, EIO);
  return {
    opacity: o,
    transform: p < 1 ? `translateY(${((1 - p) * dy).toFixed(2)}px)` : undefined,
    filter: blurCss((1 - p) * blur),
  } as React.CSSProperties;
};

const SearchIcon: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 20 20" style={{display: 'block'}}>
    <circle cx="8.5" cy="8.5" r="6" fill="none" stroke={color} strokeWidth="2" />
    <path d="M13 13 L17.5 17.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const Cite: React.FC<{n: number; style?: React.CSSProperties}> = ({n, style}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 17,
      height: 17,
      borderRadius: 5,
      background: 'rgba(184,103,31,0.14)',
      color: C.amber,
      fontSize: 10.5,
      fontWeight: 700,
      verticalAlign: 2,
      marginLeft: 3,
      lineHeight: 1,
      ...style,
    }}
  >
    {n}
  </span>
);

export const Surface: React.FC = () => {
  const f = useCurrentFrame();
  if (f > 152) return null;

  const inP = prog(f, T.barIn[0], T.barIn[1], EOUT);
  const exitP = prog(f, T.cardExit[0], T.cardExit[1], Easing.bezier(0.45, 0, 0.8, 0.45));
  const wrapScale = lerp(0.94, 1, inP) * lerp(1, 0.9, exitP);
  const wrapBlur = (1 - inP) * 8 + exitP * 9;
  const wrapOpacity = prog(f, T.barIn[0], T.barIn[0] + 12) * (1 - prog(f, 130, 150, EIO));
  const wrapY = (1 - inP) * 14 - exitP * 6;

  const r = surfaceRect(f);
  const ph = prog(f, T.expandH[0], T.expandH[1], ESM);
  const pq = prog(f, T.expandW[0], T.expandW[1] + 2, ESM); // query header morph
  const radius = lerp(34, 18, ph);

  // Query text
  const typed = TYPE_TIMES.filter((t) => t <= f).length;
  const qSize = lerp(21, 14, pq);
  const qLine = qSize * 1.34;
  // anchored to the live card edge so the header never outruns the growing mask
  const qLeft = r.x + lerp(54, 50, pq);
  const qTop = r.y + lerp((BAR.h - 21 * 1.34) / 2, 32 - (14 * 1.34) / 2, pq);
  const qColor = rgb(mixRgb(INK, MUTED, pq));
  const qWeight = 500;

  const typing = f >= T.typeStart && typed < QUERY.length;
  const caretOn = f < 62 && (typing || Math.floor(f / 8) % 2 === 0);
  const caretOpacity = caretOn ? 1 - prog(f, 56, 62) : 0;

  const iconSize = lerp(18, 14, pq);
  const iconLeft = r.x + lerp(24, 28, pq);
  const iconTop = r.y + lerp(BAR.h / 2, 32, pq) - iconSize / 2;

  // Send button (rides the right edge)
  const press = bump(f, T.press - 1, T.press + 6);
  const btnOpacity = prog(f, 8, 20) * (1 - prog(f, 57, 64));
  const btnReady = prog(f, 44, 52);
  const btnX = r.x + r.w - 54;
  const btnY = r.y + 14;

  // Ripple on press
  const rip = prog(f, T.press, T.press + 18, EOUT);

  const chipFocus = prog(f, T.chipFocus[0] + 2, T.chipFocus[1], EIO);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `translateY(${wrapY.toFixed(2)}px) scale(${wrapScale.toFixed(4)})`,
        transformOrigin: '480px 270px',
        filter: blurCss(wrapBlur),
        opacity: wrapOpacity,
      }}
    >
      {/* Card body */}
      <div
        style={{
          position: 'absolute',
          left: r.x,
          top: r.y,
          width: r.w,
          height: r.h,
          borderRadius: radius,
          background: `linear-gradient(180deg, ${C.paperHi} 0%, ${C.paper} 100%)`,
          boxShadow:
            '0 30px 70px -18px rgba(18,7,0,0.65), 0 8px 22px rgba(18,7,0,0.28), inset 0 1px 0 rgba(255,255,255,0.8), inset 0 0 0 1px rgba(120,80,40,0.10)',
          overflow: 'hidden',
        }}
      >
        {/* Frame-anchored content layer: stays put while the card mask grows */}
        <div style={{position: 'absolute', left: -r.x, top: -r.y, width: 960, height: 540, fontFamily: SANS}}>
          {/* Search icon */}
          <div style={{position: 'absolute', left: iconLeft, top: iconTop}}>
            <SearchIcon size={iconSize} color={rgb(mixRgb([150, 120, 95], [170, 130, 95], pq))} />
          </div>

          {/* Query text */}
          <div
            style={{
              position: 'absolute',
              left: qLeft,
              top: qTop,
              fontSize: qSize,
              lineHeight: `${qLine}px`,
              fontWeight: qWeight,
              color: qColor,
              whiteSpace: 'nowrap',
              letterSpacing: '-0.005em',
            }}
          >
            {QUERY.slice(0, typed)}
            <span
              style={{
                display: 'inline-block',
                width: 2,
                height: qSize * 1.12,
                marginLeft: 2,
                verticalAlign: -qSize * 0.2,
                background: C.amberBtn,
                borderRadius: 1,
                opacity: caretOpacity,
              }}
            />
          </div>

          {/* Header: sources pill */}
          <div
            style={{
              position: 'absolute',
              right: 960 - (CARD.x + CARD.w - CARD_PAD),
              top: CARD.y + 20,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '0 10px 0 5px',
              borderRadius: 12,
              background: 'rgba(184,103,31,0.10)',
              ...reveal(f, 76, 14, 0, 4),
            }}
          >
            <div style={{display: 'flex'}}>
              {SOURCES.map((s, i) => (
                <Img
                  key={s.src}
                  src={staticFile(img(s.src))}
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    objectFit: 'cover',
                    marginLeft: i === 0 ? 0 : -5,
                    boxShadow: `0 0 0 1.5px ${C.paperHi}`,
                  }}
                />
              ))}
            </div>
            <span style={{fontSize: 11.5, fontWeight: 600, color: C.amber, letterSpacing: '0.01em'}}>3 sources</span>
          </div>

          {/* Divider */}
          <div
            style={{
              position: 'absolute',
              left: CARD.x + CARD_PAD,
              top: CARD.y + 56,
              width: CARD.w - CARD_PAD * 2,
              height: 1,
              background: C.line,
              transformOrigin: 'left center',
              transform: `scaleX(${prog(f, 64, 88, ESM).toFixed(4)})`,
            }}
          />

          {/* Answer label */}
          <div
            style={{
              position: 'absolute',
              left: CARD.x + CARD_PAD,
              top: CARD.y + 74,
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: '0.16em',
              color: C.amber,
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              ...reveal(f, 70, 12, 6, 3),
            }}
          >
            <span style={{width: 6, height: 6, borderRadius: 3, background: C.amberBtn, display: 'inline-block'}} />
            ANSWER
          </div>

          {/* Headline */}
          <div
            style={{
              position: 'absolute',
              left: CARD.x + CARD_PAD - 1,
              top: CARD.y + 92,
              fontFamily: SERIF,
              fontSize: 32,
              lineHeight: '38px',
              fontWeight: 600,
              color: C.ink,
              letterSpacing: '-0.012em',
              whiteSpace: 'nowrap',
            }}
          >
            {'Mirror Lake, east shore.'.split(' ').map((w, i) => (
              <React.Fragment key={i}>
                <span style={{display: 'inline-block', ...reveal(f, 74 + i * 3, 13, 12, 7)}}>{w}</span>
                {' '}
              </React.Fragment>
            ))}
          </div>

          {/* Body */}
          <div
            style={{
              position: 'absolute',
              left: CARD.x + CARD_PAD,
              top: CARD.y + 140,
              width: CARD.w - CARD_PAD * 2,
              fontSize: 15.5,
              lineHeight: '24px',
              color: C.inkSoft,
              letterSpacing: '-0.003em',
            }}
          >
            {BODY.map((t, i) => {
              const st = reveal(f, 83 + i * 0.62, 11, 7, 4);
              return 'w' in t ? (
                <React.Fragment key={i}>
                  <span style={{display: 'inline-block', ...st}}>{t.w}</span>{' '}
                </React.Fragment>
              ) : (
                <React.Fragment key={i}>
                  <Cite n={t.c} style={{...st, marginLeft: (BODY[i - 1] as {c?: number}).c ? 2 : -1}} />
                  {'c' in (BODY[i + 1] ?? {w: ''}) ? '' : ' '}
                </React.Fragment>
              );
            })}
          </div>

          {/* Evidence chips */}
          {SOURCES.map((s, i) => {
            const c = chipAbs(i);
            const st = reveal(f, 92 + i * 4, 14, 10, 5);
            const focus = i === 0 ? chipFocus : 0;
            const dim = i === 0 ? 1 - prog(f, T.heroGrow[0], T.heroGrow[0] + 8) : 1 - 0.45 * chipFocus;
            return (
              <div
                key={s.src}
                style={{
                  position: 'absolute',
                  left: c.x,
                  top: c.y,
                  width: CHIP.w,
                  height: CHIP.h,
                  borderRadius: 10,
                  background: i === 0 ? rgb(mixRgb([251, 246, 238], [255, 241, 222], focus)) : C.chip,
                  boxShadow: `inset 0 0 0 1px ${
                    i === 0 ? rgb(mixRgb([230, 216, 196], [214, 150, 80], focus)) : C.chipLine
                  }, 0 ${lerp(1, 6, focus).toFixed(1)}px ${lerp(2, 14, focus).toFixed(1)}px rgba(90,50,10,${lerp(
                    0.06,
                    0.16,
                    focus,
                  ).toFixed(2)})`,
                  ...st,
                  opacity: (st.opacity as number) * dim,
                }}
              >
                <Img
                  src={staticFile(img(s.src))}
                  style={{
                    position: 'absolute',
                    left: THUMB_IN_CHIP.x,
                    top: THUMB_IN_CHIP.y,
                    width: THUMB_IN_CHIP.w,
                    height: THUMB_IN_CHIP.h,
                    borderRadius: 5,
                    objectFit: 'cover',
                    opacity: i === 0 && f >= T.heroGrow[0] ? 0 : 1,
                  }}
                />
                <div style={{position: 'absolute', left: 66, top: 8, fontSize: 12.5, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap'}}>
                  {s.title}
                </div>
                <div
                  style={{position: 'absolute', left: 66, top: 26, fontSize: 10.5, fontWeight: 500, color: C.muted, whiteSpace: 'nowrap'}}
                >
                  {s.sub}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    right: 9,
                    top: 8,
                    width: 16,
                    height: 16,
                    borderRadius: 5,
                    background: 'rgba(184,103,31,0.14)',
                    color: C.amber,
                    fontSize: 10,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {i + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Send button */}
      <div
        style={{
          position: 'absolute',
          left: btnX,
          top: btnY,
          width: 40,
          height: 40,
          borderRadius: 20,
          background: `linear-gradient(180deg, ${rgb(mixRgb([214, 196, 176], [214, 134, 60], btnReady))}, ${rgb(
            mixRgb([196, 176, 156], [184, 102, 34], btnReady),
          )})`,
          boxShadow: `0 4px 12px rgba(150,70,10,${(0.1 + 0.25 * btnReady).toFixed(2)}), inset 0 1px 0 rgba(255,255,255,0.35)`,
          opacity: btnOpacity,
          transform: `scale(${(1 - 0.12 * press).toFixed(4)})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 20 20">
          <path d="M10 15.5 V4.8 M5 9.6 L10 4.6 L15 9.6" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {rip > 0 && rip < 1 && (
        <div
          style={{
            position: 'absolute',
            left: btnX + 20 - 20 * (1 + rip * 1.4),
            top: btnY + 20 - 20 * (1 + rip * 1.4),
            width: 40 * (1 + rip * 1.4),
            height: 40 * (1 + rip * 1.4),
            borderRadius: '50%',
            border: `2px solid rgba(214,134,60,${(0.55 * (1 - rip)).toFixed(3)})`,
          }}
        />
      )}
    </div>
  );
};

