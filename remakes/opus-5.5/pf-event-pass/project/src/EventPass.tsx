import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {FONT_FAMILY} from './font';
import {
  clamp01,
  easeDock,
  easeGrow,
  easeOutCubic,
  easeOutExpo,
  easeOutQuint,
  easeSwap,
  lerp,
  makeSpeed,
  progress,
  sec,
  settle,
} from './motion';

// ---------------------------------------------------------------------------
// Palette + layout
// ---------------------------------------------------------------------------
const BG = '#f4f5f1';
const INK = '#131511';
const MUTED = '#6f746b';
const CORAL = '#ff6a4d';
const CARD = '#fdfdfa';

const W = 1080;
const H = 1350;

const CARD_W = 670;
const CARD_H = 865;
const CARD_X = (W - CARD_W) / 2; // 205
const CARD_Y = 242; // integer so the resting pass sits on whole pixels
const CX = CARD_X + CARD_W / 2;
const CY = CARD_Y + CARD_H / 2;

const PAD = 48;

// Headline type
const FONT = 136;
const LINE_H = 120; // mask height per line
const HEAD_SCALE = 0.7; // 136px -> 95.2px inside the pass
const HEAD_X0 = 253;
const HEAD_Y0 = Math.round((H - LINE_H * 3) / 2);
const HEAD_W0 = 350; // measured width of FIELD / DAYS / 2026 at 136px
const HEAD_X1 = CARD_X + PAD;
const HEAD_Y1 = CARD_Y + 66;

// Pass interior (card-local coordinates)
const IMG_Y = 346;
const IMG_H = 318;
const PERF_Y = 704;
const INFO_Y = 738;

const LINES_A = ["I'M", 'GOING', 'OUTSIDE.'];
const LINES_B = ['FIELD', 'DAYS', '2026'];

// ---------------------------------------------------------------------------
// Timing (frames @ 60fps)
// ---------------------------------------------------------------------------
const STAGGER = sec(0.07); // 4.2f
const REVEAL_DUR = 40;
const SWAP_START = sec(0.9); // 54
const SWAP_END = sec(1.5); // 90
const SWAP_DUR = SWAP_END - SWAP_START - STAGGER * 2; // last line lands exactly at 1.5s
const DOCK_START = sec(1.6); // 96
const DOCK_END = sec(2.55); // 153
const SETTLE_END = sec(3); // 180

const MAX_BLUR = 8;
const revealSpeed = makeSpeed(easeOutExpo);
const swapSpeed = makeSpeed(easeSwap);

const PASS_ROT0 = -8;
const STICKER_START = 136;
const STICKER_ROT = -9;

// ---------------------------------------------------------------------------

const typeBase: React.CSSProperties = {
  fontFamily: `${FONT_FAMILY}, system-ui, sans-serif`,
  fontSize: FONT,
  fontWeight: 760,
  lineHeight: `${LINE_H}px`,
  letterSpacing: '-0.045em',
  color: INK,
  whiteSpace: 'nowrap',
  fontKerning: 'normal',
};

const VelocityFilters: React.FC<{blurs: number[]}> = ({blurs}) => (
  <svg width={0} height={0} style={{position: 'absolute'}} aria-hidden>
    <defs>
      {blurs.map((b, i) => (
        <filter key={i} id={`vblur-${i}`} x="-2%" y="-40%" width="104%" height="180%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation={`0 ${b.toFixed(3)}`} />
        </filter>
      ))}
    </defs>
  </svg>
);

