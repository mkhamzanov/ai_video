import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../lib/brand";
import { FACE_HEIGHT, FACE_TOP, NOTCH_HEIGHT } from "./format";

// Базовая «сцена»: фирменный тёмный фон + лёгкое жёлтое свечение.
// ВЕСЬ визуальный контент рендерится ТОЛЬКО в верхних 70% кадра — нижние 30%
// (зона лица автора) остаются пустыми: контент клипается на линии faceTop.
// guide=true рисует подсказку зоны лица (только для превью).
export const Stage: React.FC<{ children: React.ReactNode; guide?: boolean }> = ({
  children,
  guide = false,
}) => (
  <AbsoluteFill style={{ backgroundColor: C.bg }}>
    <AbsoluteFill
      style={{
        background: `radial-gradient(60% 28% at 50% 5%, rgba(250,204,21,0.10), transparent 70%)`,
      }}
    />

    {/* Контент-зона: верхние 70%. Всё, что выходит за faceTop, обрезается. */}
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: FACE_TOP,
        overflow: "hidden",
      }}
    >
      {children}
    </div>

    {guide && (
      <>
        {/* зона шторки айфона — верхние 20% */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: NOTCH_HEIGHT,
            background:
              "repeating-linear-gradient(45deg, rgba(250,204,21,0.06) 0 24px, transparent 24px 48px)",
            borderBottom: `2px dashed ${C.yellow}`,
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: FONT,
              color: C.yellow,
              fontSize: 40,
              fontWeight: 700,
              opacity: 0.5,
              letterSpacing: 2,
            }}
          >
            ШТОРКА · 20%
          </span>
        </div>

        {/* зона лица — нижние 30% */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: FACE_TOP,
            height: FACE_HEIGHT,
            background:
              "repeating-linear-gradient(45deg, rgba(250,204,21,0.06) 0 24px, transparent 24px 48px)",
            borderTop: `2px dashed ${C.yellow}`,
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: FONT,
              color: C.yellow,
              fontSize: 40,
              fontWeight: 700,
              opacity: 0.5,
              letterSpacing: 2,
            }}
          >
            ЗОНА ЛИЦА · 30%
          </span>
        </div>
      </>
    )}
  </AbsoluteFill>
);
