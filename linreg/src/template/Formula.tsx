import React from "react";
import katex from "katex";

// LaTeX-формула через KaTeX. Шрифты KaTeX встроены в src/katex-embed.css (data-URI).
// Пример: <Formula tex="y = k\\cdot x + b" size={70} />
export const Formula: React.FC<{
  tex: string;
  size?: number;
  color?: string;
  display?: boolean;
}> = ({ tex, size = 64, color = "#fafafa", display = true }) => {
  const html = katex.renderToString(tex, {
    throwOnError: false,
    displayMode: display,
  });
  return (
    <span
      style={{ fontSize: size, color, lineHeight: 1.2 }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