const HeadlineLine: React.FC<{index: number; frame: number; blur: number}> = ({index, frame, blur}) => {
  const tIn = progress(frame, STAGGER * index, REVEAL_DUR);
  const inY = (1 - easeOutExpo(tIn)) * (LINE_H + 6);

  const tSwap = progress(frame, SWAP_START + STAGGER * index, SWAP_DUR);
  const p = easeSwap(tSwap);
  // The outgoing line runs slightly ahead so it is fully gone before the new
  // line lands (no lingering sliver at the top of the mask).
  const pOld = easeSwap(clamp01(tSwap / 0.82));

  const filter = blur > 0.05 ? `url(#vblur-${index})` : undefined;

  return (
    <div style={{position: 'relative', height: LINE_H, width: 760, overflow: 'hidden'}}>
      {pOld < 1 ? (
        <div
          style={{
            ...typeBase,
            position: 'absolute',
            left: 0,
            top: 0,
            transformOrigin: '0 0',
            // pushed up by the incoming line while compressing to half height:
            // its bottom edge always meets the top edge of the new line.
            transform: pOld > 0 ? `translateY(${-0.5 * pOld * LINE_H}px) scaleY(${1 - 0.5 * pOld})` : `translateY(${inY}px)`,
            opacity: 1 - pOld * pOld,
            filter,
          }}
        >
          {LINES_A[index]}
        </div>
      ) : null}
      {p > 0 ? (
        <div
          style={{
            ...typeBase,
            position: 'absolute',
            left: 0,
            top: 0,
            transform: p < 1 ? `translateY(${LINE_H * (1 - p)}px)` : undefined,
            filter,
          }}
        >
          {LINES_B[index]}
        </div>
      ) : null}
    </div>
  );
};

const Sticker: React.FC<{frame: number}> = ({frame}) => {
  const t = progress(frame, STICKER_START, SETTLE_END - STICKER_START);
  if (t <= 0) return null;
  const s = settle(t, 4.2, 1.4);
  const scale = 1 + 0.45 * (1 - s);
  const rot = STICKER_ROT - 26 * (1 - s);
  const opacity = clamp01((frame - STICKER_START) / 5);
  const lift = clamp01(1 - s);

  const R = 90;
  const N = 18;
  const pts: string[] = [];
  for (let i = 0; i <= 360; i++) {
    const a = (i / 360) * Math.PI * 2;
    const r = R - 3.2 + 3.2 * Math.cos(N * a);
    pts.push(`${(R + 6 + r * Math.cos(a)).toFixed(2)},${(R + 6 + r * Math.sin(a)).toFixed(2)}`);
  }
  const size = (R + 6) * 2;

  return (
    <div
      style={{
        position: 'absolute',
        left: 552 - size / 2,
        top: 326 - size / 2,
        width: size,
        height: size,
        opacity,
        transform: `rotate(${rot}deg) scale(${scale})`,
        filter: `drop-shadow(0 ${3 + 14 * lift}px ${5 + 16 * lift}px rgba(120, 38, 18, ${0.26 - 0.08 * lift}))`,
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{position: 'absolute', inset: 0}}>
        <defs>
          <radialGradient id="stickerShade" cx="35%" cy="28%" r="80%">
            <stop offset="0%" stopColor="#ff8a6f" />
            <stop offset="55%" stopColor={CORAL} />
            <stop offset="100%" stopColor="#f2583b" />
          </radialGradient>
        </defs>
        <polygon points={pts.join(' ')} fill="url(#stickerShade)" />
        <circle cx={size / 2} cy={size / 2} r={R - 16} fill="none" stroke="rgba(19,21,17,0.55)" strokeWidth={1.6} strokeDasharray="3 5" />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: `${FONT_FAMILY}, system-ui, sans-serif`,
          fontWeight: 800,
          fontSize: 78,
          letterSpacing: '-0.05em',
          color: INK,
          paddingTop: 2,
        }}
      >
        26
      </div>
    </div>
  );
};

