import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  Img,
  cancelRender,
  continueRender,
  delayRender,
  interpolateColors,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {Cursor} from './Cursor';
import {CartIcon, CheckIcon} from './icons';
import {T, ease, overshoot, progress, tw} from './timing';

const FONT = 'Geist';

const C = {
  bg: '#f2eee5',
  bgHi: '#f8f6f1',
  panel: '#e6e0d2',
  ink: '#141d17',
  muted: '#676c63',
  eyebrow: '#56703f',
  lime: '#cde993',
  limePress: '#c3e085',
  green: '#1d4a2f',
  coral: '#ff8a6c',
  pillInk: '#15311d',
};

// Button geometry (canvas px)
const COL_X = 900;
const BTN = {cx: COL_X + 210, cy: 824, w: 420, h: 100};
// Side circles are the pill's own end caps (centre offset 160 = 210 - 50). They gather in 10px,
// spring out to 170 (10px overshoot, spec <= 12px) and settle at 160, so the trio spans the
// exact 420px footprint of the pill.
const SIDE_OUT = 160;
const SIDE_KEYS: [number, number][] = [
  [T.pressEnd, 160],
  [T.pressEnd + 12, 150],
  [T.pressEnd + 27, 170],
  [T.morphEnd, 160],
];
const SIDE_TUCK = 110;

/** Piecewise ease-in-out through keyframes (zero velocity at each key). */
const keys = (f: number, k: [number, number][], easing = ease.inOut) => {
  if (f <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) {
    if (f <= k[i][0]) return tw(f, k[i - 1][0], k[i][0], k[i - 1][1], k[i][1], easing);
  }
  return k[k.length - 1][1];
};

const useGeist = () => {
  const [handle] = useState(() => delayRender('Geist font'));
  useEffect(() => {
    const face = new FontFace(FONT, `url(${staticFile('assets/GeistVF.woff2')}) format('woff2')`, {
      weight: '100 900',
      style: 'normal',
    });
    face
      .load()
      .then(() => {
        (document.fonts as unknown as {add: (f: FontFace) => void}).add(face);
        return document.fonts.ready;
      })
      .then(() => continueRender(handle))
      .catch((err) => cancelRender(err));
  }, [handle]);
};

/** Entrance helper: rise + fade, finished by `end`. */
const rise = (f: number, start: number, end: number, dist = 36) => {
  const p = progress(f, start, end, ease.outSoft);
  return {opacity: Math.min(1, p * 1.6), transform: p >= 1 ? undefined : `translate3d(0, ${(1 - p) * dist}px, 0)`};
};

const Print: React.FC<{f: number}> = ({f}) => {
  const p = progress(f, 0, T.enterEnd, ease.outSoft);
  const PW = 540;
  const PH = 720;
  const cx = 452;
  const cy = 600;
  const lift = 1 - p;
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - PW / 2,
        top: cy - PH / 2,
        width: PW,
        height: PH,
        opacity: Math.min(1, p * 1.8),
        transform: `translate3d(0, ${lift * 70}px, 0) scale(${0.94 + 0.06 * p}) rotate(${-1.6 * lift}deg)`,
        transformOrigin: '50% 60%',
      }}
    >
      {/* contact + ambient shadows */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 3,
          boxShadow: [
            '0 1px 1px rgba(52,40,24,0.10)',
            '0 3px 6px rgba(52,40,24,0.08)',
            `0 ${18 + lift * 30}px ${38 + lift * 30}px -6px rgba(52,40,24,0.20)`,
            `0 ${46 + lift * 40}px ${90 + lift * 40}px -20px rgba(52,40,24,0.26)`,
          ].join(', '),
        }}
      />
      {/* paper */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 3,
          background: 'linear-gradient(160deg, #fdfcf9 0%, #f6f3ec 100%)',
          overflow: 'hidden',
        }}
      >
        <div style={{position: 'absolute', left: 30, top: 30, right: 30, bottom: 78, overflow: 'hidden', background: '#9aa9a4'}}>
          <Img
            src={staticFile('assets/coast.jpg')}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: '52% 50%',
              transform: `scale(${1.1 - 0.1 * p})`,
              transformOrigin: '50% 60%',
            }}
          />
          {/* print inner edge */}
          <div style={{position: 'absolute', inset: 0, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)'}} />
        </div>
        {/* plate caption */}
        <div
          style={{
            position: 'absolute',
            left: 30,
            right: 30,
            bottom: 26,
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: FONT,
            fontSize: 15,
            fontWeight: 550,
            letterSpacing: '0.16em',
            color: '#8b877c',
          }}
        >
          <span>COASTAL/STUDY</span>
          <span>FIELD PRINTS · 01</span>
        </div>
        {/* soft paper sheen */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(115deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 38%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.04) 100%)',
          }}
        />
      </div>
    </div>
  );
};

