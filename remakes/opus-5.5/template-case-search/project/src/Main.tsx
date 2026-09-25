import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {CAMERA_FOV, CAMERA_Z, Hero3D, heroState} from './Hero3D';
import {ITEMS, GridItem, ObjectVisual, PosterImg, isChrome, itemHalfHeight} from './objects';
import {floatY, gridPose, introDelay, recedeProgress} from './grid';
import {BgChrome} from './BgChrome';
import {
  ACCENT,
  EASE,
  FAINT,
  FONT,
  FORM_RS,
  FORM_SCALE,
  GRID_POSTER_W,
  HEIGHT,
  HERO_X,
  HERO_Y,
  INK,
  LINE_RADIUS_PX,
  LINE_STROKE,
  MUTED,
  POSTER_H,
  POSTER_W,
  RING_R,
  TL,
  TUBE_R,
  WIDTH,
  clamp01,
  lerp,
  prog,
} from './timing';

const SELECTED = ITEMS.find((i) => i.selected)!;

// ---------- Background ----------
const Background: React.FC = () => (
  <AbsoluteFill>
    <AbsoluteFill style={{background: 'radial-gradient(120% 95% at 50% 42%, #F7F6F3 0%, #EFEEEA 55%, #E4E3DE 100%)'}} />
    <AbsoluteFill
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(21,22,26,0.075) 0.9px, transparent 1.3px)',
        backgroundSize: '24px 24px',
        backgroundPosition: '12px 6px',
        WebkitMaskImage: 'radial-gradient(75% 70% at 50% 50%, #000 30%, transparent 100%)',
        maskImage: 'radial-gradient(75% 70% at 50% 50%, #000 30%, transparent 100%)',
      }}
    />
  </AbsoluteFill>
);

// ---------- Grid of creative objects ----------
const GridObject: React.FC<{item: GridItem; index: number; f: number}> = ({item, index, f}) => {
  const p = gridPose(item, index, f);
  if (p.opacity <= 0.002) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: p.x,
        top: p.y,
        transform: `translate(-50%, -50%) scale(${p.scale})`,
        opacity: p.opacity,
        filter: p.blur > 0.05 || p.gray > 0.01 ? `blur(${p.blur}px) grayscale(${p.gray})` : undefined,
      }}
    >
      <ObjectVisual item={item} />
    </div>
  );
};

const ChromeShadow: React.FC<{item: GridItem; index: number; f: number}> = ({item, index, f}) => {
  const p = gridPose(item, index, f);
  if (p.opacity <= 0.002) return null;
  const w = (item.kind.type === 'ringChrome' ? 52 : item.kind.type === 'pill' ? 40 : 44) * p.scale;
  const h = 10 * p.scale;
  const hh = itemHalfHeight(item.kind) * p.scale;
  return (
    <div
      style={{
        position: 'absolute',
        left: p.x - w / 2,
        top: p.y + hh - h * 0.2,
        width: w,
        height: h,
        borderRadius: '50%',
        background: 'rgb(28,26,30)',
        opacity: 0.2 * p.opacity,
        filter: `blur(${5 + p.blur}px)`,
      }}
    />
  );
};

const MatchLabels: React.FC<{f: number}> = ({f}) => {
  const inP = prog(f, TL.filter[0] + 6, TL.filter[1] + 6, EASE.out);
  const outP = prog(f, TL.fly[0], TL.fly[0] + 14, EASE.inOut);
  const o = inP * (1 - outP);
  if (o <= 0) return null;
  const hover = prog(f, TL.hover, TL.hover + 12, EASE.out);
  return (
    <>
      {ITEMS.filter((i) => i.match).map((item) => {
        const hh = itemHalfHeight(item.kind);
        const extra = item.selected ? hover * 6 : 0;
        return (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              left: item.x - 60,
              width: 120,
              top: Math.round(item.y + hh + 12 + extra + (1 - inP) * 4),
              textAlign: 'center',
              fontFamily: FONT,
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.01em',
              color: item.selected ? mixColor(MUTED, INK, hover) : MUTED,
              opacity: o,
            }}
          >
            {item.match}
          </div>
        );
      })}
    </>
  );
};

