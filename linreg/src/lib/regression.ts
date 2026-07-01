// Данные и вся математика линейной регрессии.
// Всё детерминировано (никакого Math.random) — нужно для воспроизводимого рендера.

export type Point = { x: number; y: number };

// Облако точек с примерно линейным трендом (y ≈ 0.7·x + 1.5 + шум).
export const DATA: Point[] = [
  { x: 0.5, y: 2.1 },
  { x: 1.2, y: 2.0 },
  { x: 1.8, y: 3.4 },
  { x: 2.5, y: 3.0 },
  { x: 3.1, y: 4.2 },
  { x: 3.9, y: 3.8 },
  { x: 4.6, y: 5.5 },
  { x: 5.3, y: 4.9 },
  { x: 6.0, y: 6.3 },
  { x: 6.8, y: 6.0 },
  { x: 7.5, y: 7.4 },
  { x: 8.2, y: 6.8 },
  { x: 8.9, y: 8.1 },
  { x: 9.5, y: 7.6 },
];

const n = DATA.length;
const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;

// Среднеквадратичная ошибка для прямой y = k·x + b.
export const mse = (k: number, b: number): number => {
  let s = 0;
  for (const p of DATA) {
    const e = k * p.x + b - p.y;
    s += e * e;
  }
  return s / n;
};

// Аналитическое решение методом наименьших квадратов (OLS).
const xbar = mean(DATA.map((p) => p.x));
const ybar = mean(DATA.map((p) => p.y));
let sxy = 0;
let sxx = 0;
for (const p of DATA) {
  sxy += (p.x - xbar) * (p.y - ybar);
  sxx += (p.x - xbar) ** 2;
}
export const OLS = {
  k: sxy / sxx, // ≈ 0.6746
  b: ybar - (sxy / sxx) * xbar, // ≈ 1.7154
};
export const OLS_COST = mse(OLS.k, OLS.b); // ≈ 0.2229

export type GdStep = { k: number; b: number; cost: number };

// Траектория градиентного спуска от (k=0, b=0).
export function gradientDescent(lr = 0.015, steps = 400): GdStep[] {
  let k = 0;
  let b = 0;
  const path: GdStep[] = [{ k, b, cost: mse(k, b) }];
  for (let i = 0; i < steps; i++) {
    let dk = 0;
    let db = 0;
    for (const p of DATA) {
      const e = k * p.x + b - p.y;
      dk += e * p.x;
      db += e;
    }
    dk = (2 * dk) / n;
    db = (2 * db) / n;
    k -= lr * dk;
    b -= lr * db;
    path.push({ k, b, cost: mse(k, b) });
  }
  return path;
}

export const GD_PATH = gradientDescent(0.015, 400);
export const GD_MAX_COST = GD_PATH[0].cost;
