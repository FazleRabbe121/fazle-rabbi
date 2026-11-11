import { describe, it, expect } from "vitest";
import { convert, roundForUnit, scaleIngredients, costSummary } from "./measure";

describe("measurement conversion", () => {
  it("converts 1 oz to about 29.57 ml", () => expect(convert(1, "oz", "ml")).toBeCloseTo(29.57, 2));
  it("converts 3 cl to 30 ml", () => expect(convert(3, "cl", "ml")).toBe(30));
  it("converts 1 tbsp to 3 tsp", () => expect(convert(1, "tbsp", "tsp")).toBeCloseTo(3, 2));
});

describe("recipe scaling", () => {
  it("doubles 50 ml to 100 ml for 2 servings", () => {
    const [i] = scaleIngredients([{ name: "Gin", amount: 50, unit: "ml" }], 1, 2);
    expect(i?.amount).toBe(100);
  });
  it("rounds dashes to whole numbers", () => {
    const [i] = scaleIngredients([{ name: "Bitters", amount: 2, unit: "dash" }], 4, 3);
    expect(i?.amount).toBe(2);
  });
  it("rounds oz to the nearest quarter", () => expect(roundForUnit(1.6, "oz")).toBe(1.5));
  it("keeps tiny positive amounts above zero", () => expect(roundForUnit(0.01, "drop")).toBe(1));
});

describe("cost calculator", () => {
  it("computes cost, margin and pour cost", () => {
    const s = costSummary([{ name: "Gin", bottleCost: 28, bottleSizeMl: 700, pourMl: 50 }], 0, 1, 10);
    expect(s.perServing).toBeCloseTo(2, 5);
    expect(s.pourCostPct).toBeCloseTo(20, 5);
    expect(s.marginPct).toBeCloseTo(80, 5);
  });
});