// ---------- Selected poster (DOM) ----------
const posterPose = (f: number) => {
  const idx = ITEMS.indexOf(SELECTED);
  const intro = prog(f, introDelay(idx), introDelay(idx) + 36, EASE.out);
  const hover = prog(f, TL.hover, TL.hover + 14, EASE.out);
  const press = prog(f, TL.press, TL.press + 5, EASE.out) * (1 - prog(f, TL.release, TL.release + 10, EASE.outSoft));
  const fl = prog(f, TL.fly[0], TL.fly[1], EASE.flight);
  const gridScale = (GRID_POSTER_W / POSTER_W) * (0.94 + 0.06 * intro) * (1 + 0.07 * hover - 0.035 * press);
  const x0 = SELECTED.x;
  const y0 = SELECTED.y + (1 - intro) * 14 + floatY(f, idx) * (1 - hover);
  const cx = (x0 + HERO_X) / 2 - 10;
  const cy = (y0 + HERO_Y) / 2 + 22;
  const u = fl;
  const x = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * cx + u * u * HERO_X;
  const y = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * cy + u * u * HERO_Y;
  const scale = Math.exp(lerp(Math.log(gridScale), 0, fl));
  const rot = -4.5 * Math.sin(Math.PI * fl);
  const lift = Math.max(hover * 0.35, Math.sin(Math.PI * fl), 0) + (fl >= 1 ? 0 : 0);
  return {x, y, scale, rot, intro, hover, lift, fl};
};

const DirBlurDefs: React.FC<{amount: number}> = ({amount}) => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <defs>
      <filter id="dirblur" x="-100%" y="-100%" width="300%" height="300%" colorInterpolationFilters="sRGB">
        <feGaussianBlur stdDeviation={`${amount} 0`} />
      </filter>
    </defs>
  </svg>
);

const HeroPoster: React.FC<{f: number}> = ({f}) => {
  const fade = 1 - prog(f, TL.swap[0], TL.swap[1], EASE.linear);
  if (fade <= 0) return null;
  const p = posterPose(f);
  const q = posterPose(f - 1);
  // velocity including the growth of the card's half-diagonal
  const vx = p.x - q.x;
  const vy = p.y - q.y;
  const grow = (p.scale - q.scale) * Math.hypot(POSTER_W, POSTER_H) * 0.1;
  const speed = Math.hypot(vx, vy) + Math.abs(grow);
  const blur = Math.min(13, Math.max(0, speed * 0.62 - 0.8));
  const ang = (Math.atan2(vy, vx) * 180) / Math.PI;
  const w = POSTER_W * p.scale;
  const h = POSTER_H * p.scale;
  return (
    <>
      <DirBlurDefs amount={blur} />
      <div
        style={{
          position: 'absolute',
          left: p.x - w / 2,
          top: p.y - h / 2,
          width: w,
          height: h,
          opacity: p.intro * fade,
          transform: `rotate(${ang}deg)`,
          filter: blur > 0.3 ? 'url(#dirblur)' : undefined,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: w / 2 - POSTER_W / 2,
            top: h / 2 - POSTER_H / 2,
            width: POSTER_W,
            height: POSTER_H,
            transform: `rotate(${-ang + p.rot}deg) scale(${p.scale})`,
          }}
        >
          <PosterImg variant="ring" width={POSTER_W} />
        </div>
      </div>
    </>
  );
};

const PosterShadow: React.FC<{f: number}> = ({f}) => {
  const p = posterPose(f);
  const st = heroState(f);
  const out = prog(f, TL.roll[0], TL.roll[0] + 60, EASE.inOut);
  const w = POSTER_W * p.scale * lerp(1, 0.45, out);
  const h = POSTER_H * p.scale;
  const lift = p.lift;
  const o = p.intro * (0.3 - 0.08 * lift) * (1 - out) * (1 - st.a * 0.2);
  if (o <= 0.002) return null;
  const offset = (3 + 8 * lift) * Math.max(p.scale, 0.3) + 2;
  const blur = (4 + 16 * lift) * Math.max(p.scale, 0.35) + 2;
  return (
    <div
      style={{
        position: 'absolute',
        left: p.x - w / 2 + 3,
        top: p.y - h / 2 + offset,
        width: w - 6,
        height: h - 4,
        background: 'rgb(28,26,30)',
        opacity: o,
        filter: `blur(${blur}px)`,
        borderRadius: 4,
      }}
    />
  );
};