const PassCard: React.FC<{frame: number; textBottom: number}> = ({frame, textBottom}) => {
  // Image reveal: wipes up from the bottom, but its top edge never passes the
  // docking headline (textBottom, card-local px) so type and photo never collide.
  const tImg = progress(frame, 112, 44);
  const imgReveal = easeOutQuint(tImg);
  const clipTop = Math.min(IMG_H, Math.max((1 - imgReveal) * IMG_H, textBottom + 22 - IMG_Y, 0));
  const imgScale = 1.22 - 0.22 * easeOutCubic(progress(frame, 104, SETTLE_END - 8 - 104));

  // Perforation draw-on
  const perf = easeOutCubic(progress(frame, 128, 32));

  const infoItem = (i: number): React.CSSProperties => {
    const t = easeOutQuint(progress(frame, 132 + i * 5, 24));
    return {opacity: t, transform: t < 1 ? `translateY(${(1 - t) * 18}px)` : undefined};
  };

  const title: React.CSSProperties = {
    fontFamily: `${FONT_FAMILY}, system-ui, sans-serif`,
    fontSize: 40,
    fontWeight: 700,
    letterSpacing: '-0.025em',
    lineHeight: '44px',
    color: INK,
  };
  const sub: React.CSSProperties = {
    fontFamily: `${FONT_FAMILY}, system-ui, sans-serif`,
    fontSize: 18,
    fontWeight: 560,
    letterSpacing: '0.14em',
    lineHeight: '22px',
    color: MUTED,
    marginTop: 12,
  };

  const notch = 20;
  const mask = `radial-gradient(circle at 0px ${PERF_Y}px, transparent ${notch}px, #000 ${notch + 0.6}px), radial-gradient(circle at ${CARD_W}px ${PERF_Y}px, transparent ${notch}px, #000 ${notch + 0.6}px)`;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 32,
        background: CARD,
        overflow: 'hidden',
        WebkitMaskImage: mask,
        maskImage: mask,
        WebkitMaskComposite: 'source-in',
        maskComposite: 'intersect',
      }}
    >
      {/* inner hairline */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 32,
          boxShadow: 'inset 0 0 0 1px rgba(19,21,17,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
        }}
      />
      {/* lanyard slot */}
      <div
        style={{
          position: 'absolute',
          left: CARD_W / 2 - 46,
          top: 26,
          width: 92,
          height: 14,
          borderRadius: 7,
          background: BG,
          boxShadow: 'inset 0 1.5px 2px rgba(19,21,17,0.18)',
        }}
      />
      {/* coast image */}
      <div
        style={{
          position: 'absolute',
          left: PAD,
          top: IMG_Y,
          width: CARD_W - PAD * 2,
          height: IMG_H,
          borderRadius: 20,
          overflow: 'hidden',
          clipPath: clipTop > 0 ? `inset(${clipTop}px 0 0 0 round 20px)` : undefined,
          background: '#d9ddd6',
        }}
      >
        <Img
          src={staticFile('assets/coast.jpg')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: '50% 58%',
            transform: `scale(${imgScale})`,
            transformOrigin: '50% 60%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 20,
            boxShadow: 'inset 0 0 0 1px rgba(19,21,17,0.08)',
          }}
        />
      </div>
      {/* perforation */}
      {perf > 0.005 ? (
      <svg
        width={CARD_W}
        height={4}
        style={{position: 'absolute', left: 0, top: PERF_Y - 2}}
        viewBox={`0 0 ${CARD_W} 4`}
      >
        <line
          x1={notch + 14}
          x2={notch + 14 + (CARD_W - 2 * (notch + 14)) * perf}
          y1={2}
          y2={2}
          stroke="rgba(19,21,17,0.22)"
          strokeWidth={2}
          strokeDasharray="7 9"
          strokeLinecap="round"
        />
      </svg>
      ) : null}
      {/* attendee + event info */}
      <div
        style={{
          position: 'absolute',
          left: PAD,
          right: PAD,
          top: INFO_Y,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{...title, ...infoItem(0)}}>MIRA CHEN</div>
          <div style={{...sub, ...infoItem(1)}}>DESIGNER</div>
        </div>
        <div style={{textAlign: 'right'}}>
          <div style={{...title, ...infoItem(1)}}>OCT 24–25</div>
          <div style={{...sub, ...infoItem(2)}}>SAN FRANCISCO</div>
        </div>
      </div>
    </div>
  );
};

