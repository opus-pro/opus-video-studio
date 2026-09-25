import React from 'react';
import {Img, staticFile} from 'remotion';
import {FONT_STACK} from './font';
import {
  Alert,
  BatteryIcon,
  Bell,
  Bookmark,
  Compass,
  FieldMark,
  MapIcon,
  Peak,
  Pin,
  SignalIcon,
  Star,
  Sun,
  Tree,
  User,
  Wave,
  WifiIcon,
} from './icons';

// ---- Logical UI geometry (1 logical px = 1 source-photo px) -------------------------
export const UI_W = 356;
export const UI_H = 750;
const STATUS_H = 46;
const HEADER_BOTTOM = 140;
const NAV_H = 84;
const NAV_TOP = UI_H - NAV_H;
export const VIEWPORT_H = NAV_TOP - HEADER_BOTTOM; // 526

// Scroll-content layout (y within the scroll body). Rest framings:
//   0    -> greeting, week, featured coast card (photo + title)
//   -100 -> week card top sits in the gap under the header, coast card whole
//   -420 -> coast details, forest card whole, mountain photo peeking
//   -620 -> forest details, mountain card whole with air above the nav
const GREETING_TOP = 14;
const WEEK_TOP = 112;
const WEEK_H = 110;
const SECTION_TOP = 244;
const INFO_H = 126;
const CARD_GAP = 14;
const IMG_HEIGHTS = [186, 132, 132];
const CARD_HEIGHTS = IMG_HEIGHTS.map((h) => h + INFO_H); // 312, 258, 258
const CARD_TOPS = [280, 280 + CARD_HEIGHTS[0] + CARD_GAP, 280 + CARD_HEIGHTS[0] + CARD_HEIGHTS[1] + 2 * CARD_GAP]; // 280, 606, 878
const CARDS_END = CARD_TOPS[2] + CARD_HEIGHTS[2]; // 1136
const ALERT_SECTION_TOP = CARDS_END + 22;
const ALERT_TOP = ALERT_SECTION_TOP + 34;
const ALERT_H = 72;
export const CONTENT_H = ALERT_TOP + ALERT_H + 26;

// ---- Palette ------------------------------------------------------------------------
const C = {
  bg: '#F2F0EA',
  surface: '#FFFFFF',
  chrome: '#F7F5F0',
  ink: '#15201A',
  ink2: '#58645D',
  ink3: '#8B948E',
  line: 'rgba(21,32,26,0.09)',
  forest: '#1F3B2D',
  forestDeep: '#172E23',
  rust: '#C9542B',
  rustSoft: '#F6E4DA',
  track: '#E6E2D8',
};

type Route = {
  kind: 'Coast' | 'Forest' | 'Mountain';
  image: string;
  title: string;
  place: string;
  away: string;
  level: 'Easy' | 'Moderate' | 'Hard';
  distance: string;
  gain: string;
  time: string;
  rating: string;
  reviews: string;
  focus: string;
  saved?: boolean;
};

const ROUTES: Route[] = [
  {
    kind: 'Coast',
    image: 'coast.jpg',
    title: 'Emerald Cove Loop',
    place: 'Braies Shoreline',
    away: '2.1 km away',
    level: 'Easy',
    distance: '6.2 km',
    gain: '120 m',
    time: '1h 50m',
    rating: '4.9',
    reviews: '1,284',
    focus: '50% 58%',
    saved: true,
  },
  {
    kind: 'Forest',
    image: 'forest.jpg',
    title: 'Fern Hollow Trail',
    place: 'Black Pine Woods',
    away: '5.4 km away',
    level: 'Moderate',
    distance: '9.8 km',
    gain: '410 m',
    time: '3h 20m',
    rating: '4.8',
    reviews: '932',
    focus: '55% 45%',
  },
  {
    kind: 'Mountain',
    image: 'mountains.jpg',
    title: 'Ridgeback Pass',
    place: 'Glacier Valley',
    away: '12 km away',
    level: 'Hard',
    distance: '14.6 km',
    gain: '1,120 m',
    time: '6h 15m',
    rating: '4.9',
    reviews: '2,017',
    focus: '50% 62%',
  },
];

