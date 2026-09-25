import React from "react";
import { useCurrentFrame } from "remotion";
import {
  Arrow,
  Frame,
  Text,
  E,
  S,
  ease,
  mix,
  pos,
  progress,
  serif,
  textWidth,
} from "./shared";

export type ManifestoProps = {
  brand: string;
  lead: string;
  answer: string;
  point1: string;
  point2: string;
  point3: string;
  closing: string;
  cta: string;
  background: string;
  ink: string;
  accent: string;
  highlight: string;
  shadowColor: string;
  timing: {
    reveal: number;
    compactStart: number;
    compactEnd: number;
    points: number[];
    exit: number;
    closing: number;
    footer: number;
  };
  geometry: {
    openingX: number;
    openingY: number;
    openingWidth: number;
    compactX: number;
    compactY: number;
    compactWidth: number;
  };
};
export const manifestoDefaults: ManifestoProps = {
  brand: "FORMA",
  lead: "One idea.",
  answer: "Many possibilities.",
  point1: "Your words.",
  point2: "Your vision.",
  point3: "Your next move.",
  closing: "Make it real.",
  cta: "Start creating",
  background: "#f7f8f8",
  ink: "#241b28",
  accent: "#bd49b5",
  highlight: "#f0a1d9",
  shadowColor: "#5b315a",
  timing: {
    reveal: 13,
    compactStart: 54,
    compactEnd: 70,
    points: [70, 91, 113],
    exit: 171,
    closing: 187,
    footer: 207,
  },
  geometry: {
    openingX: 96,
    openingY: 140,
    openingWidth: 790,
    compactX: 332,
    compactY: 72,
    compactWidth: 330,
  },
};
export const Manifesto: React.FC<ManifestoProps> = (p) => {
  const f = useCurrentFrame(),
    t = p.timing,
    g = p.geometry,
    c = ease(f, t.compactStart, t.compactEnd),
    x = mix(g.openingX, g.compactX, c),
    y = mix(g.openingY, g.compactY, c),
    w = mix(g.openingWidth, g.compactWidth, c);
  const sheen = (a: number, b: number) => ({
    backgroundImage:
      f >= b
        ? "none"
        : `linear-gradient(90deg,${p.ink} 0%,${p.shadowColor} 34%,${p.accent} 48%,${p.highlight} 56%,${p.accent} 66%,${p.ink} 85%)`,
    backgroundColor: p.ink,
    backgroundRepeat: "no-repeat",
    backgroundSize: "190% 100%",
    backgroundPosition: `${mix(-140, 1100, progress(f, a, b)) - w * 1.9 * 0.56}px 0`,
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    color: "transparent",
  });
  return (
    <Frame background={p.background}>
      <div style={{ opacity: 1 - ease(f, 178, 190) }}>
        {[p.lead, p.answer].map((v, i) => {
          const en = ease(f, i * 3, t.reveal + i * 3);
          return (
            <Text
              key={i}
              text={v}
              x={x}
              y={y + mix(116, 46, c) * i + mix(24, 0, en)}
              w={w}
              h={mix(i ? 104 : 126, i ? 43 : 51, c)}
              size={mix(i ? 84 : 112, i ? 34 : 44, c)}
              min={mix(i ? 44 : 64, i ? 25 : 32, c)}
              bold
              family={serif}
              style={{
                ...sheen(0, 48),
                opacity: en,
                filter: `blur(${mix(11, 0, en)}px)`,
              }}
            />
          );
        })}
      </div>
      {[p.point1, p.point2, p.point3].map((v, i) => {
        const en = ease(f, t.points[i], t.points[i] + 13),
          out = ease(f, t.exit + i * 4, 190 + i * 4, S);
        return (
          <Text
            key={i}
            text={v}
            x={i === 2 ? 155 : 205}
            y={188 + 70 * i + mix(27, 0, en) - 28 * out}
            w={i === 2 ? 650 : 550}
            h={68}
            size={58}
            min={36}
            bold
            align="center"
            family={serif}
            color={i === 2 ? p.accent : p.ink}
            style={{
              ...(i === 2 && f < 144
                ? {
                    backgroundImage: `linear-gradient(90deg,${p.accent},${p.highlight},${p.accent})`,
                    backgroundSize: "190% 100%",
                    backgroundPosition: `${mix(-500, 650, progress(f, 113, 143))}px 0`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }
                : {}),
              opacity: en * (1 - out),
              filter: `blur(${mix(8, 0, en)}px)`,
            }}
          />
        );
      })}
      <Text
        text={p.closing}
        x={110}
        y={205 + mix(26, 0, ease(f, t.closing, 204))}
        w={740}
        h={118}
        size={94}
        min={54}
        bold
        align="center"
        family={serif}
        color={p.ink}
        style={{
          opacity: ease(f, t.closing, 204),
          filter: `blur(${mix(9, 0, ease(f, t.closing, 204))}px)`,
        }}
      />
      <Text
        text={p.brand}
        x={96}
        y={470 + mix(9, 0, ease(f, t.footer, 220))}
        w={260}
        h={28}
        size={20}
        bold
        color={p.ink}
        style={{ opacity: ease(f, t.footer, 220) }}
      />
      <Text
        text={p.cta}
        x={567}
        y={469 + mix(9, 0, ease(f, t.footer + 3, 220))}
        w={270}
        h={25}
        size={16}
        min={12}
        align="right"
        color={p.ink}
        style={{ opacity: ease(f, t.footer + 3, 220) }}
      />
      <Arrow
        size={14}
        color={p.ink}
        style={{
          ...pos(853, 474, 14, 14),
          opacity: ease(f, t.footer + 3, 220),
        }}
      />
    </Frame>
  );
};

