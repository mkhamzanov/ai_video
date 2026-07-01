import React from "react";
import { Audio, Sequence, staticFile } from "remotion";

// Доступные звуки в public/sfx (по смыслу). Используем ТОЛЬКО семейства, которые
// реально лежат в папке: back, blip, bloop, click, error, hover, keypress, pop,
// tap, tick, toggle. Семейства bell/chime/confirm/notify/select/success/swipe/whoosh
// удалены — логические имена ниже маппятся на выжившие файлы.
//  pop     — появление элемента/точки
//  tap     — мелкий «тык», смена шага
//  tink    — лёгкий звон, маленький акцент (tick)
//  whoosh  — смена сцены (back)
//  chime   — раскрытие важного факта, акцент (blip)
//  success — итог / финал (bloop)
//  bloop   — счётчик/число
export type SfxName =
  | "pop"
  | "tap"
  | "tink"
  | "tick"
  | "error"
  | "whoosh"
  | "chime"
  | "success"
  | "bloop";

export type SoundCue = { name: SfxName; at: number; volume?: number };

// Логическое имя → конкретный файл из пака public/sfx (только существующие семейства).
const FILE: Record<SfxName, string> = {
  pop: "pop_01",
  tap: "tap_01",
  tink: "tick_02",
  tick: "tick_01",
  error: "error_02",
  whoosh: "back_02",
  chime: "blip_03",
  success: "bloop_04",
  bloop: "bloop_02",
};

// Глобальная звуковая дорожка — по абсолютным кадрам (как субтитры).
export const SoundTrack: React.FC<{ cues: SoundCue[] }> = ({ cues }) => (
  <>
    {cues.map((c, i) => (
      <Sequence key={i} from={c.at} durationInFrames={90} name={`sfx:${c.name}`}>
        <Audio src={staticFile(`sfx/${FILE[c.name]}.mp3`)} volume={c.volume ?? 0.38} />
      </Sequence>
    ))}
  </>
);
