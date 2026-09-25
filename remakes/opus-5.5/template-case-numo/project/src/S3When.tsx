import React from 'react';
import {C, MONO, SANS, T} from './theme';
import {DEPLOY_T, N3, conv3, err3, scatter} from './data';
import {EXPO_OUT, IN_OUT, Label, Panel, Rect, alpha, tw} from './util';

const CP = {x: 24, y: 96, w: 580, h: 250};
const CL = {l: 40, r: 564, t: 46, b: 218};
const cx = (i: number) => CL.l + ((CL.r - CL.l) * i) / (N3 - 1);
const cyConv = (v: number) => CL.b - ((v - 2.8) / (4.8 - 2.8)) * (CL.b - CL.t);
const cyErr = (v: number) => CL.b - (v / 5) * (CL.b - CL.t);
const MARK_X = CL.l + (CL.r - CL.l) * DEPLOY_T;
export const MARKER_RECT: Rect = {x: CP.x + MARK_X - 1, y: CP.y + CL.t - 12, w: 2, h: CL.b - CL.t + 12, r: 1};

const SP = {x: 620, y: 96, w: 316, h: 250};
const SL = {l: 38, r: 300, t: 64, b: 214};
const sx = (v: number) => SL.l + (v / 4.5) * (SL.r - SL.l);
const sy = (v: number) => SL.b - ((v - 3.0) / (4.8 - 3.0)) * (SL.b - SL.t);

const LP = {x: 24, y: 360, w: 912, h: 156};
const ROW0 = 38;
const RH = 22;
export const ROW_RECT: Rect = {x: LP.x + 8, y: LP.y + ROW0 + 2 * RH, w: LP.w - 16, h: RH, r: 4};

const LOG = [
  {t: '13:41:07', s: 'search-api', e: 'config  cache.ttl 300 → 600', env: 'prod', a: 'ops-bot'},
  {t: '13:55:42', s: 'web-checkout', e: 'flag  address-autocomplete → 10%', env: 'prod', a: 'j.park'},
  {t: '14:02:11', s: 'payment-sdk', e: 'deploy  v2.13.4 → v2.14.0', env: 'prod-eu-west', a: 'ci/release'},
  {t: '14:02:48', s: 'payment-gw', e: 'error  3DS challenge timeout ×1,204', env: 'prod-eu-west', a: '—'},
  {t: '14:09:30', s: 'cdn', e: 'purge  /static/checkout/*', env: 'prod', a: 'ops-bot'},
];

const path = (vals: number[], y: (v: number) => number) => vals.map((v, i) => `${i ? 'L' : 'M'}${cx(i).toFixed(2)},${y(v).toFixed(2)}`).join('');

