import { z } from "zod";
import { jsPDF } from "jspdf";
import { recipeInputSchema, type Recipe, type Category, type RecipeInput, toInput } from "./recipes";
import { formatAmount } from "./measure";
import { drinkPictureDataUrl } from "@/components/recipes/DrinkPicture";

function download(name: string, content: BlobPart, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const stamp = () => new Date().toISOString().slice(0, 10);

export function exportJSON(recipes: Recipe[], cats: Category[]) {
  const catName = (id: string | null) => cats.find((c) => c.id === id)?.name ?? null;
  const payload = { app: "fazle-rabbi-recipes", version: 1, exported_at: new Date().toISOString(),
    recipes: recipes.map((r) => ({ ...toInput(r), category: catName(r.category_id), created_at: r.created_at })) };
  download(`recipes-backup-${stamp()}.json`, JSON.stringify(payload, null, 2), "application/json");
}

const csvCell = (v: unknown) => { const s = v == null ? "" : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

export function exportCSV(recipes: Recipe[], cats: Category[]) {
  const head = ["name", "category", "ingredients", "steps", "glassware", "ice_type", "garnish", "technique", "prep_time_minutes", "difficulty", "abv", "flavor_tags", "servings", "cost_per_serving", "selling_price", "notes", "is_favorite", "created_at"];
  const rows = recipes.map((r) => [r.name, cats.find((c) => c.id === r.category_id)?.name ?? "",
    r.ingredients.map((i) => `${formatAmount(i.amount)} ${i.unit} ${i.name}${i.note ? ` (${i.note})` : ""}`.trim()).join("; "),
    r.steps.join(" | "), r.glassware, r.ice_type, r.garnish, r.technique, r.prep_time_minutes, r.difficulty, r.abv, r.flavor_tags.join(", "),
    r.servings, r.cost_per_serving, r.selling_price, r.notes, r.is_favorite, r.created_at].map(csvCell).join(","));
  download(`recipes-backup-${stamp()}.csv`, "\ufeff" + [head.join(","), ...rows].join("\n"), "text/csv");
}

const importSchema = z.object({
  recipes: z.array(recipeInputSchema.partial({ category_id: true, image_path: true }).extend({ category: z.string().nullable().optional() })).max(5000),
});

export type ImportPlan = { items: RecipeInput[]; duplicates: string[] };

/** Validates a backup file and resolves category names. Images are not included in backups. */
export function parseImport(text: string, cats: Category[], existing: Recipe[]): ImportPlan {
  let json: unknown;
  try { json = JSON.parse(text); } catch { throw new Error("File is not valid JSON"); }
  const parsed = importSchema.safeParse(Array.isArray(json) ? { recipes: json } : json);
  if (!parsed.success) throw new Error("Invalid backup: " + parsed.error.issues.slice(0, 3).map((i) => `${i.path.join(".")} ${i.message}`).join("; "));
  const names = new Set(existing.map((r) => r.name.trim().toLowerCase()));
  const items = parsed.data.recipes.map(({ category, ...r }) => ({
    ...r, image_path: null,
    category_id: cats.find((c) => c.name.toLowerCase() === (category ?? "").toLowerCase())?.id ?? (r.category_id && cats.some((c) => c.id === r.category_id) ? r.category_id : null),
  })) as RecipeInput[];
  return { items, duplicates: items.filter((i) => names.has(i.name.trim().toLowerCase())).map((i) => i.name) };
}

async function toDataUrl(url: string): Promise<string | null> {
  try { const b = await (await fetch(url)).blob(); return await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result as string); fr.readAsDataURL(b); }); } catch { return null; }
}

/** Branded black & gold recipe card PDF. */
export async function exportRecipePDF(r: Recipe, categoryName: string | null, imageUrl?: string) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
  const gold: [number, number, number] = [201, 168, 106];
  const page = () => { doc.setFillColor(13, 12, 10); doc.rect(0, 0, W, H, "F"); doc.setDrawColor(...gold); doc.setLineWidth(0.8); doc.rect(20, 20, W - 40, H - 40); };
  page();
  let y = 70;
  doc.setTextColor(...gold); doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.text("FR  ·  FAZLE RABBI  ·  RECIPE CARD", 50, 50);
  doc.setFontSize(28); doc.setTextColor(245, 236, 215); doc.text(doc.splitTextToSize(r.name, W - 100), 50, (y += 30));
  y += 18; doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(...gold);
  doc.text([categoryName, r.technique, r.difficulty, r.glassware].filter(Boolean).join("  ·  ").toUpperCase(), 50, y);
  y += 14; doc.setLineWidth(0.5); doc.line(50, y, W - 50, y); y += 20;
  const iw = 180, ih = 225;
  const photo = imageUrl ? await toDataUrl(imageUrl) : null;
  const pic = await drinkPictureDataUrl(r);
  if (photo) doc.addImage(photo, "JPEG", W - 50 - iw, y, iw, ih);
  else if (pic) doc.addImage(pic, "PNG", W - 50 - iw, y, iw, iw * 1.2);
  const colW = W - 300;
  const ensure = (h: number) => { if (y + h > H - 50) { doc.addPage(); page(); y = 60; } };
  const section = (t: string) => { ensure(30); doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(...gold); doc.text(t.toUpperCase(), 50, y); y += 16; doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(235, 228, 210); };
  section(`Ingredients — serves ${formatAmount(Number(r.servings))}`);
  r.ingredients.forEach((i) => { const lines = doc.splitTextToSize(`${formatAmount(i.amount)} ${i.unit}  ${i.name}${i.note ? ` — ${i.note}` : ""}`, colW); ensure(lines.length * 14); doc.text(lines, 56, y); y += lines.length * 14 + 2; });
  y = Math.max(y + 10, 360);
  section("Method");
  r.steps.forEach((s, n) => { const lines = doc.splitTextToSize(`${n + 1}. ${s}`, W - 110); ensure(lines.length * 14); doc.text(lines, 56, y); y += lines.length * 14 + 4; });
  y += 8; section("Details");
  [["Ice", r.ice_type], ["Garnish", r.garnish], ["Prep time", r.prep_time_minutes != null ? `${r.prep_time_minutes} min` : null], ["ABV", r.abv != null ? `${r.abv}%` : null],
    ["Flavour", r.flavor_tags.join(", ")], ["Cost / serving", r.cost_per_serving != null ? String(r.cost_per_serving) : null], ["Selling price", r.selling_price != null ? String(r.selling_price) : null]]
    .filter(([, v]) => v).forEach(([k, v]) => { ensure(14); doc.text(`${k}: ${v}`, 56, y); y += 14; });
  if (photo && pic) { ensure(170); doc.addImage(pic, "PNG", W - 50 - 120, y, 120, 144); y += 150; }
  if (r.notes) { y += 8; section("Notes"); const l = doc.splitTextToSize(r.notes, W - 110); l.forEach((line: string) => { ensure(14); doc.text(line, 56, y); y += 14; }); }
  doc.setFontSize(8); doc.setTextColor(...gold); doc.text(`Private recipe · ${new Date().toLocaleDateString()}`, 50, H - 32);
  doc.save(`${r.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`);
}