const Details: React.FC<{f: number}> = ({f}) => {
  const e = (d: number) => rise(f, d, T.enterEnd, 40);
  return (
    <div style={{position: 'absolute', left: COL_X, top: 0, width: 620, fontFamily: FONT, color: C.ink}}>
      <div
        style={{
          position: 'absolute',
          top: 300,
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: '0.24em',
          color: C.eyebrow,
          ...e(3),
        }}
      >
        FIELD PRINTS
      </div>
      <div
        style={{
          position: 'absolute',
          top: 344,
          fontSize: 104,
          fontWeight: 700,
          lineHeight: '96px',
          letterSpacing: '-0.035em',
          whiteSpace: 'nowrap',
        }}
      >
        <div style={e(5)}>COASTAL/</div>
        <div style={e(8)}>STUDY</div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 566,
          fontSize: 28,
          fontWeight: 450,
          color: C.muted,
          letterSpacing: '-0.005em',
          ...e(11),
        }}
      >
        Archival matte print · 12 × 16 in
      </div>
      <div
        style={{
          position: 'absolute',
          top: 626,
          fontSize: 60,
          fontWeight: 600,
          letterSpacing: '-0.03em',
          ...e(13),
        }}
      >
        $32
      </div>
    </div>
  );
};

const CartButton: React.FC<{f: number}> = ({f}) => {
  // ---- press (1.10–1.35s)
  const down = tw(f, T.pressStart, T.pressStart + 6, 0, 1, ease.out);
  const up = tw(f, T.pressEnd - 6, T.pressEnd, 0, 1, ease.inOut);
  const press = down - up;
  const pressScale = 1 - 0.035 * press;

  // ---- split (1.35–2.05s)
  const shrink = progress(f, T.pressEnd + 1, T.pressEnd + 29, ease.inOutSoft); // 420 -> 100
  // colour floods each side circle from its centre once it has pinched off (no muddy RGB crossfade)
  const tint = progress(f, T.pressEnd + 13, T.pressEnd + 26, ease.outSoft);

  // ---- return (3.1–3.8s)
  const widen = progress(f, T.returnStart + 3, T.returnEnd, ease.inOutSoft); // 100 -> 420, monotonic
  const tuck = progress(f, T.returnStart + 8, T.returnStart + 32, ease.inOut); // sides slide home
  const untint = progress(f, T.returnStart + 2, T.returnStart + 13, ease.in); // colour drains back to lime

  const centerW = BTN.w + (BTN.h - BTN.w) * shrink + (BTN.w - BTN.h) * widen;
  const sideX = keys(f, SIDE_KEYS) - (SIDE_OUT - SIDE_TUCK) * tuck;
  const sideR = 50;
  const flood = tint * (1 - untint); // 0..1 radius fraction of the colour disc
  const floodDone = tint >= 1 && untint <= 0;
  const centerFill = interpolateColors(press, [0, 1], [C.lime, C.limePress]);
  const leftFill = floodDone ? C.green : C.lime;
  const rightFill = floodDone ? C.coral : C.lime;

  // ---- content
  const addLabel = 1 - progress(f, T.pressEnd, T.pressEnd + 10, ease.inOut);
  const cartPop = progress(f, T.pressEnd + 18, T.pressEnd + 36, ease.outSoft);
  const cartScaleIn = 0.55 + 0.45 * overshoot(progress(f, T.pressEnd + 18, T.pressEnd + 40, (t) => t), 1.08);
  const checkDraw = progress(f, T.pressEnd + 24, T.pressEnd + 38, ease.inOut);
  const sideIcons = progress(f, T.pressEnd + 22, T.pressEnd + 38, ease.outSoft) * (1 - progress(f, T.returnStart, T.returnStart + 8, ease.inOut));
  const qtyScale = 0.6 + 0.4 * overshoot(progress(f, T.pressEnd + 24, T.pressEnd + 42, (t) => t), 1.1);
  const viewLabel = progress(f, T.returnStart + 14, T.returnEnd - 4, ease.inOut);
  const slot = progress(f, T.returnStart + 4, T.returnEnd - 6, ease.inOut); // icon: centre -> label slot

  // cart icon: 46px in the circle -> 34px beside the label, with a small swing while it travels
  const iconSize = 46 - 8 * slot;
  const swing = interpolateSwing(f);

  const SW = 760;
  const SH = 300;
  const ox = SW / 2;
  const oy = SH / 2;

  return (
    <div
      style={{
        position: 'absolute',
        left: BTN.cx,
        top: BTN.cy,
        width: 0,
        height: 0,
        transform: pressScale === 1 ? undefined : `scale(${pressScale})`,
      }}
    >
      <svg
        width={SW}
        height={SH}
        style={{
          position: 'absolute',
          left: -ox,
          top: -oy,
          overflow: 'visible',
          filter: `drop-shadow(0 ${10 - 5 * press}px ${14 - 6 * press}px rgba(36,64,20,${0.2 - 0.06 * press})) drop-shadow(0 2px 3px rgba(36,64,20,0.12))`,
        }}
      >
        <defs>
          <filter id="goo" filterUnits="userSpaceOnUse" x={0} y={0} width={SW} height={SH} colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation={12} result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -12" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="over" />
          </filter>
        </defs>
        <g filter="url(#goo)">
          <circle cx={ox - sideX} cy={oy} r={sideR} fill={leftFill} />
          <circle cx={ox + sideX} cy={oy} r={sideR} fill={rightFill} />
          {!floodDone && flood > 0.001 && (
            <>
              <circle cx={ox - sideX} cy={oy} r={(sideR + 0.5) * flood} fill={C.green} />
              <circle cx={ox + sideX} cy={oy} r={(sideR + 0.5) * flood} fill={C.coral} />
            </>
          )}
          <rect x={ox - centerW / 2} y={oy - BTN.h / 2} width={centerW} height={BTN.h} rx={BTN.h / 2} fill={centerFill} />
        </g>
      </svg>

      {/* Contents clipped to the centre shape */}
      <div
        style={{
          position: 'absolute',
          left: -centerW / 2,
          top: -BTN.h / 2,
          width: centerW,
          height: BTN.h,
          borderRadius: BTN.h / 2,
          overflow: 'hidden',
        }}
      >
        {/* Add to cart */}
        {addLabel > 0.002 && (
          <div
            style={{
              position: 'absolute',
              left: centerW / 2 - 210,
              top: 0,
              width: 420,
              height: BTN.h,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONT,
              fontSize: 34,
              fontWeight: 600,
              letterSpacing: '-0.01em',
              color: C.pillInk,
              opacity: addLabel,
              transform: `scale(${0.9 + 0.1 * addLabel})`,
              filter: addLabel < 0.999 ? `blur(${(1 - addLabel) * 4}px)` : undefined,
            }}
          >
            Add to cart
          </div>
        )}
        {/* View cart · 1 row. The whole row rides left as the pill widens: at slot=0 the icon sits
            on the pill centre, at slot=1 the row is centred. Shift = (rowWidth/2 - iconBox/2). */}
        <div
          style={{
            position: 'absolute',
            left: centerW / 2 - 210,
            top: 0,
            width: 420,
            height: BTN.h,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flex: 'none',
              transform: slot >= 1 ? undefined : `translate3d(calc(${1 - slot} * (50% - 19px)), 0, 0)`,
            }}
          >
            <div style={{position: 'relative', width: 38, height: 38, flex: 'none'}}>
              {cartPop > 0.001 && (
                <div
                  style={{
                    position: 'absolute',
                    left: 19 - iconSize / 2,
                    top: 19 - iconSize / 2 + 1,
                    width: iconSize,
                    height: iconSize,
                    opacity: cartPop,
                    transform: `scale(${cartScaleIn}) rotate(${swing}deg)`,
                    transformOrigin: '50% 80%',
                  }}
                >
                  <CartIcon size={iconSize} color={C.pillInk} />
                </div>
              )}
            </div>
            <div
              style={{
                marginLeft: 14,
                fontFamily: FONT,
                fontSize: 34,
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: C.pillInk,
                whiteSpace: 'nowrap',
                lineHeight: '40px',
                opacity: viewLabel,
              }}
            >
              View cart · 1
            </div>
          </div>
        </div>
      </div>

      {/* Left: check */}
      {sideIcons > 0.002 && (
        <div
          style={{
            position: 'absolute',
            left: -sideX - 50,
            top: -50,
            width: 100,
            height: 100,
            opacity: sideIcons,
            transform: `scale(${0.7 + 0.3 * sideIcons})`,
          }}
        >
          <CheckIcon size={100} color={C.lime} draw={checkDraw} />
        </div>
      )}
      {/* Right: quantity */}
      {sideIcons > 0.002 && (
        <div
          style={{
            position: 'absolute',
            left: sideX - 50,
            top: -50,
            width: 100,
            height: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONT,
            fontSize: 44,
            fontWeight: 650,
            color: C.pillInk,
            letterSpacing: '-0.02em',
            opacity: sideIcons,
            transform: `scale(${qtyScale * (0.85 + 0.15 * sideIcons)})`,
          }}
        >
          1
        </div>
      )}
    </div>
  );
};

