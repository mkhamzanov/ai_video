import React from "react";
import { Series } from "remotion";
import { Reel, Title, Captions, SoundTrack, EndCard } from "../../template";
import { CAPS, CUES, DUR, TOTAL } from "./timeline";

export { TOTAL };

// ПРИМЕР-ЗАГОТОВКА движка (без реального контента).
// Скопируй папку `_example`, переименуй, замени тексты/сцены — и получишь новый ролик.
// guide=true в превью показывает зону лица автора и «шторку» айфона.
export const Example: React.FC<{ guide?: boolean }> = ({ guide = false }) => {
  return (
    <Reel durationInFrames={TOTAL} guide={guide}>
      <Series>
        <Series.Sequence durationInFrames={DUR.hook}>
          <Title kicker="ПРИМЕР" title="Заголовок ролика" />
        </Series.Sequence>
        <Series.Sequence durationInFrames={DUR.point1}>
          <Title kicker="Шаг 1" title="Первая мысль" />
        </Series.Sequence>
        <Series.Sequence durationInFrames={DUR.point2}>
          <Title kicker="Шаг 2" title="Вторая мысль" />
        </Series.Sequence>
        <Series.Sequence durationInFrames={DUR.end}>
          <EndCard guide={guide} avatar="avatar.example.jpg" />
        </Series.Sequence>
      </Series>

      <Captions track={CAPS} />
      <SoundTrack cues={CUES} />
    </Reel>
  );
};
