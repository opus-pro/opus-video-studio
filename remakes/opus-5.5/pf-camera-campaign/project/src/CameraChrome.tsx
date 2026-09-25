import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {FONT} from './font';
import {
  BOTTOM_BAR,
  CHROME_GONE,
  CHROME_OUT_START,
  CUT_CLOSE,
  CUT_FINAL,
  FOCUS_CENTER,
  FOCUS_H,
  FOCUS_W,
  H,
  SHOTS,
  SHUTTER,
  TOP_BAR,
  W,
  clampInterp,
  ease,
  shotAt,
} from './timeline';

const ACCENT = '#F4D163';
const INK = 'rgba(246, 247, 249, 0.92)';
const BAR_BG = 'rgba(11, 11, 12, 0.64)';

const labelStyle: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: 23,
  fontWeight: 500,
  letterSpacing: '0.06em',
  color: INK,
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
};

const FlashIcon: React.FC = () => (
  <svg width={30} height={30} viewBox="0 0 24 24" fill="none">
    <path
      d="M13.2 2.8 5.6 13.4h5.3l-1.1 7.8 7.6-10.6h-5.3l1.1-7.8Z"
      stroke={INK}
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
  </svg>
);

const FlipIcon: React.FC = () => (
  <svg width={38} height={38} viewBox="0 0 24 24" fill="none">
    <path d="M5.2 10.2a7 7 0 0 1 12.6-2.9" stroke={INK} strokeWidth={1.6} strokeLinecap="round" />
    <path d="M18.4 3.9v3.7h-3.7" stroke={INK} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.8 13.8a7 7 0 0 1-12.6 2.9" stroke={INK} strokeWidth={1.6} strokeLinecap="round" />
    <path d="M5.6 20.1v-3.7h3.7" stroke={INK} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Rule-of-thirds grid over the viewfinder (the area between the bars).
const Grid: React.FC<{opacity: number}> = ({opacity}) => {
  const vfTop = TOP_BAR;
  const vfH = H - TOP_BAR - BOTTOM_BAR;
  const line: React.CSSProperties = {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.30)',
    boxShadow: '0 0 1px rgba(0,0,0,0.25)',
  };
  return (
    <AbsoluteFill style={{opacity}}>
      {[1, 2].map((i) => (
        <div key={`v${i}`} style={{...line, left: Math.round((W * i) / 3), top: vfTop, width: 1.5, height: vfH}} />
      ))}
      {[1, 2].map((i) => (
        <div key={`h${i}`} style={{...line, top: Math.round(vfTop + (vfH * i) / 3), left: 0, height: 1.5, width: W}} />
      ))}
    </AbsoluteFill>
  );
};

// 420x340 corner focus frame, tracking the face per shot.
const FocusFrame: React.FC<{frame: number; exit: number}> = ({frame, exit}) => {
  const shot = shotAt(frame);
  const local = frame - shot.start;
  const [cx, cy] = FOCUS_CENTER[shot.key];

  // Initial acquire on the wide viewfinder, then a quick re-lock on every burst cut.
  const acquire = shot.start === 0
    ? clampInterp(frame, [0, 16], [1.14, 1], ease.out)
    : clampInterp(local, [0, 9], [1.07, 1], ease.out);
  // Lock confirmation: a brief dip-and-return in the bracket brightness.
  const lockBlink = shot.start === 0 ? clampInterp(frame, [15, 18, 22], [1, 0.45, 1]) : 1;
  const scale = acquire * (1 + exit * 0.08);
  const opacity = lockBlink * (1 - exit);

  const arm = 46;
  const stroke = 3;
  const corner = (pos: React.CSSProperties, borders: React.CSSProperties) => (
    <div style={{position: 'absolute', width: arm, height: arm, ...pos, ...borders}} />
  );
  const b = `${stroke}px solid ${ACCENT}`;

  return (
    <div
      style={{
        position: 'absolute',
        left: cx - FOCUS_W / 2,
        top: cy - FOCUS_H / 2,
        width: FOCUS_W,
        height: FOCUS_H,
        transform: `scale(${scale})`,
        opacity,
        filter: 'drop-shadow(0 0 1.5px rgba(0,0,0,0.35))',
      }}
    >
      {corner({left: 0, top: 0}, {borderLeft: b, borderTop: b, borderTopLeftRadius: 4})}
      {corner({right: 0, top: 0}, {borderRight: b, borderTop: b, borderTopRightRadius: 4})}
      {corner({left: 0, bottom: 0}, {borderLeft: b, borderBottom: b, borderBottomLeftRadius: 4})}
      {corner({right: 0, bottom: 0}, {borderRight: b, borderBottom: b, borderBottomRightRadius: 4})}
    </div>
  );
};