/** Small damped tilt of the cart glyph while it slides into place (3.1–3.8s). */
const interpolateSwing = (f: number) => {
  const a = progress(f, T.returnStart + 4, T.returnStart + 16, ease.inOut);
  const b = progress(f, T.returnStart + 16, T.returnStart + 30, ease.inOut);
  const c = progress(f, T.returnStart + 30, T.returnEnd, ease.inOut);
  return -9 * a + 12 * b - 3 * c;
};

const Confirmation: React.FC<{f: number}> = ({f}) => {
  const p = progress(f, T.pressEnd + 30, T.pressEnd + 52, ease.out);
  return (
    <div
      style={{
        position: 'absolute',
        left: COL_X,
        top: BTN.cy + BTN.h / 2 + 34,
        fontFamily: FONT,
        fontSize: 28,
        fontWeight: 500,
        color: C.green,
        letterSpacing: '-0.005em',
        opacity: p,
        transform: p >= 1 ? undefined : `translate3d(0, ${(1 - p) * 14}px, 0)`,
        whiteSpace: 'nowrap',
      }}
    >
      Added to your bag
    </div>
  );
};

export const CartCheckout: React.FC = () => {
  useGeist();
  const f = useCurrentFrame();
  const panel = progress(f, 0, 26, ease.out);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        backgroundImage: `radial-gradient(1400px 1000px at 72% 30%, ${C.bgHi} 0%, ${C.bg} 70%)`,
        overflow: 'hidden',
      }}
    >
      {/* product stage */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          top: 96,
          width: 712,
          height: 1008,
          borderRadius: 36,
          background: `linear-gradient(180deg, #e9e4d7 0%, ${C.panel} 100%)`,
          opacity: panel,
          transform: `scale(${0.985 + 0.015 * panel})`,
        }}
      />
      <Print f={f} />
      <Details f={f} />
      <CartButton f={f} />
      <Confirmation f={f} />
      <Cursor frame={f} />
    </AbsoluteFill>
  );
};
