import React, { CSSProperties, useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender } from "remotion";

export const sans = "Arial, Helvetica, sans-serif";
export const serif = 'Georgia, "Times New Roman", serif';
export const clamp = (v: number) => Math.min(1, Math.max(0, v));
export const progress = (f: number, a: number, b: number) =>
  clamp((f - a) / (b - a));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const bezier =
  (x1: number, y1: number, x2: number, y2: number) => (x: number) => {
    x = clamp(x);
    let lo = 0,
      hi = 1,
      t = x;
    const value = (a: number, b: number, n: number) =>
      3 * (1 - n) * (1 - n) * n * a + 3 * (1 - n) * n * n * b + n * n * n;
    for (let i = 0; i < 24; i++) {
      t = (lo + hi) / 2;
      if (value(x1, x2, t) < x) lo = t;
      else hi = t;
    }
    return x === 0 ? 0 : x === 1 ? 1 : value(y1, y2, t);
  };
export const E = bezier(0.16, 1, 0.3, 1),
  S = bezier(0.65, 0, 0.35, 1);
export const ease = (f: number, a: number, b: number, fn = E) =>
  fn(progress(f, a, b));
export const pos = (
  x: number,
  y: number,
  w: number,
  h: number,
): CSSProperties => ({
  position: "absolute",
  left: x,
  top: y,
  width: w,
  height: h,
});
export const FontReady: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender("Waiting for system fonts"));
  useEffect(() => {
    document.fonts.ready.then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);
  return ready ? <>{children}</> : null;
};
let context: CanvasRenderingContext2D | null = null;
export function textWidth(
  text: string,
  size: number,
  bold = false,
  family = sans,
) {
  if (typeof document === "undefined") return text.length * size * 0.56;
  context ??= document.createElement("canvas").getContext("2d");
  context!.font = `${bold ? "700" : "400"} ${size}px ${family}`;
  return context!.measureText(text).width;
}
export type TextProps = {
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  size: number;
  min?: number;
  bold?: boolean;
  family?: string;
  color?: string;
  align?: "left" | "center" | "right";
  lines?: number;
  lineHeight?: number;
  style?: CSSProperties;
  name?: string;
};
export const Text: React.FC<TextProps> = ({
  text,
  x,
  y,
  w,
  h,
  size,
  min = size,
  bold = false,
  family = sans,
  color = "inherit",
  align = "left",
  lines = 1,
  lineHeight,
  style,
  name,
}) => {
  let font = size;
  let output: string[] = [];
  const wrap = (s: number) => {
    if (text.includes("\n")) return text.split("\n");
    if (lines === 1) return [text];
    const rows: string[] = [""];
    for (const word of text.split(" ")) {
      const last = rows.length - 1;
      const next = rows[last] ? rows[last] + " " + word : word;
      if (textWidth(next, s, bold, family) > w && rows[last]) rows.push(word);
      else rows[last] = next;
    }
    return rows;
  };
  for (; font >= min; font -= 0.25) {
    output = wrap(font);
    if (
      output.length <= lines &&
      output.every((t) => textWidth(t, font, bold, family) <= w) &&
      output.length * (lineHeight ?? font * 1.15) <= h + 0.5
    )
      break;
  }
  font = Math.max(font, min);
  output = wrap(font);
  return (
    <div
      data-textbox={name ?? text}
      data-measured-width={Math.max(
        ...output.map((t) => textWidth(t, font, bold, family)),
      )}
      style={{
        ...pos(x, y, w, h),
        fontFamily: family,
        fontSize: font,
        fontWeight: bold ? 700 : 400,
        letterSpacing: 0,
        lineHeight: `${lineHeight ?? font * 1.15}px`,
        whiteSpace: "pre",
        textAlign: align,
        color,
        ...style,
      }}
    >
      {output.join("\n")}
    </div>
  );
};
export const Frame: React.FC<{
  background: string;
  children: React.ReactNode;
}> = ({ background, children }) => (
  <AbsoluteFill
    style={{
      background,
      overflow: "hidden",
      fontFamily: sans,
      letterSpacing: 0,
    }}
  >
    {children}
  </AbsoluteFill>
);
export const Mark: React.FC<{
  size: number;
  color: string;
  style?: CSSProperties;
}> = ({ size, color, style }) => (
  <svg width={size} height={size} viewBox="0 0 130 130" style={style}>
    {[0, 45, 90, 135].map((a) => (
      <rect
        key={a}
        x="0"
        y="50"
        width="130"
        height="30"
        rx="15"
        fill={color}
        transform={`rotate(${a} 65 65)`}
      />
    ))}
  </svg>
);
export const Arrow: React.FC<{
  color?: string;
  size?: number;
  style?: CSSProperties;
}> = ({ color = "currentColor", size = 20, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <path
      d="M4 12h15m-6-6 6 6-6 6"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
  </svg>
);
export const Check: React.FC<{
  color?: string;
  size?: number;
  draw?: number;
}> = ({ color = "currentColor", size = 30, draw = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 30 30">
    <path
      d="m5 15 7 7 14-15"
      fill="none"
      stroke={color}
      strokeWidth="3"
      pathLength="1"
      strokeDasharray="1"
      strokeDashoffset={1 - draw}
    />
  </svg>
);
export const Cursor: React.FC<{
  x: number;
  y: number;
  click: number;
  frame: number;
  color?: string;
}> = ({ x, y, click, frame, color = "#d6f53c" }) => {
  const p = progress(frame, click, click + 9);
  const sc =
    frame < click
      ? 1
      : frame < click + 4
        ? 0.84
        : mix(0.84, 1, ease(frame, click + 4, click + 9));
  return (
    <div style={{ ...pos(x, y, 30, 34), transform: `scale(${sc})` }}>
      <svg width="30" height="34" viewBox="0 0 30 34">
        <path
          d="M2 2 4 26 10 20 16 31 21 28 15 18 25 17Z"
          fill="#16151a"
          stroke="white"
          strokeWidth="1.6"
        />
        {frame >= click && frame < click + 9 && (
          <circle
            cx="3"
            cy="4"
            r={mix(6, 22, p)}
            stroke={color}
            strokeWidth="1.3"
            fill="none"
            opacity={1 - p}
          />
        )}
      </svg>
    </div>
  );
};
