import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import type {FieldScreenData} from './data';
import {FONT} from './font';
import {CONTOURS, ELEV_MAX, ELEV_MIN, MAP_H, MAP_W, ROUTE_D, elevationAt, pointAt} from './map';

export const SCREEN_W = 310;
export const SCREEN_H = 700;

const INK = '#121a15';
const MUTED = '#6a746c';
const HAIR = '#e3e7e0';
const HEADER_H = 240;
const MAP_TOP = HEADER_H;
const SHEET_TOP = 452;

const fmtInt = (n: number) => Math.round(n).toLocaleString('en-US');

const StatusBar: React.FC<{clock: string}> = ({clock}) => (
  <>
    <div
      style={{
        position: 'absolute',
        left: 30,
        top: 16,
        fontSize: 15,
        fontWeight: 600,
        letterSpacing: '-0.01em',
        color: '#fff',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {clock}
    </div>
    <div
      style={{
        position: 'absolute',
        left: (SCREEN_W - 92) / 2,
        top: 11,
        width: 92,
        height: 27,
        borderRadius: 14,
        background: '#000',
      }}
    />
    <svg style={{position: 'absolute', right: 24, top: 20}} width={64} height={12} viewBox="0 0 64 12">
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={i * 4.6} y={9 - i * 2.4} width={3.2} height={3 + i * 2.4} rx={0.9} fill="#fff" />
      ))}
      <path d="M29.5 3.6a8 8 0 0 1 10.6 0" stroke="#fff" strokeWidth={1.7} fill="none" strokeLinecap="round" />
      <path d="M31.6 6.3a4.8 4.8 0 0 1 6.4 0" stroke="#fff" strokeWidth={1.7} fill="none" strokeLinecap="round" />
      <circle cx={34.8} cy={9.4} r={1.4} fill="#fff" />
      <rect x={44.5} y={0.8} width={17} height={10.4} rx={3} stroke="rgba(255,255,255,.55)" strokeWidth={1} fill="none" />
      <rect x={46.3} y={2.6} width={11.4} height={6.8} rx={1.6} fill="#fff" />
      <path d="M62.8 4.3v3.4a1.8 1.8 0 0 0 0-3.4z" fill="rgba(255,255,255,.55)" />
    </svg>
  </>
);

const Header: React.FC<{data: FieldScreenData; trail: string; accent: string}> = ({data, trail, accent}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: SCREEN_W, height: HEADER_H, overflow: 'hidden'}}>
    <Img
      src={staticFile(`assets/${data.photo}`)}
      style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: data.photoPosition}}
    />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'linear-gradient(180deg, rgba(6,12,9,.62) 0%, rgba(6,12,9,.2) 34%, rgba(6,12,9,0) 50%, rgba(6,12,9,.30) 70%, rgba(6,12,9,.78) 100%)',
      }}
    />
    <StatusBar clock={data.clock} />
    <div
      style={{
        position: 'absolute',
        left: 24,
        top: 60,
        fontSize: 15,
        fontWeight: 800,
        letterSpacing: '0.24em',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <svg width={18} height={13} viewBox="0 0 18 13" style={{marginTop: -1}}>
        <path d="M0.8 12.2L6.6 2.4l3.1 5.2 2.1-3.3 5.4 7.9z" fill="#fff" />
        <path d="M6.6 2.4l1.6 2.7-1.6-0.9-1.6 0.9z" fill={accent} />
      </svg>
      FIELD
    </div>
    <div
      style={{
        position: 'absolute',
        right: 18,
        top: 55,
        height: 26,
        padding: '0 11px 0 9px',
        borderRadius: 13,
        background: 'rgba(8,14,10,.46)',
        border: '1px solid rgba(255,255,255,.22)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        fontWeight: 600,
        color: '#fff',
        letterSpacing: '0.01em',
      }}
    >
      <span style={{width: 7, height: 7, borderRadius: 4, background: '#5ee08a', boxShadow: '0 0 0 3px rgba(94,224,138,.25)'}} />
      On route
    </div>
    <div
      style={{
        position: 'absolute',
        left: 24,
        right: 24,
        bottom: 54,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,.78)',
      }}
    >
      {trail}
    </div>
    <div
      style={{
        position: 'absolute',
        left: 23,
        right: 24,
        bottom: 18,
        fontSize: 29,
        lineHeight: '34px',
        fontWeight: 640,
        letterSpacing: '-0.025em',
        color: '#fff',
        whiteSpace: 'nowrap',
      }}
    >
      {data.place}
    </div>
    <div style={{position: 'absolute', left: 24, bottom: 0, width: 34, height: 3, borderRadius: 2, background: accent}} />
  </div>
);

