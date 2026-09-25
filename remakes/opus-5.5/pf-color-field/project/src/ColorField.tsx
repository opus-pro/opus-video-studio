import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame} from 'remotion';
import {FieldCanvas} from './FieldCanvas';
import {FONT, loadGeist} from './fonts';
import {clamp01, easeInCubic, easeInOut, easeInOutSoft, easeOutCubic, easeOutExpo, mix, prog, velocity} from './anim';

// ---------------------------------------------------------------------------
// Palette + layout
// ---------------------------------------------------------------------------
const INK = '#144b41'; // deep green
const PAPER = '#f2f7ef'; // near-white
const CORAL = '#ff7f73';

const W = 1920;

const HERO_SIZE = 206;
const HERO_TRACK = -0.045; // em
const HERO_LH = 1.0;
const HERO_TOP = 312;
const HERO_BASELINE = 178; // px below HERO_TOP to the cap baseline (scale anchor)
const HERO_SCALE_START = 1.22;

const SUPPORT_SIZE = 44;
const SUPPORT_LH = 1.34;
const SUPPORT_TOP_START = 566;
const SUPPORT_DROP = 62; // px moved down during the hero transform
const SUPPORT_SCALE_END = 0.8;

const LINE_1 = 'Continuous color, generated in motion.';
const LINE_2A = 'Four tones. One flowing field.';
const LINE_2B = 'Launching October 24.';

// ---------------------------------------------------------------------------
// Timeline (frames @ 60 fps)
// ---------------------------------------------------------------------------
const T = {
  heroInStart: 2,
  heroInStagger: 3,
  heroInDur: 22, // last letter lands at 2 + 4*3 + 22 = 36 (0.6 s)
  line1In: [8, 32] as const,
  line2In: [12, 36] as const,
  morph: [90, 132] as const, // 1.5 s -> 2.2 s
  swapOut: [165, 182] as const, // 2.75 s ->
  swapIn: [182, 204] as const, // -> 3.4 s
  footerIn: [214, 252] as const,
};

const HERO_A = 'FIELD';
const HERO_B = 'STUDIO';

// ---------------------------------------------------------------------------
// Motion blur helper (directional SVG blur, only while something moves)
// ---------------------------------------------------------------------------
const BlurDefs: React.FC<{id: string; x: number; y: number}> = ({id, x, y}) => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <defs>
      <filter id={id} x="-10%" y="-30%" width="120%" height="160%" colorInterpolationFilters="sRGB">
        <feGaussianBlur stdDeviation={`${x.toFixed(3)} ${y.toFixed(3)}`} />
      </filter>
    </defs>
  </svg>
);

const blurFilter = (id: string, x: number, y: number) => (x > 0.05 || y > 0.05 ? `url(#${id})` : 'none');

// ---------------------------------------------------------------------------
// Hero morph progress
// ---------------------------------------------------------------------------
const morphP = (f: number) => prog(f, T.morph[0], T.morph[1], easeInOut);

type Metrics = {fieldW: number; fullW: number};

const heroStyle: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: HERO_SIZE,
  fontWeight: 780,
  letterSpacing: `${HERO_TRACK}em`,
  lineHeight: HERO_LH,
  color: INK,
  whiteSpace: 'nowrap',
  fontFeatureSettings: '"ss01" 0',
};

const Slash: React.FC = () => <span style={{fontWeight: 260, margin: '0 0.02em'}}>/</span>;

// Hidden measuring copy so the mask can be sized to the real glyph advances.
const Measure: React.FC<{onMeasure: (m: Metrics) => void}> = ({onMeasure}) => {
  const fieldRef = useRef<HTMLSpanElement>(null);
  const fullRef = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    if (!fieldRef.current || !fullRef.current) return;
    onMeasure({fieldW: fieldRef.current.offsetWidth, fullW: fullRef.current.offsetWidth});
  }, [onMeasure]);
  return (
    <div style={{position: 'absolute', visibility: 'hidden', left: 0, top: 0}}>
      <span ref={fullRef} style={{...heroStyle, display: 'inline-block'}}>
        <span ref={fieldRef} style={{display: 'inline-block'}}>
          {HERO_A}
        </span>
        <span style={{display: 'inline-block'}}>
          <Slash />
          {HERO_B}
        </span>
      </span>
    </div>
  );
};

