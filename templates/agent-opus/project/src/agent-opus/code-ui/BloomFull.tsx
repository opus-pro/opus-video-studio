import template from "../../template";
import React, { useContext } from "react";
import { OpusBrandContext, OpusMark, OpusStage } from "../brand/OpusMark";
import {
  AbsoluteFill,
  Img,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BloomTwoSegments } from "./SecondClaim";
import { PromptCraft } from "./PromptCraft";
import { useEditTime } from "./clock";
import { sweep, outputSeconds, mix } from "./motion";
import { out4, smooth } from "./fullTimeline";
const A: React.CSSProperties = { position: "absolute" };
const serif: React.CSSProperties = {
  fontFamily: "Fraunces",
  fontWeight: 500,
  letterSpacing: "-.055em",
  fontVariationSettings: '"opsz" 72,"SOFT" 85,"WONK" 1',
};
const alpha = (t: number, a: number, b: number, d = 0.2) =>
  out4(t, a, d) * (1 - smooth(t, b - d, d));
const Center = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <div
    style={{
      ...A,
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      ...style,
    }}
  >
    {children}
  </div>
);
function Orb({
  size = 90,
  color = "purple",
  t = 0,
}: {
  size?: number;
  color?: string;
  t?: number;
}) {
  const now = useEditTime();
  t = now;
  const tones =
    color === "green"
      ? ["#ccffb0", "#25d246", "#72e019"]
      : color === "pink"
        ? ["#ffe7eb", "#ff6794", "#e04771"]
        : ["#ffe9fc", "#c348ed", "#6714a6"];
  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: "50%",
        background: `radial-gradient(circle at ${30 + Math.sin(t * 2) * 8}% 22%,#fff 0%,${tones[0]} 15%,${tones[1]} 47%,${tones[2]} 74%,#532485 100%)`,
        boxShadow: `inset -8px -6px 14px #57266022,inset 6px 7px 15px #fff8,0 0 23px ${tones[1]}22`,
        filter: "blur(.7px)",
        transform: `rotate(${t * 24}deg)`,
      }}
    />
  );
}