export const S3When: React.FC<{f: number}> = ({f}) => {
  const head = tw(f, 348, 372);
  const chartIn = tw(f, 340, 362);
  const draw = tw(f, 348, 396, 0, 1, IN_OUT);
  const markLabel = tw(f, 366, 382);
  const scIn = tw(f, 350, 372);
  const fit = tw(f, 384, 410, 0, 1, IN_OUT);
  const logIn = tw(f, 356, 376);
  const hi = tw(f, 404, 418);
  const drift = tw(f, 336, 470, 1.025, 1, EXPO_OUT);
  const errArea = path(err3, cyErr) + `L${cx(N3 - 1)},${CL.b}L${cx(0)},${CL.b}Z`;

  return (
    <div style={{position: 'absolute', inset: 0, transform: `scale(${drift})`, transformOrigin: `${MARKER_RECT.x}px 220px`}}>
      <div style={{position: 'absolute', left: 24, top: 24, opacity: head, transform: `translateY(${(1 - head) * 10}px)`}}>
        <Label color={C.red} size={10.5}>Evidence 02 · When</Label>
        <div style={{fontFamily: SANS, fontSize: 26, fontWeight: 650, color: C.text, letterSpacing: '-0.02em', marginTop: 6}}>
          Payment errors spiked with the 14:02 deploy.
        </div>
      </div>

      {/* timeline chart */}
      <Panel x={CP.x} y={CP.y} w={CP.w} h={CP.h} style={{opacity: chartIn}}>
        <div style={{position: 'absolute', left: 16, top: 16, fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.text}}>EU-West checkout</div>
        <Label style={{position: 'absolute', left: 150, top: 19}} size={9}>12:00 – 16:40 · 5-min</Label>
        <div style={{position: 'absolute', right: 16, top: 17, display: 'flex', gap: 12}}>
          <Label size={9}>
            <span style={{display: 'inline-block', width: 12, height: 2, background: C.text, marginRight: 5, verticalAlign: 3}} />
            Conversion
          </Label>
          <Label size={9}>
            <span style={{display: 'inline-block', width: 8, height: 8, background: alpha(C.red, 0.5), marginRight: 5, borderRadius: 2, verticalAlign: -1}} />
            Payment errors
          </Label>
        </div>
        <svg width={CP.w} height={CP.h} style={{position: 'absolute', left: 0, top: 0}}>
          <defs>
            <clipPath id="s3draw">
              <rect x={0} y={0} width={CL.l + (CL.r - CL.l) * draw} height={CP.h} />
            </clipPath>
            <linearGradient id="s3err" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={C.red} stopOpacity={0.55} />
              <stop offset="1" stopColor={C.red} stopOpacity={0.04} />
            </linearGradient>
          </defs>
          {[3.0, 3.5, 4.0, 4.5].map((v) => (
            <g key={v}>
              <line x1={CL.l} x2={CL.r} y1={cyConv(v)} y2={cyConv(v)} stroke={C.lineSoft} />
              <text x={CL.l - 8} y={cyConv(v) + 3.5} textAnchor="end" fontFamily={MONO} fontSize={9} fill={C.mute}>
                {v.toFixed(1)}
              </text>
            </g>
          ))}
          {['12:00', '13:00', '14:00', '15:00', '16:00'].map((t, k) => (
            <text key={t} x={CL.l + ((CL.r - CL.l) * (k * 60)) / 280} y={CL.b + 18} textAnchor={k === 0 ? 'start' : 'middle'} fontFamily={MONO} fontSize={9} fill={C.mute}>
              {t}
            </text>
          ))}
          <g clipPath="url(#s3draw)">
            <path d={errArea} fill="url(#s3err)" />
            <path d={path(err3, cyErr)} fill="none" stroke={C.red} strokeWidth={1.4} />
            <path d={path(conv3, cyConv)} fill="none" stroke={C.text} strokeWidth={1.8} strokeLinejoin="round" />
          </g>
          {/* marker */}
          {f >= T.t2CollapseEnd && <rect x={MARK_X - 1} y={CL.t - 12} width={2} height={CL.b - CL.t + 12} fill={C.red} />}
        </svg>
        <div
          style={{
            position: 'absolute',
            left: MARK_X + 8,
            top: CL.t - 4,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 9px 4px 4px',
            borderRadius: 6,
            background: 'rgba(12,14,20,0.94)',
            boxShadow: `inset 0 0 0 1px ${alpha(C.red, 0.55)}`,
            opacity: markLabel,
            transform: `translateX(${(1 - markLabel) * -8}px)`,
          }}
        >
          <div style={{fontFamily: MONO, fontSize: 11, fontWeight: 700, color: C.ink, background: C.red, borderRadius: 4, padding: '2px 6px'}}>14:02</div>
          <div style={{fontFamily: MONO, fontSize: 10.5, color: C.text}}>payment-sdk v2.14.0</div>
        </div>
        <div style={{position: 'absolute', right: 20, top: cyErr(err3[N3 - 1]) - 40, fontFamily: MONO, fontSize: 11, fontWeight: 600, color: C.red, opacity: tw(f, 392, 404)}}>
          errors ×9.1
        </div>
      </Panel>

      {/* scatter */}
      <Panel x={SP.x} y={SP.y} w={SP.w} h={SP.h} style={{opacity: scIn}}>
        <div style={{position: 'absolute', left: 16, top: 16, fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.text}}>Errors vs conversion</div>
        <div style={{position: 'absolute', right: 16, top: 12, textAlign: 'right', opacity: tw(f, 398, 412)}}>
          <div style={{fontFamily: SANS, fontSize: 20, fontWeight: 700, color: C.text, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums'}}>r = −0.94</div>
        </div>
        <Label style={{position: 'absolute', left: 16, top: 36}} size={9}>n = 42 · 5-min buckets</Label>
        <svg width={SP.w} height={SP.h} style={{position: 'absolute', left: 0, top: 0}}>
          <line x1={SL.l} x2={SL.r} y1={SL.b} y2={SL.b} stroke={C.line} />
          <line x1={SL.l} x2={SL.l} y1={SL.t} y2={SL.b} stroke={C.line} />
          {[0, 1, 2, 3, 4].map((v) => (
            <text key={v} x={sx(v)} y={SL.b + 15} textAnchor="middle" fontFamily={MONO} fontSize={9} fill={C.mute}>
              {v}%
            </text>
          ))}
          {[3.5, 4.0, 4.5].map((v) => (
            <text key={v} x={SL.l - 7} y={sy(v) + 3} textAnchor="end" fontFamily={MONO} fontSize={9} fill={C.mute}>
              {v.toFixed(1)}
            </text>
          ))}
          <line
            x1={sx(0)}
            y1={sy(4.55)}
            x2={sx(0) + (sx(4.5) - sx(0)) * fit}
            y2={sy(4.55) + (sy(4.55 - 0.3 * 4.5) - sy(4.55)) * fit}
            stroke={alpha(C.text, 0.7)}
            strokeWidth={1.2}
            strokeDasharray="4 3"
          />
          {scatter.map((p, i) => {
            const a = tw(f, 352 + i * 0.9, 366 + i * 0.9, 0, 1, EXPO_OUT);
            return <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={3.2 * a} fill={p.post ? C.red : alpha(C.blue, 0.85)} stroke={C.panel} strokeWidth={1} opacity={a} />;
          })}
        </svg>
      </Panel>

      {/* event log */}
      <Panel x={LP.x} y={LP.y} w={LP.w} h={LP.h} style={{opacity: logIn}}>
        <div style={{position: 'absolute', left: 16, top: 13, fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.text}}>Change log</div>
        <Label style={{position: 'absolute', left: 98, top: 16}} size={9}>13:30 – 14:15 · all services</Label>
        {LOG.map((r, i) => {
          const p = tw(f, 362 + i * 4, 380 + i * 4);
          const hot = i === 2;
          const y = ROW0 + i * RH;
          return (
            <div key={r.t} style={{position: 'absolute', left: 8, right: 8, top: y, height: RH, opacity: p, transform: `translateY(${(1 - p) * 6}px)`}}>
              {hot && (
                <div style={{position: 'absolute', inset: 0, borderRadius: 4, background: alpha(C.red, 0.16 * hi), boxShadow: `inset 3px 0 0 ${alpha(C.red, hi)}, inset 0 0 0 1px ${alpha(C.red, 0.35 * hi)}`}} />
              )}
              <div style={{position: 'absolute', left: 12, top: 0, height: RH, display: 'flex', alignItems: 'center', fontFamily: MONO, fontSize: 11, color: hot && hi > 0.5 ? C.text : C.sub, whiteSpace: 'nowrap'}}>
                <span style={{width: 78, color: C.mute}}>{r.t}</span>
                <span style={{width: 112, color: hot && hi > 0.5 ? C.red : C.sub, fontWeight: hot ? 600 : 400}}>{r.s}</span>
                <span style={{width: 300}}>{r.e}</span>
                <span style={{width: 116, color: C.mute}}>{r.env}</span>
                <span style={{width: 90, color: C.mute}}>{r.a}</span>
              </div>
              {hot && (
                <div style={{position: 'absolute', right: 8, top: 3, height: RH - 6, display: 'flex', alignItems: 'center', padding: '0 7px', borderRadius: 4, background: C.red, opacity: tw(f, 412, 424), transform: `scale(${tw(f, 412, 426, 0.8, 1)})`}}>
                  <Label color={C.ink} size={8.5} style={{fontWeight: 700}}>Likely cause</Label>
                </div>
              )}
            </div>
          );
        })}
      </Panel>
    </div>
  );
};

export const S3_DRIFT = (f: number) => tw(f, 336, 470, 1.025, 1, EXPO_OUT);
export const S3_ORIGIN = {x: MARKER_RECT.x, y: 220};
