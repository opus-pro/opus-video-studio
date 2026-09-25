import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, interpolateColors, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Chrome} from './Chrome';
import {Cursor, Ripple} from './Cursor';
import {PAGE_H, PAGE_W, Page} from './Page';
import {THEMES} from './themes';
import {
  CHIP_W,
  CHROME_H,
  CLICK1,
  CLICK2,
  PAGE_X,
  PAGE_Y,
  PUSH_END,
  PUSH_START,
  SEG_H,
  SEG_PAD,
  SEG_X,
  SEG_Y,
  WIN_W,
  WIN_X,
  WIN_Y,
  chipCenter,
  clamp,
  cursorOpacity,
  cursorPos,
  pressAmount,
  wipeProgress,
} from './timeline';

const WIN_H = CHROME_H + PAGE_H;
const S_FINAL = 960 / PAGE_W;

const Wipe: React.FC<{from: number; to: number; p: number; click: number}> = ({from, to, p, click}) => {
  const c = chipCenter(click);
  const ox = c.x - PAGE_X;
  const oy = c.y - PAGE_Y;
  const maxR = Math.hypot(Math.max(ox, PAGE_W - ox), PAGE_H - oy) + 40;
  const r0 = Math.abs(oy) + 6;
  const r = p <= 0 ? 0 : r0 + p * (maxR - r0);
  const ringO = interpolate(p, [0, 0.08, 0.7, 1], [0, 1, 0.9, 0], clamp);
  const next = THEMES[to];
  return (
    <>
      <Page t={THEMES[from]} />
      <div style={{position: 'absolute', inset: 0, clipPath: `circle(${r}px at ${ox}px ${oy}px)`}}>
        <Page t={next} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: ox - r,
          top: oy - r,
          width: r * 2,
          height: r * 2,
          borderRadius: '50%',
          opacity: ringO,
          boxShadow: `0 0 0 1.5px ${next.accent}, 0 0 28px 6px ${next.accent}55, inset 0 0 22px 2px ${next.accent}44`,
        }}
      />
    </>
  );
};

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Theme state
  const p1 = wipeProgress(frame, CLICK1);
  const p2 = wipeProgress(frame, CLICK2);

  // Segmented control indicator (spring from click)
  const s1 = spring({frame: frame - CLICK1, fps, config: {damping: 16, stiffness: 190, mass: 0.7}});
  const s2 = spring({frame: frame - CLICK2, fps, config: {damping: 16, stiffness: 190, mass: 0.7}});
  const indicator = s1 + s2;

  // Cursor interaction
  const cp = cursorPos(frame);
  const press1 = pressAmount(frame, CLICK1);
  const press2 = pressAmount(frame, CLICK2);
  const hover = [0, 1, 2].map((i) => {
    const x0 = WIN_X + SEG_X + SEG_PAD + i * CHIP_W;
    const y0 = WIN_Y + SEG_Y;
    const inside = cp.x > x0 && cp.x < x0 + CHIP_W && cp.y > y0 && cp.y < y0 + SEG_H;
    return inside ? 1 : 0;
  });
  const flash = [
    0,
    interpolate(frame, [CLICK1, CLICK1 + 3, CLICK1 + 20], [0, 1, 0], clamp),
    interpolate(frame, [CLICK2, CLICK2 + 3, CLICK2 + 20], [0, 1, 0], clamp),
  ];
  const ripple1 = interpolate(frame, [CLICK1 - 1, CLICK1 + 17], [0, 1], clamp);
  const ripple2 = interpolate(frame, [CLICK2 - 1, CLICK2 + 17], [0, 1], clamp);

  // Camera: intro settle (3D tilt) and final push to full-bleed page.
  const intro = interpolate(frame, [0, 36], [0, 1], {...clamp, easing: Easing.bezier(0.25, 0.4, 0.15, 1)});
  const push = interpolate(frame, [PUSH_START, PUSH_END], [0, 1], {...clamp, easing: Easing.bezier(0.62, 0, 0.18, 1)});
  const k = 1 - intro;
  const tilt =
    k > 0.0005
      ? `perspective(1500px) translate3d(0, ${16 * k}px, 0) rotateX(${11 * k}deg) rotateY(${-13 * k}deg) rotateZ(${1.2 * k}deg) scale(${
          1 - 0.1 * k
        })`
      : 'none';
  const sc = 1 + (S_FINAL - 1) * push;
  const cam = push > 0 ? `translate(${-WIN_X * S_FINAL * push}px, ${-PAGE_Y * S_FINAL * push}px) scale(${sc})` : 'none';

  const themePos = p1 + p2;
  const glow = interpolateColors(themePos, [0, 1, 2], THEMES.map((t) => t.glow));
  const radius = 12 * (1 - push);

  let page: React.ReactNode;
  if (p2 > 0 && p2 < 1) page = <Wipe from={1} to={2} p={p2} click={2} />;
  else if (p2 >= 1) page = <Page t={THEMES[2]} />;
  else if (p1 > 0 && p1 < 1) page = <Wipe from={0} to={1} p={p1} click={1} />;
  else if (p1 >= 1) page = <Page t={THEMES[1]} />;
  else page = <Page t={THEMES[0]} />;

  const c1 = chipCenter(1);
  const c2 = chipCenter(2);

  // Backdrop parallax: slow drift plus a smaller share of the camera push.
  const bgScale = 1.12 + 0.03 * (frame / 195) + 0.1 * push;

  return (
    <AbsoluteFill style={{backgroundColor: '#0B0907', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${bgScale})`, transformOrigin: '50% 60%'}}>
        <Img
          src={staticFile('generated-assets/evidence-room.png')}
          style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(9px) brightness(0.5) saturate(0.95)'}}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(52% 58% at 50% 52%, ${glow}66 0%, ${glow}22 45%, rgba(0,0,0,0) 72%)`,
          mixBlendMode: 'screen',
        }}
      />
      <AbsoluteFill style={{background: 'radial-gradient(90% 90% at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)'}} />

      <AbsoluteFill style={{transform: cam, transformOrigin: '0 0'}}>
        <AbsoluteFill style={{transform: tilt, transformOrigin: '50% 50%'}}>
          {/* contact shadow */}
          <div
            style={{
              position: 'absolute',
              left: WIN_X + 30,
              top: WIN_Y + WIN_H - 30,
              width: WIN_W - 60,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.55)',
              filter: 'blur(18px)',
              opacity: 1 - push,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: WIN_X,
              top: WIN_Y,
              width: WIN_W,
              height: WIN_H,
              borderRadius: radius,
              overflow: 'hidden',
              background: '#1D1F23',
              boxShadow: `0 0 0 1px rgba(255,255,255,${0.09 * (1 - push)}), 0 30px 70px rgba(0,0,0,${0.55 * (1 - push)}), 0 10px 24px rgba(0,0,0,${
                0.35 * (1 - push)
              })`,
            }}
          >
            <Chrome indicator={indicator} hover={hover} press={[0, press1, press2]} flash={flash} />
            <div style={{position: 'absolute', left: 0, top: CHROME_H, width: PAGE_W, height: PAGE_H, overflow: 'hidden'}}>{page}</div>
          </div>
          <Ripple x={c1.x - 6} y={c1.y + 1} t={ripple1} color="#FFFFFF" />
          <Ripple x={c2.x - 6} y={c2.y + 1} t={ripple2} color="#FFFFFF" />
          <Cursor frame={frame} press={Math.max(press1, press2)} opacity={cursorOpacity(frame)} />
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