export const Flower = OpusMark;
const flowerPositions = [
  [160, 280, 350],
  [505, 90, 235],
  [1100, 30, 385],
  [1580, 225, 360],
  [1870, 680, 270],
  [1260, 1030, 345],
  [580, 1030, 280],
  [30, 880, 405],
  [1490, 830, 150],
  [790, 830, 125],
  [330, 540, 165],
  [1240, 290, 145],
];
function Flowers({
  t,
  start,
  end,
  quiet = false,
}: {
  t: number;
  start: number;
  end: number;
  quiet?: boolean;
}) {
  const now = useEditTime(),
    opusBrand = useContext(OpusBrandContext);
  const release = smooth(t, end - 0.5, 0.43),
    inward = out4(t, start, 0.58);
  const positions = opusBrand
    ? [
        [200, 215, 280],
        [870, 80, 220],
        [1670, 260, 325],
        [1730, 880, 240],
        [1060, 1030, 270],
        [240, 900, 335],
      ]
    : flowerPositions;
  return (
    <AbsoluteFill style={{ opacity: 1 - smooth(t, end - 0.19, 0.19) }}>
      {positions.map(([x, y, size], i) => {
        const q = out4(t, start + (i % 3) * 0.065, 0.6);
        return (
          <Flower
            key={i}
            id={`f-${start}-${i}`}
            x={960 + (x - 960) * (1.3 - 0.3 * inward) * (1 - release * 0.2)}
            y={540 + (y - 540) * (1.3 - 0.3 * inward)}
            size={size * q * (quiet ? 0.55 : 1) * (1 + release * 1.8)}
            opacity={q * (quiet ? 0.8 : 1)}
            blur={release * 30 + (i % 4 === 0 ? 2 : 0)}
            turn={
              opusBrand
                ? [-12, 8, -9, 12, -5, 10][i] + (1 - q) * 15
                : i * 28 + now * 12
            }
          />
        );
      })}
    </AbsoluteFill>
  );
}
function MaterialTitle({
  text,
  t,
  start,
  end,
  size = 150,
  style = {},
}: {
  text: string;
  t: number;
  start: number;
  end: number;
  size?: number;
  style?: React.CSSProperties;
}) {
  const now = useEditTime(),
    a = outputSeconds(start),
    b = outputSeconds(end);
  const enter = sweep(now, a, a + 0.24),
    exit = sweep(now, b - 0.14, b),
    front = mix(-30, 130, out4(t, start, 0.95));
  const id = `material-title-${Math.round(start * 100)}`;
  // Paint the gradient in the glyphs themselves. CSS background-clip can lose
  // its glyph clip during consecutive Chromium frame captures and become a bar.
  return (
    <Center style={{ opacity: sweep(now, a, a + 0.08) * (1 - exit), ...style }}>
      <svg
        width="1920"
        height={size * 1.7}
        style={{
          overflow: "visible",
          transform: `translate(${exit * 120}px,${(1 - enter) * 95 - exit * 15}px)`,
          filter: `blur(${(1 - enter) * 2 + exit * 2}px)`,
        }}
      >
        <defs>
          <linearGradient
            id={id + "-color"}
            x1={`${front - 55}%`}
            x2={`${front + 18}%`}
            y1="0"
            y2="0"
          >
            <stop offset="0" stopColor="#161219" />
            <stop offset=".37" stopColor="#391641" />
            <stop offset=".644" stopColor="#ae45c8" />
            <stop offset=".849" stopColor="#efb2eb" />
            <stop offset="1" stopColor="#fff" />
          </linearGradient>
          <linearGradient
            id={id + "-reveal"}
            x1={`${enter * 160 - 35}%`}
            x2={`${enter * 160}%`}
            y1="0"
            y2="0"
          >
            <stop offset="0" stopColor="white" />
            <stop offset="1" stopColor="black" />
          </linearGradient>
          <mask
            id={id + "-mask"}
            maskUnits="objectBoundingBox"
            maskContentUnits="objectBoundingBox"
            x="0"
            y="0"
            width="1"
            height="1"
          >
            <rect width="1" height="1" fill={`url(#${id}-reveal)`} />
          </mask>
        </defs>
        <text
          x="960"
          y={size * 0.85}
          textAnchor="middle"
          dominantBaseline="central"
          xmlSpace="preserve"
          fill={`url(#${id}-color)`}
          mask={`url(#${id}-mask)`}
          style={{ ...serif, fontSize: size, whiteSpace: "pre" }}
        >
          {text}
        </text>
      </svg>
    </Center>
  );
}

