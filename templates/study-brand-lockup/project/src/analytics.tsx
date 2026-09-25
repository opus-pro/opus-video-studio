import React from "react";
import { useCurrentFrame } from "remotion";
import { Frame, Text, ease, mix, pos, S } from "./shared";
export type AnalyticsProps = {
  title: string;
  description: string;
  values: number[];
  highlight: number;
  background: string;
  card: string;
  track: string;
  bar: string;
  highlightTop: string;
  highlightBottom: string;
  intermediate: number[];
  geometry: {
    surface: number;
    scale: number;
    card: [number, number, number, number];
    chart: [number, number, number, number];
    barWidth: number;
    barPitch: number;
    baseline: number;
  };
  timing: {
    growEnd: number;
    moveStart: number;
    moveMid: number;
    moveEnd: number;
    highlightStart: number;
    highlightEnd: number;
  };
};
export const analyticsDefaults: AnalyticsProps = {
  title: "Sales analytics",
  description:
    "Browse and list residential and commercial properties effortlessly with detailed profiles images and virtual tours.",
  values: [46, 49, 35, 61, 78, 89, 100, 61, 46, 49],
  highlight: 7,
  background: "#fafafa",
  card: "#ffffff",
  track: "#f6f6f6",
  bar: "#cfcfcf",
  highlightTop: "#f4d856",
  highlightBottom: "#f7a53c",
  intermediate: [25, 43, 35, 60, 72, 82, 94, 62, 40, 31],
  geometry: {
    surface: 600,
    scale: 0.84,
    card: [90, 117, 420, 366],
    chart: [108, 313, 384, 134],
    barWidth: 36,
    barPitch: 44,
    baseline: 446,
  },
  timing: {
    growEnd: 42,
    moveStart: 25,
    moveMid: 52,
    moveEnd: 90,
    highlightStart: 84,
    highlightEnd: 108,
  },
};
export const Analytics: React.FC<AnalyticsProps> = (p) => {
  const f = useCurrentFrame(),
    g = p.geometry,
    t = p.timing;
  const offset =
    f < t.moveMid
      ? mix(38, 7, ease(f, t.moveStart, t.moveMid, S))
      : mix(7, -12, ease(f, t.moveMid, t.moveEnd));
  const glow = ease(f, t.highlightStart, t.highlightEnd);
  return (
    <Frame background={p.background}>
      <div
        style={{
          ...pos(228, 18, 600, 600),
          transform: `scale(${g.scale})`,
          transformOrigin: "top left",
        }}
      >
        <div
          style={{
            ...pos(...g.card),
            background: p.card,
            borderRadius: 15,
            boxShadow: "0 10px 22px #0000000e",
          }}
        />
        <Text
          text={p.title}
          x={126}
          y={158}
          w={345}
          h={28}
          size={18}
          min={15}
          bold
        />
        <Text
          text={
            p.description === analyticsDefaults.description
              ? "Browse and list residential and commercial\nproperties effortlessly with detailed profiles\nimages and virtual tours."
              : p.description
          }
          x={126}
          y={204}
          w={345}
          h={81}
          size={16}
          min={14}
          color="#727272"
          lineHeight={26}
          lines={3}
        />
        <div
          style={{
            ...pos(...g.chart),
            overflow: "hidden",
            maskImage:
              "linear-gradient(90deg,transparent,#000 30px,#000 calc(100% - 30px),transparent)",
          }}
        >
          {p.values.map((v, i) => (
            <div
              key={"track" + i}
              style={{
                ...pos(10 + g.barPitch * i, 1, g.barWidth, 132),
                borderRadius: 18,
                background: p.track,
              }}
            />
          ))}
          {p.values.map((v, i) => {
            const a = mix(
              p.intermediate[i] * 0.1,
              p.intermediate[i],
              ease(f, i * 2, t.growEnd + i * 2),
            );
            const h = Math.max(8, (132 * mix(a, v, ease(f, 42, 90))) / 100);
            return (
              <div
                key={i}
                style={{
                  ...pos(10 + g.barPitch * i + offset, 133 - h, g.barWidth, h),
                  borderRadius: Math.min(18, h / 2),
                  background: p.bar,
                }}
              >
                {i === p.highlight - 1 && (
                  <>
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "inherit",
                        background: `linear-gradient(${p.highlightTop},${p.highlightBottom})`,
                        opacity: glow * 0.3,
                        filter: "blur(15px)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "inherit",
                        background: `linear-gradient(${p.highlightTop},${p.highlightBottom})`,
                        opacity: glow,
                      }}
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Frame>
  );
};
