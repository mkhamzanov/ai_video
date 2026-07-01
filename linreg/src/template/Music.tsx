import React from "react";
import { Audio, interpolate, staticFile } from "remotion";

// Фоновая музыка (radiohead) на ВЕСЬ ролик.
// Громкость = уровень оригинала main_music_radiohead.MOV (volume = 1).
// Крошечные fade-in/out (по ~6 кадров) только чтобы убрать щелчки на стыках.
export const BackgroundMusic: React.FC<{
  durationInFrames: number;
  volume?: number;
}> = ({ durationInFrames, volume = 1 }) => {
  return (
    <Audio
      src={staticFile("music/radiohead.mp3")}
      volume={(f) =>
        interpolate(
          f,
          [0, 6, durationInFrames - 8, durationInFrames - 1],
          [0, volume, volume, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
      }
    />
  );
};
