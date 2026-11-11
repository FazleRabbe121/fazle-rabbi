export const RECIPE_UNITS = ["ml", "oz", "g", "dash", "tsp", "tbsp", "barspoon", "drop", "piece"] as const;
export type RecipeUnit = (typeof RECIPE_UNITS)[number];
export const CALC_UNITS = ["ml", "oz", "cl", "dash", "tsp", "tbsp", "barspoon", "drop", "g"] as const;
export type CalcUnit = (typeof CALC_UNITS)[number];

/** Millilitres per unit. "g" assumes water density (1 g ≈ 1 ml) and is approximate. */
export const ML_PER_UNIT: Record<CalcUnit, number> = {
  ml: 1, oz: 29.5735, cl: 10, dash: 0.92, tsp: 4.92892, tbsp: 14.7868, barspoon: 5, drop: 0.05, g: 1,
};

export function convert(amount: number, from: CalcUnit, to: CalcUnit): number {
  return (amount * ML_PER_UNIT[from]) / ML_PER_UNIT[to];
}

const STEP: Record<RecipeUnit, (v: number) => number> = {
  ml: (v) => (v >= 5 ? 0.5 : 0.25),
  oz: () => 0.25,
  g: (v) => (v >= 10 ? 1 : 0.5),
  dash: () => 1,
  drop: () => 1,
  piece: () => 0.5,
  tsp: () => 0.25,
  tbsp: () => 0.25,
  barspoon: () => 0.25,
};

/** Round a scaled quantity to a practical bar measure for its unit (never rounds a positive value to 0). */
export function roundForUnit(value: number, unit: RecipeUnit): number {
  if (!isFinite(value) || value <= 0) return 0;
  const step = STEP[unit](value);
  const r = Math.round(value / step) * step;
  return Number((r === 0 ? step : r).toFixed(2));
}

export function formatAmount(n: number | null | undefined): string {
  if (n == null || !isFinite(n)) return "";
  return Number(n.toFixed(2)).toString();
}

export type Ingredient = { name: string; amount: number | null; unit: RecipeUnit; note?: string };

export function scaleIngredients(items: Ingredient[], fromServings: number, toServings: number): Ingredient[] {
  const f = fromServings > 0 ? toServings / fromServings : 1;
  return items.map((i) => ({ ...i, amount: i.amount == null ? null : roundForUnit(i.amount * f, i.unit) }));
}

export type CostRow = { name: string; bottleCost: number; bottleSizeMl: number; pourMl: number };

export function ingredientCost(r: CostRow): number {
  if (!(r.bottleSizeMl > 0)) return 0;
  return (r.bottleCost / r.bottleSizeMl) * r.pourMl;
}

export function costSummary(rows: CostRow[], extras: number, servings: number, sellingPrice: number) {
  const total = rows.reduce((s, r) => s + ingredientCost(r), 0) + (extras || 0);
  const perServing = servings > 0 ? total / servings : total;
  const marginPct = sellingPrice > 0 ? ((sellingPrice - perServing) / sellingPrice) * 100 : null;
  const pourCostPct = sellingPrice > 0 ? (perServing / sellingPrice) * 100 : null;
  return { total, perServing, marginPct, pourCostPct, profit: sellingPrice > 0 ? sellingPrice - perServing : null };
}
