import React from 'react';
import {Cam, EASE, FONT, Pose, camTf, childPose, clamp, lerp, objStyle, prog} from './math';
import {BTN, BTN_C, PANEL, PHONE, PROMPT, SCREEN, SHARE_BTN, SLOT, T, typedCount} from './timeline';

export const Sparkle: React.FC<{size: number; color?: string; style?: React.CSSProperties}> = ({size, color = '#fff', style}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{display: 'block', ...style}}>
    <path d="M12 1.5C12.9 8.3 15.7 11.1 22.5 12C15.7 12.9 12.9 15.7 12 22.5C11.1 15.7 8.3 12.9 1.5 12C8.3 11.1 11.1 8.3 12 1.5Z" fill={color} />
    <path d="M19.5 1.8C19.8 3.6 20.4 4.2 22.2 4.5C20.4 4.8 19.8 5.4 19.5 7.2C19.2 5.4 18.6 4.8 16.8 4.5C18.6 4.2 19.2 3.6 19.5 1.8Z" fill={color} opacity={0.85} />
  </svg>
);

export const GRAD = 'linear-gradient(135deg, #FF9A5C 0%, #F2548E 52%, #7C5CFF 100%)';

/* ------------------------------------------------------------------ Backdrop */
export const Backdrop: React.FC<{f: number; cam: Cam}> = ({f, cam}) => {
  const px = -cam.x * 0.05 + cam.ry * 6;
  const warm = prog(f, 150, 250, EASE.soft);
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, #D9D1E8 0%, #E9E3F2 34%, #F4F0F8 60%, #F7F4FA 70%, #E7E0F0 100%)',
        }}
      />
      {/* key light pool on the cyc */}
      <div
        style={{
          position: 'absolute',
          left: -200 + px,
          top: -120,
          width: 1360,
          height: 900,
          background: 'radial-gradient(ellipse 38% 34% at 44% 52%, rgba(255,255,255,0.85), rgba(255,255,255,0) 100%)',
        }}
      />
      {/* coloured bounce */}
      <div
        style={{
          position: 'absolute',
          left: -200 + px * 1.6,
          top: -120,
          width: 1360,
          height: 900,
          background: `radial-gradient(ellipse 26% 26% at 66% 30%, rgba(255,170,150,${0.22 + warm * 0.18}), rgba(255,170,150,0) 100%), radial-gradient(ellipse 30% 30% at 26% 74%, rgba(140,120,255,${0.16 + warm * 0.08}), rgba(140,120,255,0) 100%)`,
        }}
      />
      {/* cyc floor curve */}
      <div
        style={{
          position: 'absolute',
          left: -100,
          right: -100,
          top: 392,
          height: 240,
          background: 'radial-gradient(ellipse 60% 70% at 50% 0%, rgba(255,255,255,0.55), rgba(255,255,255,0) 70%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 75% 70% at 50% 46%, rgba(0,0,0,0) 55%, rgba(58,40,98,0.2) 100%)',
        }}
      />
    </div>
  );
};

