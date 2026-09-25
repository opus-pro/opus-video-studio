import React from 'react';
import {C, MONO, SANS} from './theme';
import {REGION_DELTAS} from './data';
import {EXPO_OUT, IN_OUT, Label, Panel, Rect, alpha, tw} from './util';

// geometry
const ROW0 = 152;
const ROWH = 42;
const BAR_X = 164;
const BAR_MAX = 296; // = 25%
const BAR_H = 14;
const barW = (d: number) => Math.max(3, (Math.abs(d) / 25) * BAR_MAX);
export const EU_BAR_RECT: Rect = {x: BAR_X, y: ROW0 + 4 * ROWH + (ROWH - BAR_H) / 2, w: barW(-23.4), h: BAR_H, r: 3};

const STEPS = [
  {name: 'Visit → Cart', v: 38.2, b: 38.6, d: '−0.4'},
  {name: 'Cart → Checkout', v: 61.3, b: 61.0, d: '+0.3'},
  {name: 'Checkout → Paid', v: 55.6, b: 72.6, d: '−17.0 pts'},
];
const FP = {x: 560, y: 96, w: 376, h: 250};
const F_BOT = 306; // global
const F_H = 150;
const colX = (i: number) => 584 + 22.5 + i * 109;
export const PAY_COL_RECT: Rect = {x: colX(2), y: F_BOT - (F_H * 55.6) / 100, w: 64, h: (F_H * 55.6) / 100, r: 3};

const sorted = [...REGION_DELTAS].map((r, i) => ({...r, i})).sort((a, b) => a.d - b.d);
const sortedPos = new Map(sorted.map((r, k) => [r.i, k]));

