import React from "react";
import { useCurrentFrame } from "remotion";
import { Frame, Mark, Text, ease, mix, pos } from "./shared";
export type BrandProps = {
  brand: string;
  background: string;
  ink: string;
  accent: string;
  symbol: { construction: string; diameter: number; capsuleWidth: number };
  showWordmark: boolean;
  variant: "lockup" | "bloom" | "spin" | "gather";
  timing: {
    growEnd: number;
    rotationEnd: number;
    travelStart: number;
    travelEnd: number;
    wordStart: number;
    wordEnd: number;
  };
  geometry: {
    centerX: number;
    centerY: number;
    lockupSize: number;
    lockupX: number;
  };
};
const base = {
  brand: "forma",
  symbol: {
    construction: "four-capsule-union",
    diameter: 130,
    capsuleWidth: 30,
  },
  geometry: { centerX: 480, centerY: 270, lockupSize: 80, lockupX: 370 },
  timing: {
    growEnd: 19,
    rotationEnd: 21,
    travelStart: 25,
    travelEnd: 40,
    wordStart: 27,
    wordEnd: 42,
  },
};
export const brandDefaults: Record<string, BrandProps> = {
  "study-brand-lockup": {
    ...base,
    variant: "lockup",
    background: "#eaf2f5",
    ink: "#17272f",
    accent: "#246b99",
    showWordmark: true,
    timing: { ...base.timing, growEnd: 18 },
  },
  "study-brand-bloom": {
    ...base,
    variant: "bloom",
    background: "#faf8fa",
    ink: "#28232c",
    accent: "#ad3870",
    showWordmark: false,
  },
  "study-brand-spin": {
    ...base,
    variant: "spin",
    background: "#f7f8fa",
    ink: "#151619",
    accent: "#3455db",
    showWordmark: false,
    timing: { ...base.timing, growEnd: 20, rotationEnd: 24 },
  },
  "study-brand-gather": {
    ...base,
    variant: "gather",
    background: "#f8f8f6",
    ink: "#222626",
    accent: "#d85548",
    showWordmark: false,
  },
};
export const Brand: React.FC<BrandProps> = (p) => {
  const f = useCurrentFrame(),
    lock = p.variant === "lockup",
    d = lock ? p.geometry.lockupSize : p.symbol.diameter;
  const sc = mix(lock ? 0.2 : 0.12, 1, ease(f, 0, p.timing.growEnd)),
    x = lock
      ? mix(
          p.geometry.centerX,
          p.geometry.lockupX,
          ease(f, p.timing.travelStart, p.timing.travelEnd),
        )
      : p.geometry.centerX;
  const rot =
    p.variant === "bloom"
      ? mix(-95, 0, ease(f, 0, p.timing.rotationEnd))
      : p.variant === "spin"
        ? mix(-180, 0, ease(f, 0, p.timing.rotationEnd))
        : 0;
  return (
    <Frame background={p.background}>
      <Mark
        size={d}
        color={p.ink}
        style={{
          ...pos(x - d / 2, p.geometry.centerY - d / 2, d, d),
          transform: `scale(${sc}) rotate(${rot}deg)`,
          filter: `blur(${mix(lock ? 5 : 7, 0, ease(f, 0, lock ? 12 : 15))}px)`,
        }}
      />
      {lock && p.showWordmark && (
        <Text
          text={p.brand}
          x={455}
          y={239}
          w={300}
          h={62}
          size={48}
          min={25}
          bold
          color={p.ink}
          lineHeight={62}
          style={{
            opacity: ease(f, p.timing.wordStart, p.timing.wordEnd),
            transform: `translateX(${mix(18, 0, ease(f, p.timing.wordStart, p.timing.wordEnd))}px)`,
            filter: `blur(${mix(12, 0, ease(f, p.timing.wordStart, p.timing.wordEnd))}px)`,
          }}
        />
      )}
      {p.variant === "gather" &&
        [
          [180, 270],
          [780, 270],
          [480, 60],
          [480, 480],
        ].map(([a, b], i) => (
          <div
            key={i}
            style={{
              ...pos(
                mix(a, 480, ease(f, 0, 22)) - 15,
                mix(b, 270, ease(f, 0, 22)) - 15,
                30,
                30,
              ),
              background: p.accent,
              borderRadius: 2,
              opacity: 1 - ease(f, 28, 35),
              transform: `rotate(${mix(0, 90, ease(f, 0, 22))}deg) scale(${mix(1, 0.72, ease(f, 28, 35))})`,
            }}
          />
        ))}
    </Frame>
  );
};
