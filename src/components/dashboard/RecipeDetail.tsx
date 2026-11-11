import { useEffect, useMemo, useState } from "react";
import { Copy, FileDown, Heart, Pencil, Printer, Save, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatAmount, scaleIngredients } from "@/lib/measure";
import type { Recipe } from "@/lib/recipes";
import { DrinkPicture } from "@/components/recipes/DrinkPicture";

export function RecipeDetail({ recipe, categoryName, imageUrl, onClose, onEdit, onDuplicate, onDelete, onFavorite, onPdf, onSaveScaled }: {
  recipe: Recipe | null; categoryName: string | null; imageUrl?: string | undefined; onClose: () => void; onEdit: () => void; onDuplicate: () => void;
  onDelete: () => void; onFavorite: () => void; onPdf: () => void; onSaveScaled: (servings: number) => void;
}) {
  const [servings, setServings] = useState(1);
  useEffect(() => { if (recipe) setServings(Number(recipe.servings)); }, [recipe]);
  const scaled = useMemo(() => recipe ? scaleIngredients(recipe.ingredients, Number(recipe.servings), servings) : [], [recipe, servings]);
  if (!recipe) return null;
  const isScaled = servings !== Number(recipe.servings);
  const margin = recipe.selling_price && recipe.cost_per_serving != null ? ((Number(recipe.selling_price) - Number(recipe.cost_per_serving)) / Number(recipe.selling_price)) * 100 : null;
  const facts = [["Category", categoryName], ["Technique", recipe.technique], ["Difficulty", recipe.difficulty], ["Glassware", recipe.glassware], ["Ice", recipe.ice_type], ["Garnish", recipe.garnish],
    ["Prep time", recipe.prep_time_minutes != null ? `${recipe.prep_time_minutes} min` : null], ["ABV", recipe.abv != null ? `${recipe.abv}%` : null],
    ["Cost / serving", recipe.cost_per_serving != null ? formatAmount(Number(recipe.cost_per_serving)) : null], ["Selling price", recipe.selling_price != null ? formatAmount(Number(recipe.selling_price)) : null],
    ["Margin", margin != null ? `${margin.toFixed(1)}%` : null], ["Created", new Date(recipe.created_at).toLocaleDateString()], ["Updated", new Date(recipe.updated_at).toLocaleDateString()]].filter(([, v]) => v);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto border-primary/30 p-0">
        <div className="print-area grid md:grid-cols-[2fr_3fr]">
          <div className="flex flex-col bg-muted">{imageUrl && <img src={imageUrl} alt={recipe.name} className="h-64 w-full object-cover md:h-80" />}<div className="grid flex-1 place-items-center p-6 text-primary"><DrinkPicture recipe={recipe} className="h-56 w-auto md:h-72" /></div></div>
          <div className="space-y-6 p-6 md:p-8">
            <div>
              <p className="eyebrow">FR · Recipe card</p>
              <DialogTitle className="mt-2 font-display text-3xl font-light uppercase tracking-[0.1em]">{recipe.name}</DialogTitle>
              <DialogDescription className="sr-only">Recipe details</DialogDescription>
              {recipe.flavor_tags.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{recipe.flavor_tags.map((t) => <span key={t} className="rounded-sm border border-primary/40 px-2 py-0.5 text-xs text-gold-soft">{t}</span>)}</div>}
            </div>
            <section>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="eyebrow">Ingredients</h3>
                <div className="no-print flex items-center gap-2 text-xs text-muted-foreground">
                  <label htmlFor="scale">Servings</label>
                  <Input id="scale" type="number" min={0.25} step={0.25} className="h-8 w-20" value={servings} onChange={(e) => setServings(Math.max(0.25, Number(e.target.value) || 1))} />
                  {isScaled && <Button size="sm" variant="goldOutline" onClick={() => onSaveScaled(servings)}><Save />Save as new</Button>}
                </div>
              </div>
              <p className="mb-2 text-xs text-muted-foreground">Serves {formatAmount(servings)}{isScaled ? ` (scaled from ${formatAmount(Number(recipe.servings))})` : ""}</p>
              <ul className="divide-y divide-border">
                {scaled.map((i, n) => (
                  <li key={n} className="flex justify-between gap-4 py-2 text-sm">
                    <span>{i.name}{i.note && <span className="text-muted-foreground"> — {i.note}</span>}</span>
                    <span className="whitespace-nowrap font-display text-primary">{formatAmount(i.amount)} {i.unit}</span>
                  </li>
                ))}
              </ul>
            </section>
            {recipe.steps.length > 0 && <section><h3 className="eyebrow mb-3">Method</h3><ol className="space-y-2 text-sm">{recipe.steps.map((s, n) => <li key={n} className="flex gap-3"><span className="font-display text-primary">{n + 1}.</span>{s}</li>)}</ol></section>}
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">{facts.map(([k, v]) => <div key={k}><dt className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{k}</dt><dd>{v}</dd></div>)}</dl>
            {recipe.notes && <section><h3 className="eyebrow mb-2">Personal notes</h3><p className="whitespace-pre-wrap text-sm text-muted-foreground">{recipe.notes}</p></section>}
            <div className="no-print flex flex-wrap gap-2 border-t border-border pt-5">
              <Button size="sm" variant="gold" onClick={onEdit}><Pencil />Edit</Button>
              <Button size="sm" variant="goldOutline" onClick={onFavorite}><Heart className={recipe.is_favorite ? "fill-primary" : ""} />{recipe.is_favorite ? "Unfavourite" : "Favourite"}</Button>
              <Button size="sm" variant="goldOutline" onClick={onDuplicate}><Copy />Duplicate</Button>
              <Button size="sm" variant="goldOutline" onClick={() => window.print()}><Printer />Print</Button>
              <Button size="sm" variant="goldOutline" onClick={onPdf}><FileDown />PDF</Button>
              <Button size="sm" variant="destructive" onClick={onDelete}><Trash2 />Delete</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
