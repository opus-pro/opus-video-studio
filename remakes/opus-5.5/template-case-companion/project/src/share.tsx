import React from 'react';
import {Isle, Kind, PAL, Pal} from './Isle';
import {Cam, EASE, FONT, PERSPECTIVE, Pose, clamp, dist2, lerp, localPoint, objStyle, prog, project, rand, shutter} from './math';
import {Sparkle} from './parts';
import {CARD, HERO, SLOT, T, btnWorld, cardPose, heroPose, phoneSlotPose} from './timeline';

PAL.lilac = {
  skyTop: '#5646BF',
  skyMid: '#B18BE8',
  skyLow: '#FFD8E8',
  sun: '#FFFFFF',
  glow: '#FFD2F2',
  cloud: '#FFF1FA',
  cloudShade: '#C8A6E6',
  rock: '#8E7ACB',
  rockDark: '#4A3A8C',
  grass: '#9BE2BA',
  grassDark: '#5CB08E',
  accent: '#FFE7A0',
  roof: '#FF7FA8',
  wall: '#FFFFFF',
};

/* --------------------------------------------------------------------- Orb */
const orbPos = (f: number): [number, number, number] => {
  const a = btnWorld(f);
  const b = phoneSlotPose(f);
  const t = prog(f, T.orbBorn + 2, T.orbLand, EASE.inOut);
  const arc = Math.sin(Math.PI * t);
  return [lerp(a.x, b.x, t), lerp(a.y, b.y, t) - arc * 70, lerp(a.z, b.z, t) + arc * 170];
};