export function Prompt({
  text,
  t,
  typed = 1,
  format,
  selected = false,
  title = false,
}: {
  text: string;
  t: number;
  typed?: number;
  format?: string;
  selected?: boolean;
  title?: boolean;
}) {
  return (
    <div
      style={{
        ...A,
        left: 290,
        top: 470,
        width: 1340,
        height: 158,
        borderRadius: 100,
        background: "linear-gradient(110deg,#fff,#fbfdfd)",
        boxShadow:
          "0 12px 25px #6f50711c,inset 0 2px 3px #fff,0 0 4px #abc9c833",
        border: "1px solid #bfb3c51c",
        display: "flex",
        alignItems: "center",
        gap: 26,
        padding: "0 27px 0 30px",
      }}
    >
      {title && (
        <div
          style={{
            ...A,
            left: 26,
            top: -104,
            ...serif,
            fontSize: 54,
            letterSpacing: "-.025em",
          }}
        >
          ◎ &nbsp; Add your video
        </div>
      )}
      <Orb size={89} t={t} />
      <div
        style={{
          ...serif,
          fontSize: 51,
          letterSpacing: "-.025em",
          flex: 1,
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        {text.slice(0, Math.floor(text.length * typed))}
        {typed < 1 && (
          <span style={{ opacity: Math.sin(t * 19) > 0 ? 1 : 0.25 }}>|</span>
        )}
      </div>
      {format && (
        <div
          style={{
            ...serif,
            fontSize: 33,
            padding: "18px 26px",
            background: selected ? "#f2e3ff" : "#f6f6f5",
            borderRadius: 12,
            whiteSpace: "nowrap",
          }}
        >
          {format}⌄
        </div>
      )}
      <div
        style={{
          width: 103,
          height: 103,
          borderRadius: "50%",
          background: selected ? "#8238c7" : "#717579",
          display: "grid",
          placeItems: "center",
          color: "#fff",
          fontFamily: "Geist",
          fontSize: 70,
          lineHeight: 1,
          transform: "scale(1)",
        }}
      >
        ↑
      </div>
    </div>
  );
}
export const Garden = ({ t }: { t: number }) => <OpusStage />;
const IntegratedPromptCraft = () => {
  const f = useCurrentFrame();
  const actual = 139 / 30 + f / 30;
  const source =
    actual < 7.84
      ? actual
      : Math.min(13.14, 7.84 + (actual - 7.84) * (5.3 / 3.32));
  return <PromptCraft music={false} time={source} />;
};
export function BloomFull({
  music = true,
  integratedCraft = false,
  sourceFrame,
}: {
  music?: boolean;
  integratedCraft?: boolean;
  sourceFrame?: number;
}) {
  // The source timeline is longer than the edited composition. Remotion clamps
  // useCurrentFrame() to the composition length, including inside <Freeze>.
  // Read the unbounded source position explicitly for retimed scene selection.
  const frame = useCurrentFrame(),
    { fps } = useVideoConfig(),
    t = (sourceFrame ?? frame) / fps,
    edit = useEditTime();
  return (
    <AbsoluteFill
      style={{
        background: "#fff",
        color: "#19151d",
        fontFamily: "Geist",
        overflow: "hidden",
      }}
    >
      {t < 2.6 && <BloomTwoSegments music={false} />}
      {t >= 2.6 && t < 4.64 && (
        <>
          <MaterialTitle
            text={`Meet ${template.product.name}.`}
            t={t}
            start={2.6}
            end={4.6}
            size={167}
            style={{ filter: `blur(${smooth(t, 4.14, 0.43) * 10}px)` }}
          />
          {t > 3.35 && <Flowers t={t} start={3.35} end={4.64} />}
          <AbsoluteFill
            style={{ background: "#fff", opacity: smooth(t, 4.38, 0.26) }}
          />
        </>
      )}
      {integratedCraft && (
        <Sequence from={139} durationInFrames={203}>
          <IntegratedPromptCraft />
        </Sequence>
      )}
      {t >= 54.6 && t < 55.9 && (
        <MaterialTitle
          text={template.copy.closingAction}
          t={t}
          start={54.68}
          end={55.9}
          size={133}
        />
      )}
      {t >= 55.9 && t < 57.14 && (
        <>
          <MaterialTitle
            text={`at ${template.product.website}`}
            t={t}
            start={55.9}
            end={57.14}
            size={139}
          />
          <Flowers t={t} start={55.9} end={57.14} quiet />
        </>
      )}
      {t >= 57.14 && (
        <Center
          style={{
            opacity: sweep(edit, 46.3, 46.52),
            transform: `scale(${mix(0.88, 1, sweep(edit, 46.3, 46.533333))})`,
          }}
        >
          <Img
            src={staticFile(template.brand.wordmark)}
            style={{ width: 660, filter: "brightness(0)" }}
          />
        </Center>
      )}
      {edit >= 47.166667 && (
        <AbsoluteFill
          style={{
            background: "#000",
            opacity: sweep(edit, 47.166667, 47.466667),
          }}
        />
      )}
    </AbsoluteFill>
  );
}
