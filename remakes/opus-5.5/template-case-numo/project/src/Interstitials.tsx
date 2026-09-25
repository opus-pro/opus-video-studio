import React from 'react';
import {C, MONO, SANS} from './theme';
import {Blur, EXPO_IN, EXPO_OUT, Label, alpha, tw} from './util';

/** Oversized word/number, revealed per character from a mask with vertical motion blur. */
export const GiantText: React.FC<{
  f: number;
  id: string;
  text: string;
  size: number;
  inAt: number;
  outAt: number;
  color: string;
  weight?: number;
  tracking?: string;
  stagger?: number;
  style?: React.CSSProperties;
}> = ({f, id, text, size, inAt, outAt, color, weight = 800, tracking = '-0.05em', stagger = 2, style}) => {
  const chars = [...text];
  const pos = (fr: number, i: number) => {
    const a = tw(fr, inAt + i * stagger, inAt + i * stagger + 20, 1.08, 0, EXPO_OUT);
    const b = tw(fr, outAt + i * stagger * 0.6, outAt + i * stagger * 0.6 + 12, 0, -1.08, EXPO_IN);
    return (a + b) * size;
  };
  return (
    <div style={{display: 'flex', flexShrink: 0, whiteSpace: 'pre', overflow: 'hidden', height: size * 1.0, paddingTop: size * 0.02, paddingRight: size * 0.06, ...style}}>
      {chars.map((ch, i) => {
        const y = pos(f, i);
        const v = y - pos(f - 1, i);
        return (
          <Blur
            key={i}
            id={`${id}-${i}`}
            y={v * 0.22}
            style={{
              transform: `translateY(${y.toFixed(2)}px)`,
              fontFamily: SANS,
              fontSize: size,
              fontWeight: weight,
              lineHeight: `${size * 0.96}px`,
              letterSpacing: tracking,
              color,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {ch}
          </Blur>
        );
      })}
    </div>
  );
};

const Fade: React.FC<{f: number; a: number; b: number; out: number; children: React.ReactNode; style?: React.CSSProperties; dy?: number}> = ({f, a, b, out, children, style, dy = 10}) => {
  const p = tw(f, a, b) * tw(f, out, out + 8, 1, 0);
  return <div style={{position: 'absolute', opacity: p, transform: `translateY(${(1 - tw(f, a, b)) * dy}px)`, ...style}}>{children}</div>;
};

export const T1Content: React.FC<{f: number; ring: {x: number; y: number}}> = ({f, ring}) => (
  <div style={{position: 'absolute', inset: 0}}>
    <svg width={960} height={540} style={{position: 'absolute', inset: 0}}>
      {[0, 1, 2, 3, 4, 5].map((k) => {
        const r = 70 + k * 120 + tw(f, 96, 170, 0, 60, EXPO_OUT);
        return <circle key={k} cx={ring.x} cy={ring.y} r={r} fill="none" stroke={alpha(C.ink, 0.1)} strokeWidth={1.2} />;
      })}
      <line x1={ring.x} x2={ring.x} y1={0} y2={540} stroke={alpha(C.ink, 0.12)} />
      <line x1={0} x2={960} y1={ring.y} y2={ring.y} stroke={alpha(C.ink, 0.12)} />
    </svg>
    <Fade f={f} a={104} b={120} out={142} style={{left: 40, top: 34}}>
      <Label color={C.ink} size={12} style={{fontWeight: 600}}>● Anomaly detected</Label>
    </Fade>
    <Fade f={f} a={106} b={122} out={142} style={{right: 40, top: 34}}>
      <Label color={C.ink} size={12}>EU-West · 14:02 UTC</Label>
    </Fade>
    <div style={{position: 'absolute', left: 20, right: 0, top: 146, display: 'flex', justifyContent: 'center'}}>
      <GiantText f={f} id="t1" text="−23.4%" size={236} inAt={102} outAt={144} color={C.ink} />
    </div>
    <Fade f={f} a={114} b={132} out={146} style={{left: 40, top: 452}}>
      <div style={{fontFamily: SANS, fontSize: 30, fontWeight: 700, color: C.ink, letterSpacing: '-0.02em'}}>Checkout conversion fell off forecast.</div>
    </Fade>
    <Fade f={f} a={118} b={134} out={146} style={{right: 40, top: 462}}>
      <div style={{fontFamily: MONO, fontSize: 14, color: C.ink, opacity: 0.75}}>6.1σ below band</div>
    </Fade>
  </div>
);

export const T2Content: React.FC<{f: number}> = ({f}) => {
  const rx = (t: number) => 40 + 880 * t;
  const mark = tw(f, 300, 326, 0, 1, EXPO_OUT);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <Fade f={f} a={296} b={312} out={330} style={{left: 40, top: 34}}>
        <Label color={C.ink} size={12} style={{fontWeight: 600}}>Evidence 02 · When</Label>
      </Fade>
      <Fade f={f} a={298} b={314} out={330} style={{right: 40, top: 34}}>
        <Label color={C.ink} size={12}>Tue 24 Sep · UTC</Label>
      </Fade>
      <div style={{position: 'absolute', left: 0, right: 0, top: 96, display: 'flex', justifyContent: 'center'}}>
        <GiantText f={f} id="t2" text="14:02" size={280} inAt={298} outAt={332} stagger={1.5} color={C.ink} tracking="-0.045em" />
      </div>
      {/* oversized ruler */}
      <div style={{position: 'absolute', inset: 0, opacity: tw(f, 298, 312) * tw(f, 332, 342, 1, 0)}}>
        <svg width={960} height={540} style={{position: 'absolute', inset: 0}}>
          {Array.from({length: 57}, (_, i) => {
            const t = i / 56;
            const major = i % 12 === 0;
            const show = tw(f, 298 + i * 0.25, 308 + i * 0.25);
            return <line key={i} x1={rx(t)} x2={rx(t)} y1={major ? 392 : 400} y2={414} stroke={C.ink} strokeOpacity={major ? 0.7 : 0.3} strokeWidth={1} opacity={show} />;
          })}
          {['12:00', '13:00', '14:00', '15:00', '16:00'].map((l, k) => (
            <text key={l} x={rx((k * 60) / 280)} y={432} textAnchor={k === 0 ? 'start' : 'middle'} fontFamily={MONO} fontSize={11} fill={C.ink} opacity={0.6}>
              {l}
            </text>
          ))}
          <line x1={rx(0)} x2={rx(0.4357 * mark)} y1={414} y2={414} stroke={C.red} strokeWidth={3} />
          <rect x={rx(0.4357) - 1.5} y={380} width={3} height={42} fill={C.red} opacity={mark} />
          <circle cx={rx(0.4357)} cy={380} r={5 * mark} fill={C.red} />
        </svg>
      </div>
      <Fade f={f} a={306} b={322} out={330} style={{left: 40, top: 462}}>
        <div style={{fontFamily: SANS, fontSize: 30, fontWeight: 700, color: C.ink, letterSpacing: '-0.02em'}}>Every signal breaks at the same minute.</div>
      </Fade>
    </div>
  );
};

export const T3Content: React.FC<{f: number}> = ({f}) => {
  const arc = tw(f, 468, 500, 0, 1, EXPO_OUT);
  const arcO = tw(f, 496, 506, 1, 0);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <svg width={960} height={540} style={{position: 'absolute', inset: 0}}>
        <circle cx={480} cy={272} r={236} fill="none" opacity={arcO} stroke={alpha(C.ink, 0.1)} strokeWidth={46} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - arc * 0.82} transform="rotate(-70 480 272)" strokeLinecap="round" />
      </svg>
      <Fade f={f} a={466} b={482} out={496} style={{left: 40, top: 34}}>
        <Label color={C.ink} size={12} style={{fontWeight: 600}}>Recommended action</Label>
      </Fade>
      <Fade f={f} a={468} b={484} out={496} style={{right: 40, top: 34}}>
        <Label color={C.ink} size={12}>Confidence 94%</Label>
      </Fade>
      <div style={{position: 'absolute', left: 0, right: 0, top: 160, display: 'flex', justifyContent: 'center'}}>
        <GiantText f={f} id="t3" text="Roll back." size={196} inAt={462} outAt={498} color={C.ink} tracking="-0.055em" stagger={1.1} />
      </div>
      <Fade f={f} a={476} b={492} out={496} style={{left: 40, top: 462}}>
        <div style={{fontFamily: MONO, fontSize: 20, fontWeight: 600, color: C.ink}}>payment-sdk  v2.14.0 → v2.13.4</div>
      </Fade>
      <Fade f={f} a={480} b={494} out={496} style={{right: 40, top: 466}}>
        <div style={{fontFamily: MONO, fontSize: 14, color: C.ink, opacity: 0.75}}>3 of 3 signals agree</div>
      </Fade>
    </div>
  );
};
