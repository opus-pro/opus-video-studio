import template from "../../template";
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import wave from "./input-wave.json";
const A: React.CSSProperties = { position: "absolute" };
const serif: React.CSSProperties = {
  fontFamily: "Fraunces",
  fontWeight: 520,
  letterSpacing: "-.045em",
  fontVariationSettings: '"opsz" 72,"SOFT" 85,"WONK" 1',
};
const clamp = (n: number) => Math.min(1, Math.max(0, n));
const out = (f: number, s: number, d = 8) =>
  1 - Math.pow(1 - clamp((f - s) / d), 4);
const inside = (f: number, s: number, d = 5) => Math.pow(clamp((f - s) / d), 3);
const starts = [209, 238, 267],
  ends = [238, 267, 296];

function Label({ f, i }: { f: number; i: number }) {
  const local = f - starts[i],
    enter = out(local, 0, 9),
    exit = inside(f, ends[i] - 5, 5),
    id = "crafted-input-" + i;
  const materialFront = (local - 2) * 96,
    reveal = (local - 1) * 215;
  const text = (
    <text
      x="0"
      y="0"
      xmlSpace="preserve"
      fontFamily="Fraunces"
      fontSize="184"
      fontWeight="520"
      letterSpacing="-.045em"
      style={{ fontVariationSettings: '"opsz" 72,"SOFT" 85,"WONK" 1' }}
    >
      {template.copy.inputLabels[i]}
    </text>
  );
  const width = [900, 1040, 875][i];
  return (
    <svg
      width="1920"
      height="1080"
      viewBox="0 0 1920 1080"
      style={{ ...A, inset: 0, overflow: "visible" }}
    >
      <defs>
        <linearGradient
          id={id + "-color"}
          gradientUnits="userSpaceOnUse"
          x1={materialFront - 80}
          x2={materialFront + 420}
          y1="0"
          y2="-18"
        >
          <stop stopColor={template.brand.titleColors[0]} />
          <stop offset=".22" stopColor={template.brand.titleColors[1]} />
          <stop offset=".52" stopColor={template.brand.titleColors[2]} />
          <stop offset=".8" stopColor={template.brand.titleColors[3]} />
          <stop offset="1" stopColor={template.brand.titleColors[4]} />
        </linearGradient>
        <linearGradient
          id={id + "-reveal"}
          gradientUnits="userSpaceOnUse"
          x1={reveal - 200}
          x2={reveal + 80}
          y1="0"
          y2="0"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="black" />
        </linearGradient>
        <mask
          id={id + "-mask"}
          maskUnits="userSpaceOnUse"
          x="-60"
          y="-240"
          width="1350"
          height="340"
        >
          <rect
            x="-60"
            y="-240"
            width="1350"
            height="340"
            fill={`url(#${id}-reveal)`}
          />
        </mask>
        <filter
          id={id + "-surface"}
          x="-5%"
          y="-20%"
          width="110%"
          height="150%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceAlpha" stdDeviation="3.1" result="height" />
          <feSpecularLighting
            in="height"
            surfaceScale="4"
            specularConstant=".16"
            specularExponent="28"
            lightingColor="#f9eaff"
            result="shine"
          >
            <feDistantLight azimuth="235" elevation="30" />
          </feSpecularLighting>
          <feComposite
            in="shine"
            in2="SourceAlpha"
            operator="in"
            result="insideShine"
          />
          <feBlend in="SourceGraphic" in2="insideShine" mode="screen" />
          <feGaussianBlur stdDeviation={0.35 + (1 - enter) * 2 + exit * 3} />
        </filter>
      </defs>
      <g
        transform={`translate(${(1920 - width) / 2 + exit * 130} ${590 + (1 - enter) * 110}) scale(${1 + (1 - enter) * 0.05})`}
        opacity={clamp(local / 2) * (1 - exit)}
      >
        <g
          mask={`url(#${id}-mask)`}
          fill={`url(#${id}-color)`}
          filter={`url(#${id}-surface)`}
        >
          {text}
        </g>
      </g>
    </svg>
  );
}
function Paper({ f }: { f: number }) {
  const local = f - 209;
  return (
    <div
      style={{
        ...A,
        left: 110,
        top: 236,
        width: 346,
        height: 584,
        transform: "rotate(-10deg)",
        borderRadius: 16,
        background: "linear-gradient(130deg,#fff,#f4edfc)",
        boxShadow: "0 25px 55px #60478020",
        border: "1px solid #e0d3ef",
        padding: "47px 35px",
      }}
    >
      <div
        style={{
          ...A,
          inset: 0,
          borderRadius: 16,
          boxShadow: "inset 0 2px 4px #fff",
        }}
      />
      {template.copy.scriptLines.map((line, j) => {
        const q = out(local, 4 + j * 3, 5);
        return (
          <div
            key={line}
            style={{
              ...serif,
              fontSize: 47,
              lineHeight: 1.12,
              marginBottom: j === 1 ? 37 : 17,
              whiteSpace: "nowrap",
              position: "relative",
              clipPath: `inset(0 ${(1 - q) * 100}% 0 0)`,
              color: "#3f2a50",
            }}
          >
            <span
              style={{
                position: "absolute",
                inset: "2px -7px -1px",
                background: "#dcc4f655",
                borderRadius: 5,
                opacity: j === 1 ? out(local, 15, 6) : 0,
              }}
            />
            {line}
          </div>
        );
      })}
      <div
        style={{
          marginTop: 38,
          height: 3,
          width: 98,
          background: "#ae82d1",
          borderRadius: 2,
          transformOrigin: "left",
          transform: `scaleX(${out(local, 17, 5)})`,
        }}
      />
    </div>
  );
}
function Photo({
  name,
  x,
  y,
  w,
  h,
  rot,
  f,
  start,
}: {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
  f: number;
  start: number;
}) {
  const q = out(f, start, 8);
  return (
    <div
      style={{
        ...A,
        left: x + (1 - q) * (x < 960 ? -210 : 210),
        top: y + (1 - q) * 65,
        width: w,
        height: h,
        borderRadius: 20,
        overflow: "hidden",
        opacity: clamp((f - start) / 3),
        transform: `translate(-50%,-50%) rotate(${rot + (1 - q) * (rot > 0 ? 9 : -9)}deg) scale(${0.93 + 0.07 * q})`,
        boxShadow: "0 22px 42px #50386a24",
        border: "2px solid #ffffffbb",
      }}
    >
      <Img
        src={staticFile(name)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}
export function RichInputs({ frame: f }: { frame: number }) {
  const i = f < 238 ? 0 : f < 267 ? 1 : 2,
    start = starts[i],
    exit = inside(f, ends[i] - 5, 5),
    q = out(f, start, 6),
    handoff = inside(f, 288, 8);
  const bars = wave[String(f) as keyof typeof wave] ?? Array(83).fill(0);
  return (
    <AbsoluteFill
      style={{
        fontFamily: "Geist",
        color: "#201b24",
        overflow: "hidden",
        clipPath: `inset(0 ${handoff * 100}% 0 0)`,
        background: "#fff",
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 12% 76%,#eee4fb77,transparent 48%),radial-gradient(ellipse at 85% 20%,#eadef888,transparent 45%)",
        }}
      />
      <div
        style={{
          ...A,
          inset: 0,
          transform: `translateX(${(1 - q) * 1200 - exit * 1250}px)`,
          opacity: q,
        }}
      >
        {i === 0 && (
          <>
            <div
              style={{
                ...A,
                left: 1460,
                top: 760,
                width: 390,
                height: 390,
                transform: "rotate(12deg)",
                borderRadius: 18,
                background: "linear-gradient(135deg,#e5d5f6,#f7f3fb)",
                boxShadow: "0 16px 50px #60478019",
                padding: 44,
                opacity: out(f, start + 6, 7),
              }}
            >
              {[0, 1, 2, 3, 4].map((j) => (
                <div
                  key={j}
                  style={{
                    height: 12,
                    width: 220 - (j % 3) * 35,
                    marginBottom: 30,
                    borderRadius: 3,
                    background: "#b598d0",
                    opacity: 0.32,
                  }}
                />
              ))}
            </div>
            <Paper f={f} />
          </>
        )}
        {i === 1 && (
          <>
            <Photo
              name={template.media.inputImages[0]}
              x={235}
              y={239}
              w={287}
              h={382}
              rot={-15}
              f={f}
              start={start}
            />
            <Photo
              name={template.media.inputImages[1]}
              x={260}
              y={721}
              w={329}
              h={460}
              rot={-8}
              f={f}
              start={start + 4}
            />
            <Photo
              name={template.media.inputImages[2]}
              x={1677}
              y={338}
              w={327}
              h={429}
              rot={11}
              f={f}
              start={start + 2}
            />
            <Photo
              name={template.media.inputImages[3]}
              x={1527}
              y={906}
              w={395}
              h={375}
              rot={-7}
              f={f}
              start={start + 7}
            />
          </>
        )}
        {i === 2 && (
          <div
            style={{
              ...A,
              left: 260,
              top: 749,
              width: 1400,
              height: 164,
              display: "flex",
              gap: 8,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 38,
              background: "linear-gradient(110deg,#f4edfc99,#fbf9ff55)",
              boxShadow: "inset 0 1px 2px #fff,0 12px 30px #7b509b0a",
              overflow: "hidden",
            }}
          >
            {bars.map((level, n) => (
              <div
                key={n}
                style={{
                  width: 8,
                  flexShrink: 0,
                  height: (8 + Math.sqrt(level) * 116) * q,
                  borderRadius: 10,
                  background: "linear-gradient(#cba4e8,#8554b1)",
                  opacity: 0.9,
                }}
              />
            ))}
          </div>
        )}
      </div>
      <Label f={f} i={i} />
    </AbsoluteFill>
  );
}
