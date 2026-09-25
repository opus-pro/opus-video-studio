import {Easing, interpolate} from 'remotion';
import {SPY_THRESHOLDS} from './FieldApp';

export const FPS = 60;
const sec = (s: number) => Math.round(s * FPS);

// Scroll keyframes, logical UI px (negative = content moves up).
// 0 -> -420 at .45-1.45s, -> -620 at 2.05-2.8s, -> -100 at 2.9-3.75s.
type Segment = {from: number; to: number; start: number; end: number; ease: (t: number) => number};

export const SEGMENTS: Segment[] = [
  // Long flick: quick pickup, long glide.
  {start: sec(0.45), end: sec(1.45), from: 0, to: -420, ease: Easing.bezier(0.36, 0, 0.16, 1)},
  // Short nudge further down.
  {start: sec(2.05), end: sec(2.8), from: -420, to: -620, ease: Easing.bezier(0.4, 0, 0.2, 1)},
  // Decisive swipe back up.
  {start: sec(2.9), end: sec(3.75), from: -620, to: -100, ease: Easing.bezier(0.36, 0, 0.18, 1)},
];

export const scrollAt = (frame: number): number => {
  let value = 0;
  for (const s of SEGMENTS) {
    if (frame <= s.start) break;
    if (frame >= s.end) {
      value = s.to;
      continue;
    }
    const t = (frame - s.start) / (s.end - s.start);
    return s.from + (s.to - s.from) * s.ease(t);
  }
  return value;
};

// Signed velocity in logical px / frame (central difference on the analytic curve).
export const velocityAt = (frame: number): number => scrollAt(frame + 0.5) - scrollAt(frame - 0.5);

export const MAX_BLUR = 1.2;

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Vertical motion blur for the scrolling body only: 0 at rest, capped at 1.2px.
export const blurAt = (frame: number): number => {
  const v = Math.abs(velocityAt(frame));
  const sigma = MAX_BLUR * smoothstep(0.6, 9, v);
  return sigma < 0.02 ? 0 : Math.min(MAX_BLUR, sigma);
};

// iOS-style scroll indicator visibility: fades in as a drag starts, lingers, fades out.
export const indicatorOpacityAt = (frame: number): number => {
  const a = interpolate(frame, [sec(0.45) - 2, sec(0.45) + 6, sec(1.45) + 14, sec(1.45) + 30], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const b = interpolate(frame, [sec(2.05) - 2, sec(2.05) + 6, sec(3.75) + 14, sec(3.75) + 30], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return Math.max(a, b);
};

// Scroll-spy for the header segmented control. The current section is discrete (thresholds on
// the scroll offset); the pill then glides to it on its own 18-frame ease, so it reads as a
// deliberate UI response rather than being dragged 1:1 by a fast flick.
const sectionIndex = (frame: number) => {
  const scrolled = -scrollAt(frame);
  return SPY_THRESHOLDS.filter((t) => scrolled >= t).length;
};
const PILL_FRAMES = 18;
const pillEase = Easing.bezier(0.3, 0, 0, 1);
export const sectionAt = (frame: number): number => {
  let pos = sectionIndex(0);
  let prev = pos;
  for (let f = 1; f <= frame; f++) {
    const idx = sectionIndex(f);
    if (idx !== prev) {
      pos += (idx - prev) * pillEase(Math.min(1, (frame - f) / PILL_FRAMES));
      prev = idx;
    }
  }
  return pos;
};
