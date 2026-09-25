import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Cursor, Dock, Tooltip} from './Dock';
import {RadialMark} from './Mark';
import {PANELS, PanelShell, Tag} from './Panels';
import {
  C,
  FONT,
  ICON,
  ICON_X,
  ICON_Y,
  PANEL_RADIUS,
  P_CORAL,
  Rect,
  T,
  expandCenter,
  expandSize,
  inOut,
  lerp,
  outCubic,
  seg,
  unfoldEase,
} from './lib';

const pressScale = (t: number) => {
  if (t < 18) return 1;
  if (t < 29) return lerp(1, 1.035, inOut(seg(t, 18, 28)));
  if (t < T.press1) return lerp(1.035, 0.9, inOut(seg(t, T.press0, T.press1)));
  return lerp(0.9, 1, outCubic(seg(t, T.press1, T.expand0)));
};

const tileState = (t: number) => {
  const pe = seg(t, T.expand0, T.expand1);
  const ec = expandCenter(pe);
  const es = expandSize(pe);
  const s = pressScale(t);
  const cx0 = ICON_X[1] + ICON / 2;
  const cy0 = ICON_Y + ICON / 2;
  const cx = lerp(cx0, P_CORAL.x + P_CORAL.w / 2, ec);
  const cy = lerp(cy0, P_CORAL.y + P_CORAL.h / 2, ec);
  const w = lerp(ICON * s, P_CORAL.w, es);
  const h = lerp(ICON * s, P_CORAL.h, es);
  return {
    rect: {x: cx - w / 2, y: cy - h / 2, w, h} as Rect,
    cx,
    cy,
    pe,
    es,
    radius: lerp(30 * s, PANEL_RADIUS, es),
    markSize: lerp(82 * s, 400, es),
  };
};

const unfoldTilt = (t: number, final: Rect, start: number, end: number) => {
  const q = seg(t, start, end);
  const qw = unfoldEase(seg(q, 0, 0.86));
  const qh = unfoldEase(seg(q, 0.1, 1));
  if (qw >= 1 && qh >= 1) return undefined;
  const top = final.y < 300;
  // Flaps swing out from behind the tile: far edges start receded, hinge on the side nearest the tile.
  return {
    transform: `perspective(1800px) rotateY(${(1 - qw) * 34}deg) rotateX(${(1 - qh) * (top ? 26 : -26)}deg)`,
    transformOrigin: top ? '0% 100%' : '0% 0%',
  };
};

const unfoldRect = (t: number, final: Rect, start: number, end: number, ox: number, oy: number): Rect => {
  const q = seg(t, start, end);
  const qc = unfoldEase(seg(q, 0, 0.92));
  const qw = unfoldEase(seg(q, 0, 0.86));
  const qh = unfoldEase(seg(q, 0.1, 1));
  const cx = lerp(ox, final.x + final.w / 2, qc);
  const cy = lerp(oy, final.y + final.h / 2, qc);
  const w = lerp(0, final.w, qw);
  const h = lerp(0, final.h, qh);
  return {x: cx - w / 2, y: cy - h / 2, w, h};
};

const Background: React.FC<{t: number}> = ({t}) => {
  const g = Math.sin(t * 0.012) * 3;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 75% 70% at ${50 + g}% 46%, #212725 0%, #121614 52%, #090B0A 100%)`,
      }}
    >
      <svg width="1920" height="1080" style={{position: 'absolute', inset: 0, opacity: 0.07, mixBlendMode: 'overlay'}}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="1920" height="1080" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

const Caption: React.FC<{t: number}> = ({t}) => {
  const p = outCubic(seg(t, 142, 166));
  if (p <= 0) return null;
  const common: React.CSSProperties = {
    position: 'absolute',
    bottom: 34,
    fontFamily: FONT,
    fontSize: 20,
    fontWeight: 500,
    lineHeight: 1,
    color: C.cream,
    whiteSpace: 'nowrap',
  };
  return (
    <div style={{position: 'absolute', inset: 0, opacity: p, transform: p < 1 ? `translateY(${(1 - p) * 10}px)` : undefined}}>
      <div style={{...common, left: 37, opacity: 0.92}}>Radial mark</div>
      <div style={{...common, right: 37, opacity: 0.62, fontVariantNumeric: 'tabular-nums'}}>12 rays · 36 points</div>
    </div>
  );
};

export const Scene: React.FC<{t: number}> = ({t}) => {
  const tile = tileState(t);
  const flight = Math.sin(Math.PI * tile.pe);
  const landed = tile.pe >= 1;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Background t={t} />
      <Dock t={t} />
      {PANELS.map(({key, final, bg, start, end, C: Content}) => (
        <PanelShell
          key={key}
          rect={unfoldRect(t, final, start, end, tile.cx, tile.cy)}
          final={final}
          radius={PANEL_RADIUS}
          bg={bg}
          tilt={unfoldTilt(t, final, start, end)}
        >
          <Content t={t} />
        </PanelShell>
      ))}
      {/* FIELD tile → coral panel */}
      <div
        style={{
          position: 'absolute',
          left: tile.rect.x,
          top: tile.rect.y,
          width: tile.rect.w,
          height: tile.rect.h,
          borderRadius: tile.radius,
          overflow: 'hidden',
          background: `linear-gradient(162deg, ${C.coralHi} 0%, ${C.coral} 48%, ${C.coralLo} 100%)`,
          boxShadow: landed
            ? '0 18px 44px rgba(0,0,0,0.32), 0 2px 6px rgba(0,0,0,0.25)'
            : `inset 0 ${lerp(1.5, 0, tile.es)}px 0 rgba(255,255,255,0.3), 0 ${lerp(8, 42, flight)}px ${lerp(18, 96, flight)}px rgba(0,0,0,${0.22 + 0.3 * flight}), 0 0 ${lerp(0, 140, flight)}px rgba(240,102,74,${0.28 * flight})`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: tile.cx - tile.rect.x - tile.markSize / 2,
            top: tile.cy - tile.rect.y - tile.markSize / 2,
          }}
        >
          <RadialMark size={tile.markSize} t={t} ringFrom={94} breathe={seg(t, 150, 200)} />
        </div>
        <div style={{position: 'absolute', left: P_CORAL.x - tile.rect.x, top: P_CORAL.y - tile.rect.y, width: P_CORAL.w, height: P_CORAL.h}}>
          <Tag index="01" label="Mark" t={t} at={128} color={C.cream} />
          <Caption t={t} />
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: tile.radius,
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10)',
          }}
        />
      </div>
      <Tooltip t={t} />
      <Cursor t={t} />
    </AbsoluteFill>
  );
};
