import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {bezier, clamp01, ease, easeInOut, easeOutSoft, lerp, mix, progress, spring} from './anim';

// ---------------------------------------------------------------------------
// Layout (px, card-local). Integer positions keep text on the pixel grid.
// ---------------------------------------------------------------------------
const CARD_W = 394;
const CARD_H = 326;
const PAD = 28;
const CHART_TOP = 104;
const WELL_W = 32;
const WELL_H = 132;
const WELL_GAP = 19; // (338 - 7 * 32) / 6
const BAR_INSET = 4;
const BAR_W = WELL_W - BAR_INSET * 2;
const BAR_MAX = WELL_H - BAR_INSET * 2;
const LABEL_TOP = CHART_TOP + WELL_H + 10;
const DIVIDER_TOP = 274;
const FOOTER_TOP = 287;

const FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", "Inter", "Segoe UI", Arial, sans-serif';
const INK = '#15171C';
const MUTED = '#868C96';
const FAINT = '#A3A8B0';
const WARM = '#FF7A3D';
const WARM_LIGHT = '#FFB877';
const WARM_DEEP = '#CF5A1D';

const DAYS = [
  {label: 'Mon', value: 0.35, sessions: 2210},
  {label: 'Tue', value: 0.47, sessions: 2640},
  {label: 'Wed', value: 0.41, sessions: 2380},
  {label: 'Thu', value: 0.53, sessions: 2860},
  {label: 'Fri', value: 0.62, sessions: 3610},
  {label: 'Sat', value: 0.38, sessions: 2300},
  {label: 'Sun', value: 0.31, sessions: 2204},
];
const HERO = 4;

// ---------------------------------------------------------------------------
// Timeline (frames @ 60 fps, 180 total)
// ---------------------------------------------------------------------------
const T = {
  cardIn: [0, 34],
  label: [6, 28],
  value: [12, 34],
  wellsIn: 6, // + i * 2
  dotsIn: 12, // + i * 3
  growStart: 24, // + i * 5
  growStagger: 5,
  highlight: [90, 126],
  chip: [106, 132],
  delta: [112, 138],
  footer: [118, 146],
} as const;

const colX = (i: number) => PAD + i * (WELL_W + WELL_GAP);

/** Bar height at a (possibly fractional) frame. Starts as a dot (circle), grows with a soft spring. */
const barTarget = (i: number) => Math.round(Math.max(BAR_W, DAYS[i].value * BAR_MAX));
const barHeight = (i: number, f: number, fps: number) => {
  const target = barTarget(i);
  const s = spring((f - (T.growStart + i * T.growStagger)) / fps, 0.76, 8.2);
  return lerp(BAR_W, target, s);
};

const highlightAt = (f: number) => ease(f, T.highlight[0], T.highlight[1], easeInOut);

/** Glow bloom: rises slightly past 1 then relaxes, so the emphasis "lands". */
const bloomAt = (f: number) => {
  const base = ease(f, T.highlight[0] + 4, T.highlight[1] + 4, easeInOut);
  const bump = Math.sin(Math.PI * easeOutSoft(progress(f, T.highlight[0] + 14, T.highlight[1] + 34)));
  return base * (1 + 0.16 * bump);
};

/** A single soft sheen that travels up the hero capsule as it warms. */
const sheenAt = (f: number) => progress(f, T.highlight[0] + 6, T.highlight[1] + 6);

