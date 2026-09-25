import React from 'react';
import {C, MONO, SANS} from './theme';
import {EXPO_OUT, IN_OUT, BACK_OUT, Blur, Label, Panel, Rect, alpha, lerp, mix, tw} from './util';

const CARD = {x: 24, y: 24, w: 500, h: 492};
export const BUTTON_RECT: Rect = {x: 56, y: 436, w: 220, h: 44, r: 10};
const NODE = {x: CARD.x + CARD.w, y: 262};
const EV_X = 580;
const EV_W = 356;
const EV_H = 128;
const evY = (i: number) => 92 + i * 140;

const MiniBars: React.FC = () => (
  <svg width={110} height={100}>
    {[0.05, 0.03, 0.08, 0.06, 0.94, 0.07, 0.02, 0.1].map((v, i) => (
      <rect key={i} x={10} y={12 + i * 10.5} width={Math.max(3, v * 88)} height={6} rx={1.5} fill={i === 4 ? C.red : '#4A5468'} />
    ))}
    <line x1={10} x2={10} y1={8} y2={94} stroke={alpha(C.blue, 0.5)} />
  </svg>
);
const MiniLine: React.FC = () => {
  const pts = Array.from({length: 24}, (_, i) => {
    const e = i < 11 ? 0.18 + 0.05 * Math.sin(i * 1.7) : 0.78 + 0.05 * Math.sin(i * 2.1);
    return [8 + i * 4.1, 88 - e * 70] as const;
  });
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');
  return (
    <svg width={110} height={100}>
      <path d={`${d}L${pts[23][0]},90L8,90Z`} fill={alpha(C.red, 0.2)} />
      <path d={d} fill="none" stroke={C.red} strokeWidth={1.4} />
      <rect x={52} y={10} width={2} height={80} fill={C.text} opacity={0.8} />
      <rect x={42} y={6} width={22} height={9} rx={2} fill={C.red} />
    </svg>
  );
};
const MiniScatter: React.FC = () => {
  const pts: [number, number, boolean][] = [];
  for (let i = 0; i < 26; i++) {
    const post = i % 2 === 1;
    const x = post ? 58 + ((i * 37) % 40) : 14 + ((i * 23) % 30);
    const y = 20 + x * 0.72 + (((i * 53) % 17) - 8);
    pts.push([x, y, post]);
  }
  return (
    <svg width={110} height={100}>
      <line x1={10} y1={22} x2={102} y2={88} stroke={alpha(C.text, 0.6)} strokeDasharray="3 3" />
      {pts.map(([x, y, p], i) => (
        <circle key={i} cx={x} cy={Math.min(92, y)} r={2.4} fill={p ? C.red : alpha(C.blue, 0.85)} />
      ))}
    </svg>
  );
};

const EVIDENCE = [
  {k: '01 · Where', t: 'Drop isolated to EU‑West checkout', d: '−23.4% · 1 of 8 regions', V: MiniBars},
  {k: '02 · When', t: 'Payment errors ×9 at the 14:02 deploy', d: 'payment-sdk v2.14.0', V: MiniLine},
  {k: '03 · Why', t: 'Errors track the lost conversion', d: 'r = −0.94 · n = 42', V: MiniScatter},
];

const Check: React.FC<{p: number}> = ({p}) => (
  <svg width={20} height={20} style={{transform: `scale(${lerp(0.4, 1, p)})`, opacity: Math.min(1, p * 2)}}>
    <circle cx={10} cy={10} r={9.5} fill={alpha(C.mint, 0.16)} stroke={C.mint} strokeWidth={1} />
    <path d="M5.8 10.3 L8.7 13.1 L14.3 7.2" fill="none" stroke={C.mint} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} />
  </svg>
);

