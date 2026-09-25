import template from "../../template";
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { IdeaOpening } from "./IdeaOpening";

const unit = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => {
  const q = unit(v);
  return q * q * (3 - 2 * q);
};

export function claimMotion(t: number, row: number) {
  const distance =
    row === 0
      ? 620 * Math.exp(-5.8 * (t - 1.58))
      : 1100 * Math.exp(-6 * (t - 1.56));
  const drift = 430 * Math.pow(unit((t - 2) / 0.52), 2.2);
  const x =
    (row === 0 ? 500 : 340) -
    distance * (row === 0 ? 0.23 : 0.1) +
    drift * (row === 0 ? 1 : 0.68);
  return {
    distance,
    x,
    y: (row === 0 ? 510 : 830) + distance,
    reveal: 6800 * (t - (row === 0 ? 1.575 : 1.695)),
    opacity: smooth((t - (row === 0 ? 1.56 : 1.685)) / 0.105),
    materialFront:
      (row === 0 ? 980 : 1240) * 1.48 * (t - (row === 0 ? 1.68 : 1.66)),
    eraseFront: 340 + 1600 * Math.pow(unit((t - 2.3) / 0.22), 4.4) - x,
  };
}

export const SecondClaim = ({ t }: { t: number }) => (
  <svg
    width="1920"
    height="1080"
    viewBox="0 0 1920 1080"
    style={{ position: "absolute", inset: 0 }}
  >
    {template.copy.secondClaimLines.map((line, row) => {
      const m = claimMotion(t, row),
        id = "claim-02-" + row,
        width = row === 0 ? 980 : 1240;
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
        <g key={id} transform={`translate(${m.x} ${m.y})`} opacity={m.opacity}>
          <defs>
            <linearGradient
              id={id + "-color"}
              gradientUnits="userSpaceOnUse"
              x1={m.materialFront - 70}
              x2={m.materialFront + 390}
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
              id={id + "-warm"}
              gradientUnits="userSpaceOnUse"
              x1={m.eraseFront + 40}
              x2={m.eraseFront + 510}
              y1="0"
              y2="0"
            >
              <stop offset="0" stopColor="#f6a1fb" />
              <stop offset=".25" stopColor="#ed64e4" />
              <stop offset=".42" stopColor="#ff9a38" />
              <stop offset=".57" stopColor="#b64421" />
              <stop offset=".84" stopColor="#271920" />
              <stop offset="1" stopColor={template.brand.titleColors[0]} />
            </linearGradient>
            <linearGradient
              id={id + "-in"}
              gradientUnits="userSpaceOnUse"
              x1={m.reveal - 230}
              x2={m.reveal + 90}
              y1="0"
              y2="0"
            >
              <stop offset="0" stopColor="white" />
              <stop offset="1" stopColor="black" />
            </linearGradient>
            <linearGradient
              id={id + "-out"}
              gradientUnits="userSpaceOnUse"
              x1={m.eraseFront - 310}
              x2={m.eraseFront - 135}
              y1="0"
              y2="0"
            >
              <stop offset="0" stopColor="black" />
              <stop offset="1" stopColor="white" />
            </linearGradient>
            <mask
              id={id + "-enter-mask"}
              maskUnits="userSpaceOnUse"
              x="-80"
              y="-380"
              width="1500"
              height="600"
            >
              <rect
                x="-80"
                y="-380"
                width="1500"
                height="600"
                fill={`url(#${id}-in)`}
              />
            </mask>
            <mask
              id={id + "-exit-mask"}
              maskUnits="userSpaceOnUse"
              x="-80"
              y="-380"
              width="1500"
              height="600"
            >
              <rect
                x="-80"
                y="-380"
                width="1500"
                height="600"
                fill={t < 2.3 ? "white" : `url(#${id}-out)`}
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
              <feGaussianBlur
                stdDeviation={Math.max(0.55, Math.min(3, m.distance * 0.006))}
              />
            </filter>
            <filter
              id={id + "-halo"}
              x="-8%"
              y="-20%"
              width="116%"
              height="145%"
            >
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>
          <g mask={`url(#${id}-enter-mask)`}>
            <g
              mask={`url(#${id}-exit-mask)`}
              opacity={1 - smooth((t - 2.49) / 0.03)}
            >
              <g fill={`url(#${id}-color)`} filter={`url(#${id}-surface)`}>
                {text}
              </g>
              <g opacity={smooth((t - 2.3) / 0.1)} fill={`url(#${id}-warm)`}>
                <g filter={`url(#${id}-surface)`}>{text}</g>
                <g filter={`url(#${id}-halo)`} opacity=".3">
                  {text}
                </g>
              </g>
            </g>
          </g>
        </g>
      );
    })}
  </svg>
);

export const BloomTwoSegments = ({ music = true }: { music?: boolean }) => {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig(),
    t = f / fps;
  return (
    <AbsoluteFill style={{ background: "#fff", overflow: "hidden" }}>
      <IdeaOpening t={t} />
      {t > 1.52 && t < 2.6 && <SecondClaim t={t} />}
    </AbsoluteFill>
  );
};
