import React from 'react';
import {Easing, Img, staticFile, useCurrentFrame} from 'remotion';
import {
  C,
  camPush,
  camX,
  HERO_BORDER,
  HERO_STRIP,
  heroExitP,
  heroFrameP,
  heroGrowP,
  heroRect,
  img,
  SANS,
  T,
} from './layout';
import {blurCss, clamp01, EIO, EOUT, lerp, prog, rectSpeed} from './lib';

type Photo = {
  src: string;
  cx: number;
  cy: number;
  w: number;
  h: number;
  rot: number;
  depth: number;
  blur: number;
  delay: number;
  badge?: number;
  opacity?: number;
};

const PHOTOS: Photo[] = [
  {src: 'sandstone-desert', cx: 806, cy: 146, w: 184, h: 128, rot: 3.5, depth: 0.45, blur: 3.4, delay: 0, opacity: 0.82},
  {src: 'alpine-valley', cx: 138, cy: 180, w: 200, h: 140, rot: -5, depth: 0.7, blur: 1.1, delay: 4, badge: 2},
  {src: 'ridge-meadow', cx: 828, cy: 390, w: 208, h: 148, rot: 4, depth: 0.82, blur: 0.9, delay: 8, badge: 3},
];

const Badge: React.FC<{n: number; size?: number}> = ({n, size = 20}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 6,
      background: 'linear-gradient(180deg,#d98a3e,#b8671f)',
      color: '#fff8ee',
      fontFamily: SANS,
      fontSize: size * 0.56,
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 6px rgba(80,30,0,0.35)',
    }}
  >
    {n}
  </div>
);