const RingShadow: React.FC<{f: number}> = ({f}) => {
  const st = heroState(f);
  const o = 0.2 * prog(f, TL.bend[0] + 30, TL.bend[1] + 10, EASE.inOut) * (1 - prog(f, TL.line[0], TL.line[0] + 40, EASE.inOut));
  if (o <= 0.002) return null;
  const R = RING_R * st.S;
  const r = TUBE_R * st.rs * st.S;
  const rx = R + r;
  const ry = (R + r) * Math.cos(st.rx) * 0.92;
  const bw = Math.max(2, 2 * r * 0.85);
  return (
    <div
      style={{
        position: 'absolute',
        left: HERO_X - rx,
        top: HERO_Y - ry + 30,
        width: rx * 2,
        height: ry * 2,
        borderRadius: '50%',
        border: `${bw}px solid rgb(28,26,30)`,
        boxSizing: 'border-box',
        opacity: o,
        filter: 'blur(18px)',
      }}
    />
  );
};

// ---------- Focus ring, cursor ----------
const FocusRing: React.FC<{f: number}> = ({f}) => {
  const p = posterPose(f);
  const inP = prog(f, TL.hover, TL.hover + 12, EASE.out);
  const outP = prog(f, TL.fly[0], TL.fly[0] + 8, EASE.linear);
  const o = inP * (1 - outP);
  if (o <= 0) return null;
  const pad = lerp(12, 7, inP);
  const w = POSTER_W * p.scale + pad * 2;
  const h = POSTER_H * p.scale + pad * 2;
  return (
    <div
      style={{
        position: 'absolute',
        left: p.x - w / 2,
        top: p.y - h / 2,
        width: w,
        height: h,
        borderRadius: 8,
        border: `1.5px solid ${INK}`,
        boxSizing: 'border-box',
        opacity: o,
      }}
    />
  );
};

const CURSOR_TARGET = {x: SELECTED.x + 14, y: SELECTED.y + 18};
const Cursor: React.FC<{f: number}> = ({f}) => {
  const t = prog(f, TL.cursor[0], TL.cursor[1], EASE.inOut);
  const x0 = 700;
  const y0 = 580;
  const cx = 520;
  const cy = 360;
  let x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * CURSOR_TARGET.x;
  let y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * CURSOR_TARGET.y;
  const exit = prog(f, TL.fly[0] + 2, TL.fly[0] + 26, EASE.inOut);
  x += exit * 26;
  y += exit * 34;
  const press = prog(f, TL.press, TL.press + 4, EASE.out) * (1 - prog(f, TL.release, TL.release + 8, EASE.out));
  const o = prog(f, TL.cursor[0], TL.cursor[0] + 10, EASE.linear) * (1 - exit);
  const ripple = prog(f, TL.press, TL.press + 30, EASE.out);
  const rippleO = f >= TL.press ? 0.95 * Math.pow(1 - ripple, 1.4) : 0;
  if (o <= 0 && rippleO <= 0) return null;
  return (
    <>
      {rippleO > 0 && (
        <div
          style={{
            position: 'absolute',
            left: CURSOR_TARGET.x - 4 - ripple * 22,
            top: CURSOR_TARGET.y - 4 - ripple * 22,
            width: 8 + ripple * 44,
            height: 8 + ripple * 44,
            borderRadius: '50%',
            border: '2px solid #FFFFFF',
            boxShadow: '0 0 0 0.5px rgba(21,22,26,0.18)',
            boxSizing: 'border-box',
            opacity: rippleO,
          }}
        />
      )}
      <svg
        width={22}
        height={26}
        viewBox="0 0 22 26"
        style={{
          position: 'absolute',
          left: x - 2,
          top: y - 2,
          opacity: o,
          transform: `scale(${1 - 0.12 * press})`,
          transformOrigin: '2px 2px',
          overflow: 'visible',
          filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.25))',
        }}
      >
        <path
          d="M2.5 2 L2.5 19.5 L7 15.4 L10.1 22.6 L13.2 21.3 L10.2 14.2 L16.4 14.2 Z"
          fill={INK}
          stroke="#fff"
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
};

