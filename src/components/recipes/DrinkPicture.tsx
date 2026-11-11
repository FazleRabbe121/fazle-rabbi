import { useId } from "react";
import { fillLevel, garnishKinds, glassKind, iceKind, liquidColor, type GlassKind } from "@/lib/drink";

export type DrinkPictureData = {
  name: string; glassware: string | null; ice_type: string | null; garnish: string | null;
  ingredients: { name: string; amount: number | null; unit: string }[]; servings: number | string; drink_color?: string | null;
};

type Spec = { bowl: string; top: number; bottom: number; rimL: number; rimR: number; stem?: [number, number]; handle?: string; widthAt: (y: number) => number };
const lin = (y0: number, w0: number, y1: number, w1: number) => (y: number) => w0 + ((y - y0) / (y1 - y0)) * (w1 - w0);
const H = "M130 105 C160 105 160 175 128 175";
const SPECS: Record<GlassKind, Spec> = {
  highball: { bowl: "M70 60 L74 208 Q100 213 126 208 L130 60 Z", top: 60, bottom: 208, rimL: 70, rimR: 130, widthAt: lin(60, 30, 208, 26) },
  collins: { bowl: "M75 36 L76 210 Q100 214 124 210 L125 36 Z", top: 36, bottom: 210, rimL: 75, rimR: 125, widthAt: lin(36, 25, 210, 24) },
  rocks: { bowl: "M58 118 L64 208 Q100 213 136 208 L142 118 Z", top: 118, bottom: 208, rimL: 58, rimR: 142, widthAt: lin(118, 42, 208, 36) },
  shot: { bowl: "M80 156 L86 210 Q100 213 114 210 L120 156 Z", top: 156, bottom: 210, rimL: 80, rimR: 120, widthAt: lin(156, 20, 210, 14) },
  coupe: { bowl: "M48 92 Q50 150 100 150 Q150 150 152 92 Z", top: 92, bottom: 150, rimL: 48, rimR: 152, stem: [150, 208], widthAt: lin(92, 52, 150, 20) },
  martini: { bowl: "M42 70 L100 140 L158 70 Z", top: 70, bottom: 140, rimL: 42, rimR: 158, stem: [140, 208], widthAt: lin(70, 58, 140, 0) },
  margarita: { bowl: "M44 74 C46 104 84 96 88 118 Q100 136 112 118 C116 96 154 104 156 74 Z", top: 74, bottom: 132, rimL: 44, rimR: 156, stem: [132, 208], widthAt: lin(74, 56, 132, 10) },
  flute: { bowl: "M86 38 L84 146 Q100 162 116 146 L114 38 Z", top: 38, bottom: 158, rimL: 86, rimR: 114, stem: [158, 208], widthAt: lin(38, 14, 158, 10) },
  wine: { bowl: "M68 58 C60 120 72 158 100 158 C128 158 140 120 132 58 Z", top: 58, bottom: 158, rimL: 68, rimR: 132, stem: [158, 208], widthAt: lin(58, 32, 158, 20) },
  hurricane: { bowl: "M72 36 C58 78 86 100 80 130 C74 160 68 184 86 194 L114 194 C132 184 126 160 120 130 C114 100 142 78 128 36 Z", top: 36, bottom: 194, rimL: 72, rimR: 128, stem: [194, 208], widthAt: lin(36, 28, 194, 16) },
  copper: { bowl: "M62 90 L64 206 Q96 212 128 206 L130 90 Z", top: 90, bottom: 206, rimL: 62, rimR: 130, handle: H, widthAt: lin(90, 34, 206, 32) },
  irish: { bowl: "M70 66 L74 156 Q100 166 126 156 L130 66 Z", top: 66, bottom: 162, rimL: 70, rimR: 130, stem: [162, 208], handle: "M129 80 C156 80 156 140 127 140", widthAt: lin(66, 30, 162, 22) },
};