const Bar: React.FC<{i: number; f: number; fps: number; hl: number; dim: number}> = ({i, f, fps, hl, dim}) => {
  const sheen = sheenAt(f);
  // Motion blur: sample the leading edge across a one-frame shutter and feather the swept region.
  const hA = barHeight(i, f - 0.5, fps);
  const hB = barHeight(i, f + 0.5, fps);
  const hMid = barHeight(i, f, fps);
  const lo = Math.min(hA, hB);
  const hi = Math.max(hA, hB);
  const smear = hi - lo;
  const blurred = smear > 0.75;
  const fillH = blurred ? hi : hMid;
  const mask = blurred
    ? `linear-gradient(to top, #000 0px, #000 ${lo.toFixed(2)}px, rgba(0,0,0,0) ${hi.toFixed(2)}px)`
    : undefined;

  const dotP = ease(f, T.dotsIn + i * 3, T.dotsIn + i * 3 + 18);
  const left = colX(i) + BAR_INSET;
  const isHero = i === HERO;
  const warm = isHero ? hl : 0;

  const neutralShadowA = lerp(1, 0.55, dim);
  const shadow = isHero
    ? [
        `0 0 0 0.5px ${mix('#141821', WARM_DEEP, warm, lerp(0.07, 0.16, warm))}`,
        `0 1px 1.5px ${mix('#141821', WARM_DEEP, warm, lerp(0.1, 0.2, warm))}`,
        `0 4px 10px -2px ${mix('#141821', WARM, warm, lerp(0.1, 0.38, warm))}`,
      ].join(', ')
    : [
        `0 0 0 0.5px rgba(20,24,33,${0.07 * neutralShadowA})`,
        `0 1px 1.5px rgba(20,24,33,${0.1 * neutralShadowA})`,
        `0 4px 10px -2px rgba(20,24,33,${0.1 * neutralShadowA})`,
      ].join(', ');

  const shadowH = (lo + hi) / 2;

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top: CHART_TOP + WELL_H - BAR_INSET,
        width: BAR_W,
        height: 0,
        opacity: dotP,
        transform: dotP < 1 ? `scale(${lerp(0.55, 1, dotP)})` : undefined,
        transformOrigin: `${BAR_W / 2}px ${-BAR_W / 2}px`,
      }}
    >
      {/* shadow carrier: unmasked so the soft shadow never flickers under the motion-blur mask */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: BAR_W,
          height: shadowH,
          borderRadius: BAR_W / 2,
          boxShadow: shadow,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: BAR_W,
          height: fillH,
          borderRadius: BAR_W / 2,
          overflow: 'hidden',
          WebkitMaskImage: mask,
          maskImage: mask,
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFB 60%, #F3F4F6 100%)',
        }}
      >
        {isHero && warm > 0 ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: warm,
              background: `linear-gradient(180deg, ${WARM_LIGHT} 0%, #FF9750 42%, ${WARM} 100%)`,
            }}
          />
        ) : null}
        {isHero && sheen > 0 && sheen < 1 ? (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: 46,
              bottom: lerp(-46, fillH + 10, bezier(0.45, 0, 0.25, 1)(sheen)),
              opacity: Math.sin(Math.PI * sheen) * 0.55,
              background:
                'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0) 100%)',
            }}
          />
        ) : null}
        {/* top highlight: the lit edge of a soft capsule */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: BAR_W,
            borderRadius: BAR_W / 2,
            background: `radial-gradient(ellipse 70% 60% at 50% 18%, rgba(255,255,255,${isHero ? lerp(0.9, 0.38, warm) : 0.9}) 0%, rgba(255,255,255,0) 70%)`,
          }}
        />
        {/* inner rim */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: BAR_W / 2,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,${isHero ? lerp(1, 0.55, warm) : 1}), inset 0 -1px 0 ${
              isHero ? mix('#141821', WARM_DEEP, warm, lerp(0.03, 0.18, warm)) : 'rgba(20,24,33,0.03)'
            }`,
          }}
        />
      </div>
    </div>
  );
};

export const AnalyticsGlow: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const f = frame;

  // Card entrance
  const cardP = ease(f, T.cardIn[0], T.cardIn[1]);
  const cardY = lerp(22, 0, cardP);
  const cardS = lerp(0.955, 1, cardP);
  const cardO = clamp01(lerp(0, 1, ease(f, 0, 20)));

  const labelP = ease(f, T.label[0], T.label[1]);
  const valueP = ease(f, T.value[0], T.value[1]);
  // The headline total is the running sum of each column's own growth, so number and bars move as one.
  const shown = Math.round(
    DAYS.reduce((acc, d, i) => {
      const s0 = T.growStart + i * T.growStagger;
      return acc + d.sessions * ease(f, s0 - 8, s0 + 40, (x) => 1 - Math.pow(1 - x, 2.4));
    }, 0),
  );

  const hl = highlightAt(f);
  const bloom = bloomAt(f);
  const chipP = ease(f, T.chip[0], T.chip[1]);
  const deltaP = ease(f, T.delta[0], T.delta[1]);
  const footerP = ease(f, T.footer[0], T.footer[1]);

  const heroH = barHeight(HERO, f, fps);
  const heroLeft = colX(HERO) + BAR_INSET;
  const heroCx = heroLeft + BAR_W / 2;
  const heroBottom = CHART_TOP + WELL_H - BAR_INSET;
  const heroTop = heroBottom - heroH;

  const chipTop = heroBottom - barTarget(HERO) - 8 - 24;
  const rest = (p: number) => p >= 1; // resting elements get no transform -> crisp text

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(ellipse 80% 75% at 50% 42%, #FBFBFA 0%, #F3F3F1 48%, #E9E9E6 100%)',
        fontFamily: FONT,
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* ground contact shadow */}
      <div
        style={{
          position: 'absolute',
          left: 480 - 170,
          top: 270 + CARD_H / 2 - 18,
          width: 340,
          height: 40,
          borderRadius: '50%',
          background: 'rgba(40,44,52,0.11)',
          filter: 'blur(22px)',
          opacity: cardO * lerp(0.2, 1, cardP),
          transform: `translateY(${cardY * 0.4}px) scaleX(${lerp(0.8, 1, cardP)})`,
        }}
      />

      {/* card */}
      <div
        style={{
          position: 'absolute',
          left: (960 - CARD_W) / 2,
          top: (540 - CARD_H) / 2,
          width: CARD_W,
          height: CARD_H,
          opacity: cardO,
          transform: rest(cardP) ? undefined : `translateY(${cardY}px) scale(${cardS})`,
          transformOrigin: '50% 60%',
          borderRadius: 26,
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 55%, #FCFCFB 100%)',
          boxShadow: [
            '0 0 0 1px rgba(20,24,33,0.05)',
            '0 1px 2px rgba(20,24,33,0.04)',
            `0 10px 22px -8px rgba(20,24,33,${lerp(0.04, 0.09, cardP)})`,
            `0 30px 60px -22px rgba(20,24,33,${lerp(0.05, 0.13, cardP)})`,
            'inset 0 1px 0 #FFFFFF',
          ].join(', '),
        }}
      >
        {/* warm light spill on the card surface */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 26,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: heroCx - 150,
              top: heroTop - 70,
              width: 300,
              height: heroH + 170,
              borderRadius: '50%',
              background: 'radial-gradient(closest-side, rgba(255,150,90,0.16), rgba(255,150,90,0))',
              opacity: bloom,
            }}
          />
        </div>

        {/* header */}
        <div
          style={{
            position: 'absolute',
            left: PAD,
            top: 24,
            height: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '0.005em',
            color: MUTED,
            opacity: labelP,
            transform: rest(labelP) ? undefined : `translateY(${lerp(6, 0, labelP)}px)`,
          }}
        >
          <span>Weekly sessions</span>
          <span style={{width: 3, height: 3, borderRadius: 2, background: '#C9CCD1'}} />
          <span style={{color: FAINT}}>Last 7 days</span>
        </div>

        {/* delta badge (part of the compact result) */}
        <div
          style={{
            position: 'absolute',
            right: PAD,
            top: 22,
            height: 22,
            padding: '0 8px',
            borderRadius: 11,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11.5,
            fontWeight: 600,
            letterSpacing: '0.01em',
            fontVariantNumeric: 'tabular-nums',
            color: WARM_DEEP,
            background: '#FFF3EA',
            boxShadow: 'inset 0 0 0 1px rgba(255,122,61,0.16)',
            opacity: deltaP,
            transform: rest(deltaP) ? undefined : `translateX(${lerp(8, 0, deltaP)}px)`,
          }}
        >
          <svg width="8" height="8" viewBox="0 0 8 8" style={{display: 'block'}}>
            <path d="M4 1.2 L7 5.6 H1 Z" fill={WARM_DEEP} />
          </svg>
          <span>12.4%</span>
        </div>

        {/* big value */}
        <div
          style={{
            position: 'absolute',
            left: PAD - 1,
            top: 47,
            fontSize: 36,
            lineHeight: '40px',
            fontWeight: 650,
            letterSpacing: '-0.025em',
            color: INK,
            fontVariantNumeric: 'tabular-nums',
            opacity: valueP,
            transform: rest(valueP) ? undefined : `translateY(${lerp(8, 0, valueP)}px)`,
          }}
        >
          {shown.toLocaleString('en-US')}
        </div>

        {/* wells */}
        {DAYS.map((d, i) => {
          const p = ease(f, T.wellsIn + i * 2, T.wellsIn + i * 2 + 22);
          const warmWell = i === HERO ? hl : 0;
          return (
            <div
              key={`well-${d.label}`}
              style={{
                position: 'absolute',
                left: colX(i),
                top: CHART_TOP,
                width: WELL_W,
                height: WELL_H,
                borderRadius: WELL_W / 2,
                opacity: p,
                background: `linear-gradient(180deg, ${mix('#F1F2F4', '#FFF1E6', warmWell)} 0%, ${mix(
                  '#F6F6F8',
                  '#FFF6EF',
                  warmWell,
                )} 100%)`,
                boxShadow: [
                  `inset 0 1px 2px rgba(20,24,33,${lerp(0.06, 0.04, warmWell)})`,
                  `inset 0 0 0 1px ${mix('#141821', WARM, warmWell, lerp(0.028, 0.08, warmWell))}`,
                  '0 1px 0 rgba(255,255,255,0.9)',
                ].join(', '),
              }}
            />
          );
        })}

        {/* warm glow beneath the hero bar */}
        <div
          style={{
            position: 'absolute',
            left: heroCx - (BAR_W + 44) / 2,
            top: heroTop - 16,
            width: BAR_W + 44,
            height: heroH + 30,
            borderRadius: 40,
            background: 'rgba(255,140,74,0.5)',
            filter: 'blur(18px)',
            opacity: bloom * 0.85,
            transform: `scale(${lerp(0.7, 1, clamp01(bloom))})`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: heroCx - (BAR_W + 10) / 2,
            top: heroTop - 4,
            width: BAR_W + 10,
            height: heroH + 6,
            borderRadius: (BAR_W + 10) / 2,
            background: 'rgba(255,120,55,0.55)',
            filter: 'blur(7px)',
            opacity: bloom,
          }}
        />

        {/* bars */}
        {DAYS.map((d, i) => (
          <Bar key={`bar-${d.label}`} i={i} f={f} fps={fps} hl={hl} dim={i === HERO ? 0 : hl} />
        ))}

        {/* day labels */}
        {DAYS.map((d, i) => {
          const p = ease(f, T.wellsIn + 6 + i * 2, T.wellsIn + 28 + i * 2);
          const isHero = i === HERO;
          return (
            <div
              key={`lbl-${d.label}`}
              style={{
                position: 'absolute',
                left: colX(i) - 8,
                top: LABEL_TOP,
                width: WELL_W + 16,
                textAlign: 'center',
                fontSize: 11,
                lineHeight: '14px',
                fontWeight: 600,
                letterSpacing: '0.02em',
                color: isHero ? mix('#A3A8B0', WARM_DEEP, hl) : FAINT,
                opacity: p,
              }}
            >
              {d.label}
            </div>
          );
        })}

        {/* value chip above the hero bar */}
        <div
          style={{
            position: 'absolute',
            left: heroCx - 32,
            top: chipTop,
            width: 64,
            height: 24,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            background: '#FFFFFF',
            boxShadow: [
              '0 0 0 1px rgba(20,24,33,0.06)',
              '0 1px 2px rgba(20,24,33,0.06)',
              '0 6px 14px -4px rgba(20,24,33,0.14)',
            ].join(', '),
            fontSize: 12,
            fontWeight: 650,
            letterSpacing: '0.005em',
            color: INK,
            fontVariantNumeric: 'tabular-nums',
            opacity: chipP,
            transform: rest(chipP) ? undefined : `translateY(${lerp(8, 0, chipP)}px) scale(${lerp(0.9, 1, chipP)})`,
            transformOrigin: '50% 100%',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              background: `linear-gradient(180deg, ${WARM_LIGHT}, ${WARM})`,
              boxShadow: '0 0 6px rgba(255,122,61,0.6)',
            }}
          />
          <span>3,610</span>
        </div>

        {/* divider */}
        <div
          style={{
            position: 'absolute',
            left: PAD,
            right: PAD,
            top: DIVIDER_TOP,
            height: 1,
            background: 'rgba(20,24,33,0.06)',
            transformOrigin: '0 50%',
            transform: `scaleX(${ease(f, 40, 90)})`,
          }}
        />

        {/* quiet explanatory text */}
        <div
          style={{
            position: 'absolute',
            left: PAD,
            top: FOOTER_TOP,
            height: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            fontSize: 12.5,
            lineHeight: '16px',
            fontWeight: 500,
            color: MUTED,
            opacity: footerP,
            transform: rest(footerP) ? undefined : `translateY(${lerp(6, 0, footerP)}px)`,
          }}
        >
          <span>
            Friday peaked <span style={{color: INK, fontWeight: 600}}>39% above</span> your daily average
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
