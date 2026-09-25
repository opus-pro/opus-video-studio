import template from "../../template";
import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { HeadlineB } from "./HeadlineB";
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const out = (t: number, a: number, d: number) =>
  1 - Math.pow(1 - clamp((t - a) / d), 4);
const inv = (t: number, a: number, d: number) =>
  Math.pow(clamp((t - a) / d), 3.2);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
// Screen-space trajectories sampled from the source opening. Continuous cubic
// segments are used here; the whole clock is deliberately NOT beat-warped.
export function panelCurve(t: number) {
  const q = out(t, 0.43, 0.51);
  return {
    x: mix(-182, 424, q),
    y: mix(-540, 36, q) - inv(t, 1.0, 0.55) * 610,
    scale: mix(2.08, 1, q),
  };
}
const cards = [
  [48, 52, 213, 213, 0.62, -510, -240, 1.25],
  [424, 36, 191, 283, 0.43, -680, -310, 2.08],
  [810, -42, 330, 305, 0.54, -60, -550, 1.6],
  [1278, 115, 280, 277, 0.67, 500, -350, 1.55],
  [1629, -80, 270, 360, 0.56, 650, -250, 1.5],
  [36, 412, 400, 252, 0.64, -780, 130, 1.6],
  [1679, 488, 300, 455, 0.7, 740, 90, 1.5],
  [49, 798, 332, 185, 0.4, -450, 470, 1.7],
  [444, 723, 306, 308, 0.62, -280, 550, 1.4],
  [882, 774, 393, 219, 0.68, 80, 620, 1.3],
  [1328, 765, 288, 329, 0.64, 510, 630, 1.45],
];
const Headline = ({ t }: { t: number }) => {
  const exit = inv(t, 1.1, 0.5) * 930;
  const speed = (3.2 / 0.5) * Math.pow(clamp((t - 1.1) / 0.5), 2.2) * 930;
  return (
    <div
      style={{
        position: "absolute",
        left: 305,
        top: 224 - exit,
        width: 1320,
        fontFamily: "Fraunces",
        fontVariationSettings: '"opsz" 72,"SOFT" 45,"WONK" 1',
        fontWeight: 580,
        fontSize: 324,
        letterSpacing: "-.055em",
        lineHeight: 1.03,
      }}
    >
      {["One idea.", "Many clips."].map((line, row) => (
        <div
          key={line}
          style={{ height: 345, whiteSpace: "nowrap", position: "relative" }}
        >
          {[...line].map((ch, i) => {
            const start = 0.065 + row * 0.065 + i * 0.023;
            const q = out(t, start, 0.35 + row * 0.04);
            const finish = clamp((t - 0.065 - row * 0.045 - i * 0.065) / 0.22);
            const y = (1 - q) * (160 + row * 480);
            const col =
              finish < 0.36
                ? `rgb(${mix(230, 189, finish / 0.36)},${mix(58, 44, finish / 0.36)},${mix(239, 200, finish / 0.36)})`
                : `rgb(${mix(189, 25, (finish - 0.36) / 0.64)},${mix(44, 24, (finish - 0.36) / 0.64)},${mix(200, 25, (finish - 0.36) / 0.64)})`;
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  whiteSpace: "pre",
                  opacity: clamp(q * 1.18),
                  transform: `translateY(${y}px) rotateX(${(1 - q) * 32}deg)`,
                  filter: `blur(${Math.max((1 - q) * 7, speed * 0.00065 * (row ? 1 : 0.35))}px)`,
                  color: col,
                  textShadow:
                    finish < 0.85
                      ? `0 0 ${4 + (1 - finish) * 14}px ${col}66`
                      : "none",
                }}
              >
                {ch}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
export const BloomOpening = ({
  music = true,
  variant = "A",
  continueExit = false,
}: {
  music?: boolean;
  variant?: "A" | "B";
  continueExit?: boolean;
}) => {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig(),
    t = f / fps;
  return (
    <AbsoluteFill style={{ background: "#fff", overflow: "hidden" }}>
      {variant === "B" ? <HeadlineB t={t} /> : <Headline t={t} />}{" "}
      {cards.map(([x, y, w, h, a, dx, dy, z], i) => {
        const q = out(t, a, 0.44),
          exit =
            continueExit && t > 1.52
              ? inv(1.52, 1, 0.55) * 610 + (t - 1.52) * 3100
              : inv(t, 1, 0.55) * 610;
        const tracked = i === 1 ? panelCurve(t) : null;
        if (tracked && continueExit && t > 1.52) tracked.y = 36 - exit;
        const xx = tracked ? tracked.x : x + dx * (1 - q),
          yy = tracked ? tracked.y : y + dy * (1 - q) - exit,
          sc = tracked ? tracked.scale : mix(z, 1, q);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: xx,
              top: yy,
              width: w,
              height: h,
              opacity: t < a ? 0 : clamp((t - a) / 0.055),
              transform: `scale(${sc})`,
              transformOrigin: tracked ? "top left" : "50% 50%",
              overflow: "hidden",
              filter: `blur(${(1 - q) * 2.3}px)`,
            }}
          >
            {i === 1 ? (
              <div
                style={{
                  background:
                    "linear-gradient(145deg,#084a45,#086c58 55%,#2ba985)",
                  height: "100%",
                  padding: 19,
                  color: "white",
                  fontFamily: "Geist",
                  fontSize: 32,
                  fontWeight: 650,
                  letterSpacing: "-.065em",
                  lineHeight: 0.95,
                }}
              >
                <span
                  style={{ fontSize: 10, letterSpacing: 0, fontWeight: 400 }}
                >
                  {template.product.name}
                </span>
                <div style={{ marginTop: 22 }}>
                  {template.copy.openingCardLines[0]}
                  <br />
                  {template.copy.openingCardLines[1]}
                  <br />
                  {template.copy.openingCardLines[2]}
                </div>
                <div
                  style={{
                    marginTop: 36,
                    transform: "rotate(-12deg)",
                    height: 100,
                    background:
                      "linear-gradient(120deg,transparent,#7dffd688,transparent)",
                    filter: "blur(13px)",
                  }}
                />
              </div>
            ) : i === 5 ? (
              <div
                style={{
                  background: "#7984ca",
                  height: "100%",
                  padding: 25,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  fontFamily: "Fraunces",
                  fontWeight: 500,
                  fontSize: 39,
                  color: "white",
                  letterSpacing: "-.05em",
                  lineHeight: 1,
                }}
              >
                {template.copy.openingCardStory[0]}
                <br />
                {template.copy.openingCardStory[1]}
              </div>
            ) : i === 9 ? (
              <div
                style={{
                  height: "100%",
                  background: "#d7f1be",
                  color: "#1d3726",
                  padding: 24,
                  fontFamily: "Geist",
                  fontSize: 42,
                  fontWeight: 750,
                  letterSpacing: "-.06em",
                  lineHeight: 1,
                }}
              >
                {template.copy.openingCardCTA[0]}
                <br />
                {template.copy.openingCardCTA[1]}
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 450,
                    letterSpacing: 0,
                    marginTop: 23,
                  }}
                >
                  {template.copy.openingCardFootnote}
                </div>
              </div>
            ) : (
              <Img
                src={staticFile(template.media.openingImages[i % 4])}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