export const EventPass: React.FC = () => {
  const frame = useCurrentFrame();

  // --- Velocity blur per headline line (reveal + swap share the same filter)
  const blurs = [0, 1, 2].map((i) => {
    const tIn = progress(frame, STAGGER * i, REVEAL_DUR);
    const tSwap = progress(frame, SWAP_START + STAGGER * i, SWAP_DUR);
    return MAX_BLUR * Math.max(revealSpeed(tIn), swapSpeed(tSwap));
  });

  // --- Pass: rotation settles by 3s, growth completes at 2.55s
  const tRot = progress(frame, DOCK_START, SETTLE_END - DOCK_START);
  const passRot = frame < DOCK_START ? 0 : PASS_ROT0 * (1 - settle(tRot, 4, 1.5));

  const tGrow = progress(frame, DOCK_START, DOCK_END - DOCK_START);
  const grow = easeGrow(tGrow);
  // The pass starts as a small card tucked behind the headline (centred on it)
  // and grows out to its full 670x865 footprint.
  const cardScale = lerp(0.5, 1, grow);
  const cardOpacity = clamp01((frame - DOCK_START) / 7);
  const cardShiftX = (HEAD_X0 + HEAD_W0 / 2 - CX) * (1 - grow);
  const cardLiftY = 0;

  const lift = frame < DOCK_START ? 0 : 1 - easeOutCubic(progress(frame, DOCK_START + 20, SETTLE_END - DOCK_START - 20));
  const shadow = [
    `drop-shadow(0 ${2 + 2 * lift}px ${3 + 3 * lift}px rgba(24, 30, 20, ${0.07 + 0.02 * lift}))`,
    `drop-shadow(0 ${22 + 28 * lift}px ${34 + 36 * lift}px rgba(24, 30, 20, ${0.12 + 0.06 * lift}))`,
  ].join(' ');

  // --- Headline dock: from canvas centre into the top of the pass
  const d = easeDock(progress(frame, DOCK_START, DOCK_END - DOCK_START));
  const rad = (-passRot * Math.PI) / 180;
  const dx = HEAD_X0 - CX;
  const dy = HEAD_Y0 - CY;
  const localX0 = CX + dx * Math.cos(rad) - dy * Math.sin(rad);
  const localY0 = CY + dx * Math.sin(rad) + dy * Math.cos(rad);
  const headX = lerp(localX0, HEAD_X1, d);
  const headY = lerp(localY0, HEAD_Y1, d);
  const headScale = lerp(1, HEAD_SCALE, d);
  const headRot = -passRot * (1 - d);
  // Bottom of the headline's caps, expressed in (unscaled) card-local pixels.
  const CAPS_BOTTOM = 347;
  const textBottomCard = (headY + CAPS_BOTTOM * headScale - CY - cardLiftY) / cardScale + CARD_H / 2;
  const headTransform =
    frame < DOCK_START
      ? `translate(${HEAD_X0}px, ${HEAD_Y0}px)`
      : `translate(${headX}px, ${headY}px) rotate(${headRot}deg) scale(${headScale})`;

  return (
    <AbsoluteFill style={{backgroundColor: BG, overflow: 'hidden'}}>
      <VelocityFilters blurs={blurs} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: W,
          height: H,
          transformOrigin: `${CX}px ${CY}px`,
          transform: passRot !== 0 ? `rotate(${passRot}deg)` : undefined,
        }}
      >
        {frame >= DOCK_START ? (
          <div
            style={{
              position: 'absolute',
              left: CARD_X,
              top: CARD_Y,
              width: CARD_W,
              height: CARD_H,
              opacity: cardOpacity,
              transformOrigin: '50% 50%',
              transform: cardScale !== 1 || cardShiftX !== 0 ? `translate(${cardShiftX}px, ${cardLiftY}px) scale(${cardScale})` : undefined,
              filter: shadow,
            }}
          >
            <PassCard frame={frame} textBottom={textBottomCard} />
            <Sticker frame={frame} />
          </div>
        ) : null}

        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            transformOrigin: '0 0',
            transform: headTransform,
          }}
        >
          {[0, 1, 2].map((i) => (
            <HeadlineLine key={i} index={i} frame={frame} blur={blurs[i]} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