// ---------- Search pill ----------
const QUERY = 'ring';
const SearchPill: React.FC<{f: number}> = ({f}) => {
  const inP = prog(f, 8, 40, EASE.out);
  const chars = TL.typeChars.filter((c) => f >= c).length;
  const last = chars > 0 ? TL.typeChars[chars - 1] : 0;
  const typing = chars > 0 && chars < QUERY.length;
  const selectedAt = TL.fly[0];
  const caretOn =
    f < selectedAt && (typing || Math.floor((f - (chars ? last : 40)) / 26) % 2 === 0) && f >= 40;
  const kbd = 1 - prog(f, TL.typeChars[0] - 6, TL.typeChars[0] + 4, EASE.linear);
  const results = prog(f, TL.filter[0], TL.filter[0] + 14, EASE.out);
  const typed = QUERY.slice(0, chars);
  const top = Math.round(38 + (1 - inP) * 10);
  return (
    <div
      style={{
        position: 'absolute',
        left: HERO_X - 180,
        top,
        width: 360,
        height: 44,
        borderRadius: 22,
        background: 'rgba(255,255,255,0.88)',
        boxShadow:
          '0 0 0 1px rgba(21,22,26,0.07), 0 1px 2px rgba(21,22,26,0.05), 0 12px 32px -14px rgba(21,22,26,0.22)',
        opacity: inP,
        fontFamily: FONT,
      }}
    >
      <svg width={16} height={16} viewBox="0 0 16 16" style={{position: 'absolute', left: 17, top: 14}}>
        <circle cx="6.8" cy="6.8" r="5.1" fill="none" stroke={INK} strokeOpacity={0.55} strokeWidth={1.6} />
        <path d="M10.6 10.6 L14.2 14.2" stroke={INK} strokeOpacity={0.55} strokeWidth={1.6} strokeLinecap="round" />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 44,
          top: 0,
          height: 44,
          lineHeight: '44px',
          fontSize: 15,
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {chars > 0 && <span style={{color: INK, fontWeight: 500, letterSpacing: '0.005em'}}>{typed}</span>}
        <span
          style={{
            display: 'inline-block',
            width: 1.6,
            height: 18,
            marginLeft: chars === 0 ? 0 : 1.5,
            marginRight: chars === 0 ? 2 : 0,
            background: ACCENT,
            borderRadius: 1,
            opacity: caretOn ? 1 : 0,
          }}
        />
        {chars === 0 && <span style={{color: '#A6A5A0', fontWeight: 400}}>Search creative cases</span>}
      </div>
      {kbd > 0 && (
        <div
          style={{
            position: 'absolute',
            right: 12,
            top: 11,
            height: 22,
            padding: '0 7px',
            borderRadius: 6,
            boxShadow: '0 0 0 1px rgba(21,22,26,0.1)',
            fontSize: 12,
            lineHeight: '22px',
            color: MUTED,
            fontWeight: 500,
            opacity: kbd,
          }}
        >
          ⌘K
        </div>
      )}
      {results > 0 && (
        <div
          style={{
            position: 'absolute',
            right: 18,
            top: 0,
            lineHeight: '44px',
            fontSize: 13,
            color: MUTED,
            fontWeight: 500,
            opacity: results,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          3 results
        </div>
      )}
    </div>
  );
};

// ---------- Stepper ----------
const mixColor = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const c = pa.map((v, i) => Math.round(lerp(v, pb[i], clamp01(t))));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};

const STAGES = [
  {label: 'Surface', on: TL.swap[0], off: 372},
  {label: 'Form', on: 372, off: 496},
  {label: 'Line', on: 496, off: 99999},
];

const Stepper: React.FC<{f: number}> = ({f}) => {
  const inP = prog(f, TL.swap[0] + 2, TL.swap[0] + 30, EASE.out);
  if (inP <= 0) return null;
  const c1 = prog(f, TL.roll[0] + 8, 372, EASE.inOut);
  const c2 = prog(f, TL.line[0], 496, EASE.inOut);
  const word = (i: number) => {
    const s = STAGES[i];
    const on = prog(f, s.on - 8, s.on + 8, EASE.inOut);
    const off = prog(f, s.off - 8, s.off + 8, EASE.inOut);
    const active = on * (1 - off);
    const done = off;
    const t = active + done * 0.42;
    return (
      <span key={s.label} style={{color: mixColor(FAINT, INK, t), position: 'relative', display: 'inline-block'}}>
        <span
          style={{
            position: 'absolute',
            left: -11,
            top: 7.5,
            width: 5,
            height: 5,
            borderRadius: 3,
            background: ACCENT,
            opacity: active,
            transform: `scale(${0.4 + 0.6 * active})`,
          }}
        />
        {s.label}
      </span>
    );
  };
  const conn = (p: number) => (
    <span style={{position: 'relative', width: 46, height: 1.2, background: 'rgba(21,22,26,0.13)', margin: '0 17px'}}>
      <span style={{position: 'absolute', left: 0, top: 0, height: 1.2, width: 46 * p, background: 'rgba(21,22,26,0.78)'}} />
    </span>
  );
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        width: WIDTH,
        top: Math.round(492 + (1 - inP) * 8),
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: FONT,
        fontSize: 13,
        fontWeight: 500,
        letterSpacing: '0.01em',
        lineHeight: '20px',
        opacity: inP,
      }}
    >
      {word(0)}
      {conn(c1)}
      {word(1)}
      {conn(c2)}
      {word(2)}
    </div>
  );
};

