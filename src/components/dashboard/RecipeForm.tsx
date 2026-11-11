import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RECIPE_UNITS } from "@/lib/measure";
import { DIFFICULTIES, TECHNIQUES, emptyRecipe, recipeInputSchema, uploadRecipeImage, type Category, type RecipeInput } from "@/lib/recipes";
import { Field, num, selectCls } from "./fields";

export function RecipeForm({ open, onOpenChange, initial, categories, imageUrl, onSave, title }: {
  open: boolean; onOpenChange: (o: boolean) => void; initial: RecipeInput | null; categories: Category[]; imageUrl?: string | undefined;
  onSave: (v: RecipeInput) => Promise<void>; title: string;
}) {
  const [v, setV] = useState<RecipeInput>(emptyRecipe());
  const [tag, setTag] = useState("");
  const [preview, setPreview] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => { if (open) { setV(initial ?? emptyRecipe()); setPreview(imageUrl); setErrors([]); setTag(""); } }, [open, initial, imageUrl]);
  const set = <K extends keyof RecipeInput>(k: K, val: RecipeInput[K]) => setV((p) => ({ ...p, [k]: val }));

  async function onImage(f: File | undefined) {
    if (!f) return;
    setUploading(true);
    try {
      const path = await uploadRecipeImage(f);
      set("image_path", path); setPreview(URL.createObjectURL(f));
      toast.success("Image uploaded");
    } catch (e) { toast.error((e as Error).message || "Upload failed"); }
    finally { setUploading(false); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = { ...v, ingredients: v.ingredients.filter((i) => i.name.trim()), steps: v.steps.map((s) => s.trim()).filter(Boolean) };
    const p = recipeInputSchema.safeParse(cleaned);
    if (!p.success) { setErrors(p.error.issues.map((i) => `${i.path.join(" ")}: ${i.message}`)); return; }
    setSaving(true);
    try { await onSave(p.data); onOpenChange(false); } catch (err) { toast.error((err as Error).message || "Save failed"); }
    finally { setSaving(false); }
  }

  const ing = v.ingredients;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto border-primary/30">
        <DialogHeader>
          <DialogTitle className="font-display uppercase tracking-[0.15em]">{title}</DialogTitle>
          <DialogDescription>Fields marked * are required.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
            <label className="relative grid aspect-[4/5] cursor-pointer place-items-center overflow-hidden rounded-sm border border-dashed border-primary/40 bg-muted text-muted-foreground hover:border-primary">
              {preview ? <img src={preview} alt="Recipe preview" className="absolute inset-0 h-full w-full object-cover" /> : <span className="flex flex-col items-center gap-2 text-xs"><ImagePlus />Add photo</span>}
              {uploading && <span className="absolute inset-0 grid place-items-center bg-ink/70"><Loader2 className="animate-spin text-primary" /></span>}
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => onImage(e.target.files?.[0])} aria-label="Upload recipe image" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Cocktail name *" htmlFor="rname" className="sm:col-span-2"><Input id="rname" value={v.name} onChange={(e) => set("name", e.target.value)} maxLength={160} /></Field>
              <Field label="Category" htmlFor="rcat"><select id="rcat" className={selectCls} value={v.category_id ?? ""} onChange={(e) => set("category_id", e.target.value || null)}>
                <option value="">Uncategorised</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
              <Field label="Mixing technique" htmlFor="rtech"><select id="rtech" className={selectCls} value={v.technique ?? ""} onChange={(e) => set("technique", e.target.value || null)}>
                <option value="">—</option>{TECHNIQUES.map((t) => <option key={t}>{t}</option>)}</select></Field>
              <Field label="Difficulty" htmlFor="rdiff"><select id="rdiff" className={selectCls} value={v.difficulty} onChange={(e) => set("difficulty", e.target.value as RecipeInput["difficulty"])}>
                {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}</select></Field>
              <Field label="Serving size (servings) *" htmlFor="rserv"><Input id="rserv" type="number" min={0.25} step={0.25} value={v.servings} onChange={(e) => set("servings", Number(e.target.value) || 1)} /></Field>
            </div>
          </div>

          <fieldset className="space-y-2">
            <legend className="eyebrow mb-2">Ingredients</legend>
            {ing.map((i, n) => (
              <div key={n} className="grid grid-cols-[1fr_80px_100px_auto] gap-2 sm:grid-cols-[2fr_90px_110px_1.3fr_auto]">
                <Input aria-label={`Ingredient ${n + 1} name`} placeholder="Ingredient" value={i.name} onChange={(e) => set("ingredients", ing.map((x, k) => k === n ? { ...x, name: e.target.value } : x))} />
                <Input aria-label="Amount" type="number" step="any" min={0} placeholder="Amt" value={i.amount ?? ""} onChange={(e) => set("ingredients", ing.map((x, k) => k === n ? { ...x, amount: num(e.target.value) } : x))} />
                <select aria-label="Unit" className={selectCls} value={i.unit} onChange={(e) => set("ingredients", ing.map((x, k) => k === n ? { ...x, unit: e.target.value as typeof i.unit } : x))}>
                  {RECIPE_UNITS.map((u) => <option key={u}>{u}</option>)}</select>
                <Input aria-label="Note" placeholder="Note (optional)" className="col-span-3 sm:col-span-1" value={i.note ?? ""} onChange={(e) => set("ingredients", ing.map((x, k) => k === n ? { ...x, note: e.target.value } : x))} />
                <Button type="button" variant="ghost" size="icon" aria-label="Remove ingredient" onClick={() => set("ingredients", ing.filter((_, k) => k !== n))}><Trash2 /></Button>
              </div>
            ))}
            <Button type="button" variant="goldOutline" size="sm" onClick={() => set("ingredients", [...ing, { name: "", amount: null, unit: "ml", note: "" }])}><Plus />Add ingredient</Button>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="eyebrow mb-2">Preparation method</legend>
            {v.steps.map((s, n) => (
              <div key={n} className="flex gap-2">
                <span className="mt-2 w-6 font-display text-sm text-primary">{n + 1}.</span>
                <Textarea aria-label={`Step ${n + 1}`} rows={2} value={s} onChange={(e) => set("steps", v.steps.map((x, k) => k === n ? e.target.value : x))} />
                <Button type="button" variant="ghost" size="icon" aria-label="Remove step" onClick={() => set("steps", v.steps.filter((_, k) => k !== n))}><Trash2 /></Button>
              </div>
            ))}
            <Button type="button" variant="goldOutline" size="sm" onClick={() => set("steps", [...v.steps, ""])}><Plus />Add step</Button>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Glassware" htmlFor="rglass"><Input id="rglass" value={v.glassware ?? ""} onChange={(e) => set("glassware", e.target.value)} placeholder="Coupe" /></Field>
            <Field label="Ice type" htmlFor="rice"><Input id="rice" value={v.ice_type ?? ""} onChange={(e) => set("ice_type", e.target.value)} placeholder="Clear block" /></Field>
            <Field label="Garnish" htmlFor="rgarn"><Input id="rgarn" value={v.garnish ?? ""} onChange={(e) => set("garnish", e.target.value)} placeholder="Lemon twist" /></Field>
            <Field label="Prep time (min)" htmlFor="rprep"><Input id="rprep" type="number" min={0} value={v.prep_time_minutes ?? ""} onChange={(e) => set("prep_time_minutes", num(e.target.value) == null ? null : Math.round(num(e.target.value)!))} /></Field>
            <Field label="ABV % (optional)" htmlFor="rabv"><Input id="rabv" type="number" min={0} max={100} step="0.1" value={v.abv ?? ""} onChange={(e) => set("abv", num(e.target.value))} /></Field>
            <div className="flex items-end gap-3 pb-1"><Switch id="rfav" checked={v.is_favorite} onCheckedChange={(c) => set("is_favorite", c)} /><label htmlFor="rfav" className="text-sm">Favourite</label></div>
            <Field label="Cost per serving (optional)" htmlFor="rcost"><Input id="rcost" type="number" min={0} step="0.01" value={v.cost_per_serving ?? ""} onChange={(e) => set("cost_per_serving", num(e.target.value))} /></Field>
            <Field label="Selling price (optional)" htmlFor="rprice"><Input id="rprice" type="number" min={0} step="0.01" value={v.selling_price ?? ""} onChange={(e) => set("selling_price", num(e.target.value))} /></Field>
          </div>

          <Field label="Flavour profile" htmlFor="rtag">
            <div className="flex flex-wrap gap-2">
              {v.flavor_tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 rounded-sm border border-primary/40 px-2 py-1 text-xs text-gold-soft">{t}
                  <button type="button" aria-label={`Remove ${t}`} onClick={() => set("flavor_tags", v.flavor_tags.filter((x) => x !== t))}><X className="h-3 w-3" /></button></span>
              ))}
              <Input id="rtag" className="w-44" placeholder="Add tag + Enter" value={tag} onChange={(e) => setTag(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); const t = tag.trim(); if (t && !v.flavor_tags.includes(t)) set("flavor_tags", [...v.flavor_tags, t]); setTag(""); } }} />
            </div>
          </Field>
          <Field label="Personal notes" htmlFor="rnotes"><Textarea id="rnotes" rows={3} value={v.notes ?? ""} onChange={(e) => set("notes", e.target.value)} /></Field>

          {errors.length > 0 && <ul role="alert" className="space-y-1 text-sm text-destructive">{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="gold" disabled={saving || uploading}>{saving && <Loader2 className="animate-spin" />}Save recipe</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
