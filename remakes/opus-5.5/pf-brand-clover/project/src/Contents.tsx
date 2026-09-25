import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {Clover} from './Clover';
import {C, REGION, T, WORD_SCALE, WORD_SIZE, clamp01, ease, lerp, progress} from './system';

// ---------------------------------------------------------------------------
// Wordmark metrics (Geist 700, -0.035em tracking), measured from renders.
// ---------------------------------------------------------------------------
const CAP = 0.716; // cap height / font size
const WIDTH1 = 268; // ink width of FIELD at 104px
const INK_PAD = 56;
// glyph-ink centre relative to the text box centre at 104px (measured)
export const INK_DX = 3.4;
export const INK_DY = 1.6;
const capH = CAP * WORD_SIZE * WORD_SCALE;
const baseline = REGION.ink.y + REGION.ink.h - INK_PAD;
const markX = REGION.ink.x + INK_PAD;
const wordLeft = markX + capH + 0.3 * capH;

export const LOCKUP = {
  capHeight1: CAP * WORD_SIZE,
  wordWidth1: WIDTH1,
  boxShift: 0, // % of the text box height to move so caps are centred on the anchor
  wordCenter: {x: wordLeft + (WIDTH1 * WORD_SCALE) / 2 - INK_DX * WORD_SCALE, y: baseline - capH / 2 + INK_DY * WORD_SCALE},
  mark: {x: markX, y: baseline - capH, size: capH},
};

// ---------------------------------------------------------------------------
// Reveal helpers
// ---------------------------------------------------------------------------
const rv = (f: number, at: number, dur = 28) => ease.out(progress(f, at, at + dur));

