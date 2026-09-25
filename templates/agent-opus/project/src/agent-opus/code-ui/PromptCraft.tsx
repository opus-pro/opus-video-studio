import template from "../../template";
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

import { useEditTime, MotionFilter } from "./clock";
import { inputPose, sweep, mix } from "./motion";

const A: React.CSSProperties = { position: "absolute" };
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => {
  x = clamp(x);
  return x * x * (3 - 2 * x);
};
const ease = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
const serif = {
  fontFamily: "Fraunces",
  fontWeight: 550,
  letterSpacing: "-.042em",
  fontVariationSettings: '"opsz" 72,"SOFT" 60,"WONK" 1',
};
// Monotone cubic interpolation preserves measured holds and acceleration, without overshoot.
export function track(t: number, points: number[][]) {
  if (t <= points[0][0]) return points[0][1];
  if (t >= points[points.length - 1][0]) return points[points.length - 1][1];
  const d = points
    .slice(1)
    .map((p, i) => (p[1] - points[i][1]) / (p[0] - points[i][0]));
  const slopes = points.map((_, i) =>
    i === 0
      ? d[0]
      : i === points.length - 1
        ? d[d.length - 1]
        : d[i - 1] * d[i] <= 0
          ? 0
          : 2 / (1 / d[i - 1] + 1 / d[i]),
  );
  const i = points.findIndex(
    (p, j) => j < points.length - 1 && t >= p[0] && t < points[j + 1][0],
  );
  const h = points[i + 1][0] - points[i][0],
    u = (t - points[i][0]) / h;
  return (
    (2 * u ** 3 - 3 * u * u + 1) * points[i][1] +
    (u ** 3 - 2 * u * u + u) * h * slopes[i] +
    (-2 * u ** 3 + 3 * u * u) * points[i + 1][1] +
    (u ** 3 - u * u) * h * slopes[i + 1]
  );
}
export const zoomTrack = [
  [4.64, 1],
  [5.04, 1.04],
  [5.28, 1.12],
  [5.44, 1.33],
  [5.6, 1.72],
  [5.76, 1.92],
  [6.08, 2.035],
  [6.4, 2.08],
  [7.78, 2.08],
];
export const focusTrack = [
  [4.64, 394],
  [5.28, 402],
  [5.76, 417],
  [6.08, 410],
  [6.32, 380],
  [6.48, 320],
  [6.64, 204],
  [6.8, -58],
  [6.96, -552],
  [7.04, -792],
  [7.12, -935],
  [7.2, -1029],
  [7.36, -1144],
  [7.52, -1206],
  [7.68, -1239],
  [7.78, -1251],
];
export const verticalTrack = [
  [4.64, 616],
  [4.8, 605],
  [5.04, 592],
  [5.28, 580],
  [5.52, 565],
  [5.76, 550],
  [6.16, 542],
  [6.48, 542],
  [7.78, 542],
];
function ColorOrb({
  size,
  t,
  coral = false,
}: {
  size: number;
  t: number;
  coral?: boolean;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        filter: `blur(${size * 0.035}px)`,
        background: coral
          ? `radial-gradient(ellipse at ${38 + Math.sin(t * 4) * 12}% 18%,#fff9,transparent 42%),radial-gradient(ellipse at 24% 35%,#ffb1c4,transparent 63%),conic-gradient(from ${t * 52}deg,#ff7894,#ffa8b1,#f96181,#ff5271,#ff9fbd)`
          : `radial-gradient(ellipse at ${33 + Math.sin(t * 2) * 15}% 23%,#ffd5e477,transparent 48%),conic-gradient(from ${t * 67}deg,#f19697,#9344d0,#6e00cc,#c41fdd,#f0769b)`,
        boxShadow: "inset 0 4px 10px #ffffff30",
      }}
    />
  );
}
function Arrow({ size = 88, dark = false }: { size?: number; dark?: boolean }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: dark
          ? "linear-gradient(135deg,#7600c4,#9b38de)"
          : "linear-gradient(135deg,#54535a,#696b70)",
        display: "grid",
        placeItems: "center",
        boxShadow: dark ? "0 0 50px #b86bff88" : "none",
      }}
    >
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 40 40">
        <path
          d="M20 32V8M9 19L20 8l11 11"
          fill="none"
          stroke="white"
          strokeWidth="4.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