const LEVEL_STYLE: Record<Route['level'], {fg: string; bg: string}> = {
  Easy: {fg: '#2F6B45', bg: '#E3EFE5'},
  Moderate: {fg: '#8A5A12', bg: '#F5EAD3'},
  Hard: {fg: '#A8401F', bg: '#F7E1D8'},
};

const KIND_ICON: Record<Route['kind'], React.FC<{size?: number; color?: string; stroke?: number}>> = {
  Coast: Wave,
  Forest: Tree,
  Mountain: Peak,
};

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Scroll-spy thresholds for the segmented control: a route card becomes "current" once
// its top passes 60% of the viewport height (scroll offsets, logical px).
export const SPY_THRESHOLDS = [CARD_TOPS[1] - VIEWPORT_H * 0.6, CARD_TOPS[2] - VIEWPORT_H * 0.6];

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  const k = Math.min(1, Math.max(0, t));
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`;
};

const tnum: React.CSSProperties = {fontVariantNumeric: 'tabular-nums', fontFeatureSettings: '"tnum" 1'};

// ---- Fixed chrome -------------------------------------------------------------------
const StatusBar: React.FC = () => (
  <div style={{position: 'absolute', left: 0, top: 0, width: UI_W, height: STATUS_H}}>
    <div
      style={{
        position: 'absolute',
        left: 34,
        top: 16,
        fontSize: 15,
        fontWeight: 620,
        letterSpacing: '-0.01em',
        color: C.ink,
        ...tnum,
      }}
    >
      9:41
    </div>
    {/* Dynamic island */}
    <div
      style={{
        position: 'absolute',
        left: (UI_W - 98) / 2,
        top: 10,
        width: 98,
        height: 28,
        borderRadius: 14,
        background: '#050607',
      }}
    />
    <div style={{position: 'absolute', right: 30, top: 19, display: 'flex', alignItems: 'center', gap: 5}}>
      <SignalIcon color={C.ink} />
      <WifiIcon color={C.ink} />
      <BatteryIcon color={C.ink} />
    </div>
  </div>
);

const Avatar: React.FC<{size: number}> = ({size}) => {
  // portrait-smile.png is 1024x1536; frame the face (~ x 50%, y 31%).
  const imgW = size * 2.35;
  const imgH = (imgW * 1536) / 1024;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: `0 0 0 2px ${C.chrome}, 0 0 0 3px rgba(201,84,43,0.55)`,
        background: '#cfd9e0',
      }}
    >
      <Img
        src={staticFile('assets/portrait-smile.png')}
        style={{
          position: 'absolute',
          width: imgW,
          height: imgH,
          left: size / 2 - imgW * 0.5,
          top: size / 2 - imgH * 0.305,
        }}
      />
    </div>
  );
};

const SEGMENTS = [
  {label: 'Coast', count: '12'},
  {label: 'Forest', count: '18'},
  {label: 'Mountain', count: '9'},
];

const Header: React.FC<{scrolled: number; section: number}> = ({scrolled, section}) => {
  const p = section;
  const trackX = 16;
  const trackW = UI_W - 32;
  const segW = (trackW - 6) / 3;
  const shadow = smoothstep(0, 28, scrolled);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: UI_W,
        height: HEADER_BOTTOM,
        background: C.chrome,
        zIndex: 3,
        boxShadow: `0 1px 0 rgba(21,32,26,${0.07 * shadow}), 0 8px 18px -10px rgba(21,32,26,${0.22 * shadow})`,
      }}
    >
      <StatusBar />
      {/* Brand row */}
      <div
        style={{
          position: 'absolute',
          left: 18,
          right: 18,
          top: STATUS_H + 6,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 9}}>
          <FieldMark size={27} />
          <div style={{display: 'flex', flexDirection: 'column', gap: 1}}>
            <div style={{fontSize: 15, fontWeight: 760, letterSpacing: '0.26em', color: C.ink, lineHeight: '16px'}}>
              FIELD
            </div>
            <div style={{fontSize: 10, fontWeight: 520, color: C.ink3, letterSpacing: '0.01em', lineHeight: '12px'}}>
              39 routes near you
            </div>
          </div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              background: C.surface,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 2px rgba(21,32,26,0.08)',
              position: 'relative',
            }}
          >
            <Bell size={18} color={C.ink} stroke={1.7} />
            <div
              style={{
                position: 'absolute',
                right: 8,
                top: 8,
                width: 7,
                height: 7,
                borderRadius: 4,
                background: C.rust,
                boxShadow: `0 0 0 1.5px ${C.surface}`,
              }}
            />
          </div>
          <Avatar size={32} />
        </div>
      </div>
      {/* Segmented control: follows the section in view */}
      <div
        style={{
          position: 'absolute',
          left: trackX,
          top: STATUS_H + 52,
          width: trackW,
          height: 34,
          borderRadius: 12,
          background: C.track,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 3,
            left: 3 + p * segW,
            width: segW,
            height: 28,
            borderRadius: 9,
            background: C.surface,
            boxShadow: '0 1px 2px rgba(21,32,26,0.10), 0 3px 8px rgba(21,32,26,0.07)',
          }}
        />
        {SEGMENTS.map((s, i) => {
          const active = Math.max(0, 1 - Math.abs(p - i));
          const Icon = KIND_ICON[s.label as Route['kind']];
          const col = mix(C.ink2, C.ink, active);
          return (
            <div
              key={s.label}
              style={{
                position: 'absolute',
                top: 3,
                left: 3 + i * segW,
                width: segW,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
              }}
            >
              <Icon size={13} color={mix(C.ink3, C.rust, active)} stroke={2.1} />
              <span style={{fontSize: 12.5, fontWeight: 560 + 80 * active, color: col, letterSpacing: '-0.005em'}}>
                {s.label}
              </span>
              <span style={{fontSize: 10.5, fontWeight: 560, color: C.ink3, ...tnum}}>{s.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const NAV_ITEMS = [
  {label: 'Explore', Icon: Compass, active: true},
  {label: 'Map', Icon: MapIcon},
  {label: 'Record', Icon: null},
  {label: 'Saved', Icon: Bookmark},
  {label: 'Profile', Icon: User},
];

const BottomNav: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: NAV_TOP,
      width: UI_W,
      height: NAV_H,
      background: C.chrome,
      boxShadow: '0 -1px 0 rgba(21,32,26,0.07)',
      zIndex: 3,
    }}
  >
    {NAV_ITEMS.map((item, i) => {
      const cx = (UI_W * (i + 0.5)) / 5;
      if (!item.Icon) {
        return (
          <div
            key={item.label}
            style={{
              position: 'absolute',
              left: cx - 22,
              top: 9,
              width: 44,
              height: 44,
              borderRadius: 22,
              background: C.rust,
              boxShadow: '0 6px 14px -4px rgba(201,84,43,0.55), inset 0 1px 0 rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{width: 18, height: 18, borderRadius: 9, border: '2px solid #fff', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{width: 8, height: 8, borderRadius: 4, background: '#fff'}} />
            </div>
          </div>
        );
      }
      const color = item.active ? C.forest : C.ink3;
      return (
        <div
          key={item.label}
          style={{
            position: 'absolute',
            left: cx - 30,
            top: 12,
            width: 60,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <item.Icon size={22} color={color} stroke={item.active ? 2 : 1.7} />
          <div style={{fontSize: 10, fontWeight: item.active ? 650 : 540, color, letterSpacing: '0.01em'}}>{item.label}</div>
        </div>
      );
    })}
    {/* Home indicator */}
    <div
      style={{
        position: 'absolute',
        left: (UI_W - 122) / 2,
        top: NAV_H - 11,
        width: 122,
        height: 4.5,
        borderRadius: 3,
        background: C.ink,
      }}
    />
  </div>
);

// ---- Scroll body --------------------------------------------------------------------
const Greeting: React.FC = () => (
  <div style={{position: 'absolute', left: 20, right: 20, top: GREETING_TOP}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 6, height: 14}}>
      <Sun size={13} color={C.rust} stroke={2.2} />
      <div style={{fontSize: 10.5, fontWeight: 640, letterSpacing: '0.09em', color: C.ink3, textTransform: 'uppercase', ...tnum}}>
        Sat 26 Sep · 18° Clear
      </div>
    </div>
    <div style={{marginTop: 9, fontSize: 25, fontWeight: 660, letterSpacing: '-0.028em', lineHeight: '30px', color: C.ink}}>
      Good morning, Maya
    </div>
    <div style={{marginTop: 5, fontSize: 13, fontWeight: 450, lineHeight: '18px', color: C.ink2}}>
      Three routes match your pace today.
    </div>
  </div>
);

const WEEK = [
  {d: 'M', v: 0.42},
  {d: 'T', v: 0},
  {d: 'W', v: 0.66},
  {d: 'T', v: 0.3},
  {d: 'F', v: 0},
  {d: 'S', v: 1, today: true},
  {d: 'S', v: 0},
];

const WeekCard: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      left: 16,
      right: 16,
      top: WEEK_TOP,
      height: WEEK_H,
      borderRadius: 20,
      background: `linear-gradient(140deg, ${C.forest} 0%, ${C.forestDeep} 100%)`,
      boxShadow: '0 10px 22px -12px rgba(23,46,35,0.55)',
      overflow: 'hidden',
    }}
  >
    {/* contour lines texture */}
    <svg width="324" height="110" viewBox="0 0 324 110" style={{position: 'absolute', left: 0, top: 0}}>
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={`M${150 + i * 2} ${120} C ${190 + i * 6} ${70 - i * 12}, ${250 - i * 4} ${95 - i * 14}, ${340} ${40 - i * 10}`}
          stroke="rgba(243,239,230,0.08)"
          strokeWidth="1.2"
          fill="none"
        />
      ))}
    </svg>
    <div style={{position: 'absolute', left: 16, top: 14}}>
      <div style={{fontSize: 10, fontWeight: 650, letterSpacing: '0.12em', color: 'rgba(243,239,230,0.58)'}}>THIS WEEK</div>
      <div style={{marginTop: 5, display: 'flex', alignItems: 'baseline', gap: 4, color: '#F3EFE6'}}>
        <span style={{fontSize: 30, fontWeight: 660, letterSpacing: '-0.03em', lineHeight: '32px', ...tnum}}>18.4</span>
        <span style={{fontSize: 13, fontWeight: 560, color: 'rgba(243,239,230,0.75)'}}>km</span>
      </div>
      <div style={{marginTop: 2, fontSize: 11.5, fontWeight: 480, color: 'rgba(243,239,230,0.62)', ...tnum}}>
        of 25 km goal · 3 hikes
      </div>
    </div>
    {/* Day bars */}
    <div style={{position: 'absolute', right: 16, top: 16, display: 'flex', gap: 7, alignItems: 'flex-end'}}>
      {WEEK.map((w, i) => (
        <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5}}>
          <div style={{width: 9, height: 46, borderRadius: 5, background: 'rgba(243,239,230,0.10)', position: 'relative', overflow: 'hidden'}}>
            <div
              style={{
                position: 'absolute',
                left: 0,
                bottom: 0,
                width: 9,
                height: w.v > 0 ? Math.max(9, 46 * w.v) : 0,
                borderRadius: 5,
                background: w.today ? '#E0663A' : 'rgba(243,239,230,0.55)',
              }}
            />
          </div>
          <div style={{fontSize: 9, fontWeight: w.today ? 700 : 540, color: w.today ? '#F3EFE6' : 'rgba(243,239,230,0.5)'}}>{w.d}</div>
        </div>
      ))}
    </div>
    {/* Goal progress */}
    <div style={{position: 'absolute', left: 16, right: 16, bottom: 16, height: 5, borderRadius: 3, background: 'rgba(243,239,230,0.13)'}}>
      <div style={{width: '73.6%', height: 5, borderRadius: 3, background: 'linear-gradient(90deg, #E0663A, #F0A06B)'}} />
    </div>
  </div>
);

const SectionHeader: React.FC<{top: number; title: string; action: string}> = ({top, title, action}) => (
  <div
    style={{
      position: 'absolute',
      left: 20,
      right: 20,
      top,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    <div style={{fontSize: 17, fontWeight: 660, letterSpacing: '-0.018em', color: C.ink}}>{title}</div>
    <div style={{fontSize: 12.5, fontWeight: 620, color: C.rust}}>{action}</div>
  </div>
);

const Stat: React.FC<{label: string; value: string; divider?: boolean}> = ({label, value, divider}) => (
  <div style={{flex: 1, paddingLeft: divider ? 14 : 0, borderLeft: divider ? `1px solid ${C.line}` : 'none'}}>
    <div style={{fontSize: 9.5, fontWeight: 640, letterSpacing: '0.09em', color: C.ink3, textTransform: 'uppercase'}}>{label}</div>
    <div style={{marginTop: 3, fontSize: 14.5, fontWeight: 640, letterSpacing: '-0.01em', color: C.ink, ...tnum}}>{value}</div>
  </div>
);

const RouteCard: React.FC<{route: Route; top: number; imgH: number; scrolled: number; featured?: boolean}> = ({
  route,
  top,
  imgH,
  scrolled,
  featured,
}) => {
  const IMG_H = imgH;
  const CARD_H = imgH + INFO_H;
  // Gentle parallax: the photo drifts a little against the card as it travels.
  const imgCenterInView = top + IMG_H / 2 - scrolled;
  const drift = Math.max(-16, Math.min(16, (imgCenterInView - VIEWPORT_H / 2) * -0.06));
  const Icon = KIND_ICON[route.kind];
  const lv = LEVEL_STYLE[route.level];
  return (
    <div
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        top,
        height: CARD_H,
        borderRadius: 20,
        background: C.surface,
        boxShadow: '0 1px 2px rgba(21,32,26,0.06), 0 12px 24px -14px rgba(21,32,26,0.28)',
        overflow: 'hidden',
      }}
    >
      <div style={{position: 'absolute', left: 0, top: 0, right: 0, height: IMG_H, overflow: 'hidden', background: '#c8cfc9'}}>
        <Img
          src={staticFile(`assets/${route.image}`)}
          style={{
            position: 'absolute',
            left: 0,
            top: -18,
            width: '100%',
            height: IMG_H + 36,
            objectFit: 'cover',
            objectPosition: route.focus,
            transform: `translateY(${drift}px)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.16) 0%, rgba(0,0,0,0) 34%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 12,
            top: 12,
            height: 24,
            padding: '0 10px 0 8px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.94)',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
          }}
        >
          <Icon size={13} color={C.rust} stroke={2.2} />
          <span style={{fontSize: 10, fontWeight: 720, letterSpacing: '0.11em', color: C.ink}}>{route.kind.toUpperCase()}</span>
        </div>
        <div
          style={{
            position: 'absolute',
            right: 12,
            top: 10,
            width: 30,
            height: 30,
            borderRadius: 15,
            background: 'rgba(255,255,255,0.94)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
          }}
        >
          <Bookmark size={16} color={route.saved ? C.rust : C.ink} stroke={1.9} filled={route.saved} />
        </div>
        <div
          style={{
            position: 'absolute',
            left: 14,
            bottom: 11,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: '#fff',
            textShadow: '0 1px 3px rgba(0,0,0,0.35)',
          }}
        >
          <Star size={12} color="#FFD27A" />
          <span style={{fontSize: 12, fontWeight: 680, ...tnum}}>{route.rating}</span>
          <span style={{fontSize: 11, fontWeight: 480, opacity: 0.88, ...tnum}}>({route.reviews} reviews)</span>
        </div>
        {featured ? (
          <div
            style={{
              position: 'absolute',
              right: 12,
              bottom: 10,
              height: 20,
              padding: '0 8px',
              borderRadius: 10,
              background: C.rust,
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.06em',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            }}
          >
            TOP PICK
          </div>
        ) : null}
      </div>
      <div style={{position: 'absolute', left: 16, right: 16, top: IMG_H + 14}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 20}}>
          <div style={{fontSize: 16.5, fontWeight: 660, letterSpacing: '-0.018em', color: C.ink}}>{route.title}</div>
          <div
            style={{
              height: 20,
              padding: '0 8px',
              borderRadius: 10,
              background: lv.bg,
              color: lv.fg,
              fontSize: 10.5,
              fontWeight: 660,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {route.level}
          </div>
        </div>
        <div style={{marginTop: 5, display: 'flex', alignItems: 'center', gap: 4, color: C.ink2, height: 16}}>
          <Pin size={12} color={C.ink3} stroke={2} />
          <span style={{fontSize: 12, fontWeight: 480}}>{route.place}</span>
          <span style={{fontSize: 12, color: C.ink3}}>·</span>
          <span style={{fontSize: 12, fontWeight: 480, ...tnum}}>{route.away}</span>
        </div>
        <div style={{marginTop: 12, height: 1, background: C.line}} />
        <div style={{marginTop: 12, display: 'flex'}}>
          <Stat label="Distance" value={route.distance} />
          <Stat label="Elevation" value={route.gain} divider />
          <Stat label="Est. time" value={route.time} divider />
        </div>
      </div>
    </div>
  );
};

const AlertCard: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      left: 16,
      right: 16,
      top: ALERT_TOP,
      height: ALERT_H,
      borderRadius: 18,
      background: C.rustSoft,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '0 16px',
      boxSizing: 'border-box',
    }}
  >
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        background: C.surface,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Alert size={18} color={C.rust} stroke={2} />
    </div>
    <div>
      <div style={{fontSize: 13, fontWeight: 650, color: C.ink, letterSpacing: '-0.01em'}}>Trail alert · Ridgeback Pass</div>
      <div style={{marginTop: 3, fontSize: 12, fontWeight: 460, color: C.ink2, ...tnum}}>Snow above 2,100 m. Traction advised.</div>
    </div>
  </div>
);