/* ------------------------------------------------------------- Floor shadow */
export const FLOOR = 520;
export const FloorShadow: React.FC<{cam: string; x: number; z: number; w: number; d: number; opacity: number; color?: string}> = ({
  cam,
  x,
  z,
  w,
  d,
  opacity,
  color = '60,36,110',
}) => (
  <div
    style={{
      ...objStyle(cam, {x, y: FLOOR, z, rx: 90, ry: 0, rz: 0, s: 1}, w, d),
      background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(${color},0.55), rgba(${color},0.18) 45%, rgba(${color},0) 100%)`,
      opacity: clamp(opacity),
    }}
  />
);

/* -------------------------------------------------------------- Input panel */
export const InputPanel: React.FC<{f: number; cam: string; pose: Pose; opacity: number}> = ({f, cam, pose, opacity}) => {
  if (opacity <= 0.001) return null;
  const n = typedCount(f);
  const typing = f >= T.typeStart && f < T.typeEnd + 2;
  const caretOn = f < T.click && (typing || Math.floor(f / 15) % 2 === 0);
  const sweep = prog(f, T.click - 2, T.click + 14, EASE.inOut);
  const press = f >= T.click ? Math.sin(Math.PI * clamp((f - T.click) / 10)) : 0;
  const busy = prog(f, T.click + 6, T.click + 14, EASE.soft);
  const glow = f >= T.click ? Math.exp(-(f - T.click - 4) * 0.12) * prog(f, T.click, T.click + 4) : 0;
  const layers = [-14, -10, -6, -3];
  return (
    <>
      {layers.map((d, i) => (
        <div
          key={d}
          style={{
            ...objStyle(cam, childPose(pose, PANEL.w, PANEL.h, PANEL.w / 2, PANEL.h / 2, d), PANEL.w, PANEL.h),
            borderRadius: PANEL.r,
            background: `linear-gradient(180deg, ${['#CFC5E0', '#D6CDE6', '#DED6EC', '#E7E1F2'][i]}, ${['#B9ADD0', '#C2B7D8', '#CBC1DF', '#D8D0E8'][i]})`,
            boxShadow: i === 0 ? '0 40px 70px -18px rgba(62,40,120,0.34), 0 14px 26px -8px rgba(62,40,120,0.16)' : undefined,
            opacity,
          }}
        />
      ))}
      <div
        style={{
          ...objStyle(cam, pose, PANEL.w, PANEL.h),
          borderRadius: PANEL.r,
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FBF9FE 60%, #F4F0FA 100%)',
          boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(120,100,170,0.14), inset 0 0 0 1px rgba(255,255,255,0.7)',
          opacity,
          fontFamily: FONT,
          overflow: 'hidden',
        }}
      >
        {/* soft key-light sheen */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 60% 120% at 18% 0%, rgba(255,255,255,0.9), rgba(255,255,255,0) 70%)',
          }}
        />
        <div style={{position: 'absolute', left: 28, top: 20, display: 'flex', alignItems: 'center', gap: 8}}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 7,
              background: GRAD,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 8px -2px rgba(242,84,142,0.5)',
            }}
          >
            <Sparkle size={12} />
          </div>
          <div style={{fontSize: 13.5, fontWeight: 600, color: '#6E6788', letterSpacing: 0.1}}>New idea</div>
        </div>
        <div
          style={{
            position: 'absolute',
            left: 28,
            top: 56,
            height: 44,
            width: PANEL.w - 28 - BTN.w - BTN.right - 18,
            display: 'flex',
            alignItems: 'center',
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: -0.2,
            whiteSpace: 'nowrap',
            overflow: 'visible',
          }}
        >
          {n === 0 ? (
            <span style={{color: '#A59FB8'}}>Describe your idea…</span>
          ) : (
            <span
              style={{
                backgroundImage: `linear-gradient(90deg, rgba(34,26,56,${1 - sweep * 0.72}) ${sweep * 130 - 30}%, #F2548E ${sweep * 130 - 12}%, #1F1834 ${sweep * 130 + 4}%)`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {PROMPT.slice(0, n)}
            </span>
          )}
          <span
            style={{
              display: 'inline-block',
              width: 2.5,
              height: 27,
              marginLeft: 2,
              borderRadius: 2,
              background: '#7C5CFF',
              opacity: caretOn ? 1 : 0,
            }}
          />
        </div>
        {/* button well */}
        <div
          style={{
            position: 'absolute',
            left: BTN_C.x - BTN.w / 2 - 4,
            top: BTN.top - 4,
            width: BTN.w + 8,
            height: BTN.h + 8,
            borderRadius: BTN.h,
            background: 'linear-gradient(180deg, rgba(120,100,170,0.14), rgba(255,255,255,0.6))',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: BTN_C.x - BTN.w / 2,
            top: BTN.top,
            width: BTN.w,
            height: BTN.h,
            borderRadius: BTN.h,
            background: GRAD,
            transform: `translateY(${press * 2}px) scale(${1 - press * 0.05})`,
            boxShadow: `inset 0 1.5px 0 rgba(255,255,255,0.55), inset 0 -3px 8px rgba(70,20,120,0.28), 0 ${10 - press * 7}px ${22 - press * 12}px -6px rgba(232,72,140,${0.55 - press * 0.2}), 0 0 ${40 * glow}px ${16 * glow}px rgba(255,150,200,${0.7 * glow})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 18,
            fontWeight: 650,
            letterSpacing: 0.1,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: '50%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0))',
            }}
          />
          <div style={{display: 'flex', alignItems: 'center', gap: 8, opacity: 1 - busy, transform: `translateY(${-busy * 8}px)`}}>
            <Sparkle size={17} />
            <span>Create</span>
          </div>
          <div
            style={{
              position: 'absolute',
              display: 'flex',
              gap: 6,
              opacity: busy,
              transform: `translateY(${(1 - busy) * 8}px)`,
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 4,
                  background: '#fff',
                  opacity: 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(f * 0.35 - i * 1.1)),
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ Cursor */
export const Cursor: React.FC<{cam: string; pose: Pose; opacity: number; scale: number}> = ({cam, pose, opacity, scale}) => {
  if (opacity <= 0.001) return null;
  return (
    <div style={{...objStyle(cam, {...pose, s: pose.s * scale}, 26, 32), opacity}}>
      <svg width={26} height={32} viewBox="0 0 26 32" style={{display: 'block', overflow: 'visible', filter: 'drop-shadow(0 4px 6px rgba(40,20,80,0.35))'}}>
        <path d="M3 2 L3 25 L9 19.5 L13 28.5 L17 26.8 L13.2 18 L21.5 18 Z" fill="#1B1530" stroke="#fff" strokeWidth={2} strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/* ------------------------------------------------------------------- Phone */
const StatusBar: React.FC = () => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 12, height: 20, fontFamily: FONT}}>
    <div style={{position: 'absolute', left: 26, top: 2, fontSize: 12.5, fontWeight: 650, color: '#1B1530', letterSpacing: -0.1}}>9:41</div>
    <div style={{position: 'absolute', right: 20, top: 5, display: 'flex', alignItems: 'flex-end', gap: 5}}>
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 1.5}}>
        {[4, 6, 8, 10].map((h) => (
          <div key={h} style={{width: 2.6, height: h, borderRadius: 1, background: '#1B1530'}} />
        ))}
      </div>
      <div style={{width: 21, height: 10, borderRadius: 3, border: '1.2px solid rgba(27,21,48,0.45)', padding: 1.2, boxSizing: 'border-box'}}>
        <div style={{width: '78%', height: '100%', borderRadius: 1.5, background: '#1B1530'}} />
      </div>
    </div>
  </div>
);

const Skeleton: React.FC<{x: number; y: number; w: number; h: number; f: number; show: number}> = ({x, y, w, h, f, show}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: h / 2,
      opacity: show,
      background: `linear-gradient(90deg, #ECE7F4 ${((f * 3) % 160) - 60}%, #F8F5FC ${((f * 3) % 160) - 30}%, #ECE7F4 ${(f * 3) % 160}%)`,
    }}
  />
);

const PhoneLayer: React.FC<{cam: string; pose: Pose; d: number; i: number; opacity: number}> = ({cam, pose, d, i, opacity}) => (
  <div
    style={{
      ...objStyle(cam, childPose(pose, PHONE.w, PHONE.h, PHONE.w / 2, PHONE.h / 2, d), PHONE.w, PHONE.h),
      borderRadius: PHONE.r,
      background: i === 0 ? '#1E1C26' : 'linear-gradient(90deg, #3B3946, #6E6B7C 40%, #2A2833)',
      boxShadow: i === 0 ? '0 50px 80px -24px rgba(40,24,90,0.45), 0 18px 30px -10px rgba(40,24,90,0.25)' : undefined,
      opacity,
    }}
  />
);

export const Phone: React.FC<{f: number; cam: string; pose: Pose; opacity: number; part?: 'back' | 'face' | 'all'}> = ({f, cam, pose, opacity, part = 'all'}) => {
  if (pose.y > 880) return null;
  const content = (d: number) => prog(f, T.orbLand + d, T.orbLand + d + 14, EASE.out);
  const titleIn = content(12);
  const promptIn = content(17);
  const btnIn = content(22);
  const tapT = clamp((f - T.tap) / 16);
  const tapPress = f >= T.tap ? Math.sin(Math.PI * clamp((f - T.tap) / 9)) : 0;
  const glare = 0.5 + pose.ry / 60;
  const layers = [-12, -10, -8, -6, -4, -2];
  if (part === 'back') {
    return (
      <>
        {layers.map((d, i) => (
          <PhoneLayer key={d} cam={cam} pose={pose} d={d} i={i} opacity={opacity} />
        ))}
      </>
    );
  }
  return (
    <>
      {part === 'all' && layers.map((d, i) => <PhoneLayer key={d} cam={cam} pose={pose} d={d} i={i} opacity={opacity} />)}
      <div
        style={{
          ...objStyle(cam, pose, PHONE.w, PHONE.h),
          borderRadius: PHONE.r,
          background: 'linear-gradient(135deg, #8C889A 0%, #34313D 22%, #1A1820 60%, #5E5A6B 100%)',
          opacity,
          fontFamily: FONT,
        }}
      >
        <div style={{position: 'absolute', inset: 2.5, borderRadius: PHONE.r - 2.5, background: '#09080C'}} />
        <div
          style={{
            position: 'absolute',
            left: PHONE.inset,
            top: PHONE.inset,
            width: SCREEN.w,
            height: SCREEN.h,
            borderRadius: PHONE.r - PHONE.inset + 1,
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF8FD 100%)',
            overflow: 'hidden',
          }}
        >
          <StatusBar />
          <div style={{position: 'absolute', left: SCREEN.w / 2 - 33, top: 10, width: 66, height: 20, borderRadius: 10, background: '#050408'}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 46, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <svg width={9} height={15} viewBox="0 0 9 15" style={{position: 'absolute', left: 16, top: 6}}>
              <path d="M7.5 1.5 L2 7.5 L7.5 13.5" stroke="#1B1530" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{fontSize: 14, fontWeight: 650, color: '#1B1530', letterSpacing: -0.1}}>Your creation</div>
            <div style={{position: 'absolute', right: 16, top: 11, display: 'flex', gap: 3}}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{width: 3.5, height: 3.5, borderRadius: 2, background: '#1B1530'}} />
              ))}
            </div>
          </div>
          {/* image slot (hero image renders over this) */}
          <div
            style={{
              position: 'absolute',
              left: SLOT.x,
              top: SLOT.y,
              width: SLOT.w,
              height: SLOT.h,
              borderRadius: SLOT.r,
              background: `linear-gradient(115deg, #EEE8F6 ${((f * 2.6) % 180) - 70}%, #FBF8FF ${((f * 2.6) % 180) - 40}%, #EEE8F6 ${((f * 2.6) % 180) - 10}%)`,
              boxShadow: 'inset 0 0 0 1px rgba(120,100,170,0.08)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: 1 - prog(f, T.orbLand - 10, T.orbLand, EASE.soft),
              }}
            >
              <div style={{width: 30, height: 30, borderRadius: 10, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.9}}>
                <Sparkle size={16} />
              </div>
              <div style={{fontSize: 11.5, fontWeight: 600, color: '#8A82A3'}}>Creating…</div>
            </div>
          </div>
          {/* title */}
          <Skeleton x={14} y={311} w={112} h={12} f={f} show={1 - titleIn} />
          <div style={{position: 'absolute', left: 14, top: 305, fontSize: 16.5, fontWeight: 700, color: '#1B1530', letterSpacing: -0.3, opacity: titleIn, transform: `translateY(${(1 - titleIn) * 6}px)`}}>
            Lighthouse Isle
          </div>
          <Skeleton x={14} y={333} w={160} h={8} f={f} show={1 - promptIn} />
          <Skeleton x={14} y={346} w={104} h={8} f={f} show={1 - promptIn} />
          <div
            style={{
              position: 'absolute',
              left: 14,
              top: 328,
              width: 166,
              fontSize: 11,
              lineHeight: 1.38,
              fontWeight: 500,
              color: '#7A7392',
              opacity: promptIn,
              transform: `translateY(${(1 - promptIn) * 6}px)`,
            }}
          >
            “{PROMPT}”
          </div>
          {/* actions */}
          <div
            style={{
              position: 'absolute',
              left: 14,
              top: SHARE_BTN.y,
              width: 76,
              height: SHARE_BTN.h,
              borderRadius: 17,
              border: '1.2px solid #E0DAEA',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12.5,
              fontWeight: 650,
              color: '#3A3352',
              opacity: btnIn,
              background: '#fff',
            }}
          >
            Remix
          </div>
          <div
            style={{
              position: 'absolute',
              left: SHARE_BTN.x,
              top: SHARE_BTN.y,
              width: SHARE_BTN.w,
              height: SHARE_BTN.h,
              borderRadius: 17,
              background: GRAD,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              fontSize: 12.5,
              fontWeight: 650,
              color: '#fff',
              opacity: btnIn,
              transform: `scale(${1 - tapPress * 0.07})`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.45), 0 6px 12px -4px rgba(232,72,140,0.5)`,
              overflow: 'hidden',
            }}
          >
            <svg width={11} height={12} viewBox="0 0 11 12">
              <path d="M5.5 1 L5.5 7.5 M2.8 3.6 L5.5 1 L8.2 3.6 M1.2 6 L1.2 10.8 L9.8 10.8 L9.8 6" stroke="#fff" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Share
            {f >= T.tap && (
              <div
                style={{
                  position: 'absolute',
                  left: SHARE_BTN.w / 2 - 40,
                  top: SHARE_BTN.h / 2 - 40,
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  background: 'rgba(255,255,255,0.55)',
                  transform: `scale(${lerp(0.1, 1.4, EASE.out(tapT))})`,
                  opacity: 1 - tapT,
                }}
              />
            )}
          </div>
          <div style={{position: 'absolute', left: SCREEN.w / 2 - 36, bottom: 7, width: 72, height: 4, borderRadius: 2, background: '#1B1530', opacity: 0.85}} />
        </div>
        {/* glass reflection */}
        <div
          style={{
            position: 'absolute',
            inset: PHONE.inset,
            borderRadius: PHONE.r - PHONE.inset,
            background: `linear-gradient(118deg, rgba(255,255,255,0) ${glare * 100 - 18}%, rgba(255,255,255,0.22) ${glare * 100 - 6}%, rgba(255,255,255,0) ${glare * 100 + 6}%)`,
            zIndex: 5,
          }}
        />
        {/* tap touch indicator */}
        {f >= T.tap - 4 && f < T.tap + 18 && (
          <div
            style={{
              position: 'absolute',
              left: PHONE.inset + SHARE_BTN.x + SHARE_BTN.w / 2 - 17,
              top: PHONE.inset + SHARE_BTN.y + SHARE_BTN.h / 2 - 17,
              width: 34,
              height: 34,
              borderRadius: 17,
              background: 'radial-gradient(circle, rgba(255,255,255,0.9), rgba(255,255,255,0.4) 60%, rgba(255,255,255,0) 72%)',
              boxShadow: '0 0 0 1.5px rgba(255,255,255,0.8)',
              opacity: prog(f, T.tap - 4, T.tap, EASE.soft) * (1 - prog(f, T.tap + 6, T.tap + 18, EASE.soft)),
              transform: `scale(${1 - tapPress * 0.15})`,
              zIndex: 6,
            }}
          />
        )}
      </div>
    </>
  );
};

/* ------------------------------------------------------------------- Toast */
export const Toast: React.FC<{f: number; cam: string; phone: Pose}> = ({f, cam, phone}) => {
  const tin = prog(f, 166, 184, EASE.out);
  const tout = prog(f, 198, 210, EASE.soft);
  if (tin <= 0 || tout >= 1) return null;
  const p = childPose(phone, PHONE.w, PHONE.h, PHONE.w + 104 - (1 - tin) * 50, 118 - tout * 16, 46);
  return (
    <div
      style={{
        ...objStyle(cam, {...p, ry: p.ry * 0.5}, 168, 44),
        borderRadius: 22,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(250,247,254,0.8))',
        border: '1px solid rgba(255,255,255,0.95)',
        boxShadow: 'inset 0 1px 0 #fff, 0 18px 30px -12px rgba(50,26,110,0.35), 0 4px 10px -4px rgba(50,26,110,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '0 14px',
        boxSizing: 'border-box',
        fontFamily: FONT,
        opacity: tin * (1 - tout),
      }}
    >
      <div style={{width: 22, height: 22, borderRadius: 11, background: 'linear-gradient(135deg, #5EE0A6, #22B07D)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 6px -2px rgba(34,176,125,0.6)'}}>
        <svg width={11} height={9} viewBox="0 0 11 9">
          <path d="M1.5 4.6 L4.2 7.2 L9.5 1.6" stroke="#fff" strokeWidth={1.9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', lineHeight: 1.15}}>
        <span style={{fontSize: 13, fontWeight: 650, color: '#1B1530', letterSpacing: -0.1}}>Ready to share</span>
        <span style={{fontSize: 10.5, fontWeight: 500, color: '#7A7392'}}>Created in 3.2s</span>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------- Grain */
export const Grain: React.FC = () => (
  <svg width={960} height={540} style={{position: 'absolute', inset: 0, opacity: 0.05, mixBlendMode: 'multiply', pointerEvents: 'none'}}>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width={960} height={540} filter="url(#grain)" />
  </svg>
);

export const camString = camTf;
export {PROMPT};