export const S2Where: React.FC<{f: number}> = ({f}) => {
  const head = tw(f, 168, 192);
  const leftIn = tw(f, 160, 184);
  const funIn = tw(f, 172, 196);
  const impIn = tw(f, 184, 208);
  const sortP = (i: number) => tw(f, 222 + i * 1.5, 248 + i * 1.5, 0, 1, IN_OUT);
  const colGrow = (i: number) => tw(f, 190 + i * 5, 222 + i * 5, 0, 1, EXPO_OUT);
  const focus = tw(f, 252, 268);
  const drift = S2_DRIFT(f);

  return (
    <div style={{position: 'absolute', inset: 0, transform: `scale(${drift})`, transformOrigin: `${S2_ORIGIN.x}px ${S2_ORIGIN.y}px`}}>
      <div style={{position: 'absolute', left: 24, top: 24, opacity: head, transform: `translateY(${(1 - head) * 10}px)`}}>
        <Label color={C.red} size={10.5}>Evidence 01 · Where</Label>
        <div style={{fontFamily: SANS, fontSize: 26, fontWeight: 650, color: C.text, letterSpacing: '-0.02em', marginTop: 6}}>
          The drop is isolated to EU‑West checkout.
        </div>
      </div>

      {/* region bars */}
      <Panel x={24} y={96} w={520} h={420} style={{opacity: leftIn, transform: `translateY(${(1 - leftIn) * 12}px)`}}>
        <div style={{position: 'absolute', left: 16, top: 16, fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.text}}>Conversion Δ vs forecast</div>
        <Label style={{position: 'absolute', left: 190, top: 19}} size={9}>by region · since 14:00</Label>
        <Label style={{position: 'absolute', right: 16, top: 19}} size={9}>
          <span style={{display: 'inline-block', width: 10, height: 8, background: alpha(C.blue, 0.18), boxShadow: `inset 0 0 0 1px ${alpha(C.blue, 0.4)}`, marginRight: 6, verticalAlign: -1}} />
          Normal ±2%
        </Label>
      </Panel>
      <div style={{position: 'absolute', left: 0, top: 0, opacity: leftIn}}>
        {/* normal range band + axis */}
        <div style={{position: 'absolute', left: BAR_X, top: ROW0 - 4, width: (2 / 25) * BAR_MAX, height: ROWH * 8 + 8, background: alpha(C.blue, 0.09), borderLeft: `1px solid ${alpha(C.blue, 0.4)}`, borderRight: `1px dashed ${alpha(C.blue, 0.3)}`}} />
        {[0, 5, 10, 15, 20, 25].map((v) => (
          <div key={v} style={{position: 'absolute', left: BAR_X + (v / 25) * BAR_MAX - 20, width: 40, textAlign: 'center', top: ROW0 + ROWH * 8 + 10, fontFamily: MONO, fontSize: 9, color: C.mute}}>
            {v}%
          </div>
        ))}
        {REGION_DELTAS.map((r, i) => {
          const k = sortedPos.get(i)!;
          const pos = i + (k - i) * sortP(k);
          const y = ROW0 + pos * ROWH;
          const hot = r.name === 'EU West';
          const grow = hot ? (f >= 186 ? 1 : 0) : tw(f, 176 + i * 2.5, 206 + i * 2.5);
          const w = barW(r.d) * grow;
          const sign = r.d > 0 ? '+' : '−';
          return (
            <div key={r.name} style={{position: 'absolute', left: 24, top: y, width: 520, height: ROWH}}>
              {hot && (
                <div style={{position: 'absolute', left: 8, right: 8, top: 3, bottom: 3, borderRadius: 6, background: alpha(C.red, 0.08 + 0.05 * focus), boxShadow: `inset 0 0 0 1px ${alpha(C.red, 0.28)}`, opacity: tw(f, 188, 204)}} />
              )}
              <div style={{position: 'absolute', left: 18, top: 0, height: ROWH, display: 'flex', alignItems: 'center', fontFamily: SANS, fontSize: 13, fontWeight: hot ? 650 : 450, color: hot ? C.text : C.sub}}>
                {r.name}
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: BAR_X - 24,
                  top: (ROWH - BAR_H) / 2,
                  width: w,
                  height: BAR_H,
                  borderRadius: 3,
                  background: hot ? C.red : r.d > 0 ? alpha(C.mint, 0.55) : '#4A5468',
                  boxShadow: hot ? `0 0 24px ${alpha(C.red, 0.45)}` : undefined,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: BAR_X - 24 + barW(r.d) + 10,
                  top: 0,
                  height: ROWH,
                  display: 'flex',
                  alignItems: 'center',
                  fontFamily: MONO,
                  fontSize: hot ? 13 : 11,
                  fontWeight: hot ? 600 : 400,
                  color: hot ? C.red : C.sub,
                  opacity: hot ? tw(f, 186, 198) : tw(f, 192 + i * 2.5, 206 + i * 2.5),
                }}
              >
                {sign}
                {Math.abs(r.d).toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>

      {/* funnel */}
      <Panel x={FP.x} y={FP.y} w={FP.w} h={FP.h} style={{opacity: funIn, transform: `translateY(${(1 - funIn) * 12}px)`}}>
        <div style={{position: 'absolute', left: 16, top: 16, fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.text}}>Step conversion</div>
        <Label style={{position: 'absolute', left: 130, top: 19}} size={9}>EU-West</Label>
        <div style={{position: 'absolute', right: 16, top: 17, display: 'flex', gap: 10}}>
          <Label size={9}>
            <span style={{display: 'inline-block', width: 8, height: 8, background: C.text, marginRight: 5, borderRadius: 2, verticalAlign: -1}} />
            Today
          </Label>
          <Label size={9}>
            <span style={{display: 'inline-block', width: 8, height: 8, boxShadow: `inset 0 0 0 1px ${C.sub}`, marginRight: 5, borderRadius: 2, verticalAlign: -1}} />
            7-day
          </Label>
        </div>
        {STEPS.map((s, i) => {
          const g = colGrow(i);
          const x = colX(i) - FP.x;
          const bot = F_BOT - FP.y;
          const hb = (F_H * s.b) / 100;
          const hv = ((F_H * s.v) / 100) * g;
          const hot = i === 2;
          return (
            <React.Fragment key={s.name}>
              <div style={{position: 'absolute', left: x - 6, top: bot - hb * g - 1, width: 76, height: hb * g + 1, borderRadius: 4, boxShadow: `inset 0 0 0 1px ${hot ? alpha(C.text, 0.5) : alpha(C.sub, 0.35)}`, backgroundImage: hot ? `repeating-linear-gradient(135deg, ${alpha(C.red, 0.18)} 0 4px, transparent 4px 8px)` : undefined}} />
              <div style={{position: 'absolute', left: x, top: bot - hv, width: 64, height: hv, borderRadius: 3, background: hot ? C.red : '#C9D0DD', boxShadow: hot ? `0 0 ${18 + 14 * focus}px ${alpha(C.red, 0.35 + 0.3 * focus)}` : undefined}} />
              <div style={{position: 'absolute', left: x - 20, width: 104, textAlign: 'center', top: bot - hb - 20, fontFamily: MONO, fontSize: hot ? 11.5 : 10.5, fontWeight: hot ? 600 : 400, color: hot ? C.red : C.sub, opacity: tw(f, 214 + i * 5, 228 + i * 5)}}>
                {s.d}
              </div>
              <div style={{position: 'absolute', left: x - 22, width: 108, textAlign: 'center', top: bot + 10, fontFamily: SANS, fontSize: 11, color: hot ? C.text : C.sub, fontWeight: hot ? 600 : 400}}>
                {s.name}
              </div>
              <div style={{position: 'absolute', left: x, width: 64, textAlign: 'center', top: bot - hv + 6, fontFamily: MONO, fontSize: 10.5, fontWeight: 600, color: hot ? C.ink : C.ink, opacity: tw(f, 210 + i * 5, 222 + i * 5)}}>
                {s.v.toFixed(1)}%
              </div>
            </React.Fragment>
          );
        })}
      </Panel>

      {/* impact */}
      <Panel x={560} y={358} w={376} h={158} style={{opacity: impIn, transform: `translateY(${(1 - impIn) * 12}px)`}}>
        <div style={{position: 'absolute', left: 16, top: 16, fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.text}}>Impact</div>
        <Label style={{position: 'absolute', left: 70, top: 19}} size={9}>since 14:02</Label>
        {[
          {k: 'Affected sessions', v: '18,240', c: C.text},
          {k: 'Revenue at risk', v: '$6.8k / hr', c: C.red},
          {k: 'Other 7 regions', v: 'within ±1.6%', c: C.sub},
        ].map((row, i) => {
          const p = tw(f, 200 + i * 6, 222 + i * 6);
          return (
            <div key={row.k} style={{position: 'absolute', left: 16, right: 16, top: 46 + i * 36, height: 32, display: 'flex', alignItems: 'center', borderTop: i ? `1px solid ${C.lineSoft}` : undefined, opacity: p, transform: `translateX(${(1 - p) * 10}px)`}}>
              <div style={{fontFamily: SANS, fontSize: 13, color: C.sub}}>{row.k}</div>
              <div style={{flex: 1}} />
              <div style={{fontFamily: SANS, fontSize: 17, fontWeight: 650, color: row.c, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums'}}>{row.v}</div>
            </div>
          );
        })}
      </Panel>
    </div>
  );
};

export const S2_DRIFT = (f: number) => tw(f, 156, 300, 1.025, 1, EXPO_OUT);
export const S2_ORIGIN = {x: 300, y: 330};
