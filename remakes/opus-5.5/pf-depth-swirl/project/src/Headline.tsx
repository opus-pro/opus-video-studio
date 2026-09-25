import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {inPose, outPose, OUT_START, IN_START, WordPose} from './swap';
import {
  EYEBROW,
  EYEBROW_LINE,
  EYEBROW_SIZE,
  EYEBROW_TOP,
  EYEBROW_TRACKING,
  EYEBROW_WEIGHT,
  FONT_FAMILY,
  HEADLINE_LINE,
  HEADLINE_SIZE,
  HEADLINE_TRACKING,
  KEY_LINE,
  KEY_WEIGHT,
  LEAD_NEW,
  LEAD_OLD,
  LEAD_WEIGHT,
  LINE1_TOP,
  LINE2_TOP,
  TEXT_COLOR,
  TextMetrics,
} from './typography';

const base: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
  textAlign: 'center',
  whiteSpace: 'pre',
  fontFamily: FONT_FAMILY,
  color: TEXT_COLOR,
  fontKerning: 'normal',
  WebkitFontSmoothing: 'antialiased',
  // A soft halo, not a box: lifts the glyph edges off whatever is behind them.
  textShadow: '0 1px 2px rgba(4,6,10,0.35), 0 0 28px rgba(4,6,10,0.45)',
};

const headline: React.CSSProperties = {
  ...base,
  fontSize: HEADLINE_SIZE,
  height: HEADLINE_LINE,
  lineHeight: `${HEADLINE_LINE}px`,
  letterSpacing: `${HEADLINE_TRACKING}em`,
  // Negative tracking trails the last glyph; pad it back so the ink, not the advance, is centred.
  paddingRight: `${-HEADLINE_TRACKING}em`,
};

const poseStyle = (p: WordPose): React.CSSProperties => {
  const atRest = p.opacity >= 0.999 && Math.abs(p.y) < 1e-4 && p.blur < 0.01;
  if (atRest) return {display: 'inline-block'};
  return {
    display: 'inline-block',
    opacity: p.opacity,
    transform: `translate3d(0, ${p.y.toFixed(4)}em, 0)`,
    filter: p.blur > 0.01 ? `blur(${p.blur.toFixed(2)}px)` : undefined,
  };
};

const Words: React.FC<{text: string; pose: (k: number) => WordPose}> = ({text, pose}) => {
  const words = text.split(' ');
  return (
    <>
      {words.map((w, k) => (
        <React.Fragment key={k}>
          {k > 0 ? ' ' : null}
          <span style={poseStyle(pose(k))}>{w}</span>
        </React.Fragment>
      ))}
    </>
  );
};

export const Headline: React.FC<{metrics: TextMetrics; audit?: boolean}> = ({audit}) => {
  const frame = useCurrentFrame();
  const showOld = frame < OUT_START + 30;
  const showNew = frame >= IN_START;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        data-audit="eyebrow"
        style={{
          ...base,
          top: EYEBROW_TOP,
          height: EYEBROW_LINE,
          lineHeight: `${EYEBROW_LINE}px`,
          fontSize: EYEBROW_SIZE,
          fontWeight: EYEBROW_WEIGHT,
          letterSpacing: `${EYEBROW_TRACKING}em`,
          color: 'rgba(246,243,238,0.74)',
          textShadow: '0 0 18px rgba(4,6,10,0.6)',
        }}
      >
        <span style={{display: 'inline-flex', alignItems: 'center', gap: 22}}>
          <span style={{width: 34, height: 1, background: 'rgba(246,243,238,0.42)', marginRight: `${EYEBROW_TRACKING}em` /* balances trailing tracking */}} />
          <span data-audit="eyebrow-text">{EYEBROW}</span>
          <span style={{width: 34, height: 1, background: 'rgba(246,243,238,0.42)'}} />
        </span>
      </div>
      {showOld ? (
        <div data-audit="lead-old" style={{...headline, top: LINE1_TOP, fontWeight: LEAD_WEIGHT}}>
          <Words text={LEAD_OLD} pose={(k) => outPose(frame, k)} />
        </div>
      ) : null}
      {showNew ? (
        <div data-audit="lead-new" style={{...headline, top: LINE1_TOP, fontWeight: LEAD_WEIGHT}}>
          <Words text={LEAD_NEW} pose={(k) => inPose(frame, k)} />
        </div>
      ) : null}
      <div data-audit="key" style={{...headline, top: LINE2_TOP, fontWeight: KEY_WEIGHT}}>
        <span style={{display: 'inline-block'}}>{KEY_LINE}</span>
      </div>
      {audit ? <AuditProbe /> : null}
    </AbsoluteFill>
  );
};

// Audit mode only: logs the ink box of every visible word (canvas glyph metrics placed on the
// DOM baseline, transforms included) so scripts/audit.mjs can verify protection and spacing.
const AuditProbe: React.FC = () => {
  const frame = useCurrentFrame();
  React.useLayoutEffect(() => {
    const ctx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
    const out: Record<string, {text: string; opacity: number; left: number; top: number; right: number; bottom: number}[]> = {};
    document.querySelectorAll<HTMLElement>('[data-audit]').forEach((el) => {
      const key = el.dataset.audit as string;
      if (key === 'eyebrow') return;
      const words = el.dataset.audit === 'eyebrow-text' ? [el] : Array.from(el.querySelectorAll<HTMLElement>(':scope > span'));
      out[key] = words.map((w) => {
        const cs = getComputedStyle(w);
        ctx.font = `${cs.fontWeight} ${cs.fontSize} ${FONT_FAMILY}`;
        (ctx as unknown as {letterSpacing: string}).letterSpacing = cs.letterSpacing;
        const m = ctx.measureText(w.textContent ?? '');
        const probe = document.createElement('span');
        Object.assign(probe.style, {display: 'inline-block', width: '0px', height: '0px', verticalAlign: 'baseline'});
        w.appendChild(probe);
        const base = probe.getBoundingClientRect().top;
        probe.remove();
        const box = w.getBoundingClientRect();
        let opacity = 1;
        for (let n: HTMLElement | null = w; n; n = n.parentElement) opacity *= Number(getComputedStyle(n).opacity);
        return {
          text: w.textContent ?? '',
          opacity,
          left: box.left - m.actualBoundingBoxLeft,
          right: box.left + m.actualBoundingBoxRight,
          top: base - m.actualBoundingBoxAscent,
          bottom: base + m.actualBoundingBoxDescent,
        };
      });
    });
    console.log(`AUDIT_TEXT ${frame} ${JSON.stringify(out)}`);
  }, [frame]);
  return null;
};
