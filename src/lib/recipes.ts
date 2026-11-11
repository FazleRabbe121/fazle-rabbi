import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";
import { RECIPE_UNITS, type Ingredient } from "./measure";

export type RecipeRow = Database["public"]["Tables"]["recipes"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Recipe = Omit<RecipeRow, "ingredients"> & { ingredients: Ingredient[] };

export const DIFFICULTIES = ["Easy", "Medium", "Advanced", "Expert"] as const;
export const TECHNIQUES = ["Shaken", "Stirred", "Built", "Blended", "Muddled", "Layered", "Thrown", "Swizzled", "Rolled", "Dry shake", "Whip shake", "Steamed", "Brewed"];
export const BUCKET = "recipe-images";

export const ingredientSchema = z.object({
  name: z.string().trim().min(1, "Ingredient name required").max(120),
  amount: z.number().nonnegative().nullable(),
  unit: z.enum(RECIPE_UNITS),
  note: z.string().trim().max(200).optional().default(""),
});

export const recipeInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(160),
  category_id: z.string().uuid().nullable(),
  image_path: z.string().nullable(),
  ingredients: z.array(ingredientSchema).max(60),
  steps: z.array(z.string().trim().min(1).max(1000)).max(40),
  glassware: z.string().trim().max(100).nullable(),
  ice_type: z.string().trim().max(100).nullable(),
  garnish: z.string().trim().max(200).nullable(),
  technique: z.string().trim().max(60).nullable(),
  prep_time_minutes: z.number().int().min(0).max(10000).nullable(),
  difficulty: z.enum(DIFFICULTIES),
  abv: z.number().min(0).max(100).nullable(),
  flavor_tags: z.array(z.string().trim().min(1).max(40)).max(20),
  servings: z.number().positive().max(1000),
  cost_per_serving: z.number().min(0).nullable(),
  selling_price: z.number().min(0).nullable(),
  notes: z.string().max(5000).nullable(),
  is_favorite: z.boolean(),
  drink_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable().default(null),
});
export type RecipeInput = z.infer<typeof recipeInputSchema>;

export const emptyRecipe = (): RecipeInput => ({
  name: "", category_id: null, image_path: null, ingredients: [{ name: "", amount: null, unit: "ml", note: "" }],
  steps: [""], glassware: "", ice_type: "", garnish: "", technique: "Shaken", prep_time_minutes: 3,
  difficulty: "Easy", abv: null, flavor_tags: [], servings: 1, cost_per_serving: null, selling_price: null, notes: "", is_favorite: false, drink_color: null,
});

const normalize = (r: RecipeRow): Recipe => ({ ...r, ingredients: (Array.isArray(r.ingredients) ? r.ingredients : []) as unknown as Ingredient[] });

export function toInput(r: Recipe): RecipeInput {
  const { id: _i, user_id: _u, created_at: _c, updated_at: _up, ...rest } = r;
  return { ...rest, servings: Number(rest.servings), abv: rest.abv == null ? null : Number(rest.abv),
    cost_per_serving: rest.cost_per_serving == null ? null : Number(rest.cost_per_serving),
    selling_price: rest.selling_price == null ? null : Number(rest.selling_price),
    difficulty: rest.difficulty as RecipeInput["difficulty"], drink_color: rest.drink_color ?? null } as RecipeInput;
}

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) throw error;
  return data;
}

export async function listRecipes(): Promise<Recipe[]> {
  const all: RecipeRow[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from("recipes").select("*").order("created_at", { ascending: false }).range(from, from + 999);
    if (error) throw error;
    all.push(...data);
    if (data.length < 1000) break;
  }
  return all.map(normalize);
}

function clean(input: RecipeInput) {
  const v = recipeInputSchema.parse(input);
  const blank = (s: string | null) => (s && s.trim() ? s.trim() : null);
  return { ...v, glassware: blank(v.glassware), ice_type: blank(v.ice_type), garnish: blank(v.garnish), technique: blank(v.technique),
    notes: blank(v.notes), steps: v.steps.filter(Boolean), ingredients: v.ingredients as unknown as Json };
}

export async function createRecipe(input: RecipeInput): Promise<Recipe> {
  const { data, error } = await supabase.from("recipes").insert(clean(input)).select().single();
  if (error) throw error;
  return normalize(data);
}

export async function updateRecipe(id: string, input: RecipeInput): Promise<Recipe> {
  const { data, error } = await supabase.from("recipes").update(clean(input)).eq("id", id).select().single();
  if (error) throw error;
  return normalize(data);
}

export async function deleteRecipe(r: Recipe) {
  const { error } = await supabase.from("recipes").delete().eq("id", r.id);
  if (error) throw error;
  if (r.image_path) {
    const { count } = await supabase.from("recipes").select("id", { count: "exact", head: true }).eq("image_path", r.image_path);
    if (!count) await supabase.storage.from(BUCKET).remove([r.image_path]);
  }
}

export async function setFavorite(id: string, is_favorite: boolean) {
  const { error } = await supabase.from("recipes").update({ is_favorite }).eq("id", id);
  if (error) throw error;
}

/** Resize to max 1600px and re-encode as JPEG before uploading. */
export async function compressImage(file: File, max = 1600, quality = 0.82): Promise<Blob> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file");
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("Compression failed"))), "image/jpeg", quality));
}

export async function uploadRecipeImage(file: File): Promise<string> {
  const blob = await compressImage(file);
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Please sign in again");
  const path = `${u.user.id}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (error) throw error;
  return path;
}

export async function signedUrls(paths: string[]): Promise<Record<string, string>> {
  const unique = [...new Set(paths.filter(Boolean))];
  if (!unique.length) return {};
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(unique, 60 * 60);
  if (error) throw error;
  const out: Record<string, string> = {};
  data.forEach((d) => { if (d.path && d.signedUrl) out[d.path] = d.signedUrl; });
  return out;
}