export type RibbonProps = {
  brand: string;
  point1: string;
  point2: string;
  point3: string;
  closing: string;
  cta: string;
  background: string;
  ink: string;
  ribbonColors: string[];
  geometry: {
    width: number;
    height: number;
    ys: number[];
    rotations: number[];
    finalYs: number[];
    finalWidths: number[];
    gap: number;
  };
  timing: {
    decelerate: number;
    stop: number;
    cropStart: number;
    cropEnd: number;
    exit: number;
    closing: number;
  };
  speeds: number[];
};
export const ribbonDefaults: RibbonProps = {
  brand: "STUDIO DAYS",
  point1: "MAKE IT",
  point2: "FEEL NEW",
  point3: "EVERY DAY",
  closing: "A new perspective.",
  cta: "Join us this Friday",
  background: "#f3f5f3",
  ink: "#202820",
  ribbonColors: ["#cafa83", "#ff876b", "#90c8ed"],
  geometry: {
    width: 1480,
    height: 102,
    ys: [121, 270, 403],
    rotations: [-5, 4, -4],
    finalYs: [133, 254, 375],
    finalWidths: [424, 522, 580],
    gap: 82,
  },
  timing: {
    decelerate: 96,
    stop: 120,
    cropStart: 108,
    cropEnd: 128,
    exit: 166,
    closing: 179,
  },
  speeds: [-3.6, 4.2, -3.9],
};
const velocityIntegral = (t: number) => {
  const n = 80;
  let sum = 0;
  for (let i = 0; i < n; i++) sum += ((1 - E(((i + 0.5) * t) / n)) * t) / n;
  return sum;
};
export const Ribbon: React.FC<RibbonProps> = (p) => {
  const f = useCurrentFrame(),
    g = p.geometry,
    t = p.timing;
  return (
    <Frame background={p.background}>
      {[p.point1, p.point2, p.point3].map((v, i) => {
        const start = t.decelerate + 3 * i,
          end = t.stop + 3 * i,
          stop = ease(f, start, end),
          crop = ease(f, t.cropStart, t.cropEnd),
          entry = ease(f, 0, 11),
          out = ease(f, t.exit + i * 3, 181 + i * 3, S);
        const font = Math.min(
          87,
          Math.max(44, (87 * (780 - 52)) / textWidth(v, 87, true)),
        );
        const tw = textWidth(v, font, true),
          period = tw + g.gap,
          compact =
            v ===
            [
              ribbonDefaults.point1,
              ribbonDefaults.point2,
              ribbonDefaults.point3,
            ][i]
              ? g.finalWidths[i]
              : Math.min(780, tw + 52);
        const distance =
          f <= start
            ? f - start - (end - start) * velocityIntegral(1)
            : (end - start) *
              (velocityIntegral(progress(f, start, end)) - velocityIntegral(1));
        const raw = distance * p.speeds[i],
          shift =
            f < start
              ? ((((raw + period / 2) % period) + period) % period) - period / 2
              : raw;
        const width = mix(g.width, compact, crop);
        return (
          <div
            key={i}
            style={{
              ...pos(
                480 - width / 2 + mix(i === 1 ? 180 : -180, 0, entry),
                mix(g.ys[i], g.finalYs[i], stop) - 52 - 58 * out,
                width,
                mix(g.height, 104, crop),
              ),
              background: p.ribbonColors[i],
              overflow: "hidden",
              transform: `rotate(${mix(g.rotations[i], 0, stop)}deg)`,
              filter: `blur(${mix(7, 0, entry)}px)`,
              opacity: ease(f, 0, 5) * (1 - out),
              zIndex: i === 1 ? 2 : 1,
            }}
          >
            {[-3, -2, -1, 0, 1, 2, 3].map((j) => (
              <Text
                key={j}
                text={v}
                x={width / 2 - tw / 2 + period * j + shift}
                y={0}
                w={tw + 0.5}
                h={104}
                size={font}
                min={44}
                bold
                color={p.ink}
                lineHeight={104}
                style={{ opacity: j === 0 ? 1 : 1 - ease(f, 120, 128) }}
              />
            ))}
          </div>
        );
      })}
      <Text
        text={p.closing}
        x={75}
        y={210 + mix(22, 0, ease(f, t.closing, 195))}
        w={810}
        h={108}
        size={78}
        min={42}
        family={serif}
        bold
        color={p.ink}
        align="center"
        style={{
          opacity: ease(f, t.closing, 195),
          filter: `blur(${mix(8, 0, ease(f, t.closing, 195))}px)`,
        }}
      />
      <Text
        text={p.brand}
        x={96}
        y={473 + mix(8, 0, ease(f, 201, 213))}
        w={300}
        h={25}
        size={18}
        bold
        color={p.ink}
        style={{ opacity: ease(f, 201, 213) }}
      />
      <Text
        text={p.cta}
        x={568}
        y={474 + mix(8, 0, ease(f, 201, 213))}
        w={270}
        h={25}
        size={15}
        min={12}
        align="right"
        color={p.ink}
        style={{ opacity: ease(f, 201, 213) }}
      />
      <Arrow
        size={14}
        color={p.ink}
        style={{ ...pos(853, 477, 14, 14), opacity: ease(f, 201, 213) }}
      />
    </Frame>
  );
};
