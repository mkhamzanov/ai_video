import React from "react";
import { Stage } from "./Stage";
import { BackgroundMusic } from "./Music";

// Корневая обёртка любого ролика: фон + контент + фоновая музыка на весь хронометраж.
// Используй её вместо <Stage> в каждом видео.
export const Reel: React.FC<{
  durationInFrames: number;
  guide?: boolean;
  musicVolume?: number;
  children: React.ReactNode;
}> = ({ durationInFrames, guide = false, musicVolume, children }) => (
  <Stage guide={guide}>
    {children}
    <BackgroundMusic durationInFrames={durationInFrames} volume={musicVolume} />
  </Stage>
);