const Rise: React.FC<{
  at: number;
  x: number;
  y: number;
  h: number;
  w?: number;
  align?: 'left' | 'right';
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({at, x, y, h, w, align = 'left', children, style}) => {
  const f = useCurrentFrame();
  const e = rv(f, at);
  if (e <= 0) return null;
  const pos: React.CSSProperties = align === 'left' ? {left: x} : {right: x};
  return (
    <div style={{position: 'absolute', top: y, height: h, width: w, overflow: 'hidden', ...pos}}>
      <div
        style={{
          transform: e < 1 ? `translateY(${((1 - e) * 100).toFixed(2)}%)` : undefined,
          opacity: clamp01(e * 1.6),
          whiteSpace: 'nowrap',
          textAlign: align,
          lineHeight: `${h}px`,
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
};

const label: React.CSSProperties = {
  fontSize: 19,
  fontWeight: 600,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
};

const R0 = T.revealStart; // 84

// ---------------------------------------------------------------------------
// Ink panel — primary lockup
// ---------------------------------------------------------------------------
export const InkContent: React.FC = () => {
  const f = useCurrentFrame();
  const r = REGION.ink;
  const m = LOCKUP.mark;
  const mp = (d: number) => ease.out(progress(f, 100 + d, 128 + d));
  const sp = (d: number) => lerp(0.35, 1, mp(d));
  const mr = -45 * (1 - ease.resolve(progress(f, 98, 136)));
  const pulse = (Math.sin(((f - T.revealEnd) / 60) * Math.PI * 2) + 1) / 2;
  const live = f > T.revealEnd ? pulse : 0;
  return (
    <div style={{position: 'absolute', inset: 0, color: C.paper}}>
      <Rise at={R0 + 2} x={INK_PAD} y={50} h={28} style={{...label, color: 'rgba(243,239,231,0.62)'}}>
        Identity System · 01
      </Rise>
      <Rise at={R0 + 6} x={INK_PAD} y={50} h={28} align="right" style={{...label, color: 'rgba(243,239,231,0.62)'}}>
        <span
          style={{
            display: 'inline-block',
            width: 10,
            height: 10,
            borderRadius: 5,
            background: C.coral,
            marginRight: 12,
            transform: 'translateY(-2px)',
            boxShadow: `0 0 0 ${(live * 7).toFixed(2)}px rgba(255,106,75,${(0.28 * (1 - live)).toFixed(3)})`,
          }}
        />
        Living system
      </Rise>
      <Rise at={R0 + 10} x={INK_PAD} y={116} h={64} style={{fontSize: 52, fontWeight: 500, letterSpacing: '-0.025em'}}>
        Made for open ground.
      </Rise>
      <Rise
        at={R0 + 16}
        x={INK_PAD}
        y={186}
        h={34}
        style={{fontSize: 24, fontWeight: 400, letterSpacing: '-0.005em', color: 'rgba(243,239,231,0.62)'}}
      >
        One mark, four capsules, a system that unfolds.
      </Rise>
      <div style={{position: 'absolute', left: m.x - r.x, top: m.y - r.y}}>
        <Clover
          size={m.size}
          rotation={mr}
          colors={[C.moss, C.ochre, C.coral, C.paper]}
          petalScale={[mp(0), mp(3), mp(6), mp(9)]}
          spread={[sp(0), sp(3), sp(6), sp(9)]}
        />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Coral panel — typography
// ---------------------------------------------------------------------------
export const CoralContent: React.FC = () => {
  const f = useCurrentFrame();
  const hold = Math.max(0, f - T.revealEnd);
  const weight = 620 + 200 * Math.sin((hold / 150) * Math.PI * 2 - 0) * clamp01(hold / 30);
  const aa = rv(f, R0 + 8, 34);
  const ink = C.ink;
  return (
    <div style={{position: 'absolute', inset: 0, color: ink}}>
      <Rise at={R0 + 4} x={40} y={34} h={28} style={{...label, color: 'rgba(15,36,28,0.7)'}}>
        Typography
      </Rise>
      <Rise at={R0 + 8} x={40} y={34} h={28} align="right" style={{...label, color: 'rgba(15,36,28,0.7)'}}>
        Geist Variable
      </Rise>
      <div
        style={{
          position: 'absolute',
          left: 34,
          top: 70,
          height: 200,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            fontSize: 200,
            lineHeight: '200px',
            fontWeight: Math.round(weight),
            letterSpacing: '-0.04em',
            transform: aa < 1 ? `translateY(${((1 - aa) * 100).toFixed(2)}%)` : undefined,
          }}
        >
          Aa
        </div>
      </div>
      <Rise at={R0 + 16} x={360} y={112} h={36} style={{fontSize: 27, fontWeight: 600, letterSpacing: '-0.01em'}}>
        ABCDEFGHIJKLM
      </Rise>
      <Rise at={R0 + 20} x={360} y={152} h={36} style={{fontSize: 27, fontWeight: 400, letterSpacing: '-0.01em'}}>
        abcdefghijklm
      </Rise>
      <Rise at={R0 + 24} x={360} y={192} h={36} style={{fontSize: 27, fontWeight: 400, letterSpacing: '0'}}>
        0123456789 &amp;?!
      </Rise>
      <Rise
        at={R0 + 28}
        x={360}
        y={236}
        h={26}
        style={{fontSize: 18, fontWeight: 500, letterSpacing: '0.02em', color: 'rgba(15,36,28,0.66)'}}
      >
        Weight {Math.round(weight)}
      </Rise>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Fifth panel — photography, cycling
// ---------------------------------------------------------------------------
const PHOTOS = [
  {file: 'coast.jpg', name: 'Coast'},
  {file: 'desert.jpg', name: 'Desert'},
  {file: 'forest.jpg', name: 'Forest'},
  {file: 'mountains.jpg', name: 'Mountains'},
];
const WIPE = 30;
const PHOTO_IN = [R0, 186, 238, 290];

export const FifthContent: React.FC = () => {
  const f = useCurrentFrame();
  const r = REGION.fifth;
  const nameIdx = PHOTO_IN.reduce((acc, at, i) => (i > 0 ? acc + ease.inOut(progress(f, at + 6, at + 26)) : acc), 0);
  const active = PHOTO_IN.filter((at) => f >= at).length - 1;
  const cap = rv(f, R0 + 30, 30);
  return (
    <div style={{position: 'absolute', inset: 0, background: C.clay}}>
      {PHOTOS.map((p, i) => {
        const at = PHOTO_IN[i];
        if (f < at) return null;
        const next = PHOTO_IN[i + 1];
        if (next !== undefined && f > next + WIPE + 2) return null;
        const w = (i === 0 ? ease.out : ease.inOut)(progress(f, at, at + (i === 0 ? 34 : WIPE)));
        const settle = ease.out(progress(f, at, at + 70));
        const drift = (f - at) * 0.00022;
        const scale = lerp(1.16, 1.045, settle) + drift;
        return (
          <div
            key={p.file}
            style={{
              position: 'absolute',
              inset: 0,
              clipPath: w < 1 ? `inset(${((1 - w) * 100).toFixed(3)}% 0 0 0)` : undefined,
            }}
          >
            <Img
              src={staticFile(`assets/${p.file}`)}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: `scale(${scale.toFixed(5)}) translateX(${(-(f - at) * 0.035).toFixed(3)}px)`,
              }}
            />
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(10,20,16,0.5) 0%, rgba(10,20,16,0.12) 18%, rgba(10,20,16,0) 32%, rgba(10,20,16,0) 58%, rgba(10,20,16,0.62) 100%)',
          opacity: cap,
        }}
      />
      <Rise at={R0 + 30} x={40} y={34} h={28} style={{...label, color: '#fff', textShadow: '0 1px 12px rgba(10,20,16,0.35)'}}>
        Photography
      </Rise>
      <div style={{position: 'absolute', right: 40, top: 46, display: 'flex', gap: 8, opacity: cap}}>
        {PHOTOS.map((p, i) => {
          const at = PHOTO_IN[i];
          const end = PHOTO_IN[i + 1] ?? 330;
          const fill = i < active ? 1 : i === active ? clamp01((f - at) / (end - at)) : 0;
          return (
            <div key={p.file} style={{width: 44, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.34)', boxShadow: '0 1px 8px rgba(10,20,16,0.25)', overflow: 'hidden'}}>
              <div style={{width: `${(fill * 100).toFixed(2)}%`, height: '100%', background: '#fff'}} />
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 40, bottom: 40, height: 48, overflow: 'hidden', opacity: cap}}>
        <div
          style={{
            transform: `translateY(${(-nameIdx * 48 + (1 - cap) * 48).toFixed(2)}px)`,
            color: '#fff',
            fontSize: 40,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            lineHeight: '48px',
          }}
        >
          {PHOTOS.map((p) => (
            <div key={p.name} style={{height: 48}}>
              {p.name}
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 40,
          bottom: 48,
          height: 28,
          overflow: 'hidden',
          opacity: cap,
          color: 'rgba(255,255,255,0.8)',
          ...label,
          fontSize: 18,
          lineHeight: '28px',
        }}
      >
        <div style={{transform: `translateY(${(-nameIdx * 28).toFixed(2)}px)`}}>
          {PHOTOS.map((p, i) => (
            <div key={p.name} style={{height: 28, textAlign: 'right'}}>
              {String(i + 1).padStart(2, '0')} / 04
            </div>
          ))}
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, top: 0, width: r.w, height: r.h, pointerEvents: 'none'}} />
    </div>
  );
};

// ---------------------------------------------------------------------------
// Moss panel — palette
// ---------------------------------------------------------------------------
const SWATCHES = [
  {name: 'Ink', hex: '#0F241C', color: C.ink, text: C.paper},
  {name: 'Coral', hex: '#FF6A4B', color: C.coral, text: C.ink},
  {name: 'Ochre', hex: '#F2C265', color: C.ochre, text: C.ink},
  {name: 'Paper', hex: '#F3EFE7', color: C.paper, text: C.ink},
];

export const MossContent: React.FC = () => {
  const f = useCurrentFrame();
  const r = REGION.moss;
  const chipW = 113;
  const chipGap = (r.w - 80 - chipW * 4) / 3;
  return (
    <div style={{position: 'absolute', inset: 0, color: C.ink}}>
      <Rise at={R0 + 14} x={40} y={34} h={28} style={{...label, color: 'rgba(15,36,28,0.72)'}}>
        Palette
      </Rise>
      <Rise at={R0 + 18} x={40} y={34} h={28} align="right" style={{...label, color: 'rgba(15,36,28,0.72)'}}>
        Moss #8FB47A
      </Rise>
      {SWATCHES.map((s, i) => {
        const e = rv(f, R0 + 18 + i * 3, 30);
        if (e <= 0) return null;
        const x = 40 + i * (chipW + chipGap);
        return (
          <React.Fragment key={s.name}>
            <div
              style={{
                position: 'absolute',
                left: x,
                top: 88,
                width: chipW,
                height: 120,
                borderRadius: 16,
                background: s.color,
                boxShadow: '0 1px 1px rgba(15,36,28,0.08), 0 10px 22px -14px rgba(15,36,28,0.45)',
                transform: e < 1 ? `translateY(${((1 - e) * 26).toFixed(2)}px) scale(${lerp(0.86, 1, e).toFixed(4)})` : undefined,
                opacity: clamp01(e * 3),
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 14,
                  bottom: 12,
                  fontSize: 18,
                  fontWeight: 600,
                  color: s.text,
                  letterSpacing: '-0.005em',
                }}
              >
                {s.name}
              </div>
            </div>
            <Rise at={R0 + 22 + i * 3} x={x + 2} y={222} h={28} style={{fontSize: 19, fontWeight: 500, letterSpacing: '0.01em', fontVariantNumeric: 'tabular-nums'}}>
              {s.hex}
            </Rise>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Ochre panel — pattern of living clovers
// ---------------------------------------------------------------------------
export const OchreContent: React.FC = () => {
  const f = useCurrentFrame();
  const cols = 6;
  const rows = 3;
  const size = 44;
  const gap = 14.8;
  const gridW = cols * size + (cols - 1) * gap;
  const x0 = (REGION.ochre.w - gridW) / 2;
  return (
    <div style={{position: 'absolute', inset: 0, color: C.ink}}>
      <Rise at={R0 + 20} x={40} y={34} h={28} style={{...label, color: 'rgba(15,36,28,0.72)'}}>
        Pattern
      </Rise>
      <Rise at={R0 + 24} x={40} y={34} h={28} align="right" style={{...label, color: 'rgba(15,36,28,0.72)'}}>
        Clover grid
      </Rise>
      {Array.from({length: rows * cols}).map((_, k) => {
        const c = k % cols;
        const rr = Math.floor(k / cols);
        const d = (c + rr) * 2;
        const e = ease.out(progress(f, R0 + 22 + d, R0 + 46 + d));
        if (e <= 0) return null;
        // living: every clover makes quarter turns in a diagonal wave
        const period = 84;
        const t0 = T.revealEnd + 10 + (c + rr) * 5;
        const n = Math.max(0, f - t0);
        const turns = Math.floor(n / period) + ease.inOut(clamp01((n % period) / 22));
        const rot = f > t0 ? turns * 90 : 0;
        return (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: x0 + c * (size + gap),
              top: 98 + rr * (size + gap),
              transform: `scale(${e.toFixed(4)})`,
            }}
          >
            <Clover size={size} rotation={rot - 45 * (1 - e)} colors={[C.ink, C.coral, C.ink, C.ink]} />
          </div>
        );
      })}
    </div>
  );
};
