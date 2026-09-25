import React from 'react';
import {C, MONO, SANS, T} from './theme';
import {ANOM_IDX, ANOM_START, N1, REGIONS, actual1, forecast1, heat, spark} from './data';
import {EXPO_IN, EXPO_OUT, IN_OUT, Label, Panel, alpha, fmt, lerp, mix, tw} from './util';

// Main chart geometry (panel-local + global)
const MP = {x: 24, y: 130, w: 600, h: 270};
const PL = {l: 46, r: 582, t: 46, b: 238};
const YMIN = 2.6;
const YMAX = 5.0;
const px = (i: number) => PL.l + ((PL.r - PL.l) * i) / (N1 - 1);
const py = (v: number) => PL.b - ((v - YMIN) / (YMAX - YMIN)) * (PL.b - PL.t);
export const ANOM_PT = {x: MP.x + px(ANOM_IDX), y: MP.y + py(actual1[ANOM_IDX])};

const linePath = (vals: number[], from = 0, to = vals.length - 1) => {
  let d = '';
  for (let i = from; i <= to; i++) d += `${i === from ? 'M' : 'L'}${px(i).toFixed(2)},${py(vals[i]).toFixed(2)}`;
  return d;
};

const bandPath = () => {
  let d = '';
  for (let i = 0; i < N1; i++) d += `${i ? 'L' : 'M'}${px(i).toFixed(2)},${py(forecast1[i] + 0.2).toFixed(2)}`;
  for (let i = N1 - 1; i >= 0; i--) d += `L${px(i).toFixed(2)},${py(forecast1[i] - 0.2).toFixed(2)}`;
  return d + 'Z';
};

const gapPath = () => {
  let d = '';
  for (let i = ANOM_START - 1; i < N1; i++) d += `${i === ANOM_START - 1 ? 'M' : 'L'}${px(i).toFixed(2)},${py(forecast1[i] - 0.2).toFixed(2)}`;
  for (let i = N1 - 1; i >= ANOM_START - 1; i--) d += `L${px(i).toFixed(2)},${py(Math.min(actual1[i], forecast1[i] - 0.2)).toFixed(2)}`;
  return d + 'Z';
};

const SPARKS = [
  {name: 'Add to cart', val: '38.2%', d: '+0.4', seed: 3, base: 10, amp: 1.6, bad: false},
  {name: 'Payment success', val: '55.6%', d: '−16.9', seed: 5, base: 10, amp: 1.4, tail: -9, bad: true},
  {name: 'Avg. order value', val: '$84.10', d: '+1.2', seed: 8, base: 10, amp: 1.8, bad: false},
  {name: 'Bounce rate', val: '31.7%', d: '−0.3', seed: 11, base: 10, amp: 1.5, bad: false},
  {name: 'Refund requests', val: '212', d: '+2.0', seed: 13, base: 10, amp: 2.2, bad: false},
  {name: 'Gateway errors', val: '1,204', d: '×9.1', seed: 17, base: 6, amp: 1.2, tail: 14, bad: true},
];

const KPIS = [
  {name: 'Sessions · 24h', val: 1.284, unit: 'M', dec: 3, pre: '', d: '+2.1%', bad: false},
  {name: 'Checkout conversion', val: 3.24, unit: '%', dec: 2, pre: '', d: '−23.4%', bad: true},
  {name: 'Revenue / hour', val: 29.4, unit: 'k', dec: 1, pre: '$', d: '−18.7%', bad: true},
  {name: 'p95 checkout latency', val: 412, unit: 'ms', dec: 0, pre: '', d: '+6.0%', bad: false},
];

const ALERTS = [
  {t: '16:31', s: 'crit', m: 'Checkout conversion −23.4% · EU-West', fresh: true},
  {t: '15:58', s: 'warn', m: 'Gateway 3DS timeouts above p99 band', fresh: false},
  {t: '14:47', s: 'info', m: 'Traffic mix shift · mobile +3.2%', fresh: false},
  {t: '12:10', s: 'info', m: 'Nightly forecast model retrained', fresh: false},
];

