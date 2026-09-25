import template from "../../template";
import React, { createContext } from "react";
import { AbsoluteFill } from "remotion";

// Opt-in so earlier template studies keep their original art direction.
export const OpusBrandContext = createContext(false);
const paths = template.brand.markPaths;
export type MarkProps = {
  x: number;
  y: number;
  size?: number;
  turn?: number;
  opacity?: number;
  blur?: number;
  tint?: boolean;
  id?: string;
};

// Exact paths from the official Agent Opus mark, with a shallow extrusion.
export function OpusMark({
  x,
  y,
  size = 220,
  turn = 0,
  opacity = 1,
  blur = 0,
  id = "opus",
}: MarkProps) {
  const face = id + "-face",
    side = id + "-side";
  return (
    <svg
      width={size}
      height={size}
      viewBox={template.brand.markViewBox}
      aria-hidden
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        opacity,
        overflow: "visible",
        filter: `blur(${blur}px) drop-shadow(8px 15px 12px #56308e1c)`,
        transform: `rotate(${turn}deg)`,
      }}
    >
      <defs>
        <linearGradient
          id={face}
          x1="0"
          y1="0"
          x2=".8"
          y2="1"
          gradientUnits="objectBoundingBox"
        >
          <stop stopColor={template.brand.markFaceColors[0]} />
          <stop offset=".22" stopColor={template.brand.markFaceColors[1]} />
          <stop offset=".56" stopColor={template.brand.markFaceColors[2]} />
          <stop offset=".82" stopColor={template.brand.markFaceColors[3]} />
          <stop offset="1" stopColor={template.brand.markFaceColors[4]} />
        </linearGradient>
        <linearGradient id={side} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={template.brand.markSideColors[0]} />
          <stop offset=".45" stopColor={template.brand.markSideColors[1]} />
          <stop offset="1" stopColor={template.brand.markSideColors[2]} />
        </linearGradient>
      </defs>
      <g transform={template.brand.markTransform}>
        {Array.from({ length: 16 }, (_, i) => 16 - i).map((depth) => (
          <g
            key={depth}
            transform={`translate(${depth * 0.72} ${depth * 0.95})`}
            fill={`url(#${side})`}
          >
            {paths.map((d, j) => (
              <path key={j} d={d} fillRule="evenodd" />
            ))}
          </g>
        ))}
        {paths.map((d, j) => (
          <path
            key={j}
            d={d}
            fill={`url(#${face})`}
            fillRule="evenodd"
            stroke="#ffffffac"
            strokeWidth="1.4"
          />
        ))}
      </g>
    </svg>
  );
}

export function OpusStage() {
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 24% 25%,#e8dcf8 0%,transparent 54%),radial-gradient(ellipse at 80% 78%,#efe6fa 0%,transparent 48%),linear-gradient(130deg,#f9f6fc,#fff 62%,#faf6ff)",
      }}
    />
  );
}
