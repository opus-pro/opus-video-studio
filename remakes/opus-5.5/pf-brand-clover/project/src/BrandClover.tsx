import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FONT} from './font';
import {
  C,
  GAP,
  PANEL_RADIUS,
  PETALS,
  PetalState,
  REGION,
  Rect,
  T,
  WORD_SCALE,
  WORD_SIZE,
  WORD_START,
  clamp01,
  ease,
  fifthLocal,
  lerp,
  petalState,
  progress,
  quad,
} from './system';
import {CoralContent, FifthContent, INK_DX, INK_DY, InkContent, LOCKUP, MossContent, OchreContent} from './Contents';

// ---------------------------------------------------------------------------
// Motion blur: a per-element directional Gaussian driven by frame velocity.
// ---------------------------------------------------------------------------
const SHUTTER = 0.15;
const MAX_BLUR = 7;

type Blur = {id: string; sx: number; sy: number};

const panelBlur = (id: string, now: PetalState, before: PetalState, extra?: {vw: number; vh: number}): Blur => {
  const vx = now.cx - before.cx;
  const vy = now.cy - before.cy;
  const a = (now.angle * Math.PI) / 180;
  const lx = vx * Math.cos(a) + vy * Math.sin(a);
  const ly = -vx * Math.sin(a) + vy * Math.cos(a);
  const omega = ((now.angle - before.angle) * Math.PI) / 180;
  const vw = extra?.vw ?? now.w - before.w;
  const vh = extra?.vh ?? now.h - before.h;
  return {
    id,
    sx: Math.min(MAX_BLUR, SHUTTER * (Math.abs(lx) + Math.abs(vw) / 3 + Math.abs(omega) * now.h * 0.5)),
    sy: Math.min(MAX_BLUR, SHUTTER * (Math.abs(ly) + Math.abs(vh) / 3 + Math.abs(omega) * now.w * 0.5)),
  };
};

const blurCss = (b: Blur) => (Math.max(b.sx, b.sy) > 0.12 ? `url(#${b.id})` : undefined);

const BlurDefs: React.FC<{blurs: Blur[]}> = ({blurs}) => (
  <svg width={0} height={0} style={{position: 'absolute'}} aria-hidden>
    <defs>
      {blurs.map((b) => (
        <filter
          key={b.id}
          id={b.id}
          x="-40%"
          y="-60%"
          width="180%"
          height="220%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation={`${b.sx.toFixed(3)} ${b.sy.toFixed(3)}`} />
        </filter>
      ))}
    </defs>
  </svg>
);

// ---------------------------------------------------------------------------
// Panels (petals that become regions)
// ---------------------------------------------------------------------------
const shadowFor = (lift: number) => {
  const y = 16 + 34 * lift;
  const b = 34 + 60 * lift;
  const a = 0.2 + 0.14 * lift;
  return `0 1px 2px rgba(15,36,28,0.07), 0 ${y.toFixed(1)}px ${b.toFixed(1)}px -${(18 + 10 * lift).toFixed(1)}px rgba(15,36,28,${a.toFixed(3)})`;
};

const PanelBody: React.FC<{
  box: Rect; // current box in world space (axis-aligned before rotation)
  region: Rect; // final region: content is laid out in these coordinates
  radius: number;
  color: string;
  lift: number;
  blur: Blur;
  children?: React.ReactNode;
}> = ({box, region, radius, color, lift, blur, children}) => (
  <>
    <div style={{position: 'absolute', inset: 0, borderRadius: radius, boxShadow: shadowFor(lift)}} />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: radius,
        background: color,
        overflow: 'hidden',
        filter: blurCss(blur),
      }}
    >
      {children ? (
        <div
          style={{
            position: 'absolute',
            left: region.x - box.x,
            top: region.y - box.y,
            width: region.w,
            height: region.h,
          }}
        >
          {children}
        </div>
      ) : null}
    </div>
  </>
);