const MapPanel: React.FC<{uid: string; data: FieldScreenData; all: FieldScreenData[]; accent: string; totalKm: number}> = ({
  uid,
  data,
  all,
  accent,
  totalKm,
}) => {
  const frame = useCurrentFrame();
  const [mx, my] = pointAt(data.progress);
  const [sx, sy] = pointAt(0);
  const [ex, ey] = pointAt(1);
  const pulse = ((frame + data.progress * 97) % 84) / 84;
  const lake = pointAt(0.9);
  const nextKm = ((data.nextProgress - data.progress) * totalKm).toFixed(1);
  return (
    <div style={{position: 'absolute', left: 0, top: MAP_TOP, width: MAP_W, height: MAP_H, background: '#eef1e7', overflow: 'hidden'}}>
      <svg width={MAP_W} height={MAP_H} viewBox={`0 0 ${MAP_W} ${MAP_H}`} style={{position: 'absolute', inset: 0}}>
        <defs>
          <radialGradient id={`veg-${uid}`} cx="0.18" cy="0.85" r="0.7">
            <stop offset="0" stopColor="#d4e2c8" />
            <stop offset="1" stopColor="#d4e2c8" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={MAP_W} height={MAP_H} fill={`url(#veg-${uid})`} />
        <path d={CONTOURS.minor} stroke="#8d9b86" strokeOpacity={0.34} strokeWidth={0.8} fill="none" strokeLinecap="round" />
        <path d={CONTOURS.major} stroke="#7a8a73" strokeOpacity={0.55} strokeWidth={1.3} fill="none" strokeLinecap="round" />
        <path
          d={`M${lake[0] + 4} ${lake[1] - 30}c16 -4 34 4 38 18c4 14 -8 26 -24 28c-16 2 -30 -6 -32 -20c-1 -12 6 -23 18 -26z`}
          fill="#bcd8de"
          stroke="#9cc3cc"
          strokeWidth={1}
        />
        <path d={ROUTE_D} stroke="#fff" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
        <path
          d={ROUTE_D}
          stroke={INK}
          strokeOpacity={0.55}
          strokeWidth={2.4}
          strokeDasharray="0.1 6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={ROUTE_D}
          pathLength={1}
          stroke={accent}
          strokeWidth={4}
          strokeDasharray={`${data.progress} 2`}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {all.map((s) => {
          if (s.id === data.id) return null;
          const [cx, cy] = pointAt(s.progress);
          const reached = s.progress < data.progress;
          return (
            <circle key={s.id} cx={cx} cy={cy} r={4.2} fill="#fff" stroke={reached ? accent : INK} strokeWidth={2} />
          );
        })}
        <circle cx={sx} cy={sy} r={5} fill={INK} />
        <circle cx={sx} cy={sy} r={2} fill="#fff" />
        <g transform={`translate(${ex} ${ey})`}>
          <rect x={-5} y={-5} width={10} height={10} rx={2} fill={INK} />
          <rect x={-5} y={-5} width={5} height={5} fill="#fff" opacity={0.9} />
          <rect x={0} y={0} width={5} height={5} fill="#fff" opacity={0.9} />
        </g>
        <circle cx={mx} cy={my} r={9 + pulse * 16} fill={accent} opacity={0.32 * (1 - pulse)} />
        <circle cx={mx} cy={my} r={11} fill={accent} opacity={0.16} />
        <circle cx={mx} cy={my} r={7.5} fill="#fff" />
        <circle cx={mx} cy={my} r={5} fill={accent} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 14,
          top: 14,
          height: 30,
          padding: '0 12px',
          borderRadius: 15,
          background: 'rgba(255,255,255,.94)',
          boxShadow: '0 1px 2px rgba(18,26,21,.08), 0 4px 12px rgba(18,26,21,.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontSize: 12,
          fontWeight: 500,
          color: MUTED,
          whiteSpace: 'nowrap',
        }}
      >
        Next
        <span style={{color: INK, fontWeight: 600}}>{data.next}</span>
        <span style={{color: '#b3bab1'}}>·</span>
        <span style={{color: INK, fontWeight: 600, fontVariantNumeric: 'tabular-nums'}}>{nextKm} km</span>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 14,
          top: 14,
          width: 30,
          height: 30,
          borderRadius: 15,
          background: 'rgba(255,255,255,.94)',
          boxShadow: '0 1px 2px rgba(18,26,21,.08), 0 4px 12px rgba(18,26,21,.08)',
        }}
      >
        <svg width={30} height={30} viewBox="0 0 30 30">
          <path d="M15 7l4 9h-8z" fill={accent} />
          <path d="M15 23l-4 -7h8z" fill="#c3cac1" />
        </svg>
      </div>
    </div>
  );
};