export const Orb: React.FC<{f: number; cam: string; camV: Cam}> = ({f, cam, camV}) => {
  if (f < T.orbBorn || f > T.orbLand + 36) return null;
  const pieces: React.ReactNode[] = [];
  if (f <= T.orbLand + 1) {
    const d = dist2(project(orbPos(f - 0.5), camV), project(orbPos(f + 0.5), camV));
    const {offsets, alpha} = shutter(d, 0.7, 14);
    offsets.forEach((o, i) => {
      const ff = f + o;
      const [x, y, z] = orbPos(ff);
      const born = prog(ff, T.orbBorn, T.orbBorn + 9, EASE.outBack);
      const t = clamp((ff - T.orbBorn) / (T.orbLand - T.orbBorn));
      const land = prog(ff, T.orbLand - 6, T.orbLand + 1, EASE.in);
      const s = born * (0.75 + Math.sin(Math.PI * t) * 0.45) * (1 - land * 0.7);
      pieces.push(
        <div key={i} style={{...objStyle(cam, {x, y, z, rx: 0, ry: 0, rz: 0, s}, 46, 46), opacity: alpha * (1 - land * 0.6)}}>
          <div
            style={{
              position: 'absolute',
              inset: -30,
              borderRadius: 60,
              background: 'radial-gradient(circle, rgba(255,150,200,0.55), rgba(160,120,255,0.25) 45%, rgba(160,120,255,0) 70%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 23,
              background: 'radial-gradient(circle at 34% 28%, #FFFFFF 0%, #FFE6EF 14%, #FF9DBA 38%, #B06BFF 72%, #5E3FD8 100%)',
              boxShadow: 'inset -4px -6px 10px rgba(60,20,140,0.35), inset 3px 4px 6px rgba(255,255,255,0.6), 0 0 18px 4px rgba(255,140,190,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkle size={20} style={{transform: `rotate(${ff * 4}deg)`}} />
          </div>
        </div>,
      );
    });
  }
  // landing ring on the phone screen
  if (f >= T.orbLand - 1) {
    const t = clamp((f - T.orbLand + 1) / 20);
    const p = phoneSlotPose(f);
    pieces.push(
      <div
        key="ring"
        style={{
          ...objStyle(cam, {...p, s: p.s * lerp(0.15, 1.35, EASE.out(t))}, 240, 240),
          borderRadius: 120,
          border: '3px solid rgba(255,255,255,0.9)',
          boxShadow: '0 0 30px rgba(255,160,210,0.8), inset 0 0 30px rgba(255,160,210,0.6)',
          opacity: (1 - t) * 0.9,
        }}
      />,
    );
  }
  // spark burst as the idea lands
  if (f >= T.orbLand - 1 && f < T.orbLand + 34) {
    const base = phoneSlotPose(f);
    for (let i = 0; i < 14; i++) {
      const life = 22 + rand(i + 4) * 12;
      const t = clamp((f - T.orbLand + 1) / life);
      if (t >= 1) continue;
      const ang = (i / 14) * Math.PI * 2 + rand(i) * 0.5;
      const dist = (90 + rand(i + 9) * 110) * EASE.out(t);
      const x = base.x + Math.cos(ang) * dist * 1.2;
      const y = base.y + Math.sin(ang) * dist + 30 * t * t;
      const z = base.z + 40 + rand(i + 2) * 60;
      const size = 13 + rand(i + 17) * 11;
      const col = ['#FFFFFF', '#FFD1E3', '#FFE7A0', '#D9CCFF'][i % 4];
      pieces.push(
        <div key={`sp${i}`} style={{...objStyle(cam, {x, y, z, rx: 0, ry: 0, rz: f * 3 + i * 40, s: 1 - t * 0.6}, size, size), opacity: Math.pow(1 - t, 1.3) * prog(t, 0, 0.08, EASE.linear)}}>
          <Sparkle size={size} color={col} style={{filter: `drop-shadow(0 0 4px ${col})`}} />
        </div>,
      );
    }
  }
  return <>{pieces}</>;
};

/* -------------------------------------------------------------- Hero image */
export const Hero: React.FC<{f: number; cam: string; camV: Cam}> = ({f, cam, camV}) => {
  if (f < T.orbLand - 1) return null;
  const bloom = prog(f, T.orbLand - 1, T.orbLand + 22, EASE.out);
  const lifting = f > T.liftStart - 1 && f < T.liftEnd + 1;
  let samples = {offsets: [0], alpha: 1};
  if (lifting) {
    const c0 = heroPose(f - 0.5).pose;
    const c1 = heroPose(f + 0.5).pose;
    const d = dist2(project([c0.x, c0.y, c0.z], camV), project([c1.x, c1.y, c1.z], camV));
    const dz = Math.abs(c1.z - c0.z) * 0.6;
    samples = shutter(d + dz, 0.6, 9);
  }
  const lift = prog(f, T.liftStart, T.liftEnd, EASE.inOut);
  const arc = Math.sin(Math.PI * lift);
  return (
    <>
      {samples.offsets.map((o, i) => {
        const ff = f + o;
        const {pose, radius} = heroPose(ff);
        return (
          <div
            key={i}
            style={{
              ...objStyle(cam, pose, HERO.w, HERO.h),
              borderRadius: radius,
              overflow: 'hidden',
              opacity: samples.alpha,
              clipPath: bloom < 1 ? `circle(${bloom * 75}% at 50% 50%)` : undefined,
              boxShadow:
                f > T.liftStart
                  ? `0 ${20 + arc * 30}px ${40 + arc * 40}px -14px rgba(50,24,100,${0.2 + arc * 0.25}), 0 0 0 1px rgba(255,255,255,${0.25 * lift})`
                  : undefined,
            }}
          >
            <div style={{position: 'absolute', inset: 0, filter: bloom < 1 ? `blur(${(1 - bloom) * 9}px) brightness(${1 + (1 - bloom) * 0.5})` : undefined}}>
              <Isle id={`hero${i}`} pal={PAL.dusk} kind="lighthouse" frame={ff} />
            </div>
            {/* lift sheen */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(125deg, rgba(255,255,255,0) ${lift * 140 - 40}%, rgba(255,255,255,${0.35 * arc}) ${lift * 140 - 20}%, rgba(255,255,255,0) ${lift * 140}%)`,
              }}
            />
          </div>
        );
      })}
    </>
  );
};

/* -------------------------------------------------------------- Glass card */
const Avatar: React.FC<{c1: string; c2: string; x: number; letter: string}> = ({c1, c2, x, letter}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: 0,
      width: 24,
      height: 24,
      borderRadius: 12,
      background: `linear-gradient(135deg, ${c1}, ${c2})`,
      border: '2px solid rgba(255,255,255,0.95)',
      boxSizing: 'border-box',
      color: '#fff',
      fontSize: 10,
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {letter}
  </div>
);

export const GlassCard: React.FC<{f: number; cam: string}> = ({f, cam}) => {
  if (f < 206) return null;
  const pose = cardPose(f);
  const body = prog(f, 218, 242, EASE.soft);
  const t1 = prog(f, 232, 250, EASE.out);
  const t2 = prog(f, 238, 256, EASE.out);
  const sheen = prog(f, 252, 292, EASE.inOut);
  return (
    <div
      style={{
        ...objStyle(cam, pose, CARD.w, CARD.h),
        borderRadius: CARD.r,
        opacity: body,
        background: 'linear-gradient(160deg, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.26) 50%, rgba(255,255,255,0.16) 100%)',
        backdropFilter: 'blur(7px) saturate(1.7) brightness(1.04)',
        WebkitBackdropFilter: 'blur(7px) saturate(1.7) brightness(1.04)',
        boxShadow:
          'inset 0 1.5px 0 rgba(255,255,255,0.95), inset 0 0 0 1px rgba(255,255,255,0.55), inset 0 -18px 40px -20px rgba(255,255,255,0.5), 0 40px 70px -24px rgba(50,26,110,0.42), 0 12px 24px -12px rgba(50,26,110,0.2)',
        fontFamily: FONT,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 80% 50% at 15% 0%, rgba(255,255,255,0.55), rgba(255,255,255,0) 70%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(115deg, rgba(255,255,255,0) ${sheen * 160 - 50}%, rgba(255,255,255,0.45) ${sheen * 160 - 35}%, rgba(255,255,255,0) ${sheen * 160 - 20}%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: CARD.r,
          padding: 1.6,
          background: 'linear-gradient(145deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.25) 32%, rgba(255,255,255,0.1) 60%, rgba(255,255,255,0.85) 100%)',
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
      <div style={{position: 'absolute', left: CARD.pad + 2, top: 330, opacity: t1, transform: `translateY(${(1 - t1) * 8}px)`}}>
        <div style={{fontSize: 20, fontWeight: 700, color: '#1B1530', letterSpacing: -0.4}}>Lighthouse Isle</div>
        <div style={{marginTop: 4, fontSize: 12.5, fontWeight: 500, color: '#5F5878'}}>Shared by you · just now</div>
      </div>
      <div style={{position: 'absolute', right: CARD.pad, top: 334, width: 82, height: 24, opacity: t2, transform: `translateY(${(1 - t2) * 8}px)`}}>
        <Avatar x={0} c1="#FF9A5C" c2="#F2548E" letter="A" />
        <Avatar x={16} c1="#7C5CFF" c2="#4FB6FF" letter="M" />
        <Avatar x={32} c1="#3FC6A0" c2="#2A8FB8" letter="S" />
        <div
          style={{
            position: 'absolute',
            left: 50,
            top: 0,
            height: 24,
            padding: '0 7px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.8)',
            border: '1px solid rgba(255,255,255,0.9)',
            fontSize: 10.5,
            fontWeight: 700,
            color: '#4A4264',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          +128
        </div>
      </div>
    </div>
  );
};

/** Chip that sits over the hero image once it has docked in the card. */
export const CardChip: React.FC<{f: number; cam: string}> = ({f, cam}) => {
  const t = prog(f, T.liftEnd - 2, T.liftEnd + 14, EASE.outBack);
  if (t <= 0) return null;
  const pose = cardPose(f);
  const [x, y, z] = localPoint(pose, CARD.w, CARD.h, CARD.pad + 12 + 44, CARD.pad + 12 + 13, 3);
  return (
    <div
      style={{
        ...objStyle(cam, {...pose, x, y, z, s: pose.s * t}, 88, 26),
        borderRadius: 13,
        background: 'rgba(255,255,255,0.28)',
        backdropFilter: 'blur(10px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(10px) saturate(1.6)',
        border: '1px solid rgba(255,255,255,0.65)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), 0 4px 12px -4px rgba(30,10,60,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        fontFamily: FONT,
        fontSize: 12,
        fontWeight: 650,
        color: '#fff',
        textShadow: '0 1px 2px rgba(40,10,60,0.35)',
        opacity: clamp(t * 1.5),
      }}
    >
      <div style={{width: 7, height: 7, borderRadius: 4, background: '#6CF0B0', boxShadow: '0 0 6px #6CF0B0'}} />
      Shared
    </div>
  );
};

/* -------------------------------------------------------- Related creations */
type Rel = {title: string; by: string; pal: Pal; kind: Kind; sx: number; sy: number; z: number; ry: number; rz: number; delay: number};
const RELATED: Rel[] = [
  {title: 'Windmill Rise', by: '@juno', pal: PAL.peach, kind: 'windmill', sx: 94, sy: 300, z: -480, ry: 26, rz: -2, delay: 14},
  {title: 'Tide Houses', by: '@ren', pal: PAL.lilac, kind: 'houses', sx: 868, sy: 244, z: -480, ry: -26, rz: 2, delay: 16},
  {title: 'Lantern Reef', by: '@aiko', pal: PAL.night, kind: 'lighthouse', sx: 246, sy: 164, z: -170, ry: 16, rz: -3, delay: 0},
  {title: 'Cloud Harbor', by: '@sana', pal: PAL.mint, kind: 'houses', sx: 716, sy: 158, z: -150, ry: -16, rz: 3, delay: 4},
  {title: 'Sky Orchard', by: '@milo', pal: PAL.dawn, kind: 'tree', sx: 262, sy: 398, z: -110, ry: 14, rz: 2, delay: 8},
  {title: 'Aurora Keep', by: '@theo', pal: PAL.aurora, kind: 'lighthouse', sx: 706, sy: 398, z: -90, ry: -14, rz: -2, delay: 11},
];
const RC = {w: 150, h: 220, pad: 8, img: {w: 134, h: 168}};

const relPose = (r: Rel, f: number, i: number): {pose: Pose; o: number} => {
  const k = PERSPECTIVE / (PERSPECTIVE - r.z);
  const rest: Pose = {
    x: 480 + (r.sx - 480) / k,
    y: 270 + (r.sy - 270) / k + Math.sin((f + i * 23) / 27) * 3.5,
    z: r.z,
    rx: 4,
    ry: r.ry,
    rz: r.rz,
    s: 1,
  };
  const start = 216 + r.delay;
  const t = prog(f, start, start + 34, EASE.out);
  const dir = r.sx < 480 ? -1 : 1;
  const u = 1 - t;
  return {
    pose: {
      ...rest,
      x: rest.x + dir * 300 * u,
      y: rest.y + (r.sy < 270 ? -60 : 60) * u,
      z: rest.z - 520 * u,
      ry: rest.ry + dir * 40 * u,
      rz: rest.rz + dir * 12 * u,
    },
    o: prog(f, start, start + 12, EASE.soft),
  };
};

const RelCard: React.FC<{r: Rel; i: number; j: number; ff: number; cam: string; alpha: number}> = ({r, i, j, ff, cam, alpha}) => {
  const {pose, o} = relPose(r, ff, i);
  return (
    <div
      style={{
        ...objStyle(cam, pose, RC.w, RC.h),
        borderRadius: 20,
        background: 'linear-gradient(170deg, rgba(255,255,255,0.92), rgba(247,244,252,0.84))',
        boxShadow: 'inset 0 1px 0 #fff, 0 26px 44px -18px rgba(50,26,110,0.36), 0 8px 16px -8px rgba(50,26,110,0.16)',
        opacity: o * alpha,
        fontFamily: FONT,
      }}
    >
      <div style={{position: 'absolute', left: RC.pad, top: RC.pad, width: RC.img.w, height: RC.img.h, borderRadius: 14, overflow: 'hidden'}}>
        <Isle id={`rel${i}-${j}`} pal={r.pal} kind={r.kind} frame={ff + i * 40} seed={i + 1} />
      </div>
      <div style={{position: 'absolute', left: RC.pad + 3, top: RC.pad + RC.img.h + 8, fontSize: 13.5, fontWeight: 700, color: '#1B1530', letterSpacing: -0.2}}>
        {r.title}
      </div>
      <div style={{position: 'absolute', left: RC.pad + 3, top: RC.pad + RC.img.h + 26, fontSize: 11, fontWeight: 500, color: '#7A7392'}}>{r.by}</div>
      <div
        style={{
          position: 'absolute',
          right: RC.pad + 2,
          top: RC.pad + RC.img.h + 12,
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          fontSize: 10.5,
          fontWeight: 650,
          color: '#8A82A3',
        }}
      >
        <svg width={11} height={10} viewBox="0 0 11 10">
          <path d="M5.5 9 C1 6 0.5 4 0.8 2.8 C1.2 1 3.6 0.4 5.5 2.4 C7.4 0.4 9.8 1 10.2 2.8 C10.5 4 10 6 5.5 9 Z" fill="#F2548E" />
        </svg>
        {[312, 188, 540, 97, 264, 421][i]}
      </div>
    </div>
  );
};

export const Related: React.FC<{f: number; cam: string; camV: Cam}> = ({f, cam, camV}) => {
  if (f < 214) return null;
  return (
    <>
      {RELATED.map((r, i) => {
        const a = relPose(r, f - 0.5, i).pose;
        const b = relPose(r, f + 0.5, i).pose;
        const d = dist2(project([a.x, a.y, a.z], camV), project([b.x, b.y, b.z], camV));
        const {offsets, alpha} = shutter(d, 0.6, 8);
        return (
          <React.Fragment key={r.title}>
            {offsets.map((o, j) => (
              <RelCard key={j} r={r} i={i} j={j} ff={f + o} cam={cam} alpha={alpha} />
            ))}
          </React.Fragment>
        );
      })}
    </>
  );
};

export const heroSlotRadius = SLOT.r;

/* ------------------------------------------------------ Dimensional props */
type Sph = {sx: number; sy: number; z: number; r: number; c: [string, string, string]; delay: number; front: boolean};
const SPHERES: Sph[] = [
  {sx: 606, sy: 474, z: -180, r: 26, c: ['#FFEADF', '#FF9C7C', '#E0567C'], delay: 10, front: false},
  {sx: 598, sy: 62, z: -320, r: 16, c: ['#FFF6D8', '#FFC857', '#D9822B'], delay: 20, front: false},
  {sx: 394, sy: 500, z: 80, r: 17, c: ['#F1EAFF', '#9F80FF', '#4A30C0'], delay: 18, front: true},
  {sx: 322, sy: 50, z: -60, r: 9, c: ['#E6FFF4', '#6FE3B4', '#1C8A76'], delay: 24, front: true},
];

export const Spheres: React.FC<{f: number; cam: string; front: boolean}> = ({f, cam, front}) => (
  <>
    {SPHERES.filter((s) => s.front === front).map((s, i) => {
      const t = prog(f, 222 + s.delay, 250 + s.delay, EASE.outBack);
      if (t <= 0) return null;
      const k = PERSPECTIVE / (PERSPECTIVE - s.z);
      const bob = Math.sin((f + i * 30) / 24) * 4;
      const pose: Pose = {x: 480 + (s.sx - 480) / k, y: 270 + (s.sy - 270) / k + bob + (1 - t) * 40, z: s.z, rx: 0, ry: 0, rz: 0, s: Math.max(0.001, t)};
      const d = s.r * 2;
      return (
        <div
          key={s.sx}
          style={{
            ...objStyle(cam, pose, d, d),
            borderRadius: '50%',
            background: `radial-gradient(circle at 34% 28%, ${s.c[0]} 0%, ${s.c[1]} 42%, ${s.c[2]} 100%)`,
            boxShadow: `inset ${-d * 0.08}px ${-d * 0.12}px ${d * 0.25}px rgba(30,10,70,0.28), inset ${d * 0.05}px ${d * 0.06}px ${d * 0.12}px rgba(255,255,255,0.5), 0 ${d * 0.45}px ${d * 0.6}px ${-d * 0.2}px rgba(60,30,120,0.3)`,
            opacity: clamp(t * 2),
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: d * 0.2,
              top: d * 0.14,
              width: d * 0.3,
              height: d * 0.2,
              borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(255,255,255,0.95), rgba(255,255,255,0) 70%)',
              transform: 'rotate(-30deg)',
            }}
          />
        </div>
      );
    })}
  </>
);
