/** Pure maths for the code-drawn drink picture: glass detection, fill level and liquid colour. */
export type GlassKind = "highball" | "collins" | "rocks" | "margarita" | "coupe" | "martini" | "flute" | "hurricane" | "wine" | "copper" | "shot" | "irish";
export type IceKind = "cubed" | "crushed" | "large" | "sphere" | "none";
type Ing = { name: string; amount: number | null; unit: string };

const GLASS_KEYS: [RegExp, GlassKind][] = [
  [/irish/i, "irish"], [/copper|mule/i, "copper"], [/collins/i, "collins"], [/rocks|old.?fashion|lowball|tumbler/i, "rocks"],
  [/margarita/i, "margarita"], [/coupe/i, "coupe"], [/martini|cocktail glass/i, "martini"], [/flute|champagne/i, "flute"],
  [/hurricane|tiki/i, "hurricane"], [/wine|goblet|balloon/i, "wine"], [/shot/i, "shot"], [/highball/i, "highball"],
];
export function glassKind(text: string | null | undefined): GlassKind {
  const t = text ?? "";
  return GLASS_KEYS.find(([re]) => re.test(t))?.[1] ?? "highball";
}
export const GLASS_CAPACITY_ML: Record<GlassKind, number> = {
  highball: 350, collins: 400, rocks: 300, margarita: 300, coupe: 180, martini: 180, flute: 180, hurricane: 450, wine: 400, copper: 350, shot: 60, irish: 250,
};

export function iceKind(text: string | null | undefined): IceKind {
  const t = (text ?? "").toLowerCase();
  if (!t.trim() || /no ice|none|neat|up/.test(t)) return "none";
  if (/crush|pebble|shaved/.test(t)) return "crushed";
  if (/sphere|ball/.test(t)) return "sphere";
  if (/large|block|big/.test(t)) return "large";
  return "cubed";
}

export const UNIT_ML: Record<string, number> = { ml: 1, oz: 30, cl: 10, dash: 1, tsp: 5, tbsp: 15, barspoon: 5, drop: 0.05 };
export const ingredientMl = (i: Ing) => (i.amount ?? 0) * (UNIT_ML[i.unit] ?? 0);

/** Fraction (0–0.92) of the glass filled, per single serving, including ice displacement. */
export function fillLevel(ings: Ing[], servings: number, glass: GlassKind, ice: IceKind): number {
  const cap = GLASS_CAPACITY_ML[glass];
  const liquid = ings.reduce((s, i) => s + ingredientMl(i), 0) / (servings > 0 ? servings : 1);
  if (liquid <= 0) return 0;
  const iceFrac = { none: 0, cubed: 0.35, crushed: 0.4, large: 0.25, sphere: 0.25 }[ice];
  return Math.min(0.92, Math.max(0.12, liquid / cap + (iceFrac * Math.min(1, liquid / (cap * 0.4)))));
}

type C = [number, number, number, number]; // r,g,b,alpha
const COLORS: [RegExp, C][] = [
  [/blue cura[cç]ao|blue/i, [30, 110, 220, 0.9]],
  [/grenadine|campari/i, [200, 20, 40, 0.92]],
  [/aperol/i, [240, 90, 40, 0.9]],
  [/sweet vermouth|red wine|port\b/i, [110, 20, 35, 0.92]],
  [/dry vermouth|prosecco|champagne|cava|sparkling/i, [235, 210, 140, 0.55]],
  [/coconut|cream|milk|baileys|yogh?urt|egg white/i, [245, 238, 220, 0.97]],
  [/coffee|espresso|kahl[uú]a|chocolate|cocoa|cola|stout/i, [60, 32, 18, 0.97]],
  [/dark rum|spiced rum|whisk|bourbon|scotch|rye|cognac|brandy|amaretto|ginger beer|ale/i, [190, 110, 35, 0.85]],
  [/white rum|vodka|gin\b|tequila|blanco|tonic|soda|water|syrup|triple sec|cointreau|sake|mezcal/i, [235, 240, 238, 0.18]],
  [/strawberr|raspberr|cranberr|cherr|pomegranate|watermelon|hibiscus/i, [205, 30, 70, 0.9]],
  [/passion|mango|peach|apricot|orange|blood orange/i, [245, 140, 30, 0.88]],
  [/pineapple|lemon|banana|grapefruit|elderflower/i, [245, 225, 120, 0.75]],
  [/lime|melon|midori|kiwi|cucumber|apple/i, [170, 215, 90, 0.75]],
  [/mint|cr[eè]me de menthe|chartreuse|matcha/i, [60, 170, 80, 0.85]],
  [/\brum\b/i, [215, 170, 90, 0.5]],
  [/tomato/i, [190, 40, 30, 0.92]],
];
export function ingredientColor(name: string): C | null {
  return COLORS.find(([re]) => re.test(name))?.[1] ?? null;
}
/** Volume-weighted average colour of matched ingredients; returns "rgba(...)". */
export function liquidColor(ings: Ing[], override?: string | null): string {
  if (override && /^#[0-9a-f]{6}$/i.test(override)) return override;
  let w = 0, r = 0, g = 0, b = 0, a = 0;
  for (const i of ings) {
    const c = ingredientColor(i.name); if (!c) continue;
    const wt = Math.max(ingredientMl(i), i.unit === "piece" || i.unit === "g" ? 10 : 0.5);
    w += wt; r += c[0] * wt; g += c[1] * wt; b += c[2] * wt; a += c[3] * wt;
  }
  if (!w) return "rgba(235,225,200,0.35)";
  return `rgba(${Math.round(r / w)},${Math.round(g / w)},${Math.round(b / w)},${(a / w).toFixed(2)})`;
}

export type GarnishKind = "lime" | "lemon" | "orange" | "cherry" | "mint" | "olive" | "pineapple" | "salt" | "sugar" | "cinnamon" | "beans" | "umbrella" | "cream";
const GARNISH_KEYS: [RegExp, GarnishKind][] = [
  [/salt/i, "salt"], [/sugar/i, "sugar"], [/lime/i, "lime"], [/lemon/i, "lemon"], [/orange/i, "orange"], [/cherr/i, "cherry"], [/mint/i, "mint"],
  [/olive/i, "olive"], [/pineapple/i, "pineapple"], [/cinnamon/i, "cinnamon"], [/coffee|bean/i, "beans"], [/umbrella/i, "umbrella"], [/whip|cream/i, "cream"],
];
export function garnishKinds(text: string | null | undefined): GarnishKind[] {
  const t = text ?? ""; if (/^\s*none\s*$/i.test(t)) return [];
  return GARNISH_KEYS.filter(([re]) => re.test(t)).map(([, k]) => k);
}
