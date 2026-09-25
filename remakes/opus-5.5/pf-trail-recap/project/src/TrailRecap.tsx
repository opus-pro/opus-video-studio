import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {FONT_FAMILY} from './font';
import {KNOTS, partialRoute} from './route';

// ---------------------------------------------------------------------------
// Palette + timing (60 fps, 324 frames = 5.4 s)
// ---------------------------------------------------------------------------
const GREEN = '#BDF4A6';
const GREEN_GLOW = 'rgba(170, 240, 140, 0.55)';
const INK = '#050A09';

const W = 1080;
const H = 1350;
const MARGIN_X = 72;

const T = {
  scale: [0, 156] as const, // image 1.13 -> 1.03, decelerating
  startDot: [2, 16] as const,
  route: [6, 90] as const,
  finish: [86, 116] as const,
  titleLines: [30, 38] as const, // per-line reveal starts
  titleReveal: 36, // reveal duration per line
  titleMove: [94, 138] as const, // 124px bottom -> 80px top
  grid: [120, 165] as const, // 2.00 s -> 2.75 s
  count: [122, 165] as const,
  note: [150, 172] as const,
  outlines: [170, 180, 190] as const, // three faint outline draw starts
  outlineDur: 46,
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const easeOutExpo = Easing.bezier(0.16, 1, 0.3, 1);
const easeInOut = Easing.bezier(0.65, 0, 0.3, 1);
const easeDrawn = Easing.bezier(0.42, 0, 0.18, 1);
const decelerate = Easing.bezier(0.2, 0.75, 0.25, 1);

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const prog = (f: number, [a, b]: readonly [number, number], easing = easeOutExpo) =>
  interpolate(f, [a, b], [0, 1], {...clamp, easing});

// ---------------------------------------------------------------------------
// Temporal motion blur: average N sub-frame renders additively inside an
// isolated group. At rest it renders a single, untouched copy (crisp text).
// ---------------------------------------------------------------------------
const MotionBlur: React.FC<{
  frame: number;
  active: boolean;
  samples?: number;
  shutter?: number;
  render: (f: number) => React.ReactNode;
}> = ({frame, active, samples = 12, shutter = 0.6, render}) => {
  if (!active) return <>{render(frame)}</>;
  return (
    <AbsoluteFill style={{isolation: 'isolate'}}>
      {Array.from({length: samples}).map((_, i) => {
        const f = frame + (i / (samples - 1) - 0.5) * shutter;
        return (
          <AbsoluteFill key={i} style={{opacity: 1 / samples, mixBlendMode: 'plus-lighter'}}>
            {render(f)}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Background
// ---------------------------------------------------------------------------
const Background: React.FC<{frame: number}> = ({frame}) => {
  const scale = lerp(1.13, 1.03, prog(frame, T.scale, decelerate));
  const exposure = interpolate(frame, [0, 30], [0.9, 1], {...clamp, easing: Easing.out(Easing.quad)});
  return (
    <AbsoluteFill style={{backgroundColor: INK, overflow: 'hidden'}}>
      <Img
        src={staticFile('assets/mountains.jpg')}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: '50% 50%',
          transform: `scale(${scale})`,
          transformOrigin: '50% 46%',
          filter: `brightness(${0.9 * exposure}) saturate(0.92) contrast(1.04)`,
        }}
      />
      {/* global cool grade to push the photo back behind the data */}
      <AbsoluteFill style={{backgroundColor: 'rgba(6, 16, 20, 0.16)'}} />
      {/* top shade: keeps the resting headline legible over bright cloud */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(4,10,16,0.66) 0%, rgba(4,10,16,0.44) 14%, rgba(4,10,16,0.14) 26%, rgba(4,10,16,0) 36%)',
        }}
      />
      <AbsoluteFill
        style={{
          background: 'radial-gradient(52% 20% at 22% 13%, rgba(4,10,16,0.42) 0%, rgba(4,10,16,0.18) 60%, rgba(4,10,16,0) 100%)',
        }}
      />
      {/* dark lower gradient for the metric grid */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(5,10,9,0) 44%, rgba(5,10,9,0.38) 55%, rgba(5,10,9,0.74) 64%, rgba(5,10,9,0.92) 74%, rgba(5,10,9,0.97) 100%)',
        }}
      />
      {/* soft vignette for depth */}
      <AbsoluteFill
        style={{background: 'radial-gradient(120% 90% at 50% 40%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)'}}
      />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------
const OUTLINE_WIDTHS = [52, 100, 148];
const OUTLINE_ALPHA = [0.3, 0.2, 0.12];

const Route: React.FC<{frame: number}> = ({frame}) => {
  const p = prog(frame, T.route, easeDrawn);
  const route = partialRoute(p);
  const start = KNOTS[0];
  const end = KNOTS[KNOTS.length - 1];

  const startIn = prog(frame, T.startDot);
  const finishIn = prog(frame, T.finish);
  const finishPop = interpolate(frame, [T.finish[0], T.finish[0] + 10, T.finish[0] + 22], [0, 1.25, 1], {
    ...clamp,
    easing: Easing.out(Easing.quad),
  });
  const pulse = interpolate(frame, [T.finish[0], T.finish[0] + 40], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  // soft closing pulse once the three outlines have finished drawing
  const pulse2At = T.outlines[2] + T.outlineDur - 6;
  const pulse2 = interpolate(frame, [pulse2At, pulse2At + 50], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const headAlpha = interpolate(p, [0, 0.03, 0.97, 1], [0, 1, 1, 0], clamp);

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
      <defs>
        <filter id="shadow" filterUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
          <feGaussianBlur stdDeviation={7} />
        </filter>
        <filter id="glow" filterUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
          <feGaussianBlur stdDeviation={9} />
        </filter>
        <filter id="soft" filterUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
          <feGaussianBlur stdDeviation={3} />
        </filter>
        {OUTLINE_WIDTHS.map((w, i) => {
          const op = prog(frame, [T.outlines[i], T.outlines[i] + T.outlineDur], easeDrawn);
          const part = partialRoute(op);
          return (
            <mask key={w} id={`outline-${i}`} maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
              {part ? (
                <>
                  <path d={part.d} fill="none" stroke="#fff" strokeWidth={w + 3} strokeLinecap="round" strokeLinejoin="round" />
                  <path d={part.d} fill="none" stroke="#000" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
                </>
              ) : null}
            </mask>
          );
        })}
      </defs>

      {/* three faint track outlines (contour rings hugging the route) */}
      {OUTLINE_WIDTHS.map((w, i) => {
        const op = prog(frame, [T.outlines[i], T.outlines[i] + T.outlineDur], easeDrawn);
        if (op <= 0) return null;
        return <rect key={w} x={0} y={0} width={W} height={H} fill="#DDF7D2" opacity={OUTLINE_ALPHA[i]} mask={`url(#outline-${i})`} />;
      })}

      {route ? (
        <g>
          <path
            d={route.d}
            fill="none"
            stroke="rgba(0,0,0,0.55)"
            strokeWidth={12}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#shadow)"
            transform="translate(0 6)"
          />
          <path d={route.d} fill="none" stroke={GREEN_GLOW} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />
          <path d={route.d} fill="none" stroke={GREEN} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ) : null}

      {/* start marker */}
      <g opacity={startIn} transform={`translate(${start.x} ${start.y}) scale(${lerp(0.4, 1, startIn)})`}>
        <circle r={16} fill="rgba(0,0,0,0.35)" filter="url(#soft)" />
        <circle r={11} fill={INK} stroke={GREEN} strokeWidth={4} />
      </g>

      {/* drawing head */}
      {route && headAlpha > 0 ? (
        <g opacity={headAlpha} transform={`translate(${route.head.x} ${route.head.y})`}>
          <circle r={22} fill={GREEN_GLOW} filter="url(#glow)" />
          <circle r={8} fill="#F4FFEE" />
        </g>
      ) : null}

      {/* finish marker */}
      {finishIn > 0 ? (
        <g transform={`translate(${end.x} ${end.y})`}>
          <circle r={lerp(14, 58, pulse)} fill="none" stroke={GREEN} strokeWidth={lerp(3, 1, pulse)} opacity={(1 - pulse) * 0.7} />
          {pulse2 > 0 && pulse2 < 1 ? (
            <circle r={lerp(14, 46, pulse2)} fill="none" stroke={GREEN} strokeWidth={lerp(2.5, 1, pulse2)} opacity={(1 - pulse2) * 0.45} />
          ) : null}
          <g transform={`scale(${finishPop})`}>
            <circle r={20} fill="rgba(0,0,0,0.35)" filter="url(#soft)" />
            <circle r={14} fill={GREEN} stroke={INK} strokeWidth={4} />
            <circle r={4.5} fill={INK} />
          </g>
        </g>
      ) : null}
    </svg>
  );
};

// ---------------------------------------------------------------------------
// Headline: "Trail / complete." 124px -> moves up, settles at 80px
// ---------------------------------------------------------------------------
const TITLE_START_TOP = 1000;
const TITLE_END_TOP = 92;

const titleMove = (f: number) => prog(f, T.titleMove, easeInOut);

const Title: React.FC<{f: number}> = ({f}) => {
  const m = titleMove(f);
  const size = lerp(124, 80, m);
  const top = lerp(TITLE_START_TOP, TITLE_END_TOP, m);
  const lines: {text: string; color: string}[] = [
    {text: 'Trail', color: '#FFFFFF'},
    {text: 'complete.', color: 'rgba(255,255,255,0.7)'},
  ];
  return (
    <div
      style={{
        position: 'absolute',
        left: MARGIN_X,
        top,
        fontFamily: FONT_FAMILY,
        fontSize: size,
        fontWeight: 620,
        lineHeight: 1,
        letterSpacing: '-0.045em',
        textShadow: '0 2px 28px rgba(0,0,0,0.28)',
      }}
    >
      {lines.map((line, i) => {
        const r = prog(f, [T.titleLines[i], T.titleLines[i] + T.titleReveal]);
        const revealing = r < 1;
        return (
          <div
            key={line.text}
            style={{
              overflow: revealing ? 'hidden' : 'visible',
              padding: '0.04em 0.08em 0.24em',
              margin: '-0.04em -0.08em -0.24em',
            }}
          >
            <div
              style={{
                color: line.color,
                whiteSpace: 'nowrap',
                transform: revealing ? `translateY(${(1 - r) * 142}%)` : undefined,
                opacity: r > 0 ? 1 : 0,
                filter: revealing && r < 0.98 ? `blur(${(1 - r) * 6}px)` : undefined,
              }}
            >
              {line.text}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Metric grid (borderless 2x2)
// ---------------------------------------------------------------------------
const GRID_TOP = 952;
const ROW_GAP = 162;
const COL_X = [MARGIN_X, 568];

const Unit: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span style={{fontSize: '0.38em', fontWeight: 500, letterSpacing: '0.01em', color: 'rgba(255,255,255,0.56)', marginLeft: 12}}>
    {children}
  </span>
);

const Metric: React.FC<{frame: number; index: number; label: string; children: React.ReactNode}> = ({
  frame,
  index,
  label,
  children,
}) => {
  const start = T.grid[0] + index * 7;
  const r = prog(frame, [start, start + 24]);
  const settled = r >= 0.999;
  const col = index % 2;
  const row = Math.floor(index / 2);
  return (
    <div
      style={{
        position: 'absolute',
        left: COL_X[col],
        top: GRID_TOP + row * ROW_GAP,
        fontFamily: FONT_FAMILY,
        opacity: r,
        transform: settled ? undefined : `translateY(${(1 - r) * 30}px)`,
        filter: settled ? undefined : `blur(${(1 - r) * 8}px)`,
      }}
    >
      <div
        style={{
          fontSize: 23,
          fontWeight: 540,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.58)',
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 10,
          fontSize: 78,
          fontWeight: 540,
          lineHeight: 1,
          letterSpacing: '-0.012em',
          color: '#FFFFFF',
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
        }}
      >
        {children}
      </div>
    </div>
  );
};

const CountedDistance: React.FC<{frame: number}> = ({frame}) => {
  const c = prog(frame, T.count, Easing.bezier(0.25, 0.6, 0.3, 1));
  const value = (Math.round(c * 124) / 10).toFixed(1);
  return (
    <>
      {/* natural flow keeps number and unit tight; tabular digits keep every step but 9.9 -> 10.0 width-stable */}
      <span style={{color: GREEN}}>{value}</span>
      <Unit>km</Unit>
    </>
  );
};

const Grid: React.FC<{frame: number}> = ({frame}) => {
  const note = prog(frame, T.note);
  return (
    <>
      <Metric frame={frame} index={0} label="Distance">
        <CountedDistance frame={frame} />
      </Metric>
      <Metric frame={frame} index={1} label="Time">
        1:24:36
      </Metric>
      <Metric frame={frame} index={2} label="Elevation">
        680<Unit>m</Unit>
      </Metric>
      <Metric frame={frame} index={3} label="Pace">
        6:49<Unit>/km</Unit>
      </Metric>
      <div
        style={{
          position: 'absolute',
          left: MARGIN_X,
          top: 1264,
          fontFamily: FONT_FAMILY,
          fontSize: 21,
          fontWeight: 500,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.5)',
          opacity: note,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: 'rgba(255,255,255,0.5)',
          }}
        />
        Fictional sample data
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------
const SHUTTER = 0.55; // frames (~200 deg)

export const TrailRecap: React.FC = () => {
  const frame = useCurrentFrame();
  const velocity = Math.abs(titleMove(frame + 0.5) - titleMove(frame - 0.5)) * (TITLE_START_TOP - TITLE_END_TOP);
  return (
    <AbsoluteFill style={{backgroundColor: INK}}>
      <Background frame={frame} />
      <Route frame={frame} />
      <Grid frame={frame} />
      <MotionBlur
        frame={frame}
        active={velocity > 0.6}
        shutter={SHUTTER}
        samples={Math.min(48, Math.max(8, Math.ceil((velocity * SHUTTER) / 1.1)))}
        render={(f) => <Title f={f} />}
      />
    </AbsoluteFill>
  );
};
