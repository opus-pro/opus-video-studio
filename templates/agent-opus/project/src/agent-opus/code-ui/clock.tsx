import React, { createContext, useContext } from "react";
export { sourceAt, outputAt } from "./motion";
export const EditFrame = createContext(0);
export const useEditTime = () => useContext(EditFrame) / 30;
export function MotionFilter({
  id,
  x,
  y,
}: {
  id: string;
  x: number;
  y: number;
}) {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }}>
      <defs>
        <filter
          id={id}
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation={`${x.toFixed(2)} ${y.toFixed(2)}`} />
        </filter>
      </defs>
    </svg>
  );
}
