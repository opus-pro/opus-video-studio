import {Easing} from 'remotion';

export type Rect = {x: number; y: number; w: number; h: number};

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

export const inOut = Easing.bezier(0.65, 0, 0.35, 1);
export const inOutSoft = Easing.bezier(0.45, 0, 0.2, 1);
export const outExpo = Easing.bezier(0.16, 1, 0.3, 1);
export const outQuint = Easing.bezier(0.22, 1, 0.36, 1);
export const outCubic = Easing.bezier(0.33, 1, 0.68, 1);
export const expandCenter = Easing.bezier(0.66, 0, 0.16, 1);
export const expandSize = Easing.bezier(0.74, 0, 0.16, 1);
export const unfoldEase = Easing.bezier(0.6, 0, 0.14, 1);

export const outBack = (x: number, s = 1.4) => {
  const c3 = s + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
};

export const hash = (a: number, b: number) => {
  const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

export const FONT = 'Geist, "Helvetica Neue", Arial, sans-serif';

export const C = {
  coral: '#F0664A',
  coralHi: '#F57D5C',
  coralLo: '#E5553A',
  cream: '#FFF4EA',
  paper: '#F4EDE2',
  ink: '#13201C',
  lagoon: '#1E6B64',
  lagoonDeep: '#173F3B',
  sand: '#EACFA3',
  graphite: '#1F2523',
  dock: '#F6F5F1',
};

// Layout (px) — the 1760x920 identity board, centred on the 1920x1080 frame.
export const BOARD: Rect = {x: 80, y: 80, w: 1760, h: 920};
export const P_CORAL: Rect = {x: 80, y: 80, w: 600, h: 920};
export const P_IMAGE: Rect = {x: 700, y: 80, w: 700, h: 480};
export const P_PATTERN: Rect = {x: 1420, y: 80, w: 420, h: 480};
export const P_WORD: Rect = {x: 700, y: 580, w: 700, h: 420};
export const P_BANDS: Rect = {x: 1420, y: 580, w: 420, h: 420};
export const PANEL_RADIUS = 28;

export const DOCK: Rect = {x: 640, y: 455, w: 640, h: 170};
export const ICON = 128;
export const ICON_Y = DOCK.y + (DOCK.h - ICON) / 2;
export const ICON_X = [DOCK.x + 64, DOCK.x + 256, DOCK.x + 448];

// Timeline (frames @ 60fps)
export const T = {
  press0: 29,
  press1: 34,
  expand0: 45, // 0.75s
  expand1: 93, // 1.55s
  dock0: 46,
  dock1: 66, // 1.1s
  revealed: 168, // 2.8s
};
