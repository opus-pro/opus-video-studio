import { Easing } from "remotion";
import timeline from "../../../config/timeline.json";

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const carry = Easing.bezier(0.66, 0, 0.22, 1);
const retire = Easing.bezier(0.45, 0, 0.6, 1);
const arrive = Easing.bezier(0.22, 1, 0.36, 1);
const dissolve = Easing.bezier(0.42, 0, 0.22, 1);
const phase = (f: number, a: number, b: number, curve = carry) => curve(clamp((f - a) / (b - a)));
const start = timeline.outputOverlapStart;
const end = timeline.outputStart;

// The outgoing audio panel and incoming prompt follow the same rectangle.
// The established next-section boundary stays at frame 715.
export function outputHandoff(frame: number) {
  return {
    morph: phase(frame, start - 6, end),
    cards: phase(frame, start - 6, start + 1, retire),
    background: phase(frame, start, end, dissolve),
    waveform: phase(frame, start - 6, start + 2, dissolve),
    indicator: phase(frame, start - 10, start - 6, dissolve),
    prompt: phase(frame, start + 3, end, arrive),
    question: phase(frame, start + 1, end - 1, arrive),
  };
}

export function handoffPanel(frame: number) {
  const p = outputHandoff(frame).morph;
  const mix = (a: number, b: number) => a + (b - a) * p;
  // Workflow panel transformed through its existing 1.18× camera at handoff.
  return {
    left: mix((165 - 960) * 1.18 + 960 + 90, 290),
    top: mix((738 - 540) * 1.18 + 540 - 30, 470),
    width: mix(1436 * 1.18, 1340),
    height: mix(108 * 1.18, 158),
  };
}