export const CameraChrome: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame >= CHROME_GONE) return null;

  // Exit choreography: overlays first, bars retract a beat later.
  const overlayExit = clampInterp(frame, [CHROME_OUT_START, CHROME_OUT_START + 10], [0, 1], ease.inOut);
  // Top bar leads by two frames; bottom bar (longer travel) follows.
  const topExit = clampInterp(frame, [CUT_FINAL - 1, CHROME_GONE - 2], [0, 1], ease.inOut);
  const barExit = clampInterp(frame, [CUT_FINAL + 1, CHROME_GONE], [0, 1], ease.inOut);
  const barBlur = clampInterp(frame, [CUT_FINAL, CUT_FINAL + 6, CHROME_GONE], [0, 3, 6]);

  // Grid settles in over the first frames.
  const gridIn = clampInterp(frame, [0, 10], [0.4, 1], ease.outCubic);

  // Shutter press just before the flash.
  const press = clampInterp(frame, [33, 39, 41, 50], [1, 0.86, 0.86, 1], ease.inOut);

  // Thumbnail shows the latest capture.
  const shot = shotAt(frame);
  const hasCapture = frame >= CUT_CLOSE;
  const thumbKey = hasCapture ? shot.key : null;
  const thumbPop = hasCapture ? clampInterp(frame - shot.start, [0, 10], [0.72, 1], ease.out) : 1;

  const bottomTop = H - BOTTOM_BAR;
  const shutterCY = bottomTop + 166;

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <Grid opacity={gridIn * (1 - overlayExit)} />
      <FocusFrame frame={frame} exit={overlayExit} />

      {/* Top bar — 140px */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: W,
          height: TOP_BAR,
          backgroundColor: BAR_BG,
          backdropFilter: 'blur(22px) saturate(115%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          transform: `translateY(${-topExit * (TOP_BAR + 12)}px)`,
          opacity: 1 - topExit * 0.6,
          filter: barBlur > 0.05 ? `blur(${barBlur}px)` : undefined,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 64,
            right: 64,
            top: 62,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 10, width: 170}}>
            <FlashIcon />
            <span style={{...labelStyle, fontSize: 21, color: 'rgba(246,247,249,0.7)'}}>AUTO</span>
          </div>
          <div style={{display: 'flex', gap: 34}}>
            <span style={labelStyle}>ISO 100</span>
            <span style={labelStyle}>1/250</span>
            <span style={labelStyle}>ƒ2.0</span>
          </div>
          <div style={{width: 170, display: 'flex', justifyContent: 'flex-end'}}>
            <span
              style={{
                ...labelStyle,
                fontSize: 19,
                fontWeight: 600,
                letterSpacing: '0.1em',
                padding: '5px 10px 5px 12px',
                border: `1.5px solid rgba(246,247,249,0.75)`,
                borderRadius: 7,
              }}
            >
              RAW
            </span>
          </div>
        </div>
      </div>

      {/* Bottom bar — 300px */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: bottomTop,
          width: W,
          height: BOTTOM_BAR,
          backgroundColor: BAR_BG,
          backdropFilter: 'blur(22px) saturate(115%)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          transform: `translateY(${barExit * (BOTTOM_BAR + 12)}px)`,
          opacity: 1 - barExit * 0.6,
          filter: barBlur > 0.05 ? `blur(${barBlur}px)` : undefined,
        }}
      >
        {/* PHOTO mode label */}
        <div
          style={{
            position: 'absolute',
            top: 36,
            left: 0,
            width: W,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{...labelStyle, fontSize: 22, fontWeight: 600, letterSpacing: '0.24em', color: ACCENT, marginRight: '-0.24em'}}>
            PHOTO
          </span>
          <div style={{width: 5, height: 5, borderRadius: 3, backgroundColor: ACCENT}} />
        </div>

        {/* Thumbnail of the latest capture */}
        <div
          style={{
            position: 'absolute',
            left: 176 - 38,
            top: shutterCY - bottomTop - 38,
            width: 76,
            height: 76,
            borderRadius: 14,
            overflow: 'hidden',
            backgroundColor: 'rgba(255,255,255,0.08)',
            border: '1.5px solid rgba(255,255,255,0.28)',
            transform: `scale(${thumbPop})`,
          }}
        >
          {thumbKey ? (
            <Img
              src={staticFile(SHOTS[thumbKey].file)}
              style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 30%'}}
            />
          ) : null}
        </div>

        {/* 104px shutter */}
        <div
          style={{
            position: 'absolute',
            left: W / 2 - SHUTTER / 2,
            top: shutterCY - bottomTop - SHUTTER / 2,
            width: SHUTTER,
            height: SHUTTER,
            borderRadius: '50%',
            border: '5px solid rgba(255,255,255,0.96)',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 82,
              height: 82,
              borderRadius: '50%',
              backgroundColor: '#fff',
              transform: `scale(${press})`,
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            }}
          />
        </div>

        {/* Lens flip */}
        <div
          style={{
            position: 'absolute',
            left: W - 176 - 38,
            top: shutterCY - bottomTop - 38,
            width: 76,
            height: 76,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FlipIcon />
        </div>
      </div>
    </AbsoluteFill>
  );
};
