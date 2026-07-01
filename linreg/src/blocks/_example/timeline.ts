import type { Cap } from "../../template";
import type { SoundCue } from "../../template/Sound";

// ПРИМЕР-ЗАГОТОВКА движка: показывает каркас ролика (сцены + субтитры + звуки).
// Реального контента/идей здесь НЕТ — копируй папку и наполняй своим.
// Реальные ролики хранятся ЛОКАЛЬНО, вне git (см. README → «Движок и локальный контент»).
export const DUR = {
  hook: 90, // крючок
  point1: 300, // первая мысль
  point2: 300, // вторая мысль
  end: 120, // EndCard
};

export const TOTAL = DUR.hook + DUR.point1 + DUR.point2 + DUR.end;

export const OFF = {
  hook: 0,
  point1: DUR.hook,
  point2: DUR.hook + DUR.point1,
  end: DUR.hook + DUR.point1 + DUR.point2,
};

// Субтитры = сценарий озвучки. Одна реплика — одна мысль, ≤ ~42 символа,
// пауза 10–15 кадров между репликами. *слово* — жёлтый акцент.
export const CAPS: Cap[] = [
  { start: 8, end: 86, text: "Здесь — *крючок* ролика" },
  { start: 100, end: 200, text: "Первая мысль простыми словами" },
  { start: 210, end: 296, text: "Одна реплика — *одна* идея" },
  { start: 400, end: 500, text: "Вторая мысль, тоже коротко" },
  { start: 510, end: 596, text: "Пауза между репликами — *отдых* глазу" },
];

// Звуки по смыслу (мягкие).
export const CUES: SoundCue[] = [
  { name: "whoosh", at: 2 },
  { name: "chime", at: 14 },
  { name: "whoosh", at: OFF.point1 },
  { name: "pop", at: OFF.point1 + 20 },
  { name: "whoosh", at: OFF.point2 },
  { name: "success", at: OFF.end + 6 },
];
