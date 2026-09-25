import template from "../../template";
import React from "react";

const unit = (v: number) => Math.max(0, Math.min(1, v));
const easeOut = (t: number, start: number, duration: number) =>
  1 - Math.pow(1 - unit((t - start) / duration), 4);
const smooth = (v: number) => {
  const q = unit(v);
  return q * q * (3 - 2 * q);
};

// Line motion, reveal, and material sweep have independent clocks. Coordinates
// are in the 1920 × 1080 film, not glyph indices or a resampled beat timeline.
export function titleLineB(t: number, row: number) {
  const distance =
    row === 0
      ? 415 * (1 - easeOut(t, 0.025, 0.57))
      : 950 * (1 - easeOut(t, 0.09, 0.43));
  const exit = Math.pow(unit((t - 1.1) / 0.5), 3.2) * 930;
  return {
    x: 320 - distance * (row === 0 ? 0.45 : 0.28),
    y: (row === 0 ? 500 : 800) + distance - exit,
    scale: 1 + distance * (row === 0 ? 0.00052 : 0.00038),
    distance,
    reveal: 6300 * (t - 0.09 - (row === 1 ? 0.025 : 0)),
    opacity: smooth((t - 0.08 - (row === 1 ? 0.025 : 0)) / 0.15),
    materialFront: 2083 * (t - 0.168 - (row === 1 ? 0.008 : 0)),
  };
}

export const HeadlineB = ({ t }: { t: number }) => (
  <svg
    width="1920"
    height="1080"
    viewBox="0 0 1920 1080"
    style={{ position: "absolute", inset: 0, overflow: "visible" }}
  >
    {template.copy.openingLines.map((line, row) => {
      const m = titleLineB(t, row),
        id = "title-b-" + row;
      const exitSpeed =
        (3.2 / 0.5) * Math.pow(unit((t - 1.1) / 0.5), 2.2) * 930;
      const motionBlur = Math.max(
        0.45,
        (1 - easeOut(t, row === 0 ? 0.025 : 0.09, row === 0 ? 0.57 : 0.43)) *
          (row === 0 ? 2 : 6),
        exitSpeed * 0.0004,
      );
      const width = row === 0 ? 1220 : 1240;
      const text = (
        <text
          x="0"
          y="0"
          xmlSpace="preserve"
          textLength={width}
          lengthAdjust="spacingAndGlyphs"
          fontFamily="Fraunces"
          fontSize="310"
          fontWeight="520"
          letterSpacing="-.045em"
          style={{ fontVariationSettings: '"opsz" 72,"SOFT" 85,"WONK" 1' }}
        >
          {line}
        </text>
      );
      return (
        <g
          key={id}
          transform={`translate(${m.x} ${m.y}) scale(${m.scale})`}
          opacity={m.opacity}
        >
          <defs>
            <linearGradient
              id={id + "-color"}
              gradientUnits="userSpaceOnUse"
              x1={m.materialFront - 80}
              x2={m.materialFront + 420}
              y1="0"
              y2="-18"
            >
              <stop offset="0" stopColor={template.brand.titleColors[0]} />
              <stop offset=".22" stopColor={template.brand.titleColors[1]} />
              <stop offset=".52" stopColor={template.brand.titleColors[2]} />
              <stop offset=".8" stopColor={template.brand.titleColors[3]} />
              <stop offset="1" stopColor={template.brand.titleColors[4]} />
            </linearGradient>
            <linearGradient
              id={id + "-reveal"}
              gradientUnits="userSpaceOnUse"
              x1={m.reveal - 250}
              x2={m.reveal + 80}
              y1="0"
              y2="0"
            >
              <stop offset="0" stopColor="white" />
              <stop offset="1" stopColor="black" />
            </linearGradient>
            <mask
              id={id + "-mask"}
              maskUnits="userSpaceOnUse"
              x="-80"
              y="-390"
              width="1530"
              height="570"
            >
              <rect
                x="-80"
                y="-390"
                width="1530"
                height="570"
                fill={`url(#${id}-reveal)`}
              />
            </mask>
            <filter
              id={id + "-surface"}
              x="-5%"
              y="-15%"
              width="110%"
              height="135%"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur
                in="SourceAlpha"
                stdDeviation="4.5"
                result="height"
              />
              <feSpecularLighting
                in="height"
                surfaceScale="5"
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
              <feGaussianBlur stdDeviation={motionBlur} />
            </filter>
            <filter
              id={id + "-halo"}
              x="-8%"
              y="-20%"
              width="116%"
              height="145%"
            >
              <feGaussianBlur stdDeviation="4.2" />
            </filter>
          </defs>
          <g mask={`url(#${id}-mask)`} fill={`url(#${id}-color)`}>
            <g
              opacity={0.17 * (1 - smooth((t - 0.6) / 0.25))}
              filter={`url(#${id}-halo)`}
            >
              {text}
            </g>
            <g filter={`url(#${id}-surface)`}>{text}</g>
          </g>
        </g>
      );
    })}
  </svg>
);