export const BackPhotos: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T.proofIn - 2 || f > T.brandOut[1] + 8) return null;
  return (
    <>
      {PHOTOS.map((p) => {
        const inP = prog(f, T.proofIn + p.delay, T.proofIn + p.delay + 30, EOUT);
        const outP = prog(f, T.brandOut[0] + p.delay * 0.5, T.brandOut[1] + p.delay * 0.4, Easing.bezier(0.5, 0, 0.8, 0.4));
        const push = 1 + (camPush(f) - 1) * p.depth;
        const dx = camX(f) * p.depth + (p.cx - 480) * (push - 1);
        const dy = (p.cy - 270) * (push - 1);
        const ox = (p.cx - 480) * (1 - inP) * 0.32;
        const oy = (p.cy - 270) * (1 - inP) * 0.32;
        const scale = lerp(1.32, 1, inP) * lerp(1, 0.9, outP) * push;
        const blur = p.blur + (1 - inP) * 14 + outP * 10;
        const opacity = clamp01(inP * 1.5) * (1 - outP) * (p.opacity ?? 1);
        const rot = p.rot + (1 - inP) * p.rot * 0.8;
        return (
          <div
            key={p.src}
            style={{
              position: 'absolute',
              left: p.cx + dx + ox - p.w / 2,
              top: p.cy + dy + oy - p.h / 2,
              width: p.w,
              height: p.h,
              transform: `rotate(${rot.toFixed(3)}deg) scale(${scale.toFixed(4)})`,
              filter: blurCss(blur),
              opacity,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: '#efe4d3',
                borderRadius: 3,
                boxShadow: '0 18px 40px -10px rgba(10,4,0,0.7), 0 3px 8px rgba(10,4,0,0.35)',
                padding: 7,
                boxSizing: 'border-box',
              }}
            >
              <Img
                src={staticFile(img(p.src))}
                style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 1.5}}
              />
            </div>
            {p.badge && (
              <div style={{position: 'absolute', left: 13, top: 13}}>
                <Badge n={p.badge} size={19} />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

const Check: React.FC<{color: string; size?: number}> = ({color, size = 12}) => (
  <svg width={size} height={size} viewBox="0 0 12 12" style={{display: 'block'}}>
    <path d="M2.4 6.3 L5 8.8 L9.8 3.4" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Hero: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T.heroGrow[0] || f > T.brandOut[1] + 4) return null;
  const r = heroRect(f);
  const p = heroGrowP(f);
  const fp = heroFrameP(f);
  const e = heroExitP(f);
  const b = HERO_BORDER * fp;
  const strip = HERO_STRIP * fp;
  const speed = rectSpeed(heroRect(f + 0.5), heroRect(f - 0.5));
  const mblur = Math.min(speed * 0.045, 2.6);
  const capO = prog(f, 146, 160, EIO) * (1 - prog(f, 188, 198));
  const pillP = prog(f, 155, 170, EOUT);
  const pillO = prog(f, 155, 165) * (1 - prog(f, 188, 198));
  const scan = prog(f, 150, 176, Easing.bezier(0.4, 0, 0.3, 1));

  return (
    <div
      style={{
        position: 'absolute',
        left: r.x,
        top: r.y,
        width: r.w,
        height: r.h,
        borderRadius: lerp(5, 3, fp),
        background: `linear-gradient(180deg, #f8f1e6, #efe5d5)`,
        boxShadow: `0 ${lerp(3, 30, p).toFixed(1)}px ${lerp(8, 70, p).toFixed(1)}px -${lerp(0, 14, p).toFixed(
          1,
        )}px rgba(12,5,0,${lerp(0.25, 0.7, p).toFixed(2)}), 0 ${lerp(1, 6, p).toFixed(1)}px ${lerp(3, 16, p).toFixed(
          1,
        )}px rgba(12,5,0,0.3)`,
        filter: blurCss(mblur + e * 9),
        opacity: 1 - prog(f, T.brandOut[0] + 8, T.brandOut[1], EIO),
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: b,
          top: b,
          width: r.w - 2 * b,
          height: r.h - 2 * b - strip,
          borderRadius: lerp(5, 1.5, fp),
          overflow: 'hidden',
        }}
      >
        <Img
          src={staticFile(img('rowboat-lake'))}
          style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
        />
        {/* warm verification sweep */}
        {scan > 0 && scan < 1 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '45%',
              left: `${lerp(-50, 110, scan)}%`,
              background:
                'linear-gradient(100deg, rgba(255,210,150,0) 0%, rgba(255,214,160,0.34) 50%, rgba(255,210,150,0) 100%)',
              mixBlendMode: 'screen',
            }}
          />
        )}
        {/* evidence pill */}
        <div
          style={{
            position: 'absolute',
            right: 12,
            top: 12,
            height: 26,
            padding: '0 11px 0 8px',
            borderRadius: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(28,17,9,0.62)',
            boxShadow: 'inset 0 0 0 1px rgba(255,220,170,0.18), 0 4px 14px rgba(0,0,0,0.25)',
            fontFamily: SANS,
            fontSize: 11.5,
            fontWeight: 600,
            color: '#fbead2',
            whiteSpace: 'nowrap',
            opacity: pillO,
            transform: pillP < 1 ? `translateY(${((1 - pillP) * -8).toFixed(2)}px)` : undefined,
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              background: '#d98a3e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Check color="#fff" size={11} />
          </div>
          Still water confirmed
        </div>
      </div>
      {/* caption strip */}
      <div
        style={{
          position: 'absolute',
          left: b + 2,
          right: b + 2,
          bottom: 0,
          height: strip + b,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: SANS,
          opacity: capO,
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <Badge n={1} size={18} />
          <span style={{fontSize: 12.5, fontWeight: 600, color: C.ink}}>Shore photo</span>
          <span style={{fontSize: 12, fontWeight: 500, color: C.muted}}>06:42 AM · east bank</span>
        </div>
        <span style={{fontSize: 12, fontWeight: 600, color: C.amber}}>Wind 2 mph</span>
      </div>
    </div>
  );
};

// Out-of-focus foreground document drifting past the lens.
export const Foreground: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 132 || f > 216) return null;
  const inP = prog(f, 134, 172, EOUT);
  const outP = prog(f, 190, 214, EIO);
  const dx = camX(f) * 1.9 + (1 - inP) * -140;
  const lines = [0, 1, 2, 3, 4, 5];
  return (
    <div
      style={{
        position: 'absolute',
        left: -70 + dx,
        top: 404 + (1 - inP) * 40,
        width: 300,
        height: 210,
        transform: 'rotate(-11deg)',
        filter: 'blur(11px)',
        opacity: 0.78 * inP * (1 - outP),
        background: 'linear-gradient(160deg, #f2e2c8, #d9bf98)',
        borderRadius: 4,
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
      }}
    >
      {lines.map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 30,
            top: 34 + i * 24,
            width: i === 0 ? 120 : 200 - (i % 3) * 30,
            height: i === 0 ? 12 : 7,
            background: i === 2 ? 'rgba(230,170,60,0.9)' : 'rgba(90,60,30,0.45)',
            borderRadius: 3,
          }}
        />
      ))}
    </div>
  );
};