const Hero: React.FC<{m: Metrics}> = ({m}) => {
  const frame = useCurrentFrame();
  const p = morphP(frame);
  const suffixW = m.fullW - m.fieldW;
  const visibleW = m.fieldW + p * suffixW;
  const left = (W - visibleW) / 2;
  // FIELD starts larger and settles to lockup size as the name completes,
  // like a slow pull-back revealing the full wordmark.
  const scale = mix(HERO_SCALE_START, 1, p);

  // Mask: a hard-edged rectangle over the suffix whose right edge widens from
  // the end of FIELD to the end of FIELD/STUDIO. FIELD itself is never clipped
  // horizontally, and the bleed only opens as the mask completes so the final
  // glyph's ink (negative tracking) is never shaved at rest.
  const bleed = 70 * p;
  const suffixInset = (1 - p) * suffixW - bleed; // right inset of the suffix mask
  const edge = visibleW + bleed; // mask edge, in hero-local px

  // Horizontal motion blur while the word slides.
  const leftEdgeAt = (f: number) => {
    const q = morphP(f);
    return W / 2 - (mix(HERO_SCALE_START, 1, q) * (m.fieldW + q * suffixW)) / 2;
  };
  const vx = Math.abs(velocity(leftEdgeAt, frame));
  const blurX = Math.min(4.5, vx * 0.15);

  // Soft lift under the hero, faded in once the letters have landed.
  const shadowO = prog(frame, 36, 70, easeOutCubic);

  // Leading edge of the mask, drawn as a thin rule while it travels.
  const tl = prog(frame, T.morph[0], T.morph[1]);
  const barO = Math.min(prog(tl, 0, 0.08), 1 - prog(tl, 0.55, 0.85, easeOutCubic)) * (p > 0 && p < 1 ? 1 : 0);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `scale(${scale})`,
        transformOrigin: `${W / 2}px ${HERO_TOP + HERO_BASELINE}px`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left,
          top: HERO_TOP,
          width: m.fullW,
          height: HERO_SIZE * HERO_LH,
          clipPath: `inset(-40% -80px ${frame < T.heroInStart + 4 * T.heroInStagger + T.heroInDur ? '0' : '-40%'} -80px)`,
        }}
      >
        <BlurDefs id="mb-hero" x={blurX} y={0} />
        <div
          style={{
            ...heroStyle,
            display: 'flex',
            filter: blurFilter('mb-hero', blurX, 0),
            textShadow: shadowO > 0 ? `0 24px 60px rgba(20, 75, 65, ${(0.11 * shadowO).toFixed(3)})` : 'none',
          }}
        >
          {HERO_A.split('').map((ch, i) => {
            const s = T.heroInStart + i * T.heroInStagger;
            const t = prog(frame, s, s + T.heroInDur, easeOutExpo);
            return (
              <span key={i} style={{display: 'inline-block', transform: `translateY(${(1 - t) * 104}%)`}}>
                {ch}
              </span>
            );
          })}
          <span
            style={{
              display: 'inline-block',
              visibility: p > 0 ? 'visible' : 'hidden',
              clipPath: `inset(-40% ${suffixInset}px -40% -80px)`,
            }}
          >
            <Slash />
            {HERO_B}
          </span>
        </div>
      </div>
      {barO > 0.001 ? (
        <div
          style={{
            position: 'absolute',
            left: left + edge + 10,
            top: HERO_TOP + 10,
            width: 6,
            height: HERO_SIZE * 0.95,
            background: INK,
            opacity: barO,
            filter: blurFilter('mb-hero', blurX, 0),
          }}
        />
      ) : null}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Support copy
// ---------------------------------------------------------------------------
const lineStyle = (weight: number): React.CSSProperties => ({
  fontFamily: FONT,
  fontSize: SUPPORT_SIZE,
  fontWeight: weight,
  lineHeight: SUPPORT_LH,
  letterSpacing: '-0.012em',
  color: INK,
  whiteSpace: 'nowrap',
  textAlign: 'center',
  width: '100%',
  height: SUPPORT_SIZE * SUPPORT_LH,
});