export const S1Wall: React.FC<{f: number}> = ({f}) => {
  const flag = tw(f, 46, 60); // anomaly flagged
  const dim = tw(f, 60, 80, 0, 1, IN_OUT);
  // camera: slow settle, then accelerate into the anomaly
  const settle = tw(f, 0, 70, 1.035, 1, EXPO_OUT);
  const push = tw(f, 72, 116, 0, 1, EXPO_IN);
  const scale = settle * lerp(1, 4.2, push);
  const reveal = tw(f, 0, 50, 0.28, 1, IN_OUT);
  const revealIdx = reveal * (N1 - 1);
  const cursorX = px(revealIdx);
  const dimOthers = 1 - dim * 0.7;

  const kpiIn = (i: number) => tw(f, 0 + i * 3, 30 + i * 3);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transformOrigin: `${ANOM_PT.x}px ${ANOM_PT.y}px`,
        transform: `scale(${scale})`,
        filter: push > 0.25 ? `blur(${((push - 0.25) * 3).toFixed(2)}px)` : undefined,
      }}
    >
      {/* header */}
      <div style={{position: 'absolute', left: 24, top: 22, right: 24, height: 28, display: 'flex', alignItems: 'center', opacity: dimOthers}}>
        <div style={{width: 20, height: 20, borderRadius: 6, background: `conic-gradient(from 200deg, ${C.red}, ${C.amber}, ${C.mint}, ${C.blue}, ${C.red})`, boxShadow: 'inset 0 0 0 5px rgba(9,11,16,0.9)'}} />
        <div style={{marginLeft: 10, fontFamily: SANS, fontSize: 16, fontWeight: 650, color: C.text, letterSpacing: '-0.01em'}}>numo</div>
        <div style={{width: 1, height: 14, background: C.line, margin: '0 12px'}} />
        <div style={{fontFamily: SANS, fontSize: 13, color: C.sub}}>Revenue health · Storefront</div>
        <div style={{flex: 1}} />
        <div style={{display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 999, background: alpha(C.mint, 0.1), boxShadow: `inset 0 0 0 1px ${alpha(C.mint, 0.25)}`}}>
          <div style={{width: 6, height: 6, borderRadius: 3, background: C.mint, opacity: 0.5 + 0.5 * Math.abs(Math.sin(f / 12))}} />
          <Label color={C.mint} size={9.5}>Live</Label>
        </div>
        <Label color={C.sub} size={10} style={{marginLeft: 12}}>Tue 24 Sep · 16:40 UTC</Label>
      </div>

      {/* KPI row */}
      {KPIS.map((k, i) => {
        const x = 24 + i * (219 + 12);
        const p = kpiIn(i);
        const bad = k.bad && flag > 0.5;
        const v = k.val * tw(f, 0, 34, 0.86, 1, EXPO_OUT);
        const hot = k.name === 'Checkout conversion';
        return (
          <Panel
            key={k.name}
            x={x}
            y={60}
            w={219}
            h={58}
            style={{
              opacity: (0.75 + 0.25 * p) * (hot ? 1 - dim * 0.45 : dimOthers),
              transform: `translateY(${(1 - p) * 8}px)`,
              boxShadow: hot && flag > 0 ? `inset 0 0 0 1px ${alpha(C.red, 0.55 * flag)}, 0 18px 40px -18px rgba(0,0,0,0.8)` : undefined,
            }}
          >
            <Label style={{position: 'absolute', left: 12, top: 11}} size={9}>{k.name}</Label>
            <div style={{position: 'absolute', left: 12, top: 25, fontFamily: SANS, fontSize: 22, fontWeight: 600, color: C.text, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums'}}>
              {k.pre}
              {fmt(v, k.dec)}
              <span style={{fontSize: 13, color: C.sub, marginLeft: 2, fontWeight: 500}}>{k.unit}</span>
            </div>
            <div
              style={{
                position: 'absolute',
                right: 12,
                top: 30,
                fontFamily: MONO,
                fontSize: 11,
                padding: '2px 6px',
                borderRadius: 4,
                color: bad ? C.red : k.d.startsWith('+') && !k.name.includes('latency') ? C.mint : C.sub,
                background: bad ? alpha(C.red, 0.14) : 'rgba(255,255,255,0.04)',
              }}
            >
              {k.bad ? (flag > 0.5 ? k.d : '−0.2%') : k.d}
            </div>
          </Panel>
        );
      })}

      {/* Main chart */}
      <Panel x={MP.x} y={MP.y} w={MP.w} h={MP.h}>
        <div style={{position: 'absolute', left: 16, top: 14, fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.text}}>Checkout conversion</div>
        <Label style={{position: 'absolute', left: 168, top: 17}} size={9}>15-min · all regions</Label>
        <div style={{position: 'absolute', right: 16, top: 15, display: 'flex', gap: 14, alignItems: 'center'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
            <div style={{width: 14, height: 2, background: C.text, borderRadius: 1}} />
            <Label size={9}>Actual</Label>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
            <div style={{width: 14, height: 8, background: alpha(C.blue, 0.22), borderRadius: 2, boxShadow: `inset 0 0 0 1px ${alpha(C.blue, 0.4)}`}} />
            <Label size={9}>Forecast ±2σ</Label>
          </div>
        </div>
        <svg width={MP.w} height={MP.h} style={{position: 'absolute', left: 0, top: 0}}>
          <defs>
            <clipPath id="s1reveal">
              <rect x={0} y={0} width={cursorX} height={MP.h} />
            </clipPath>
            <linearGradient id="s1fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={C.text} stopOpacity={0.12} />
              <stop offset="1" stopColor={C.text} stopOpacity={0} />
            </linearGradient>
          </defs>
          {/* grid */}
          {[3.0, 3.5, 4.0, 4.5].map((v) => (
            <g key={v}>
              <line x1={PL.l} x2={PL.r} y1={py(v)} y2={py(v)} stroke={C.lineSoft} strokeWidth={1} />
              <text x={PL.l - 8} y={py(v) + 3.5} textAnchor="end" fontFamily={MONO} fontSize={9.5} fill={C.mute}>
                {v.toFixed(1)}%
              </text>
            </g>
          ))}
          {['18:00', '22:00', '02:00', '06:00', '10:00', '14:00'].map((t, k) => {
            const i = 5 + k * 16;
            return (
              <text key={t} x={px(i)} y={PL.b + 20} textAnchor="middle" fontFamily={MONO} fontSize={9.5} fill={C.mute}>
                {t}
              </text>
            );
          })}
          <path d={bandPath()} fill={alpha(C.blue, 0.13)} stroke={alpha(C.blue, 0.35)} strokeWidth={0.8} />
          <g clipPath="url(#s1reveal)">
            <path d={linePath(actual1) + `L${px(N1 - 1)},${PL.b}L${px(0)},${PL.b}Z`} fill="url(#s1fill)" />
            <path d={gapPath()} fill={alpha(C.red, 0.28 * flag)} />
            <path d={linePath(actual1, 0, ANOM_START - 1)} fill="none" stroke={C.text} strokeWidth={1.6} strokeLinejoin="round" />
            <path d={linePath(actual1, ANOM_START - 1)} fill="none" stroke={mix(C.text, C.red, flag)} strokeWidth={2} strokeLinejoin="round" />
          </g>
          {/* scan cursor */}
          {reveal < 0.999 && (
            <g opacity={tw(f, 44, 52, 1, 0)}>
              <line x1={cursorX} x2={cursorX} y1={PL.t - 6} y2={PL.b} stroke={alpha(C.blue, 0.8)} strokeWidth={1} />
              <rect x={cursorX - 40} y={PL.t - 6} width={40} height={PL.b - PL.t + 6} fill={alpha(C.blue, 0.06)} />
            </g>
          )}
          {flag > 0 && (
            <line x1={px(ANOM_IDX) - 36} x2={px(ANOM_IDX) - 36 + 26 * tw(f, 56, 68)} y1={py(actual1[ANOM_IDX])} y2={py(actual1[ANOM_IDX])} stroke={C.red} strokeWidth={1} opacity={0.8} />
          )}
          {/* anomaly dot + pulses */}
          {flag > 0 && (
            <g>
              {[0, 1, 2].map((k) => {
                const p = tw(f, 50 + k * 9, 86 + k * 9, 0, 1, EXPO_OUT);
                return p > 0 && p < 1 ? (
                  <circle key={k} cx={px(ANOM_IDX)} cy={py(actual1[ANOM_IDX])} r={6 + p * 34} fill="none" stroke={C.red} strokeWidth={1.5} opacity={(1 - p) * 0.9} />
                ) : null;
              })}
              <circle cx={px(ANOM_IDX)} cy={py(actual1[ANOM_IDX])} r={5.5 * tw(f, 46, 58, 0, 1, EXPO_OUT)} fill={C.red} stroke={C.bg} strokeWidth={2} />
            </g>
          )}
        </svg>
        {/* callout */}
        {flag > 0 && (
          <div
            style={{
              position: 'absolute',
              left: px(ANOM_IDX) - 204,
              top: py(actual1[ANOM_IDX]) - 24,
              width: 168,
              opacity: tw(f, 52, 62),
              transform: `translateX(${(1 - tw(f, 52, 66)) * 14}px)`,
              padding: '7px 10px',
              borderRadius: 7,
              background: 'rgba(12,14,20,0.92)',
              boxShadow: `inset 0 0 0 1px ${alpha(C.red, 0.6)}, 0 10px 24px rgba(0,0,0,0.5)`,
            }}
          >
            <Label color={C.red} size={9}>Anomaly · 14:02</Label>
            <div style={{fontFamily: SANS, fontSize: 15, fontWeight: 650, color: C.text, marginTop: 3, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums'}}>
              −23.4% <span style={{fontSize: 11, color: C.sub, fontWeight: 500}}>vs forecast</span>
            </div>
          </div>
        )}
      </Panel>

      {/* small multiples */}
      {SPARKS.map((s, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = 636 + col * 156;
        const y = 130 + row * 94;
        const data = spark(s.seed, 32, s.base, s.amp, s.tail);
        const mn = Math.min(...data);
        const mx = Math.max(...data);
        const w = 124;
        const h = 30;
        const d = data.map((v, k) => `${k ? 'L' : 'M'}${((k / (data.length - 1)) * w).toFixed(1)},${(h - ((v - mn) / (mx - mn)) * h).toFixed(1)}`).join('');
        const bad = s.bad && flag > 0.5;
        const p = tw(f, i * 3, 34 + i * 3, 0.35, 1, IN_OUT);
        return (
          <Panel key={s.name} x={x} y={y} w={144} h={82} style={{opacity: bad ? 1 - dim * 0.35 : dimOthers}}>
            <Label style={{position: 'absolute', left: 10, top: 9}} size={9}>{s.name}</Label>
            <div style={{position: 'absolute', left: 10, top: 22, fontFamily: SANS, fontSize: 15, fontWeight: 600, color: C.text, fontVariantNumeric: 'tabular-nums'}}>{s.val}</div>
            <div style={{position: 'absolute', right: 10, top: 25, fontFamily: MONO, fontSize: 9.5, color: bad ? C.red : C.mute}}>{s.d}</div>
            <svg width={w} height={h + 4} style={{position: 'absolute', left: 10, top: 44}}>
              <defs>
                <clipPath id={`sp${i}`}>
                  <rect x={0} y={0} width={w * p} height={h + 4} />
                </clipPath>
              </defs>
              <path d={d} transform="translate(0,2)" fill="none" stroke={bad ? C.red : alpha(C.blue, 0.9)} strokeWidth={1.3} clipPath={`url(#sp${i})`} strokeLinejoin="round" />
            </svg>
          </Panel>
        );
      })}

      {/* heatmap */}
      <Panel x={24} y={412} w={452} h={104} style={{opacity: dimOthers}}>
        <Label style={{position: 'absolute', left: 12, top: 10}} size={9}>Conversion · region × hour</Label>
        {REGIONS.map((r, ri) => (
          <div key={r} style={{position: 'absolute', left: 12, top: 27 + ri * 9.4, fontFamily: MONO, fontSize: 8, color: r === 'EU-W' && flag > 0.5 ? C.red : C.sub, lineHeight: '8px'}}>
            {r}
          </div>
        ))}
        <svg width={390} height={78} style={{position: 'absolute', left: 52, top: 26}}>
          {heat.map((row, ri) =>
            row.map((v, h) => {
              const on = tw(f, h * 1.2 - 10, h * 1.2 + 4);
              const hot = ri === 4 && h >= 21 && flag > 0;
              const col = hot ? mix('#2A3350', C.red, tw(f, 54 + (h - 21) * 3, 66 + (h - 21) * 3)) : mix('#161C2B', '#5770D9', v);
              return <rect key={`${ri}-${h}`} x={h * 16.2} y={ri * 9.4} width={14.6} height={8} rx={1.5} fill={col} opacity={on} />;
            }),
          )}
        </svg>
      </Panel>

      {/* alerts */}
      <Panel x={488} y={412} w={448} h={104} style={{opacity: dimOthers}}>
        <Label style={{position: 'absolute', left: 12, top: 10}} size={9}>Signals</Label>
        {ALERTS.map((a, i) => {
          const fresh = a.fresh;
          const shown = fresh ? tw(f, 56, 70) : 1;
          const shift = fresh ? 0 : tw(f, 56, 70, -1, 0);
          const y = 26 + (i + shift) * 18.5;
          const col = a.s === 'crit' ? C.red : a.s === 'warn' ? C.amber : C.mute;
          return (
            <div key={a.t} style={{position: 'absolute', left: 12, right: 12, top: y, height: 16, display: 'flex', alignItems: 'center', gap: 8, opacity: shown * (y > 90 ? 0 : 1)}}>
              <div style={{width: 6, height: 6, borderRadius: 3, background: col}} />
              <div style={{fontFamily: MONO, fontSize: 10, color: C.mute, width: 34}}>{a.t}</div>
              <div style={{fontFamily: SANS, fontSize: 11.5, color: fresh ? C.text : C.sub, fontWeight: fresh ? 600 : 400}}>{a.m}</div>
            </div>
          );
        })}
      </Panel>
    </div>
  );
};

export const S1_END = T.s1End;