function ImportIcon() {
  return (
    <svg width="35" height="35" viewBox="0 0 40 40">
      <rect
        x="6"
        y="5"
        width="27"
        height="29"
        rx="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
      />
      <path d="M15 13l11 7-11 7z" fill="currentColor" />
    </svg>
  );
}
function Atmosphere({ t }: { t: number }) {
  const strength = ease(t, 4.64, 5.4),
    travel = ease(t, 6.3, 7.04),
    grain = 0.012;
  return (
    <AbsoluteFill style={{ background: "#fffeff", overflow: "hidden" }}>
      <div
        style={{
          ...A,
          left: 400 - travel * 1500,
          top: -400,
          width: 2100,
          height: 1500,
          background:
            "radial-gradient(ellipse at 44% 28%,#dabcf28c,transparent 59%),radial-gradient(ellipse at 60% 52%,#dcb8f1cf,transparent 45%)",
          opacity: 0.2 + strength * 0.8,
          filter: "blur(40px)",
          transform: `rotate(-${12 + strength * 8}deg)`,
        }}
      />
      <svg
        width="2200"
        height="1200"
        style={{
          ...A,
          left: 80 - travel * 1600,
          top: -90,
          opacity: 0.06 + strength * 0.15,
          filter: "blur(38px)",
        }}
      >
        <path
          d="M220 1130C1230 350 200 600 1610 -160L1990 -50C1610 600 1510 200 650 1270Z"
          fill="#bc72ec"
        />
        <path
          d="M100 1180C1580 500 1000 50 2350 40"
          fill="none"
          stroke="#fff"
          strokeWidth="100"
        />
      </svg>
      <div
        style={{
          ...A,
          bottom: -80 - ease(t, 4.72, 5.42) * 320,
          left: 0,
          right: 0,
          height: 260,
          opacity: 0.19 * (1 - ease(t, 4.7, 5.45)),
          filter: "blur(13px)",
          display: "flex",
          gap: 30,
          transform: "rotate(-3deg)",
        }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            style={{
              width: 150,
              height: 240,
              borderRadius: 16,
              flexShrink: 0,
              background: ["#b794f0", "#d2b3ee", "#f69ebd", "#a9d0d5"][i % 4],
              transform: `rotate(${i % 2 ? 14 : -18}deg) translateY(${(i % 3) * 22}px)`,
              border: "8px solid #fff",
            }}
          />
        ))}
      </div>
      <svg
        style={{
          ...A,
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: grain,
        }}
      >
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".65"
            numOctaves="2"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
}
function InputAndBeam({ t }: { t: number }) {
  const now = useEditTime(),
    m = inputPose(now),
    prev = inputPose(now - 1 / 30),
    { z, x, cy } = m,
    dark = ease(t, 6.86, 7.025);
  const dx = Math.min(
      14,
      (Math.abs(x - prev.x) + Math.abs(z - prev.z) * 600) * 0.1,
    ),
    dy = Math.min(
      8,
      (Math.abs(cy - prev.cy) + Math.abs(z - prev.z) * 300) * 0.1,
    );
  const text = template.copy.ideaPrompt,
    typed = Math.floor(clamp((t - 5.36) / 0.9) * text.length);
  const hover = 0,
    exit = ease(t, 7.78, 7.84);
  const screenLight = mix(500, 1140, sweep(now, 6.18, 6.64));
  return (
    <AbsoluteFill>
      <Atmosphere t={t} />
      <MotionFilter id="input-motion" x={dx} y={dy} />
      <AbsoluteFill style={{ background: "#000", opacity: dark }} />
      <div
        style={{
          ...A,
          left: x,
          top: cy - 92 * z,
          width: 1240,
          height: 184,
          transformOrigin: "0 0",
          transform: `scale(${z})`,
          opacity: 1 - exit,
          filter: `url(#input-motion)`,
        }}
      >
        <div
          style={{
            ...A,
            left: 0,
            top: -108,
            display: "flex",
            alignItems: "center",
            gap: 17,
            opacity: 1 - dark,
            color: "#17121b",
            ...serif,
            fontSize: 44,
          }}
        >
          <div
            style={{
              height: 70,
              width: 70,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: "#ffffff40",
              border: "1px solid #ffffffa0",
            }}
          >
            <ImportIcon />
          </div>
          {template.copy.ideaLabel}
        </div>
        <div
          style={{
            ...A,
            inset: 0,
            borderRadius: 110,
            background: "#f5ffff",
            boxShadow:
              "0 15px 20px #2911310f,0 3px 2px #ffffffa0,inset 0 2px 2px #fff",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              ...A,
              inset: 0,
              opacity: dark,
              background: "linear-gradient(110deg,#721cb9,#b767f6 45%,#cc90ff)",
            }}
          />
          <div style={{ ...A, top: 49, left: 44, opacity: 1 - dark }}>
            <ColorOrb size={80} t={t} />
          </div>
          <div
            style={{
              ...A,
              left: 146,
              top: 53,
              opacity: 1 - dark,
              ...serif,
              fontSize: 51,
              color: typed ? "#141219" : "#d3d2d5",
              fontWeight: typed ? 550 : 400,
              whiteSpace: "nowrap",
            }}
          >
            {t < 5.36 ? template.copy.ideaPlaceholder : text.slice(0, typed)}
          </div>
          <div style={{ ...A, left: 1114, top: 48, opacity: 1 - dark }}>
            <Arrow />
          </div>
          <div
            style={{
              ...A,
              left: 1114,
              top: 48,
              opacity: dark,
              transform: `scale(${1 + hover * 0.045})`,
            }}
          >
            <Arrow dark />
          </div>
          <div
            style={{
              ...A,
              left: (screenLight - x) / z - 125,
              top: -130,
              height: 480,
              width: 205,
              transform: "rotate(-23deg)",
              background:
                "linear-gradient(90deg,transparent,#f7ecffd0 35%,#ffffffed 58%,transparent)",
              filter: "blur(15px)",
              opacity: dark * 0.94,
              mixBlendMode: "screen",
            }}
          />
        </div>
        <div
          style={{
            ...A,
            left: (screenLight - x) / z - 100,
            top: -95,
            height: 410,
            width: 170,
            transform: "rotate(-23deg)",
            background:
              "linear-gradient(90deg,transparent,#a32ffa50,transparent)",
            filter: "blur(32px)",
            opacity: dark * 0.5,
          }}
        />
      </div>
      <AbsoluteFill style={{ background: "#fff", opacity: exit }} />
    </AbsoluteFill>
  );
}
export function PromptCraft({
  music = false,
  time,
}: {
  music?: boolean;
  time?: number;
}) {
  const frame = useCurrentFrame(),
    t = time ?? 4.64 + frame / 30;
  return (
    <AbsoluteFill
      style={{ background: "#fff", fontFamily: "Geist", overflow: "hidden" }}
    >
      <InputAndBeam t={t} />
    </AbsoluteFill>
  );
}