const Enter: React.FC<{
  id: string;
  inRange?: readonly [number, number];
  outRange?: readonly [number, number];
  rise?: number;
  children: React.ReactNode;
  style: React.CSSProperties;
}> = ({id, inRange, outRange, rise = 26, children, style}) => {
  const frame = useCurrentFrame();
  const yAt = (f: number) => {
    let y = 0;
    if (inRange) y += (1 - prog(f, inRange[0], inRange[1], easeOutExpo)) * rise;
    if (outRange) y -= prog(f, outRange[0], outRange[1], easeInCubic) * rise * 0.8;
    return y;
  };
  const tin = inRange ? prog(frame, inRange[0], inRange[0] + (inRange[1] - inRange[0]) * 0.6, easeOutCubic) : 1;
  const tout = outRange ? prog(frame, outRange[0], outRange[1], easeInCubic) : 0;
  const opacity = tin * (1 - tout);
  const vy = Math.abs(velocity(yAt, frame));
  const by = Math.min(6, vy * 0.9);
  if (opacity <= 0.001) return null;
  return (
    <div
      style={{
        ...style,
        position: 'absolute',
        left: 0,
        top: 0,
        opacity,
        transform: `translateY(${yAt(frame)}px)`,
        filter: blurFilter(id, 0, by),
      }}
    >
      <BlurDefs id={id} x={0} y={by} />
      {children}
    </div>
  );
};

const Support: React.FC = () => {
  const frame = useCurrentFrame();
  const p = prog(frame, T.morph[0] + 2, T.morph[1], easeInOutSoft);
  const top = SUPPORT_TOP_START + SUPPORT_DROP * p;
  const scale = mix(1, SUPPORT_SCALE_END, p);
  const lineH = SUPPORT_SIZE * SUPPORT_LH;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        width: W,
        top,
        height: lineH * 2,
        transform: `scale(${scale})`,
        transformOrigin: '50% 0',
      }}
    >
      <Enter id="mb-l1" inRange={T.line1In} style={{...lineStyle(520)}}>
        {LINE_1}
      </Enter>
      <div style={{position: 'absolute', left: 0, top: lineH, width: '100%', height: lineH}}>
        <Enter id="mb-l2a" inRange={T.line2In} outRange={T.swapOut} style={{...lineStyle(420)}}>
          {LINE_2A}
        </Enter>
        <Enter id="mb-l2b" inRange={T.swapIn} rise={30} style={{...lineStyle(620)}}>
          {LINE_2B}
        </Enter>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Footer wordmark
// ---------------------------------------------------------------------------
const Footer: React.FC = () => {
  const frame = useCurrentFrame();
  const t = prog(frame, T.footerIn[0], T.footerIn[1], easeOutExpo);
  const o = prog(frame, T.footerIn[0], T.footerIn[0] + 18, easeOutCubic);
  if (o <= 0) return null;
  const track = mix(0.62, 0.34, t);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        width: W,
        bottom: 72,
        textAlign: 'center',
        fontFamily: FONT,
        fontSize: 26,
        fontWeight: 600,
        letterSpacing: `${track}em`,
        // keep optical centering despite trailing tracking
        paddingLeft: `${track}em`,
        color: PAPER,
        opacity: o,
        transform: `translateY(${(1 - t) * 14}px)`,
        whiteSpace: 'nowrap',
      }}
    >
      FIELD<span style={{color: CORAL}}>.</span>STUDIO
    </div>
  );
};

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------
export const ColorField: React.FC = () => {
  const [fontReady, setFontReady] = useState(false);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [handle] = useState(() => delayRender('Measuring hero'));

  useEffect(() => {
    loadGeist().then(() => setFontReady(true));
  }, []);

  useEffect(() => {
    if (metrics) continueRender(handle);
  }, [metrics, handle]);

  return (
    <AbsoluteFill style={{backgroundColor: PAPER, overflow: 'hidden'}}>
      <FieldCanvas />
      {fontReady && !metrics ? <Measure onMeasure={setMetrics} /> : null}
      {metrics ? (
        <AbsoluteFill>
          <Hero m={metrics} />
          <Support />
          <Footer />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export {clamp01};