// ---------------------------------------------------------------------------
// Wordmark: the single FIELD element, travelling one quadratic path.
// ---------------------------------------------------------------------------
const WORD_CTRL = {x: 800, y: 748};
const WORD_BOX_W = 320; // fixed text box so the split fill maps 1:1 onto the glyphs

const wordState = (f: number) => {
  const t = ease.travel(progress(f, T.wordStart, T.unfoldEnd));
  const st = ease.inOut(progress(f, T.wordStart + 4, T.unfoldEnd));
  return {
    x: quad(WORD_START.x - INK_DX, WORD_CTRL.x, LOCKUP.wordCenter.x, t),
    y: quad(WORD_START.y + INK_DY, WORD_CTRL.y, LOCKUP.wordCenter.y, t),
    scale: lerp(1, WORD_SCALE, st),
  };
};


// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------
export const BrandClover: React.FC = () => {
  const f = useCurrentFrame();
  const now = PETALS.map((_, i) => petalState(i, f));
  const before = PETALS.map((_, i) => petalState(i, f - 1));
  const idx = (k: string) => PETALS.findIndex((p) => p.key === k);

  const boxOf = (s: PetalState): Rect => ({x: s.cx - s.w / 2, y: s.cy - s.h / 2, w: s.w, h: s.h});

  const coral = now[idx('coral')];
  const fifth = fifthLocal(f, coral);
  const fifthPrev = fifthLocal(f - 1, before[idx('coral')]);

  const blurs: Blur[] = PETALS.map((p, i) => panelBlur(`mb-${p.key}`, now[i], before[i]));
  const fifthBlur = panelBlur('mb-fifth', coral, before[idx('coral')], {
    vw: 0,
    vh: fifth.h - fifthPrev.h + (fifth.y - fifthPrev.y),
  });
  blurs.push(fifthBlur);

  // Wordmark
  const ws = wordState(f);
  const wsPrev = wordState(f - 1);
  const wordBox: Rect = {
    x: ws.x - (LOCKUP.wordWidth1 * ws.scale) / 2,
    y: ws.y - (LOCKUP.capHeight1 * ws.scale) / 2,
    w: LOCKUP.wordWidth1 * ws.scale,
    h: LOCKUP.capHeight1 * ws.scale,
  };
  // Split the fill exactly along the dark panel's edge while the panel sweeps under the
  // word, so every letter reads as ink on paper or paper on ink - never ink on ink.
  const inkS = now[idx('ink')];
  const inside = (px: number, py: number) => {
    const a = (-inkS.angle * Math.PI) / 180;
    const dx = px - inkS.cx;
    const dy = py - inkS.cy;
    const lx = dx * Math.cos(a) - dy * Math.sin(a);
    const ly = dx * Math.sin(a) + dy * Math.cos(a);
    return Math.abs(lx) <= inkS.w / 2 - 2 && Math.abs(ly) <= inkS.h / 2 - 2;
  };
  let hits = 0;
  const SX = 14;
  const SY = 5;
  for (let i = 0; i <= SX; i++) {
    for (let j = 0; j <= SY; j++) {
      if (inside(wordBox.x - 12 + ((wordBox.w + 24) * i) / SX, wordBox.y - 12 + ((wordBox.h + 24) * j) / SY)) hits++;
    }
  }
  const allIn = hits === (SX + 1) * (SY + 1);
  const noneIn = hits === 0;
  let wordFill: React.CSSProperties = {color: allIn ? C.paper : C.ink};
  if (!allIn && !noneIn) {
    // panel rect expressed in the word box's local (unscaled) coordinates
    const lx = (inkS.cx - ws.x) / ws.scale + WORD_BOX_W / 2;
    const ly = (inkS.cy - ws.y) / ws.scale + WORD_SIZE / 2;
    const w = inkS.w / ws.scale;
    const h = inkS.h / ws.scale;
    const svg =
      `<svg xmlns='http://www.w3.org/2000/svg' width='${WORD_BOX_W}' height='${WORD_SIZE}' viewBox='0 0 ${WORD_BOX_W} ${WORD_SIZE}'>` +
      `<rect width='100%' height='100%' fill='${C.ink}'/>` +
      `<rect x='${(lx - w / 2).toFixed(3)}' y='${(ly - h / 2).toFixed(3)}' width='${w.toFixed(3)}' height='${h.toFixed(3)}' rx='${(inkS.radius / ws.scale).toFixed(3)}' fill='${C.paper}' transform='rotate(${inkS.angle.toFixed(4)} ${lx.toFixed(3)} ${ly.toFixed(3)})'/></svg>`;
    wordFill = {
      color: 'transparent',
      backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`,
      backgroundSize: '100% 100%',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
    };
  }
  const wvx = (ws.x - wsPrev.x) / ws.scale;
  const wvy = (ws.y - wsPrev.y) / ws.scale;
  const wordBlur: Blur = {
    id: 'mb-word',
    sx: Math.min(MAX_BLUR, SHUTTER * Math.abs(wvx)),
    sy: Math.min(MAX_BLUR, SHUTTER * Math.abs(wvy)),
  };
  blurs.push(wordBlur);

  const order = ['moss', 'ochre', 'coral', 'ink'];

  return (
    <AbsoluteFill
      style={{
        fontFamily: `${FONT}, system-ui, sans-serif`,
        background: `radial-gradient(120% 90% at 50% 42%, #F7F4EE 0%, ${C.paper} 52%, ${C.paperDeep} 100%)`,
        overflow: 'hidden',
      }}
    >
      <BlurDefs blurs={blurs} />
      {/* paper tooth: a fixed, seeded grain so the ground reads as stock, not a flat fill */}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: 0.5, mixBlendMode: 'multiply'}} aria-hidden>
        <filter id="paper-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={7} stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.40  0 0 0 0 0.32  0 0 0 0.11 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#paper-grain)" />
      </svg>
      {order.map((key) => {
        const i = idx(key);
        const s = now[i];
        const box = boxOf(s);
        const region = REGION[PETALS[i].key];
        const content =
          key === 'ink' ? <InkContent /> : key === 'coral' ? <CoralContent /> : key === 'moss' ? <MossContent /> : <OchreContent />;
        return (
          <div
            key={key}
            style={{
              position: 'absolute',
              left: box.x,
              top: box.y,
              width: box.w,
              height: box.h,
              transform: Math.abs(s.angle) > 0.001 ? `rotate(${s.angle}deg)` : undefined,
            }}
          >
            {key === 'coral' && fifth.g > 0 ? (
              <div
                style={{
                  position: 'absolute',
                  left: fifth.x,
                  top: fifth.y,
                  width: fifth.w,
                  height: fifth.h,
                }}
              >
                <PanelBody
                  box={{x: box.x + fifth.x, y: box.y + fifth.y, w: fifth.w, h: fifth.h}}
                  region={REGION.fifth}
                  radius={Math.min(PANEL_RADIUS, fifth.h / 2)}
                  color={C.clay}
                  lift={s.lift * 0.8}
                  blur={fifthBlur}
                >
                  <FifthContent />
                </PanelBody>
              </div>
            ) : null}
            <PanelBody box={box} region={region} radius={s.radius} color={PETALS[i].color} lift={s.lift} blur={blurs[i]}>
              {content}
            </PanelBody>
          </div>
        );
      })}

      {/* The one and only wordmark */}
      <div
        style={{
          position: 'absolute',
          left: ws.x,
          top: ws.y,
          transform: `translate(-50%, ${-50 + LOCKUP.boxShift}%) scale(${ws.scale})`,
          width: WORD_BOX_W,
          height: WORD_SIZE,
          textAlign: 'center',
          fontSize: WORD_SIZE,
          fontWeight: 700,
          letterSpacing: '-0.035em',
          lineHeight: 1,
          whiteSpace: 'nowrap',
          filter: blurCss(wordBlur),
          ...wordFill,
        }}
      >
        FIELD
      </div>
    </AbsoluteFill>
  );
};

export const _unused = GAP;
