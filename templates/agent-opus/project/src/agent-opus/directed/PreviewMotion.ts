import { Easing } from "remotion";

const clamp = (n: number) => Math.max(0, Math.min(1, n));
// A fixed timeline, independent of the cards' changing positions and widths.
// Shared endpoint velocities make the cubic Bézier segments join smoothly.
const anchors = [
  { frame: 610, progress: 0, velocity: 0.003 },
  { frame: 638, progress: 1 / 3, velocity: 0.0155 },
  { frame: 662, progress: 2 / 3, velocity: 0.012 },
  { frame: 686, progress: 0.89, velocity: 0.0048 },
  { frame: 716, progress: 1, velocity: 0 },
];
const segments = anchors.slice(0, -1).map((start, i) => {
  const end = anchors[i + 1];
  const duration = end.frame - start.frame;
  const distance = end.progress - start.progress;
  return { start, end, duration, distance, curve: Easing.bezier(
    1 / 3, start.velocity * duration / (3 * distance),
    2 / 3, 1 - end.velocity * duration / (3 * distance),
  ) };
});

export function previewPlayback(frame: number) {
  if (frame <= anchors[0].frame) return 0;
  for (const {start, end, duration, distance, curve} of segments) {
    if (frame < end.frame) return start.progress + distance * curve((frame - start.frame) / duration);
  }
  return 1;
}

const sceneSwitch = Easing.bezier(0.65, 0, 0.25, 1);
const switchWindows = [[638, 646], [662, 670]].map(([start, end]) => [previewPlayback(start), previewPlayback(end)]);
export function previewFocusWeights(progress: number) {
  const [second, third] = switchWindows.map(([start, end]) => sceneSwitch(clamp((progress - start) / (end - start))));
  return [1 - second, second - third, third];
}
