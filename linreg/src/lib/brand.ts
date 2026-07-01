import { IGRA } from "./fonts";

// ОСНОВНАЯ ТЕМА: чёрный фон + жёлтый и белый шрифт.
// На светлом (белом) фоне текст — чёрный (C.ink).
export const C = {
  bg: "#0a0a0a", // чёрный фон
  bgSoft: "#111111",
  card: "#141414",
  border: "#262626",
  borderSoft: "#333333",
  text: "#ffffff", // белый текст
  muted: "#b3b3b3",
  mutedDim: "#777777",
  ink: "#0a0a0a", // чёрный текст для светлого/белого фона

  // главный акцент — жёлтый
  yellow: "#facc15",
  yellowSoft: "#fde047",
  accent: "#facc15",

  // вспомогательные цвета для графиков (нужны разные оттенки)
  red: "#f87171",
  green: "#4ade80",
  amber: "#f59e0b",
  violet: "#9e8cfc",
  blue: "#52a9ff",

  point: "#ffffff", // точки данных — белые
};

export const FONT = `${IGRA}, system-ui, sans-serif`;

// Логические координаты графика
export const DOMAIN = { xMin: 0, xMax: 10, yMin: 0, yMax: 10 };
