import React from "react";
import { useCurrentFrame } from "remotion";
import {
  Cursor,
  Frame,
  Text,
  ease,
  mix,
  pos,
  progress,
  S,
  textWidth,
  sans,
} from "./shared";
export type SearchProps = {
  file1: string;
  file2: string;
  file3: string;
  result: string;
  open: string;
  closing: string;
  ending: string[];
  signature: string;
  background: string;
  ink: string;
  posterColors: string[];
  posterCopy: {
    chroma: string;
    chromaTop: string;
    chromaBottom: string;
    form: string[];
    formTop: string;
    formBottom: string;
    flow: string;
    flowTop: string;
    flowBottom: string;
  };
  geometry: {
    posterWidth: number;
    posterRatio: number;
    centers: number[];
    heroWidth: number;
    metalWidth: number;
  };
  timing: {
    separate: number;
    select: number;
    hero: number;
    open: number;
    click: number;
    metal: number;
    line: number;
    dark: number;
    ending: number;
  };
};
export const searchDefaults: SearchProps = {
  file1: "Chroma.fig",
  file2: "Form.svg",
  file3: "Flow.psd",
  result: "Found it.",
  open: "Open file",
  closing: "Back to creating.",
  ending: ["Less searching.", "More creating."],
  signature: "Ask AI",
  background: "#f1f1f1",
  ink: "#202326",
  posterColors: ["#cef26a", "#f47258", "#86cce6"],
  posterCopy: {
    chroma: "CHROMA",
    chromaTop: "CHROMA STUDIO / 01",
    chromaBottom: "FORM / COLOR / MOTION",
    form: ["FO", "RM"],
    formTop: "FORM STUDIO / 02",
    formBottom: "SHAPE THE EVERYDAY",
    flow: "FLOW",
    flowTop: "DESIGN STUDIO / 03",
    flowBottom: "A STUDY IN CONTINUOUS MOTION",
  },
  geometry: {
    posterWidth: 132,
    posterRatio: 1.2,
    centers: [360, 480, 600],
    heroWidth: 188,
    metalWidth: 946,
  },
  timing: {
    separate: 95,
    select: 165,
    hero: 193,
    open: 277,
    click: 310,
    metal: 345,
    line: 374,
    dark: 459,
    ending: 474,
  },
};
const SVGText: React.FC<{
  text: string;
  x: number;
  y: number;
  size: number;
  color: string;
  bold?: boolean;
  width?: number;
}> = ({ text, x, y, size, color, bold = false, width = 90 }) => (
  <text
    x={x}
    y={y}
    fill={color}
    fontFamily={sans}
    fontSize={Math.min(size, (size * width) / textWidth(text, size, bold))}
    fontWeight={bold ? 700 : 400}
  >
    {text}
  </text>
);
const Artwork: React.FC<{ i: number; p: SearchProps }> = ({ i, p }) => {
  const c = p.posterCopy;
  const star = Array.from({ length: 16 }, (_, j) => {
    const a = ((-90 + j * 22.5) * Math.PI) / 180,
      r = j % 2 ? 15 : 33;
    return `${69 + r * Math.cos(a)},${79 + r * Math.sin(a)}`;
  }).join(" ");
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 100 120"
      preserveAspectRatio="none"
    >
      <defs>
        <clipPath id={"posterclip" + i}>
          <rect width="100" height="120" />
        </clipPath>
        <clipPath id="coilclip">
          <rect x="6" y="42" width="88" height="66" />
        </clipPath>
      </defs>
      <g clipPath={`url(#posterclip${i})`}>
        <rect width="100" height="120" fill={p.posterColors[i]} />
        {i === 0 ? (
          <>
            <SVGText
              text={c.chromaTop}
              x={6}
              y={9}
              size={2.5}
              color="#19341d"
            />
            <SVGText
              text={c.chroma}
              x={5}
              y={34}
              size={18}
              bold
              color="#19341d"
            />
            <g clipPath="url(#coilclip)">
              {Array.from({ length: 10 }, (_, j) => (
                <ellipse
                  key={j}
                  cx="50"
                  cy="75"
                  rx={31 - 1.2 * j}
                  ry={17 - j}
                  transform={`rotate(${-22 + 3 * j} 50 75)`}
                  fill="none"
                  stroke="#19341d"
                  strokeWidth="1.8"
                />
              ))}
            </g>
            <SVGText
              text={c.chromaBottom}
              x={6}
              y={115}
              size={2.3}
              color="#19341d"
            />
          </>
        ) : i === 1 ? (
          <>
            <SVGText text={c.formTop} x={6} y={9} size={2.5} color="#55281f" />
            {c.form.map((v, j) => (
              <SVGText
                key={j}
                text={v}
                x={5}
                y={48 + j * 31}
                size={36}
                bold
                color="#55281f"
              />
            ))}
            <polygon points={star} fill="#f8e7a2" />
            <circle cx="69" cy="79" r="9" fill={p.posterColors[1]} />
            <SVGText
              text={c.formBottom}
              x={6}
              y={115}
              size={2.3}
              color="#55281f"
            />
          </>
        ) : (
          <>
            <SVGText text={c.flowTop} x={6} y={9} size={2.5} color="#095178" />
            <SVGText
              text={c.flow}
              x={6}
              y={36}
              size={26}
              bold
              color="#095178"
            />
            {Array.from({ length: 9 }, (_, j) => (
              <circle
                key={j}
                cx="39"
                cy="103"
                r={15 + 4 * j}
                fill="none"
                stroke="#095178"
                strokeWidth="2"
              />
            ))}
            <SVGText
              text={c.flowBottom}
              x={6}
              y={115}
              size={2.3}
              color="#095178"
            />
          </>
        )}
      </g>
    </svg>
  );
};
export const Search: React.FC<SearchProps> = (p) => {
  const f = useCurrentFrame(),
    t = p.timing,
    g = p.geometry;
  const metal =
    "linear-gradient(90deg,#dce9ef 0%,#7691a7 10%,#f1f5f6 18%,#9bb6c9 27%,#506c82 36%,#e1ebf1 43%,#7294ae 57%,#e4edf4 64%,#658299 77%,#d7e3ec 90%,#eaf1f4 100%)";
  const closing = ease(f, 381, 402);
  return (
    <Frame background={p.background}>
      {[0, 1, 2].map((i) => {
        const en = ease(f, [0, 21, 46][i], [36, 51, 76][i]),
          sep = ease(f, t.separate, 129),
          sel = ease(f, t.select, 192),
          hero = ease(f, t.hero, 221),
          open = ease(f, 315, 344),
          met = ease(f, t.metal, 373, S),
          line = ease(f, t.line, 402, S);
        let x = mix(487 + 40 * i, g.centers[i], sep),
          y = 279 + 45 * (1 - en),
          w = g.posterWidth,
          h = w * g.posterRatio,
          opacity = en;
        if (i < 2) {
          x -= 40 * sel;
          opacity *= 1 - sel;
        } else {
          x = mix(x, 480, sel);
          x = mix(x, 383, hero);
          w = mix(w, g.heroWidth, hero);
          x = mix(x, 480, open);
          y = mix(y, 277, open);
          w = mix(w, 216, open);
          h = w * g.posterRatio;
          w = mix(w, g.metalWidth, met);
          h = mix(h, 46, met);
          y = mix(y, 270, met);
          h = mix(h, 1, line);
          opacity *= 1 - ease(f, 395, 419);
        }
        if (opacity === 0) return null;
        return (
          <div
            key={i}
            style={{
              ...pos(x - w / 2, y - h / 2, w, h),
              opacity,
              filter: `blur(${i < 2 ? 8 * sel + 8 * (1 - en) : 8 * (1 - en)}px)`,
              boxShadow: f < 345 ? "0 8px 15px #0000000f" : "none",
            }}
          >
            {f < 362 && (
              <>
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: -16,
                    width: w * 0.6,
                    height: 16,
                    background: "#f9f9f6",
                    opacity: 1 - ease(f, 345, 356),
                  }}
                />
                <Text
                  text={[p.file1, p.file2, p.file3][i]}
                  x={0}
                  y={-13}
                  w={w}
                  h={12}
                  size={7}
                  min={6}
                  color={p.ink}
                  style={{ opacity: 1 - ease(f, 345, 356) }}
                />
              </>
            )}
            <div
              style={{
                position: "absolute",
                inset: 0,
                overflow: "hidden",
                opacity: i === 2 ? 1 - ease(f, 345, 361) : 1,
              }}
            >
              <Artwork i={i} p={p} />
            </div>
            {i === 2 && f >= 345 && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: metal,
                  opacity: ease(f, 345, 361),
                  overflow: "hidden",
                  maskImage:
                    f >= 374
                      ? `linear-gradient(90deg,#000 calc(50% - ${125 * closing}px),transparent calc(50% - ${125 * closing}px),transparent calc(50% + ${125 * closing}px),#000 calc(50% + ${125 * closing}px))`
                      : undefined,
                }}
              >
                {[0, 1, 2].map((j) => (
                  <div
                    key={j}
                    style={{
                      ...pos(
                        100 + 300 * j - 180 * progress(f, 345, 389),
                        -50,
                        70,
                        160,
                      ),
                      background: "#fff9",
                      filter: "blur(12px)",
                      transform: "skewX(-26deg)",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
      {f >= 216 && f < 295 && (
        <Text
          text={p.result}
          x={517}
          y={263 - 10 * ease(f, 277, 294)}
          w={260}
          h={34}
          size={20}
          min={16}
          color={p.ink}
          style={{
            opacity: ease(f, 216, 235) * (1 - ease(f, 277, 294)),
            filter: `blur(${mix(5, 0, ease(f, 216, 235))}px)`,
          }}
        />
      )}
      {f >= 277 && f < 315 && (
        <div
          style={{
            ...pos(508, 264, 105, 27),
            background: f >= 310 ? "#c2dce8" : "#d4eaf3",
            borderRadius: 2,
            opacity: ease(f, 277, 294),
            transform: `scale(${f >= 310 && f < 313 ? 0.97 : 1})`,
          }}
        >
          <Text text={p.open} x={12} y={5} w={75} h={19} size={14} min={11} />
          <svg
            width="10"
            height="10"
            style={{ position: "absolute", right: 8, top: 8 }}
          >
            <path
              d="M1 9 9 1M2 1h7v7"
              stroke={p.ink}
              fill="none"
              strokeWidth="1"
            />
          </svg>
        </div>
      )}
      {f >= 294 && f < 315 && (
        <Cursor
          x={mix(681, 595, ease(f, 294, 308))}
          y={mix(339, 281, ease(f, 294, 308))}
          frame={f}
          click={t.click}
          color="#86cce6"
        />
      )}
      <Text
        text={p.closing}
        x={330}
        y={252.5}
        w={300}
        h={35}
        size={21}
        min={16}
        color={p.ink}
        align="center"
        style={{ opacity: closing * (1 - ease(f, 459, 466)) }}
      />
      <div
        style={{
          ...pos(0, 0, 960 * ease(f, t.dark, 473, S), 540),
          background: "#080a0d",
        }}
      />
      {p.ending.map((v, i) => (
        <Text
          key={i}
          text={v}
          x={410}
          y={243 + 27 * i + 12 * (1 - ease(f, t.ending + 3 * i, 489))}
          w={270}
          h={27}
          size={21}
          min={16}
          color="#f1f1f1"
          style={{
            opacity: ease(f, t.ending + 3 * i, 489),
            filter: `blur(${6 * (1 - ease(f, t.ending + 3 * i, 489))}px)`,
          }}
        />
      ))}
      <div style={{ opacity: ease(f, 491, 503) }}>
        <svg width="12" height="12" style={{ ...pos(450, 312, 12, 12) }}>
          <path d="M6 0V12M0 6H12" stroke="#889097" />
        </svg>
        <Text
          text={p.signature}
          x={470}
          y={311}
          w={100}
          h={18}
          size={10}
          min={8}
          color="#889097"
        />
      </div>
    </Frame>
  );
};