// ---- App -----------------------------------------------------------------------------
export const FieldApp: React.FC<{scroll: number; blur: number; indicator: number; section: number}> = ({
  scroll,
  blur,
  indicator,
  section,
}) => {
  const scrolled = -scroll;
  const maxScroll = CONTENT_H - VIEWPORT_H;
  const trackPad = 6;
  const trackH = VIEWPORT_H - trackPad * 2;
  const thumbH = Math.round((trackH * VIEWPORT_H) / CONTENT_H);
  const thumbTop = trackPad + (trackH - thumbH) * Math.min(1, Math.max(0, scrolled / maxScroll));

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: C.bg,
        fontFamily: FONT_STACK,
        WebkitFontSmoothing: 'antialiased',
        color: C.ink,
        overflow: 'hidden',
      }}
    >
      <svg width="0" height="0" style={{position: 'absolute'}}>
        <filter id="scroll-motion-blur" x="0" y="-2%" width="100%" height="104%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation={`0 ${blur.toFixed(3)}`} />
        </filter>
      </svg>
      {/* Scroll viewport (between fixed header and bottom nav) */}
      <div style={{position: 'absolute', left: 0, top: HEADER_BOTTOM, width: UI_W, height: VIEWPORT_H, overflow: 'hidden'}}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: UI_W,
            height: CONTENT_H,
            transform: `translateY(${scroll}px)`,
            filter: blur > 0 ? 'url(#scroll-motion-blur)' : 'none',
          }}
        >
          <Greeting />
          <WeekCard />
          <SectionHeader top={SECTION_TOP} title="Routes for today" action="See all" />
          {ROUTES.map((r, i) => (
            <RouteCard key={r.kind} route={r} top={CARD_TOPS[i]} imgH={IMG_HEIGHTS[i]} scrolled={scrolled} featured={i === 0} />
          ))}
          <SectionHeader top={ALERT_SECTION_TOP} title="Trail conditions" action="Updated 7:20" />
          <AlertCard />
        </div>
        {/* Soft scroll edges: content tucks under the fixed chrome instead of hard-cutting */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: UI_W,
            height: 10,
            background: `linear-gradient(180deg, ${C.chrome} 0%, rgba(247,245,240,0.55) 45%, rgba(247,245,240,0) 100%)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: UI_W,
            height: 10,
            background: `linear-gradient(0deg, ${C.chrome} 0%, rgba(247,245,240,0.55) 45%, rgba(247,245,240,0) 100%)`,
          }}
        />
        {/* Scroll indicator */}
        <div
          style={{
            position: 'absolute',
            right: 4,
            top: thumbTop,
            width: 3,
            height: thumbH,
            borderRadius: 2,
            background: 'rgba(21,32,26,0.38)',
            opacity: indicator,
          }}
        />
      </div>
      <Header scrolled={scrolled} section={section} />
      <BottomNav />
    </div>
  );
};
