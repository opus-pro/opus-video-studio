import React from 'react';
import {Img, staticFile} from 'remotion';
import {
  C,
  FONT,
  P_BANDS,
  P_IMAGE,
  P_PATTERN,
  P_WORD,
  Rect,
  clamp01,
  inOut,
  lerp,
  outBack,
  outExpo,
  outQuint,
  seg,
} from './lib';

export const Tag: React.FC<{
  index: string;
  label: string;
  t: number;
  at: number;
  color: string;
  pill?: string;
  x?: number;
  y?: number;
}> = ({index, label, t, at, color, pill, x = 37, y = 33}) => {
  const p = outQuint(seg(t, at, at + 22));
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: pill ? '9px 14px 9px 13px' : 0,
        borderRadius: 999,
        background: pill,
        fontFamily: FONT,
        fontSize: 16,
        fontWeight: 600,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        lineHeight: 1,
        color,
        opacity: p,
        transform: p < 1 ? `translateY(${(1 - p) * 10}px)` : undefined,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{opacity: 0.55, fontVariantNumeric: 'tabular-nums'}}>{index}</span>
      <span>{label}</span>
    </div>
  );
};

// ── 02 Imagery ────────────────────────────────────────────────────────────────
export const ImageContent: React.FC<{t: number}> = ({t}) => {
  const rv = outExpo(seg(t, 94, 150));
  const scale = 1.035 + 0.2 * (1 - outExpo(seg(t, 94, 170))) + 0.045 * (1 - seg(t, 94, 348));
  const dx = lerp(-8, 8, seg(t, 94, 348));
  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          clipPath: `inset(${(1 - rv) * 100}% 0 0 0)`,
          opacity: 0.35 + 0.65 * clamp01(rv * 1.6),
        }}
      >
        <Img
          src={staticFile('assets/coast.jpg')}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: '50% 58%',
            transform: `translateX(${dx}px) scale(${scale})`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(8,14,13,0.28) 0%, rgba(8,14,13,0) 26%, rgba(8,14,13,0) 70%, rgba(8,14,13,0.22) 100%)',
          }}
        />
      </div>
      <Tag index="02" label="Imagery" t={t} at={132} color={C.cream} pill="rgba(12,20,18,0.42)" x={24} y={24} />
    </>
  );
};

// ── 03 Pattern ────────────────────────────────────────────────────────────────
const CELL = 60;
const COLS = P_PATTERN.w / CELL; // 7
const ROWS = P_PATTERN.h / CELL; // 8
const PERIOD = 110;
const MOVE = 0.34; // fraction of each period spent turning

const BLOCK_COLORS = [
  [C.coral, C.lagoon, C.cream, C.coral],
  [C.cream, C.coral, C.coral, C.lagoon],
  [C.lagoon, C.coral, C.cream, C.coral],
  [C.coral, C.cream, C.lagoon, C.coral],
];

const stepEase = (u: number) => {
  const f = Math.floor(u);
  const fr = u - f;
  return f + inOut(clamp01(fr / MOVE));
};

export const PatternContent: React.FC<{t: number}> = ({t}) => {
  const cells = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      // 2x2 blocks of quarter circles anchored on the block centre read as whole discs;
      // the travelling wave turns each quarter, so discs bloom into pinwheels and back.
      const bc = Math.floor(c / 2);
      const br = Math.floor(r / 2);
      const base = c % 2 === 0 ? (r % 2 === 0 ? 2 : 1) : r % 2 === 0 ? 3 : 0;
      const color = BLOCK_COLORS[br][bc];
      const pop = seg(t, 98 + (c + r) * 2.4, 98 + (c + r) * 2.4 + 22);
      if (pop <= 0) continue;
      // all four quarters of a block turn in sync (4-fold symmetric at every instant);
      // neighbouring blocks counter-rotate like gears, phase travelling diagonally.
      const ph = (bc + br) * 0.13;
      const dir = (bc + br) % 2 === 0 ? 1 : -1;
      const turns = t < 150 ? 0 : dir * (stepEase((t - 150) / PERIOD - ph) - stepEase(-ph));
      const angle = (base + turns) * 90 + (1 - outExpo(pop)) * -90;
      const s = Math.max(0, outBack(pop, 1.6));
      cells.push(
        <g key={`${c}-${r}`} clipPath="url(#pf-cell)" transform={`translate(${c * CELL + CELL / 2} ${r * CELL + CELL / 2})`}>
          <g transform={`rotate(${angle}) scale(${s})`}>
            <path d="M -30 -30 L 30 -30 A 60 60 0 0 1 -30 30 Z" fill={color} />
          </g>
        </g>,
      );
    }
  }
  return (
    <>
      <svg width={P_PATTERN.w} height={P_PATTERN.h} style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          <clipPath id="pf-cell">
            <rect x={-30} y={-30} width={60} height={60} />
          </clipPath>
        </defs>
        {cells}
      </svg>
      <Tag index="03" label="Pattern" t={t} at={136} color={C.cream} pill={C.ink} x={24} y={24} />
    </>
  );
};

