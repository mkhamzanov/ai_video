import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "../lib/brand";
import { ZONE } from "./format";

export type Cap = { start: number; end: number; text: string };

// *слово* — подсветка бренд-красным.
const markup = (text: string) =>
  text.split(/(\*[^*]+\*)/g).map((p, i) =>
    p.startsWith("*") && p.endsWith("*") ? (
      <span key={i} style={{ color: C.yellow, fontWeight: 700 }}>
        {p.slice(1, -1)}
      </span>
    ) : (
      <React.Fragment key={i}>{p}</React.Fragment>
    ),
  );

// Субтитры: ВЫШЕ центра и компактнее, чтобы снизу осталось место для лица автора.
// top — необязательное смещение (по умолчанию ZONE.subtitleTop). Для роликов с
// «шторкой» айфона субтитры опускают ниже notchBottom.
export const Captions: React.FC<{ track: Cap[]; top?: number }> = ({ track, top }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const active = track.find((c) => frame >= c.start && frame < c.end);
  if (!active) return null;

  const local = frame - active.start;
  const appear = spring({ frame: local, fps, config: { damping: 18, stiffness: 170 } });
  const fade = interpolate(frame, [active.end - 7, active.end], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: top ?? ZONE.subtitleTop,
        left: 80,
        right: 80,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "rgba(10,10,10,0.66)",
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          padding: "20px 30px",
          opacity: Math.min(appear, fade),
          transform: `translateY(${interpolate(appear, [0, 1], [16, 0])}px)`,
          backdropFilter: "blur(6px)",
          maxWidth: 860,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            color: C.text,
            fontSize: 44,
            lineHeight: 1.22,
            fontWeight: 500,
            textAlign: "center",
            textWrap: "balance",
          }}
        >
          {markup(active.text)}
        </div>
      </div>
    </div>
  );
};
