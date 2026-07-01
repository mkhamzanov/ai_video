import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, FONT } from "../lib/brand";

// Финал ролика: круглая аватарка автора + «Подписывайся».
// Финальное фото автора. По умолчанию — public/avatar.jpg (ЛОКАЛЬНЫЙ файл, в git
// не хранится). Пример-ролик передаёт avatar="avatar.example.jpg" (плейсхолдер в git),
// чтобы `example` рендерился без личной фотки. Занимает весь экран.
export const EndCard: React.FC<{ guide?: boolean; avatar?: string }> = ({
  avatar = "avatar.jpg",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const title = spring({ frame, fps, config: { damping: 14 } });
  const ava = spring({ frame: frame - 12, fps, config: { damping: 12, stiffness: 120 } });
  const hint = spring({ frame: frame - 30, fps, config: { damping: 16 } });
  const pulse = 1 + 0.03 * Math.sin(frame / 9);
  const ring = 0.5 + 0.5 * Math.sin(frame / 9);
  const arrow = interpolate(frame % 40, [0, 20, 40], [0, 14, 0]);

  const D = 460; // диаметр аватарки

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT,
        gap: 70,
      }}
    >
      <div
        style={{
          color: C.yellow,
          fontSize: 92,
          fontWeight: 700,
          opacity: title,
          transform: `translateY(${interpolate(title, [0, 1], [26, 0])}px)`,
        }}
      >
        Подписывайся
      </div>

      {/* круглая аватарка с красным кольцом и пульсом */}
      <div
        style={{
          width: D,
          height: D,
          borderRadius: "50%",
          padding: 10,
          background: `conic-gradient(${C.yellow}, ${C.yellowSoft}, ${C.yellow})`,
          opacity: ava,
          transform: `scale(${Math.min(ava, 1) * pulse})`,
          boxShadow: `0 0 ${40 + ring * 60}px rgba(250,204,21,${0.30 + ring * 0.35})`,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            overflow: "hidden",
            border: `6px solid ${C.bg}`,
          }}
        >
          <Img
            src={staticFile(avatar)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>

      <div style={{ textAlign: "center", opacity: hint }}>
        <div style={{ color: C.muted, fontSize: 44 }}>
          новые ролики про <span style={{ color: C.text, fontWeight: 700 }}>ИИ</span> и{" "}
          <span style={{ color: C.text, fontWeight: 700 }}>математику</span>
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 64,
            transform: `translateY(${arrow}px)`,
          }}
        >
          🔔 👆
        </div>
      </div>
    </AbsoluteFill>
  );
};