export const S4Action: React.FC<{f: number}> = ({f}) => {
  const cardIn = tw(f, 512, 536);
  const item = (k: number) => tw(f, 519 + k * 5, 543 + k * 5);
  const conf = tw(f, 548, 590, 0, 1, IN_OUT);
  const rec = tw(f, 546, 590, 0, 1, IN_OUT);
  const colIn = tw(f, 530, 548);

  // cursor
  const cur = tw(f, 552, 582, 0, 1, IN_OUT);
  const curX = lerp(760, BUTTON_RECT.x + 202, cur);
  const curY = lerp(600, BUTTON_RECT.y + 28, cur) - Math.sin(cur * Math.PI) * 40;
  const curPrev = tw(f - 1, 552, 582, 0, 1, IN_OUT);
  const vx = curX - lerp(760, BUTTON_RECT.x + 202, curPrev);
  const vy = curY - (lerp(600, BUTTON_RECT.y + 28, curPrev) - Math.sin(curPrev * Math.PI) * 40);
  const press = f >= 584 && f < 592 ? Math.sin(((f - 584) / 8) * Math.PI) : 0;
  const clicked = f >= 588;
  const done = f >= 600;
  const prog = tw(f, 588, 606, 0, 1, IN_OUT);
  const ripple = tw(f, 585, 610, 0, 1, EXPO_OUT);

  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* soft action glow */}
      <div style={{position: 'absolute', left: -200, top: 120, width: 800, height: 600, background: `radial-gradient(closest-side, ${alpha(C.mint, 0.1 * cardIn)}, transparent)`}} />

      <Panel x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} style={{opacity: cardIn, boxShadow: `inset 0 0 0 1px ${alpha(C.mint, 0.28)}, inset 0 1px 0 rgba(255,255,255,0.05), 0 30px 60px -24px rgba(0,0,0,0.9), 0 0 60px -30px ${alpha(C.mint, 0.5)}`}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 2, background: `linear-gradient(90deg, ${C.mint}, ${alpha(C.mint, 0)})`}} />
        <div style={{position: 'absolute', left: 32, top: 30, right: 32, display: 'flex', alignItems: 'center', opacity: item(0)}}>
          <Label color={C.mint} size={10.5}>Recommended action</Label>
          <div style={{flex: 1}} />
          <Label color={C.sub} size={9} style={{padding: '3px 7px', borderRadius: 4, boxShadow: `inset 0 0 0 1px ${C.line}`}}>
            P1 · prod-eu-west
          </Label>
        </div>
        <div style={{position: 'absolute', left: 32, top: 58, width: 440, fontFamily: SANS, fontSize: 32, lineHeight: '38px', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', opacity: item(1), transform: `translateY(${(1 - item(1)) * 10}px)`}}>
          Roll back payment-sdk
          <br />
          <span style={{color: C.mint}}>to v2.13.4</span>
        </div>
        <div style={{position: 'absolute', left: 32, top: 148, width: 436, fontFamily: SANS, fontSize: 14, lineHeight: '21px', color: C.sub, opacity: item(2), transform: `translateY(${(1 - item(2)) * 10}px)`}}>
          v2.14.0 shortened the 3DS challenge timeout for EU cards. Rolling back restores checkout with no schema or API changes.
        </div>

        {/* confidence */}
        <div style={{position: 'absolute', left: 32, top: 218, width: 436, opacity: item(3)}}>
          <div style={{display: 'flex', alignItems: 'baseline'}}>
            <div style={{fontFamily: SANS, fontSize: 13, color: C.text, fontWeight: 600}}>Confidence</div>
            <div style={{flex: 1}} />
            <div style={{fontFamily: SANS, fontSize: 22, fontWeight: 700, color: C.mint, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums'}}>{Math.round(94 * conf)}%</div>
          </div>
          <div style={{marginTop: 8, height: 6, borderRadius: 3, background: C.lineSoft, overflow: 'hidden'}}>
            <div style={{width: `${94 * conf}%`, height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${C.mintDeep}, ${C.mint})`}} />
          </div>
          <Label size={9.5} style={{marginTop: 9}} color={C.sub}>
            {`${Math.min(3, Math.floor(tw(f, 556, 580, 0, 3.999, (t) => t)))} of 3 independent signals agree`}
          </Label>
        </div>

        {/* projected recovery */}
        <div style={{position: 'absolute', left: 32, top: 296, width: 436, height: 96, borderRadius: 8, background: 'rgba(0,0,0,0.22)', boxShadow: `inset 0 0 0 1px ${C.lineSoft}`, opacity: item(4)}}>
          <Label size={9} style={{position: 'absolute', left: 12, top: 10}}>Projected conversion</Label>
          <div style={{position: 'absolute', right: 12, top: 8, fontFamily: MONO, fontSize: 10.5, color: C.mint}}>+$6.8k / hr · ~6 min</div>
          <svg width={436} height={96} style={{position: 'absolute', left: 0, top: 0}}>
            <defs>
              <clipPath id="recclip">
                <rect x={0} y={0} width={12 + 412 * rec} height={96} />
              </clipPath>
            </defs>
            <path d="M12,40 C80,38 140,44 200,41 L412,41 L424,41" stroke={alpha(C.blue, 0.35)} strokeWidth={10} fill="none" strokeLinecap="round" />
            <g clipPath="url(#recclip)">
              <path d="M12,40 C40,42 70,38 96,41 C112,43 118,70 130,74 C160,78 190,72 214,75" fill="none" stroke={C.text} strokeWidth={1.8} />
              <path d="M214,75 C250,76 262,44 292,41 C330,39 380,42 424,41" fill="none" stroke={C.mint} strokeWidth={2} strokeDasharray="5 4" />
            </g>
            <line x1={214} x2={214} y1={30} y2={86} stroke={alpha(C.mint, 0.7 * rec)} strokeDasharray="2 3" />
            <circle cx={214} cy={75} r={3.5 * rec} fill={C.mint} />
            <text x={220} y={88} fontFamily={MONO} fontSize={9} fill={C.mute} opacity={rec}>
              rollback
            </text>
          </svg>
        </div>

        {/* secondary button */}
        <div style={{position: 'absolute', left: 264, top: 412, width: 150, height: 44, borderRadius: 10, boxShadow: `inset 0 0 0 1px ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontSize: 14, fontWeight: 550, color: C.sub, opacity: item(5)}}>
          Open incident
        </div>
      </Panel>

      {/* primary button (the carried focus lands here) */}
      {f >= 532 && (
        <div
          style={{
            position: 'absolute',
            left: BUTTON_RECT.x,
            top: BUTTON_RECT.y,
            width: BUTTON_RECT.w,
            height: BUTTON_RECT.h,
            borderRadius: BUTTON_RECT.r,
            background: done ? mix(C.mint, '#9BF3D0', 0) : C.mint,
            transform: `scale(${1 - press * 0.04})`,
            boxShadow: `0 10px 30px -8px ${alpha(C.mint, 0.55)}, inset 0 1px 0 rgba(255,255,255,0.35)`,
            overflow: 'hidden',
          }}
        >
          {clicked && <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${prog * 100}%`, background: alpha(C.ink, 0.12)}} />}
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: SANS, fontSize: 14.5, fontWeight: 650, color: C.ink, letterSpacing: '-0.005em'}}>
            {done ? (
              <>
                <svg width={16} height={16}>
                  <path d="M3.5 8.4 L6.6 11.3 L12.6 5" fill="none" stroke={C.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - tw(f, 600, 610)} />
                </svg>
                Rollback started
              </>
            ) : clicked ? (
              <>
                <svg width={16} height={16} style={{transform: `rotate(${(f - 588) * 24}deg)`}}>
                  <circle cx={8} cy={8} r={6} fill="none" stroke={alpha(C.ink, 0.25)} strokeWidth={2} />
                  <path d="M8 2 A6 6 0 0 1 14 8" fill="none" stroke={C.ink} strokeWidth={2} strokeLinecap="round" />
                </svg>
                Rolling back…
              </>
            ) : (
              <>
                <svg width={16} height={16}>
                  <path d="M5 4.5 H10 A3.5 3.5 0 0 1 10 11.5 H5.5" fill="none" stroke={C.ink} strokeWidth={1.9} strokeLinecap="round" />
                  <path d="M7 2 L4.4 4.5 L7 7" fill="none" stroke={C.ink} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Roll back to v2.13.4
              </>
            )}
          </div>
        </div>
      )}
      {ripple > 0 && ripple < 1 && (
        <div style={{position: 'absolute', left: BUTTON_RECT.x - 16 * ripple, top: BUTTON_RECT.y - 16 * ripple, width: BUTTON_RECT.w + 32 * ripple, height: BUTTON_RECT.h + 32 * ripple, borderRadius: 10 + 16 * ripple, boxShadow: `0 0 0 1.5px ${alpha(C.mint, 1 - ripple)}`}} />
      )}
      {done && (
        <div style={{position: 'absolute', left: BUTTON_RECT.x, top: BUTTON_RECT.y + BUTTON_RECT.h + 10, fontFamily: MONO, fontSize: 10, color: C.mint, opacity: tw(f, 600, 610), whiteSpace: 'nowrap'}}>
          ETA 6 min · 0 / 12 pods
        </div>
      )}

      {/* connectors */}
      <svg width={960} height={540} style={{position: 'absolute', left: 0, top: 0}}>
        {EVIDENCE.map((_, i) => {
          const y = evY(i) + EV_H / 2;
          const p = tw(f, 552 + i * 5, 576 + i * 5, 0, 1, IN_OUT);
          const d = `M${EV_X},${y} C${EV_X - 34},${y} ${NODE.x + 26},${NODE.y} ${NODE.x},${NODE.y}`;
          const tDot = tw(f, 572 + i * 5, 596 + i * 5, 0, 1, IN_OUT);
          // point along cubic for the flowing dot
          const bx = (t: number) => {
            const u = 1 - t;
            return u * u * u * EV_X + 3 * u * u * t * (EV_X - 34) + 3 * u * t * t * (NODE.x + 26) + t * t * t * NODE.x;
          };
          const by = (t: number) => {
            const u = 1 - t;
            return u * u * u * y + 3 * u * u * t * y + 3 * u * t * t * NODE.y + t * t * t * NODE.y;
          };
          return (
            <g key={i}>
              <path d={d} fill="none" stroke={alpha(C.mint, 0.55)} strokeWidth={1.2} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} />
              {tDot > 0 && tDot < 1 && <circle cx={bx(tDot)} cy={by(tDot)} r={2.6} fill={C.mint} />}
            </g>
          );
        })}
        <circle cx={NODE.x} cy={NODE.y} r={4.5 * tw(f, 566, 580, 0, 1, BACK_OUT)} fill={C.bg} stroke={C.mint} strokeWidth={1.5} />
      </svg>

      {/* supporting evidence */}
      <Label style={{position: 'absolute', left: EV_X, top: 70, opacity: colIn}} size={10} color={C.sub}>
        Supported by
      </Label>
      {EVIDENCE.map((e, i) => {
        const p = tw(f, 534 + i * 6, 560 + i * 6);
        const chk = tw(f, 558 + i * 8, 572 + i * 8, 0, 1, EXPO_OUT);
        const V = e.V;
        return (
          <Panel key={e.k} x={EV_X} y={evY(i)} w={EV_W} h={EV_H} style={{opacity: p, transform: `translateX(${(1 - p) * 24}px)`, boxShadow: `inset 0 0 0 1px ${mix(C.line, '#2C5E4C', chk)}, 0 18px 40px -18px rgba(0,0,0,0.8)`}}>
            <div style={{position: 'absolute', left: 14, top: 14, width: 110, height: 100, borderRadius: 7, background: 'rgba(0,0,0,0.25)', boxShadow: `inset 0 0 0 1px ${C.lineSoft}`}}>
              <V />
            </div>
            <Label color={C.red} size={9.5} style={{position: 'absolute', left: 140, top: 18}}>
              {e.k}
            </Label>
            <div style={{position: 'absolute', right: 14, top: 14}}>
              <Check p={chk} />
            </div>
            <div style={{position: 'absolute', left: 140, top: 40, width: 196, fontFamily: SANS, fontSize: 15, lineHeight: '20px', fontWeight: 600, color: C.text, letterSpacing: '-0.01em'}}>{e.t}</div>
            <div style={{position: 'absolute', left: 140, top: 92, fontFamily: MONO, fontSize: 10, color: C.sub, whiteSpace: 'nowrap'}}>{e.d}</div>
          </Panel>
        );
      })}

      {/* cursor */}
      {cur > 0 && (
        <Blur id="curblur" x={vx * 0.3} y={vy * 0.3} style={{position: 'absolute', left: curX, top: curY, transform: `scale(${1 - press * 0.12})`, transformOrigin: '0 0'}}>
          <svg width={22} height={26} style={{filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'}}>
            <path d="M2 2 L2 20 L7 15.5 L10.5 23 L13.6 21.6 L10.2 14.3 L17 14.3 Z" fill={C.text} stroke={C.ink} strokeWidth={1.3} strokeLinejoin="round" />
          </svg>
        </Blur>
      )}
    </div>
  );
};