/** Code-drawn SVG of a drink from its recipe fields — no image model, no network. */
export function DrinkPicture({ recipe, className, stroke = "currentColor", size }: { recipe: DrinkPictureData; className?: string; stroke?: string; size?: number }) {
  const uid = useId().replace(/:/g, "");
  const g = glassKind(recipe.glassware); const s = SPECS[g];
  const ice = iceKind(recipe.ice_type);
  const fill = fillLevel(recipe.ingredients, Number(recipe.servings) || 1, g, ice);
  const color = liquidColor(recipe.ingredients, recipe.drink_color);
  const garnish = garnishKinds(recipe.garnish);
  const surf = s.bottom - fill * (s.bottom - s.top);
  const hasLiquid = fill > 0;
  const cx = 100, rimY = s.top;
  const label = `Illustration of ${recipe.name || "a drink"} in a ${g === "copper" ? "copper mug" : g === "irish" ? "Irish coffee mug" : `${g} glass`}${ice !== "none" ? `, with ${recipe.ice_type?.toLowerCase()} ice` : ""}${garnish.length ? `, garnished with ${recipe.garnish}` : ""}`;
  const iceTop = hasLiquid ? Math.max(surf - 6, s.top + 4) : s.bottom - 40;
  const wAt = (y: number) => s.widthAt(Math.min(s.bottom, Math.max(s.top, y)));
  const cubes: [number, number, number][] = [];
  if (ice === "cubed") for (let row = 0; row < 4; row++) { const y = iceTop + row * 24; if (y > s.bottom - 14) break; const w = wAt(y + 10); const n = Math.max(1, Math.floor((w * 2) / 26)); for (let k = 0; k < n; k++) cubes.push([cx - w + 6 + k * ((w * 2 - 12) / n), y, Math.min(20, (w * 2 - 12) / n - 3)]); }
  if (ice === "large") { const w = Math.min(28, wAt(s.bottom - 30) - 4); cubes.push([cx - w, s.bottom - w * 2 - 4, w * 2]); }
  const dots: [number, number][] = [];
  if (ice === "crushed") for (let y = iceTop; y < s.bottom - 4; y += 7) { const w = wAt(y); for (let x = cx - w + 4 + ((y / 7) % 2) * 3; x < cx + w - 3; x += 9) dots.push([x, y]); }

  return (
    <svg role="img" aria-label={label} viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" className={className} width={size} height={size ? size * 1.2 : undefined}>
      <title>{label}</title>
      <defs><clipPath id={`b${uid}`}><path d={s.bowl} /></clipPath>
        <linearGradient id={`s${uid}`} x1="0" x2="1"><stop offset="0" stopColor="#ffffff" stopOpacity="0.35" /><stop offset="0.3" stopColor="#ffffff" stopOpacity="0" /></linearGradient></defs>
      <ellipse cx="100" cy="222" rx="54" ry="6" fill={stroke} opacity="0.12" />
      {g === "copper" && <path d={s.bowl} fill="#b87333" />}
      {s.handle && <path d={s.handle} fill="none" stroke={g === "copper" ? "#9a5a26" : stroke} strokeWidth="7" strokeLinecap="round" />}
      <g clipPath={`url(#b${uid})`}>
        <rect x="0" y="0" width="200" height="240" fill={stroke} opacity="0.05" />
        {hasLiquid && <rect x="0" y={surf} width="200" height="240" fill={color} />}
        {hasLiquid && <rect x="0" y={surf} width="200" height="3" fill="#ffffff" opacity="0.25" />}
        {cubes.map(([x, y, w], i) => <rect key={i} x={x} y={y} width={w} height={w} rx="3" fill="#ffffff" fillOpacity="0.3" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1" />)}
        {dots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.6" fill="#ffffff" fillOpacity="0.55" />)}
        {ice === "sphere" && <circle cx={cx} cy={s.bottom - Math.min(26, wAt(s.bottom - 26) - 4) - 4} r={Math.min(26, wAt(s.bottom - 26) - 4)} fill="#ffffff" fillOpacity="0.3" stroke="#ffffff" strokeOpacity="0.7" />}
        {garnish.includes("beans") && hasLiquid && [-12, 0, 12].map((d) => <ellipse key={d} cx={cx + d} cy={surf + 2} rx="5" ry="3.5" fill="#3b2314" />)}
        <rect x="0" y="0" width="200" height="240" fill={`url(#s${uid})`} />
      </g>
      {g !== "copper" && <path d={s.bowl} fill="none" stroke={stroke} strokeWidth="2.2" strokeLinejoin="round" />}
      {g === "copper" && <ellipse cx="96" cy="90" rx="34" ry="4" fill="none" stroke="#e0a070" strokeWidth="2" />}
      {s.stem && <><line x1="100" y1={s.stem[0]} x2="100" y2={s.stem[1]} stroke={stroke} strokeWidth="3" /><ellipse cx="100" cy={s.stem[1] + 2} rx="30" ry="5" fill="none" stroke={stroke} strokeWidth="2.2" /></>}
      {(garnish.includes("salt") || garnish.includes("sugar")) && Array.from({ length: 14 }).map((_, i) => <circle key={i} cx={s.rimL + ((s.rimR - s.rimL) * i) / 13} cy={rimY + 1 + (i % 2)} r="2.2" fill={garnish.includes("salt") ? "#f4f4f4" : "#f3e3b5"} stroke={stroke} strokeOpacity="0.3" strokeWidth="0.5" />)}
      {garnish.includes("cream") && <g fill="#fbf7ee" stroke={stroke} strokeOpacity="0.25">{[-1, 0, 1].map((k) => <circle key={k} cx={cx + k * ((s.rimR - s.rimL) / 4)} cy={Math.min(rimY, hasLiquid ? surf : rimY) - 4} r={(s.rimR - s.rimL) / 5} />)}<circle cx={cx} cy={Math.min(rimY, hasLiquid ? surf : rimY) - 16} r={(s.rimR - s.rimL) / 6} /></g>}
      {garnish.includes("cinnamon") && <rect x={cx + 6} y={rimY - 40} width="7" height="70" rx="2" fill="#7b4a26" transform={`rotate(14 ${cx + 9} ${rimY})`} />}
      {garnish.includes("olive") && <g><line x1={cx - 30} y1={rimY - 26} x2={cx + 6} y2={Math.max(surf, rimY) + 22} stroke="#c9a86a" strokeWidth="2" /><circle cx={cx - 6} cy={Math.max(surf, rimY) + 8} r="7" fill="#6b8e23" /><circle cx={cx - 6} cy={Math.max(surf, rimY) + 8} r="2.2" fill="#c0392b" /></g>}
      {(["lime", "lemon", "orange"] as const).filter((k) => garnish.includes(k)).map((k, i) => { const col = { lime: ["#7cb342", "#dcedc8"], lemon: ["#f4d03f", "#fff7c2"], orange: ["#f39c12", "#ffe0b2"] }[k]; const x = s.rimR - 4 - i * 16, y = rimY - 2; return <g key={k}><circle cx={x} cy={y} r="15" fill={col[0]} /><circle cx={x} cy={y} r="12" fill={col[1]} />{[0, 60, 120].map((a) => <line key={a} x1={x - 12 * Math.cos((a * Math.PI) / 180)} y1={y - 12 * Math.sin((a * Math.PI) / 180)} x2={x + 12 * Math.cos((a * Math.PI) / 180)} y2={y + 12 * Math.sin((a * Math.PI) / 180)} stroke={col[0]} strokeWidth="1.2" />)}</g>; })}
      {garnish.includes("pineapple") && <g transform={`translate(${s.rimL + 6} ${rimY})`}><path d="M-14 -6 L14 -6 L0 20 Z" fill="#f7d154" stroke="#c9a227" /><path d="M-6 -6 L-12 -26 L-2 -8 L0 -30 L2 -8 L12 -26 L6 -6 Z" fill="#4c9a2a" /></g>}
      {garnish.includes("cherry") && <g><path d={`M${cx + 4} ${(hasLiquid ? Math.min(surf, rimY + 10) : rimY) - 6} q 6 -22 18 -26`} fill="none" stroke="#4e342e" strokeWidth="2" /><circle cx={cx + 2} cy={(hasLiquid ? Math.min(surf, rimY + 10) : rimY) - 2} r="8" fill="#b0102a" /><circle cx={cx - 1} cy={(hasLiquid ? Math.min(surf, rimY + 10) : rimY) - 5} r="2" fill="#ffffff" opacity="0.6" /></g>}
      {garnish.includes("mint") && <g fill="#43a047" stroke="#2e7d32" strokeWidth="0.8">{[-30, 0, 30].map((a) => <ellipse key={a} cx={cx - 14} cy={rimY - 12} rx="6" ry="14" transform={`rotate(${a} ${cx - 14} ${rimY})`} />)}</g>}
      {garnish.includes("umbrella") && <g><line x1={s.rimL + 14} y1={rimY + 20} x2={s.rimL - 6} y2={rimY - 40} stroke="#c9a86a" strokeWidth="2" /><path d={`M${s.rimL - 34} ${rimY - 34} Q${s.rimL - 6} ${rimY - 72} ${s.rimL + 22} ${rimY - 44} Z`} fill="#e74c3c" /><path d={`M${s.rimL - 20} ${rimY - 40} Q${s.rimL - 6} ${rimY - 62} ${s.rimL + 6} ${rimY - 40} Z`} fill="#f9e79f" opacity="0.8" /></g>}
    </svg>
  );
}

/** Render the picture as a PNG data URL (for PDF export). */
export async function drinkPictureDataUrl(recipe: DrinkPictureData, stroke = "#c9a86a", px = 480): Promise<string | null> {
  try {
    const [{ renderToStaticMarkup }, { createElement }] = await Promise.all([import("react-dom/server"), import("react")]);
    const svg = renderToStaticMarkup(createElement(DrinkPicture, { recipe, stroke }));
    const img = new Image(); img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    await img.decode();
    const c = document.createElement("canvas"); c.width = px; c.height = px * 1.2;
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/png");
  } catch { return null; }
}
