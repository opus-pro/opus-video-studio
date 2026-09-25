import React, {useEffect} from 'react';
import {AbsoluteFill} from 'remotion';
import {FPS, T, bezier, clamp01} from './spatial';

const FONT = 'GeistOrbit, system-ui, sans-serif';

const easeOut = bezier(0.16, 1, 0.3, 1);
const easeInOut = bezier(0.65, 0, 0.35, 1);
const easeIn = bezier(0.55, 0, 0.9, 0.4);

const prog = (t: number, start: number, dur: number) => clamp01((t - start) / dur);

// Title timing (seconds).
export const TITLE_IN = 0.46;
export const TITLE_OUT = 3.14;
const TITLE_OUT_DUR = 0.24;

// Final copy timing.
const COPY_IN = 4.22;

type RevealProps = {text: string; t: number; start: number; stagger: number; dur: number; lift: number};

/** Per-glyph rise + defocus. Glyphs carry no transform or filter at rest. */
const Reveal: React.FC<RevealProps> = ({text, t, start, stagger, dur, lift}) => (
  <>
    {Array.from(text).map((ch, idx) => {
      const p = easeOut(prog(t, start + idx * stagger, dur));
      const done = p >= 1;
      return (
        <span
          key={idx}
          style={{
            display: 'inline-block',
            whiteSpace: 'pre',
            opacity: p,
            transform: done ? undefined : `translateY(${(1 - p) * lift}em)`,
            filter: done ? undefined : `blur(${(1 - p) * 10}px)`,
          }}
        >
          {ch}
        </span>
      );
    })}
  </>
);

const Title: React.FC<{t: number}> = ({t}) => {
  const out = easeIn(prog(t, TITLE_OUT, TITLE_OUT_DUR));
  if (out >= 1) return null;
  const eyebrowIn = easeOut(prog(t, TITLE_IN, 0.7));
  const tracking = 0.34 + (1 - eyebrowIn) * 0.3;
  const ruleIn = easeInOut(prog(t, TITLE_IN + 0.18, 0.6));
  const outStyle: React.CSSProperties =
    out > 0
      ? {opacity: 1 - out, filter: `blur(${out * 8}px)`, transform: `translateY(${-out * 10}px) scale(${1 - out * 0.03})`}
      : {};
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div
        data-title="SELECTED / FIELD NOTES"
        style={{
          fontFamily: FONT,
          color: '#fff',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          ...outStyle,
        }}
      >
        <div
          style={{
            fontSize: 19,
            fontWeight: 500,
            letterSpacing: `${tracking}em`,
            paddingLeft: `${tracking}em`,
            lineHeight: 1,
            opacity: eyebrowIn * 0.78,
            fontVariationSettings: '"wght" 500',
          }}
        >
          SELECTED <span style={{color: '#e8c79a'}}>/</span>{' '}
        </div>
        <div
          style={{
            width: 64 * ruleIn,
            height: 1,
            margin: '17px 0 15px',
            background: 'linear-gradient(90deg, rgba(232,199,154,0), rgba(232,199,154,0.9), rgba(232,199,154,0))',
          }}
        />
        <div
          style={{
            fontSize: 64,
            fontWeight: 600,
            letterSpacing: '0.04em',
            paddingLeft: '0.04em',
            lineHeight: 0.8,
            fontVariationSettings: '"wght" 600',
            textShadow: '0 2px 24px rgba(0,0,0,0.35)',
          }}
        >
          <Reveal text="FIELD NOTES" t={t} start={TITLE_IN + 0.1} stagger={0.028} dur={0.62} lift={0.28} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const FinalCopy: React.FC<{t: number}> = ({t}) => {
  const scrim = easeInOut(prog(t, COPY_IN - 0.25, 0.8));
  const eyebrow = easeOut(prog(t, COPY_IN, 0.7));
  const rule = easeInOut(prog(t, COPY_IN + 0.05, 0.7));
  const sub = easeOut(prog(t, COPY_IN + 0.42, 0.7));
  if (scrim <= 0) return null;
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity: scrim,
          background:
            'linear-gradient(0deg, rgba(6,8,10,0.74) 0%, rgba(6,8,10,0.46) 30%, rgba(6,8,10,0) 60%), radial-gradient(ellipse 70% 60% at 18% 82%, rgba(6,8,10,0.42) 0%, rgba(6,8,10,0) 100%)',
        }}
      />
      <div
        data-final-copy
        style={{
          position: 'absolute',
          left: 128,
          bottom: 118,
          fontFamily: FONT,
          color: '#fff',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            fontSize: 19,
            fontWeight: 500,
            letterSpacing: '0.3em',
            lineHeight: 1,
            opacity: eyebrow,
            transform: eyebrow >= 1 ? undefined : `translateY(${(1 - eyebrow) * 12}px)`,
          }}
        >
          <span>FIELD NOTE 01</span>
          <span style={{width: 44 * rule, height: 1, background: 'rgba(255,255,255,0.85)'}} />
          <span>COAST</span>
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 98,
            fontWeight: 600,
            letterSpacing: '-0.035em',
            lineHeight: 0.96,
            fontVariationSettings: '"wght" 600',
            textShadow: '0 2px 30px rgba(0,0,0,0.25)',
          }}
        >
          <div>
            <Reveal text="Where the water" t={t} start={COPY_IN + 0.08} stagger={0.018} dur={0.7} lift={0.22} />
          </div>
          <div>
            <Reveal text="goes quiet." t={t} start={COPY_IN + 0.2} stagger={0.018} dur={0.7} lift={0.22} />
          </div>
        </div>
        <div
          style={{
            marginTop: 30,
            fontSize: 28,
            fontWeight: 400,
            letterSpacing: '-0.005em',
            lineHeight: 1.3,
            opacity: sub,
            transform: sub >= 1 ? undefined : `translateY(${(1 - sub) * 14}px)`,
          }}
        >
          Ten places worth the long way round.
        </div>
      </div>
    </AbsoluteFill>
  );
};

const useAuditLog = (enabled: boolean, frame: number) => {
  useEffect(() => {
    if (!enabled) return;
    const rect = (sel: string) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {left: r.left, top: r.top, right: r.right, bottom: r.bottom};
    };
    console.log(
      'AUDIT ' +
        JSON.stringify({
          frame,
          title: rect('[data-title]'),
          titleText: document.querySelector('[data-title]')?.textContent ?? null,
          finalCopy: rect('[data-final-copy]'),
          finalCopyText: (document.querySelector('[data-final-copy]') as HTMLElement | null)?.innerText ?? null,
          fontLoaded: document.fonts.check('600 70px GeistOrbit'),
        }),
    );
  }, [enabled, frame]);
};

export const Overlay: React.FC<{frame: number; audit?: boolean}> = ({frame, audit = false}) => {
  const t = frame / FPS;
  useAuditLog(audit, frame);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {t < T.focusStart + 0.5 ? <Title t={t} /> : null}
      <FinalCopy t={t} />
    </AbsoluteFill>
  );
};
