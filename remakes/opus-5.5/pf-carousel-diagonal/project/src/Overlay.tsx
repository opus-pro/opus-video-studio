import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CARDS, FONT_FAMILY, SERIES} from './cards';
import {CARD_COUNT, FPS, cubicBezier, relayProgress} from './motion';

const TEXT = '#EEEBE5';
const SOFT = 'rgba(238, 235, 229, 0.56)';
const FAINT = 'rgba(238, 235, 229, 0.18)';

const pad2 = (n: number) => String(n).padStart(2, '0');
const textEase = cubicBezier(0.22, 0.85, 0.2, 1);

/** A single masked line that rolls from label[k] to label[k+1] as progress goes k -> k+1. */
const Roller: React.FC<{
  labels: string[];
  progress: number;
  height: number;
  style?: React.CSSProperties;
  align?: 'left' | 'right';
}> = ({labels, progress, height, style, align = 'right'}) => {
  const k = Math.min(labels.length - 2, Math.floor(progress));
  const f = Math.min(1, Math.max(0, progress - k));
  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
  // Outgoing label clears out early; the incoming one only resolves once it is mostly in.
  const rows =
    f <= 0
      ? [{i: k, y: 0, o: 1}]
      : f >= 1
        ? [{i: k + 1, y: 0, o: 1}]
        : [
            {i: k, y: -f, o: clamp01(1 - f * 2.2)},
            {i: k + 1, y: 1 - f, o: clamp01((f - 0.15) / 0.55)},
          ];
  return (
    <div style={{position: 'relative', height, overflow: 'hidden', ...style}}>
      {rows.map(({i, y, o}) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height,
            lineHeight: `${height}px`,
            textAlign: align,
            whiteSpace: 'nowrap',
            transform: y === 0 ? undefined : `translateY(${(y * height * 1.05).toFixed(2)}px)`,
            opacity: o,
          }}
        >
          {labels[i]}
        </div>
      ))}
    </div>
  );
};

export const Overlay: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  // A short stagger reads as a relay: numeral first, then the title, then the colophon.
  const pIndex = relayProgress(t, textEase);
  const pTitle = relayProgress(t - 0.05, textEase);
  const pMeta = relayProgress(t - 0.1, textEase);

  const base: React.CSSProperties = {
    position: 'absolute',
    fontFamily: `${FONT_FAMILY}, sans-serif`,
    color: TEXT,
    fontFeatureSettings: '"tnum" 1, "ss01" 1',
    WebkitFontSmoothing: 'antialiased',
  };

  return (
    <>
      {/* Top-left: series masthead. */}
      <div style={{...base, left: 64, top: 60, width: 250}}>
        <div style={{fontSize: 15, fontWeight: 560, letterSpacing: '0.16em', color: SOFT, textTransform: 'uppercase'}}>
          Selected Work — 2026
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 54,
            lineHeight: '56px',
            fontWeight: 620,
            letterSpacing: '-0.035em',
          }}
        >
          {SERIES.split(' ').map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>
        <div style={{marginTop: 18, fontSize: 17, lineHeight: '24px', fontWeight: 450, color: SOFT, letterSpacing: '-0.005em'}}>
          Four landscapes,
          <br />
          one continuous relay.
        </div>
      </div>

      {/* Bottom-right: relay counter + active plate. */}
      <div style={{...base, right: 64, bottom: 60, width: 300}}>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: 6, marginBottom: 18}}>
          {Array.from({length: CARD_COUNT}, (_, i) => {
            const on = Math.max(0, 1 - Math.abs(pIndex - i));
            return (
              <div
                key={i}
                style={{
                  width: 14 + 22 * on,
                  height: 3,
                  borderRadius: 2,
                  background: on > 0 ? `rgba(238, 235, 229, ${(0.18 + 0.82 * on).toFixed(3)})` : FAINT,
                }}
              />
            );
          })}
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gap: 10}}>
          <Roller
            labels={CARDS.map((_, i) => pad2(i + 1))}
            progress={pIndex}
            height={74}
            style={{fontSize: 82, fontWeight: 600, letterSpacing: '-0.045em', width: 110}}
          />
          <div style={{fontSize: 20, fontWeight: 500, color: SOFT, paddingBottom: 3, letterSpacing: '0.02em'}}>
            / {pad2(CARD_COUNT)}
          </div>
        </div>
        <Roller
          labels={CARDS.map((c) => c.title)}
          progress={pTitle}
          height={34}
          style={{marginTop: 10, fontSize: 27, fontWeight: 580, letterSpacing: '-0.02em'}}
        />
        <Roller
          labels={CARDS.map((c) => `${c.place} · ${c.time}`)}
          progress={pMeta}
          height={20}
          style={{marginTop: 6, fontSize: 13, fontWeight: 560, letterSpacing: '0.14em', color: SOFT, textTransform: 'uppercase'}}
        />
      </div>
    </>
  );
};