const CHART_X = 22;
const CHART_W = SCREEN_W - 44;
const CHART_H = 50;
const chartPath = (from: number, to: number) => {
  const pts: string[] = [];
  const n = 60;
  for (let i = 0; i <= n; i++) {
    const u = from + ((to - from) * i) / n;
    const x = CHART_X + u * CHART_W;
    const y = CHART_H - ((elevationAt(u) - ELEV_MIN) / (ELEV_MAX - ELEV_MIN)) * CHART_H;
    pts.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return pts;
};

const Sheet: React.FC<{uid: string; data: FieldScreenData; accent: string; totalKm: number}> = ({uid, data, accent, totalKm}) => {
  const done = chartPath(0, data.progress);
  const rest = chartPath(data.progress, 1);
  const full = chartPath(0, 1);
  const px = CHART_X + data.progress * CHART_W;
  const py = CHART_H - ((elevationAt(data.progress) - ELEV_MIN) / (ELEV_MAX - ELEV_MIN)) * CHART_H;
  const stats = [
    {label: 'Distance', value: (data.progress * totalKm).toFixed(1), unit: 'km'},
    {label: 'Elevation', value: fmtInt(elevationAt(data.progress)), unit: 'm'},
    {label: 'Moving', value: data.moving, unit: ''},
  ];
  const pct = Math.round(data.progress * 100);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: SHEET_TOP,
        width: SCREEN_W,
        height: SCREEN_H - SHEET_TOP,
        background: '#fbfcf9',
        borderRadius: '24px 24px 0 0',
        boxShadow: '0 -1px 0 rgba(18,26,21,.05), 0 -10px 28px rgba(18,26,21,.10)',
      }}
    >
      <div style={{position: 'absolute', left: (SCREEN_W - 36) / 2, top: 8, width: 36, height: 5, borderRadius: 3, background: '#d6dbd3'}} />
      <div style={{position: 'absolute', left: 22, right: 22, top: 26, display: 'flex', justifyContent: 'space-between'}}>
        {stats.map((s) => (
          <div key={s.label} style={{display: 'flex', flexDirection: 'column', gap: 3}}>
            <div style={{fontSize: 12, fontWeight: 500, color: MUTED, letterSpacing: '0.01em'}}>{s.label}</div>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 3, color: INK}}>
              <span style={{fontSize: 25, fontWeight: 620, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums'}}>{s.value}</span>
              {s.unit ? <span style={{fontSize: 13, fontWeight: 520, color: MUTED}}>{s.unit}</span> : null}
            </div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 22, right: 22, top: 94, height: 1, background: HAIR}} />
      <svg style={{position: 'absolute', left: 0, top: 110}} width={SCREEN_W} height={CHART_H + 4} viewBox={`0 0 ${SCREEN_W} ${CHART_H + 4}`}>
        <defs>
          <linearGradient id={`elev-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={accent} stopOpacity={0.3} />
            <stop offset="1" stopColor={accent} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <path d={`M${CHART_X} ${CHART_H}L${full.join('L')}L${CHART_X + CHART_W} ${CHART_H}Z`} fill="#edf0ea" />
        <path d={`M${CHART_X} ${CHART_H}L${done.join('L')}L${px} ${CHART_H}Z`} fill={`url(#elev-${uid})`} />
        <path d={`M${rest.join('L')}`} stroke="#b9c0b6" strokeWidth={1.6} fill="none" strokeLinejoin="round" />
        <path d={`M${done.join('L')}`} stroke={accent} strokeWidth={2} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        <line x1={px} x2={px} y1={py} y2={CHART_H} stroke={INK} strokeOpacity={0.35} strokeWidth={1} strokeDasharray="2 2" />
        <circle cx={px} cy={py} r={4.5} fill="#fff" stroke={accent} strokeWidth={2.2} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 22,
          right: 22,
          top: 180,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          fontSize: 13,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <span style={{color: INK, fontWeight: 600}}>
          {pct}% <span style={{color: MUTED, fontWeight: 500}}>of {totalKm.toFixed(1)} km</span>
        </span>
        <span style={{color: MUTED, fontWeight: 500}}>
          ETA <span style={{color: INK, fontWeight: 600}}>{data.eta}</span>
        </span>
      </div>
      <div style={{position: 'absolute', left: 22, right: 22, top: 204, height: 6, borderRadius: 3, background: '#e6eae3', overflow: 'hidden'}}>
        <div style={{width: `${pct}%`, height: '100%', borderRadius: 3, background: accent}} />
      </div>
      <div style={{position: 'absolute', left: (SCREEN_W - 118) / 2, bottom: 8, width: 118, height: 5, borderRadius: 3, background: INK}} />
    </div>
  );
};

export const FieldScreen: React.FC<{
  uid: string;
  data: FieldScreenData;
  all: FieldScreenData[];
  trail: string;
  accent: string;
  totalKm: number;
}> = ({uid, data, all, trail, accent, totalKm}) => (
  <div
    style={{
      position: 'relative',
      width: SCREEN_W,
      height: SCREEN_H,
      overflow: 'hidden',
      background: '#fbfcf9',
      fontFamily: FONT,
      WebkitFontSmoothing: 'antialiased',
    }}
  >
    <Header data={data} trail={trail} accent={accent} />
    <MapPanel uid={uid} data={data} all={all} accent={accent} totalKm={totalKm} />
    <Sheet uid={uid} data={data} accent={accent} totalKm={totalKm} />
  </div>
);
