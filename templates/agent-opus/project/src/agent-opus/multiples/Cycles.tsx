import timeline from "../../../config/timeline.json";
import template from "../../template";
import React from "react";
import {
  AbsoluteFill,
  Freeze,
  OffthreadVideo,
  staticFile,
  Easing,
} from "remotion";
import { Garden, Prompt, Flower } from "../code-ui/BloomFull";
import { handoffPanel, outputHandoff } from "../directed/OutputHandoff";
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const assets = template.media.wallVideos;
const STARTS = timeline.categoryStarts,
  REVEALS = timeline.categoryReveals,
  ENDS = timeline.categoryEnds;
// Pullback velocity crests around F808/F942/F1077, measured score transients.
export const EXPANDS = timeline.categoryExpands;
const fly = Easing.bezier(0.56, 0, 0.2, 1),
  pull = Easing.bezier(0.64, 0, 0.23, 1),
  unfold = Easing.bezier(0.18, 0.8, 0.24, 1);
const u = (f: number, a: number, b: number, curve = fly) =>
  curve(clamp((f - a) / (b - a)));
const A: React.CSSProperties = { position: "absolute" };
const kinds = ["ads", "stories", "explainers"];
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
function Shot({ frame: f, i }: { frame: number; i: number }) {
  const start = STARTS[i],
    reveal = REVEALS[i],
    end = ENDS[i],
    expand = EXPANDS[i];
  const flight = u(f, reveal - 10, reveal),
    collection = u(f, expand, expand + 18, pull),
    exit = u(f, end - 11, end);
  const wide = i === 1,
    w = wide ? 1660 : 560,
    h = wide ? 934 : 996,
    gap = wide ? 58 : 38;
  const wallScale = wide ? 0.35 : 0.48,
    exitScale = wide ? 1.42 : 3.62;
  const camera = mix(mix(1, wallScale, collection), exitScale, exit);
  const category = assets.filter((a) => a.category === kinds[i]);
  const cols = wide ? 2 : 3,
    rows = wide ? 2 : 1;
  const slots = Array.from(
    { length: (cols * 2 + 1) * (rows * 2 + 1) },
    (_, j) => {
      const col = (j % (cols * 2 + 1)) - cols,
        row = Math.floor(j / (cols * 2 + 1)) - rows;
      return {
        col,
        row,
        cx: col * (w + gap),
        cy: row * (h + gap) + (wide ? 0 : Math.abs(col) % 2 ? 110 : -36),
      };
    },
  ).filter((s) => s.col !== 0 || s.row !== 0);
  const target = slots.find(
    (s) => s.col === (i === 2 ? -1 : 1) && s.row === 0,
  )!;
  const source = template.media.heroVideos[i];
  const heroTime =
    template.media.heroStartSeconds[i] +
    (Math.max(0, f - reveal + 8) / 30) * template.media.heroPlaybackRates[i];
  const texts = template.copy.categoryPrompts;
  const entrance = outputHandoff(f);
  const panel = handoffPanel(f);
  const entering = i === 0 && f < timeline.outputStart;
  const promptScaleX = panel.width / 1340, promptScaleY = panel.height / 158;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Garden t={Math.min(f, reveal) / 30} />
      {flight < 1 && (
        <AbsoluteFill
          style={{
            opacity: 1 - flight,
            transform: `translateY(${flight * 22}px) scale(${1 + flight * 2.1})`,
          }}
        >
          <div
            style={{
              ...A,
              top: 332,
              width: "100%",
              textAlign: "center",
              fontFamily: "Fraunces",
              fontWeight: 450,
              fontVariationSettings: '"opsz" 72,"SOFT" 85,"WONK" 1',
              fontSize: 65,
              letterSpacing: "-.025em",
              opacity: entering ? entrance.question : 1,
              translate: entering ? `0 ${(1 - entrance.question) * 26}px` : undefined,
            }}
          >
            {template.copy.categoryQuestion}
          </div>
          <AbsoluteFill style={entering ? {
            opacity: entrance.prompt,
            transformOrigin: "0 0",
            transform: `translate(${panel.left - 290 * promptScaleX}px,${panel.top - 470 * promptScaleY}px) scale(${promptScaleX},${promptScaleY})`,
          } : undefined}>
            <Prompt
              text={texts[i]}
              typed={clamp((f - start) / 18)}
              selected={f >= reveal - 10}
              t={f / 30}
            />
          </AbsoluteFill>
        </AbsoluteFill>
      )}
      {f >= reveal - 10 && (
        <>
          <AbsoluteFill
            style={{
              transform: `translate(${-target.cx * camera * exit}px,${-target.cy * camera * exit}px) scale(${camera})`,
            }}
          >
            {slots.map((s, j) => {
              const delay = Math.min(
                  8,
                  Math.abs(s.col) * 1.1 + Math.abs(s.row) * 2.2,
                ),
                q = u(f, expand + delay, expand + delay + 17, unfold);
              if (q === 0) return null;
              const sample =
                category[
                  (s.col + cols + (s.row + rows) * 3 + i * 2) % category.length
                ];
              const offset =
                (Math.floor(j / category.length) * 1.25 + 0.2) * 30;
              const videoFrame = Math.floor(
                (Math.max(0, f - expand) + offset) % (sample.duration * 30 - 2),
              );
              return (
                <div
                  key={j}
                  style={{
                    ...A,
                    left: 960 - w / 2 + s.cx * q,
                    top: 540 - h / 2 + s.cy * q,
                    width: w,
                    height: h,
                    overflow: "hidden",
                    borderRadius: wide ? 18 : 25,
                    background: "#17131c",
                    opacity: clamp(q * 4),
                    boxShadow: "0 18px 55px #26163626",
                    transform: `scale(${mix(0.84, 1, q)}) rotate(${(1 - q) * (s.col < 0 ? -6 : 6)}deg)`,
                    filter: `blur(${Math.sin(Math.PI * q) * 3}px)`,
                  }}
                >
                  <Freeze frame={videoFrame}>
                    <OffthreadVideo
                      muted
                      src={staticFile(sample.file)}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Freeze>
                </div>
              );
            })}
            <div
              style={{
                ...A,
                left: (1920 - w) / 2,
                top: (1080 - h) / 2,
                width: w,
                height: h,
                borderRadius: wide ? 13 : 20,
                overflow: "hidden",
                background: "#17131c",
                boxShadow: "0 24px 80px #33234425",
                opacity: clamp(flight * 3),
                transform: `scale(${0.52 + 0.48 * flight})`,
                filter: `blur(${Math.sin(Math.PI * flight) * 4}px)`,
              }}
            >
              <Freeze frame={Math.round(heroTime * 30)}>
                <OffthreadVideo
                  muted
                  src={staticFile(source)}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Freeze>
            </div>
          </AbsoluteFill>
          {!wide && collection < 1 && (
            <AbsoluteFill style={{ opacity: flight * (1 - collection) }}>
              <Flower x={340} y={880} size={185} id={`wall-mark-${i}-a`} />
              <Flower x={1550} y={235} size={135} id={`wall-mark-${i}-b`} />
            </AbsoluteFill>
          )}
        </>
      )}
      {f >= end - 3 && (
        <AbsoluteFill
          style={{ background: "#fff", opacity: u(f, end - 3, end) }}
        />
      )}
    </AbsoluteFill>
  );
}
export function MultipleCycles({ frame: f }: { frame: number }) {
  const i = f < STARTS[1] ? 0 : f < STARTS[2] ? 1 : 2;
  return (
    <AbsoluteFill style={{ background: "#fff", overflow: "hidden" }}>
      <Shot frame={f} i={i} />
    </AbsoluteFill>
  );
}
