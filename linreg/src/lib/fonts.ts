import { continueRender, delayRender } from "remotion";

// Шрифты подключены через src/fonts-embed.css (data-URI, без сети).
// Дожидаемся готовности ТОЛЬКО наших шрифтов — не document.fonts.ready,
// который может зависнуть на загрузке шрифта эмодзи в headless-рендере.
export const IGRA = "IgraSans";
export const LITERAL = "Literal";

const handle = delayRender("Загрузка шрифтов", { timeoutInMilliseconds: 180000 });

Promise.all([
  document.fonts.load('400 32px "IgraSans"'),
  document.fonts.load('700 32px "Literal"'),
  // основные шрифты KaTeX, чтобы формулы не считались системным шрифтом
  document.fonts.load('400 32px "KaTeX_Main"').catch(() => null),
  document.fonts.load('italic 400 32px "KaTeX_Math"').catch(() => null),
  document.fonts.load('400 32px "KaTeX_Size2"').catch(() => null),
])
  .then(() => continueRender(handle))
  .catch((e) => {
    console.error("Шрифт не готов", e);
    continueRender(handle);
  });