// ---------- Final line ring (crisp vector hand-off) ----------
const LineRing: React.FC<{f: number}> = ({f}) => {
  const o = prog(f, TL.svg[0], TL.svg[1], EASE.linear);
  if (o <= 0) return null;
  const dot = prog(f, TL.svg[1] + 6, TL.svg[1] + 30, EASE.out);
  const ang = lerp(-150, -38, prog(f, TL.svg[1] + 2, TL.svg[1] + 44, EASE.inOut));
  const dx = HERO_X + LINE_RADIUS_PX * Math.cos((ang * Math.PI) / 180);
  const dy = HERO_Y + LINE_RADIUS_PX * Math.sin((ang * Math.PI) / 180);
  return (
    <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', left: 0, top: 0}}>
      <circle cx={HERO_X} cy={HERO_Y} r={LINE_RADIUS_PX} fill="none" stroke={INK} strokeWidth={LINE_STROKE} opacity={o} />
      {dot > 0 && (
        <>
          <circle cx={dx} cy={dy} r={11 * dot} fill={ACCENT} opacity={0.14 * dot} />
          <circle cx={dx} cy={dy} r={4.6 * dot} fill={ACCENT} />
        </>
      )}
    </svg>
  );
};

export const Main: React.FC = () => {
  const f = useCurrentFrame();
  const rp = recedeProgress(f);
  void FORM_RS;
  void FORM_SCALE;
  return (
    <AbsoluteFill style={{backgroundColor: '#EFEEEA', overflow: 'hidden'}}>
      <Background />
      {ITEMS.map((item, i) => (item.selected || isChrome(item) ? null : <GridObject key={item.id} item={item} index={i} f={f} />))}
      {ITEMS.map((item, i) => (isChrome(item) ? <ChromeShadow key={item.id} item={item} index={i} f={f} /> : null))}
      <AbsoluteFill style={{filter: rp > 0.02 ? `blur(${2.4 * rp}px)` : undefined}}>
        <ThreeCanvas
          width={WIDTH}
          height={HEIGHT}
          dpr={2}
          gl={{antialias: true, alpha: true, preserveDrawingBuffer: true}}
          camera={{fov: CAMERA_FOV, near: 10, far: 5000, position: [0, 0, CAMERA_Z]}}
        >
          <BgChrome />
        </ThreeCanvas>
      </AbsoluteFill>
      <MatchLabels f={f} />
      <PosterShadow f={f} />
      <RingShadow f={f} />
      <AbsoluteFill>
        <ThreeCanvas
          width={WIDTH}
          height={HEIGHT}
          dpr={2}
          gl={{antialias: true, alpha: true, preserveDrawingBuffer: true}}
          camera={{fov: CAMERA_FOV, near: 10, far: 5000, position: [0, 0, CAMERA_Z]}}
        >
          <Hero3D />
        </ThreeCanvas>
      </AbsoluteFill>
      <FocusRing f={f} />
      <HeroPoster f={f} />
      <LineRing f={f} />
      <SearchPill f={f} />
      <Stepper f={f} />
      <Cursor f={f} />
    </AbsoluteFill>
  );
};
