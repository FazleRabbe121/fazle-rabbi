import { describe, expect, it } from "vitest";
import { fillLevel, glassKind, ingredientColor, liquidColor } from "./drink";
import { checkPasscode } from "./passcode";

describe("drink picture", () => {
  it("defaults unknown glassware to highball", () => expect(glassKind("Jam jar")).toBe("highball"));
  it("matches old fashioned to rocks", () => expect(glassKind("Old Fashioned glass")).toBe("rocks"));
  it("converts 2 oz as 60 ml: 60 ml in a 180 ml coupe is one third full with no ice", () =>
    expect(fillLevel([{ name: "gin", amount: 2, unit: "oz" }], 1, "coupe", "none")).toBeCloseTo(60 / 180));
  it("colours blue curaçao blue", () => expect(ingredientColor("Blue Curaçao")?.slice(0, 3)).toEqual([30, 110, 220]));
  it("manual colour override wins", () => expect(liquidColor([{ name: "cola", amount: 50, unit: "ml" }], "#ff0000")).toBe("#ff0000"));
});
describe("passcode", () => {
  it("accepts 1710", async () => expect(await checkPasscode("1710")).toBe(true));
  it("rejects 1234", async () => expect(await checkPasscode("1234")).toBe(false));
});
