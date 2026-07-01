import React from "react";
import { C, DOMAIN, FONT } from "../lib/brand";

export type Scales = {
  sx: (x: number) => number;
  sy: (y: number) => number;
  size: number;
  pad: number;
};

type Props = {
  size: number;
  pad?: number;
  xLabel?: string;
  yLabel?: string;
  children: (s: Scales) => React.ReactNode;
};

// Квадратная координатная плоскость для вертикального формата.
export const Plot: React.FC<Props> = ({
  size,
  pad = 64,
  xLabel = "x",
  yLabel = "y",
  children,
}) => {
  const { xMin, xMax, yMin, yMax } = DOMAIN;
  const sx = (x: number) => pad + ((x - xMin) / (xMax - xMin)) * (size - 2 * pad);
  const sy = (y: number) =>
    size - pad - ((y - yMin) / (yMax - yMin)) * (size - 2 * pad);
  const ticks = [0, 2, 4, 6, 8, 10];

  return (
    <svg width={size} height={size} style={{ overflow: "visible" }}>
      {/* фоновая карточка графика */}
      <rect
        x={pad - 28}
        y={pad - 28}
        width={size - 2 * pad + 56}
        height={size - 2 * pad + 56}
        rx={20}
        fill={C.bgSoft}
        stroke={C.border}
        strokeWidth={1.5}
      />

      {/* сетка */}
      {ticks.map((t) => (
        <React.Fragment key={`g${t}`}>
          <line x1={sx(t)} y1={sy(yMin)} x2={sx(t)} y2={sy(yMax)} stroke={C.border} strokeWidth={1} />
          <line x1={sx(xMin)} y1={sy(t)} x2={sx(xMax)} y2={sy(t)} stroke={C.border} strokeWidth={1} />
        </React.Fragment>
      ))}

      {/* оси */}
      <line x1={sx(xMin)} y1={sy(yMin)} x2={sx(xMax)} y2={sy(yMin)} stroke={C.borderSoft} strokeWidth={3} />
      <line x1={sx(xMin)} y1={sy(yMin)} x2={sx(xMin)} y2={sy(yMax)} stroke={C.borderSoft} strokeWidth={3} />

      {/* подписи осей */}
      <text x={sx(xMax)} y={sy(yMin) + 46} fill={C.muted} fontSize={30} fontFamily={FONT} textAnchor="end">
        {xLabel}
      </text>
      <text
        x={sx(xMin) - 30}
        y={sy(yMax) - 16}
        fill={C.muted}
        fontSize={30}
        fontFamily={FONT}
        textAnchor="middle"
      >
        {yLabel}
      </text>

      {children({ sx, sy, size, pad })}
    </svg>
  );
};