// ── 04 Wordmark ───────────────────────────────────────────────────────────────
export const WordContent: React.FC<{t: number}> = ({t}) => {
  const letters = 'FIELD'.split('');
  const tag = outQuint(seg(t, 126, 156));
  return (
    <>
      <Tag index="04" label="Wordmark" t={t} at={140} color={C.ink} />
      <div
        style={{
          position: 'absolute',
          left: 3,
          top: 92,
          padding: '0 22px',
          overflow: 'hidden',
          display: 'flex',
          fontFamily: FONT,
          fontSize: 204,
          fontWeight: 780,
          letterSpacing: '-0.045em',
          lineHeight: '210px',
          height: 210,
          color: C.ink,
        }}
      >
        {letters.map((l, i) => {
          const p = outExpo(seg(t, 104 + i * 4, 104 + i * 4 + 34));
          return (
            <span key={i} style={{display: 'inline-block', transform: p < 1 ? `translateY(${(1 - p) * 105}%)` : undefined}}>
              {l}
            </span>
          );
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 35,
          top: 322,
          fontFamily: FONT,
          fontSize: 36,
          fontWeight: 460,
          letterSpacing: '-0.012em',
          lineHeight: 1.1,
          color: 'rgba(19,32,28,0.72)',
          opacity: tag,
          transform: tag < 1 ? `translateY(${(1 - tag) * 16}px)` : undefined,
          whiteSpace: 'nowrap',
        }}
      >
        Made for open ground.
      </div>
    </>
  );
};

// ── 05 Color ──────────────────────────────────────────────────────────────────
const BANDS = [
  {name: 'Coral', hex: '#F0664A', bg: C.coral, fg: C.cream},
  {name: 'Sand', hex: '#EACFA3', bg: C.sand, fg: C.ink},
  {name: 'Lagoon', hex: '#1E6B64', bg: C.lagoon, fg: C.cream},
];

export const BandsContent: React.FC<{t: number}> = ({t}) => {
  const bh = P_BANDS.h / 3;
  const sheen = ((t - 170) / 210) % 1;
  return (
    <>
      {BANDS.map((b, i) => {
        const p = outExpo(seg(t, 100 + i * 7, 100 + i * 7 + 44));
        const lp = outQuint(seg(t, 132 + i * 4, 132 + i * 4 + 24));
        return (
          <div
            key={b.name}
            style={{
              position: 'absolute',
              left: 0,
              top: i * bh,
              width: P_BANDS.w,
              height: bh,
              background: b.bg,
              transform: p < 1 ? `translateX(${(p - 1) * 100}%)` : undefined,
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 37,
                right: 34,
                bottom: 24,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                fontFamily: FONT,
                color: b.fg,
                opacity: lp,
                transform: lp < 1 ? `translateY(${(1 - lp) * 10}px)` : undefined,
              }}
            >
              <span style={{fontSize: 24, fontWeight: 620, letterSpacing: '-0.01em'}}>{b.name}</span>
              <span style={{fontSize: 18, fontWeight: 520, letterSpacing: '0.06em', opacity: 0.78, fontVariantNumeric: 'tabular-nums'}}>
                {b.hex}
              </span>
            </div>
          </div>
        );
      })}
      {t > 170 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(105deg, rgba(255,255,255,0) ${sheen * 160 - 40}%, rgba(255,255,255,0.09) ${sheen * 160 - 20}%, rgba(255,255,255,0) ${sheen * 160}%)`,
            mixBlendMode: 'soft-light',
          }}
        />
      ) : null}
      <Tag index="05" label="Color" t={t} at={144} color={C.cream} />
    </>
  );
};

export const PanelShell: React.FC<{
  rect: Rect;
  final: Rect;
  radius: number;
  bg: string;
  shadow?: string;
  tilt?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({rect, final, radius, bg, shadow, tilt, children}) => {
  if (rect.w < 0.5 || rect.h < 0.5) return null;
  const r = Math.min(radius, rect.w / 2, rect.h / 2);
  return (
    <div
      style={{
        position: 'absolute',
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        borderRadius: r,
        overflow: 'hidden',
        background: bg,
        boxShadow: shadow ?? '0 18px 44px rgba(0,0,0,0.32), 0 2px 6px rgba(0,0,0,0.25)',
        ...tilt,
      }}
    >
      <div
        style={{position: 'absolute', left: final.x - rect.x, top: final.y - rect.y, width: final.w, height: final.h, overflow: 'hidden'}}
      >
        {children}
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: r,
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07), inset 0 1px 0 rgba(255,255,255,0.10)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export const PANELS = [
  {key: 'pattern', final: P_PATTERN, bg: C.ink, start: 54, end: 92, C: PatternContent},
  {key: 'bands', final: P_BANDS, bg: C.graphite, start: 56, end: 93, C: BandsContent},
  {key: 'image', final: P_IMAGE, bg: C.lagoonDeep, start: 49, end: 88, C: ImageContent},
  {key: 'word', final: P_WORD, bg: C.paper, start: 51, end: 90, C: WordContent},
] as const;
