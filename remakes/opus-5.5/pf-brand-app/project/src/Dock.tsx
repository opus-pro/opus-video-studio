import React from 'react';
import {C, DOCK, FONT, ICON, ICON_X, ICON_Y, inOut, lerp, seg, T} from './lib';

const iconShell = (bg: string): React.CSSProperties => ({
  position: 'absolute',
  width: ICON,
  height: ICON,
  top: ICON_Y - DOCK.y,
  borderRadius: 30,
  background: bg,
  boxShadow:
    'inset 0 1.5px 0 rgba(255,255,255,0.28), inset 0 -2px 0 rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.10), 0 8px 18px rgba(20,24,22,0.16)',
  overflow: 'hidden',
});

// Left icon: "Tide" — lagoon squircle with three cream swells.
const TideIcon: React.FC = () => (
  <div style={{...iconShell('linear-gradient(160deg, #2C8479 0%, #185049 100%)'), left: ICON_X[0] - DOCK.x}}>
    <svg width={ICON} height={ICON} viewBox="0 0 128 128">
      {[44, 64, 84].map((y, i) => (
        <path
          key={y}
          d={`M30 ${y} q 8.5 -9 17 0 t 17 0 t 17 0 t 17 0`}
          fill="none"
          stroke={C.cream}
          strokeOpacity={1 - i * 0.22}
          strokeWidth={8}
          strokeLinecap="round"
        />
      ))}
    </svg>
  </div>
);

// Right icon: "Arch" — graphite squircle with a sand arch and coral sun.
const ArchIcon: React.FC = () => (
  <div style={{...iconShell('linear-gradient(160deg, #2E3438 0%, #16191C 100%)'), left: ICON_X[2] - DOCK.x}}>
    <svg width={ICON} height={ICON} viewBox="0 0 128 128">
      <path d="M32 94 V66 a32 32 0 0 1 64 0 V94 Z" fill={C.sand} />
      <path d="M50 94 V70 a14 14 0 0 1 28 0 V94 Z" fill="#16191C" />
      <circle cx={64} cy={70} r={7} fill={C.coral} />
    </svg>
  </div>
);

export const Dock: React.FC<{t: number}> = ({t}) => {
  const out = inOut(seg(t, T.dock0, T.dock1));
  if (out >= 1) return null;
  const indicator = seg(t, 36, 44);
  return (
    <div
      style={{
        position: 'absolute',
        left: DOCK.x,
        top: DOCK.y,
        width: DOCK.w,
        height: DOCK.h,
        borderRadius: 46,
        opacity: 1 - out,
        transform: `translateY(${lerp(0, 34, out)}px) scale(${lerp(1, 0.965, out)})`,
        filter: out > 0 ? `blur(${lerp(0, 6, out)}px)` : undefined,
        background: 'linear-gradient(180deg, #FBFAF8 0%, #F2F1ED 100%)',
        boxShadow:
          'inset 0 1.5px 0 rgba(255,255,255,0.95), inset 0 0 0 1px rgba(255,255,255,0.5), 0 1px 0 rgba(0,0,0,0.25), 0 30px 70px rgba(0,0,0,0.55), 0 10px 24px rgba(0,0,0,0.35)',
      }}
    >
      <TideIcon />
      {/* empty well where the FIELD tile sits (the tile itself is lifted to its own layer) */}
      <div
        style={{
          position: 'absolute',
          left: ICON_X[1] - DOCK.x + 6,
          top: ICON_Y - DOCK.y + 6,
          width: ICON - 12,
          height: ICON - 12,
          borderRadius: 26,
          background: 'rgba(20,24,22,0.035)',
        }}
      />
      <ArchIcon />
      <div
        style={{
          position: 'absolute',
          left: ICON_X[1] - DOCK.x + ICON / 2 - 3,
          top: DOCK.h - 11,
          width: 6,
          height: 6,
          borderRadius: 3,
          background: '#2A2F2D',
          opacity: indicator,
        }}
      />
    </div>
  );
};

// Hover tooltip naming the app, macOS-style.
export const Tooltip: React.FC<{t: number}> = ({t}) => {
  const p = inOut(seg(t, 18, 26)) * (1 - inOut(seg(t, 38, 46)));
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: ICON_X[1] + ICON / 2,
        top: DOCK.y - 16,
        transform: `translate(-50%, -100%) translateY(${(1 - p) * 8}px)`,
        opacity: p,
        padding: '10px 18px',
        borderRadius: 12,
        background: 'rgba(246,245,241,0.96)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        fontFamily: FONT,
        fontSize: 21,
        fontWeight: 560,
        letterSpacing: '-0.005em',
        lineHeight: 1,
        color: '#1A1D1C',
        whiteSpace: 'nowrap',
      }}
    >
      Field
    </div>
  );
};

// Standard arrow cursor; the hotspot is the tip at (x, y).
export const Cursor: React.FC<{t: number}> = ({t}) => {
  const p = inOut(seg(t, 0, 28));
  const x = lerp(1262, 974, p) + Math.sin(Math.PI * p) * 34;
  const y = lerp(812, 552, p);
  const press = seg(t, T.press0, T.press1) - seg(t, T.press1, 41);
  const s = 1 - 0.14 * inOut(Math.max(0, press));
  const o = 1 - seg(t, 46, 58);
  if (o <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 3.5 * 1.3,
        top: y - 2.5 * 1.3,
        width: 32 * 1.3,
        height: 44 * 1.3,
        opacity: o,
        transformOrigin: `${3.5 * 1.3}px ${2.5 * 1.3}px`,
        transform: `scale(${s})`,
        filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.35))',
      }}
    >
      <svg width={32 * 1.3} height={44 * 1.3} viewBox="0 0 32 44">
        <path
          d="M3.5 2.5 L3.5 34 L11 27 L16.2 39.2 L21.6 36.9 L16.5 25.2 L26.5 25.2 Z"
          fill="#0E0F10"
          stroke="#FFFFFF"
          strokeWidth={2.4}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
