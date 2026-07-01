// ЕДИНЫЙ ФОРМАТ ВСЕХ РОЛИКОВ (вертикальный Reels под iPhone).
export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
};

// ЗОНЫ КАДРА (в пикселях по вертикали).
// ВАЖНО: нижние 30% экрана зарезервированы под ЛИЦО автора (talking-head) —
// туда НИЧЕГО не рисуем. Весь контент, субтитры и заголовок живут в верхних 70%.
//
//   0 ─────────────── titleTop (заголовок/кикер)
//                     subtitleTop (субтитры)
//                     contentTop … contentBottom (анимация/графики)
//   1344 ──────────── faceTop  ← начало зоны лица
//   1920 ─────────────────────  низ кадра (нижние 30% = лицо, ПУСТО)
export const FACE_RATIO = 0.3; // нижние 30% под лицо
export const FACE_HEIGHT = Math.round(VIDEO.height * FACE_RATIO); // 576
export const FACE_TOP = VIDEO.height - FACE_HEIGHT; // 1344 — линия начала зоны лица

// ВЕРХНЯЯ ЗОНА — «шторка» айфона (Dynamic Island / статус-бар).
// Верхние 20% кадра перекрываются системной шторкой → туда тоже НИЧЕГО важного.
export const NOTCH_RATIO = 0.2; // верхние 20% под шторку
export const NOTCH_HEIGHT = Math.round(VIDEO.height * NOTCH_RATIO); // 384
export const NOTCH_BOTTOM = NOTCH_HEIGHT; // 384 — линия конца зоны шторки

export const ZONE = {
  titleTop: 70, // заголовок/кикер
  subtitleTop: 300, // субтитры — сверху
  contentTop: 560, // основная анимация
  contentBottom: 1300, // НИЖЕ нельзя — дальше зона лица (1344+)
  faceTop: FACE_TOP, // 1344 — всё, что ниже, занимает автор лицом
  notchBottom: NOTCH_BOTTOM, // 384 — всё, что ВЫШЕ, перекрывает шторка айфона
};
