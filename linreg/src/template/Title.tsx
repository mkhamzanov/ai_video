import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, FONT } from "../lib/brand";
import { ZONE } from "./format";

// Заголовок сцены вверху: маленький красный кикер + крупный заголовок.
export const Title: React.FC<{ kicker: string; title: string }> = ({ kicker, title }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(frame, [0, 14], [-16, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        top: ZONE.titleTop,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: FONT,
        opacity: op,
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          display: "inline-block",
          color: C.yellow,
          fontSize: 26,
          letterSpacing: 3,
          textTransform: "uppercase",
          fontWeight: 700,
          border: `1px solid ${C.border}`,
          background: C.bgSoft,
          borderRadius: 999,
          padding: "10px 22px",
          marginBottom: 20,
        }}
      >
        {kicker}
      </div>
      <div style={{ color: C.text, fontSize: 62, fontWeight: 700, lineHeight: 1.08 }}>{title}</div>
    </div>
  );
};
