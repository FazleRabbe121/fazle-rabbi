import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { isUnlocked } from "@/lib/passcode";
import { DrinkPicture } from "@/components/recipes/DrinkPicture";
import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, Heart, Loader2, LogOut, Plus, Search, Upload, Wine } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Monogram } from "@/components/site/Monogram";
import { RecipeForm } from "@/components/dashboard/RecipeForm";
import { RecipeDetail } from "@/components/dashboard/RecipeDetail";
import { CostCalculator, MeasureCalculator } from "@/components/dashboard/Calculators";
import { selectCls } from "@/components/dashboard/fields";
import { scaleIngredients } from "@/lib/measure";
import { createRecipe, deleteRecipe, listCategories, listRecipes, setFavorite, signedUrls, toInput, updateRecipe, type Recipe, type RecipeInput } from "@/lib/recipes";
import { exportCSV, exportJSON, exportRecipePDF, parseImport, type ImportPlan } from "@/lib/backup";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Recipe Dashboard — Fazle Rabbi" },
      { name: "description", content: "Private cocktail recipe management dashboard." },
      { property: "og:title", content: "Recipe Dashboard — Fazle Rabbi" },
      { property: "og:description", content: "Private cocktail recipe management dashboard." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  beforeLoad: () => { if (!isUnlocked()) throw redirect({ to: "/unlock" }); },
  component: DashboardPage,
});

function useSignOut() {
  const qc = useQueryClient(); const navigate = useNavigate();
  return async () => { await qc.cancelQueries(); qc.clear(); await supabase.auth.signOut(); navigate({ to: "/login", replace: true }); };
}

function DashboardPage() {
  const { user } = Route.useRouteContext();
  const signOut = useSignOut();
  return <Dashboard email={user.email ?? ""} onSignOut={signOut} />;
}

const Center = ({ children }: { children: React.ReactNode }) => <main className="grid min-h-screen place-items-center bg-navy-glow p-5">{children}</main>;

type SortKey = "date-desc" | "date-asc" | "name-asc" | "name-desc";

function Dashboard({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const qc = useQueryClient();
  const recipesQ = useQuery({ queryKey: ["recipes"], queryFn: listRecipes });
  const catsQ = useQuery({ queryKey: ["categories"], queryFn: listCategories, staleTime: Infinity });
  const recipes = recipesQ.data ?? [];
  const cats = catsQ.data ?? [];
  const paths = recipes.map((r) => r.image_path).filter(Boolean) as string[];
  const urlsQ = useQuery({ queryKey: ["recipe-urls", [...new Set(paths)].sort().join("|")], queryFn: () => signedUrls(paths), enabled: paths.length > 0, staleTime: 50 * 60 * 1000 });
  const urls = urlsQ.data ?? {};
  const catName = (id: string | null) => cats.find((c) => c.id === id)?.name ?? null;

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState<SortKey>("date-desc");
  const [favOnly, setFavOnly] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: string | null; input: RecipeInput | null; title: string }>({ id: null, input: null, title: "New recipe" });
  const [viewId, setViewId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Recipe | null>(null);
  const [importPlan, setImportPlan] = useState<ImportPlan | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = recipes.filter((r) => (cat === "all" || r.category_id === cat) && (!favOnly || r.is_favorite) &&
      (!term || r.name.toLowerCase().includes(term) || (catName(r.category_id) ?? "").toLowerCase().includes(term) || r.ingredients.some((i) => i.name.toLowerCase().includes(term))));
    return [...list].sort((a, b) => sort === "name-asc" ? a.name.localeCompare(b.name) : sort === "name-desc" ? b.name.localeCompare(a.name)
      : sort === "date-asc" ? a.created_at.localeCompare(b.created_at) : b.created_at.localeCompare(a.created_at));
  }, [recipes, q, cat, favOnly, sort, cats]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = () => qc.invalidateQueries({ queryKey: ["recipes"] });
  const save = async (v: RecipeInput) => {
    if (editing.id) { await updateRecipe(editing.id, v); toast.success("Recipe updated"); }
    else { await createRecipe(v); toast.success("Recipe saved"); }
    refresh();
  };
  const duplicate = async (r: Recipe, input?: RecipeInput) => {
    try { const n = await createRecipe(input ?? { ...toInput(r), name: `${r.name} (copy)`, is_favorite: false }); toast.success(`Created “${n.name}”`); refresh(); setViewId(n.id); }
    catch (e) { toast.error((e as Error).message); }
  };
  const fav = useMutation({ mutationFn: (r: Recipe) => setFavorite(r.id, !r.is_favorite), onSuccess: refresh, onError: (e) => toast.error((e as Error).message) });
  const del = useMutation({ mutationFn: deleteRecipe, onSuccess: () => { toast.success("Recipe deleted"); setViewId(null); refresh(); }, onError: (e) => toast.error((e as Error).message) });

  async function runImport(mode: "skip" | "rename" | "all") {
    if (!importPlan) return;
    const existing = new Set(recipes.map((r) => r.name.trim().toLowerCase()));
    let ok = 0, skipped = 0, failed = 0;
    for (const item of importPlan.items) {
      const dup = existing.has(item.name.trim().toLowerCase());
      if (dup && mode === "skip") { skipped++; continue; }
      try { await createRecipe(dup && mode === "rename" ? { ...item, name: `${item.name} (imported)` } : item); ok++; } catch { failed++; }
    }
    setImportPlan(null); refresh();
    toast.success(`Imported ${ok} recipe${ok === 1 ? "" : "s"}${skipped ? `, skipped ${skipped} duplicates` : ""}${failed ? `, ${failed} failed` : ""}`);
  }

  const viewing = recipes.find((r) => r.id === viewId) ?? null;
  const topCats = useMemo(() => {
    const m = new Map<string, number>(); recipes.forEach((r) => { const n = catName(r.category_id) ?? "Uncategorised"; m.set(n, (m.get(n) ?? 0) + 1); });
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [recipes, cats]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-navy-glow">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link to="/" className="flex items-center gap-3"><Monogram /><span className="hidden font-display text-xs uppercase tracking-[0.3em] sm:inline">Recipe vault</span></Link>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground md:inline">{email}</span>
            <Button size="sm" variant="ghostGold" onClick={onSignOut}><LogOut />Sign out</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <Tabs defaultValue="recipes">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <TabsList><TabsTrigger value="recipes">Recipes</TabsTrigger><TabsTrigger value="tools">Calculators</TabsTrigger></TabsList>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="goldOutline" onClick={() => exportJSON(recipes, cats)} disabled={!recipes.length}><Download />JSON</Button>
              <Button size="sm" variant="goldOutline" onClick={() => exportCSV(recipes, cats)} disabled={!recipes.length}><Download />CSV</Button>
              <Button size="sm" variant="goldOutline" onClick={() => fileRef.current?.click()}><Upload />Import</Button>
              <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" aria-label="Import recipes JSON" onChange={async (e) => {
                const f = e.target.files?.[0]; e.target.value = ""; if (!f) return;
                try { const plan = parseImport(await f.text(), cats, recipes); if (!plan.items.length) { toast.error("No recipes found in file"); return; } setImportPlan(plan); }
                catch (err) { toast.error((err as Error).message); }
              }} />
              <Button size="sm" variant="gold" onClick={() => { setEditing({ id: null, input: null, title: "New recipe" }); setFormOpen(true); }}><Plus />Add recipe</Button>
            </div>
          </div>

          <TabsContent value="recipes" className="space-y-6">
            <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-4">
              <Stat label="Total recipes" value={recipes.length} />
              <Stat label="Favourites" value={recipes.filter((r) => r.is_favorite).length} />
              <Stat label="Categories used" value={topCats.length} />
              <div className="bg-background p-4"><p className="text-[0.65rem] uppercase tracking-widest text-muted-foreground">Top categories</p>
                <ul className="mt-1 space-y-0.5 text-xs">{topCats.slice(0, 3).map(([n, c]) => <li key={n} className="flex justify-between"><span className="truncate">{n}</span><span className="text-primary">{c}</span></li>)}{!topCats.length && <li className="text-muted-foreground">—</li>}</ul></div>
            </div>

            <div className="grid gap-2 sm:grid-cols-[1fr_200px_170px_auto]">
              <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input aria-label="Search recipes" placeholder="Search name, ingredient or category" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} /></div>
              <select aria-label="Filter by category" className={selectCls} value={cat} onChange={(e) => setCat(e.target.value)}><option value="all">All categories</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
              <select aria-label="Sort" className={selectCls} value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                <option value="date-desc">Newest first</option><option value="date-asc">Oldest first</option><option value="name-asc">Name A–Z</option><option value="name-desc">Name Z–A</option></select>
              <Button variant={favOnly ? "gold" : "goldOutline"} aria-pressed={favOnly} onClick={() => setFavOnly(!favOnly)}><Heart className={favOnly ? "fill-current" : ""} />Favourites</Button>
            </div>

            {recipesQ.isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[4/5] animate-pulse bg-muted" />)}</div>
            ) : recipesQ.error ? (
              <div className="border border-destructive/50 p-6 text-center text-destructive">Couldn't load recipes. <button className="underline" onClick={() => recipesQ.refetch()}>Retry</button></div>
            ) : !filtered.length ? (
              <div className="border border-dashed border-primary/40 p-12 text-center">
                <Wine className="mx-auto h-10 w-10 text-primary" />
                <p className="mt-4 text-muted-foreground">{recipes.length ? "No recipes match your filters." : "Your recipe vault is empty. Add your first creation."}</p>
                {!recipes.length && <Button variant="gold" className="mt-5" onClick={() => { setEditing({ id: null, input: null, title: "New recipe" }); setFormOpen(true); }}><Plus />Add recipe</Button>}
              </div>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {filtered.map((r) => (
                  <li key={r.id} className="group relative overflow-hidden border border-border bg-card transition-colors hover:border-primary/60">
                    <button className="block w-full text-left" onClick={() => setViewId(r.id)} aria-label={`Open ${r.name}`}>
                      <div className="relative aspect-[4/3] bg-muted">{r.image_path && urls[r.image_path] ? <><img src={urls[r.image_path]} alt="" loading="lazy" className="h-full w-full object-cover" /><span className="absolute bottom-2 left-2 rounded-sm bg-background/80 p-1 text-primary backdrop-blur"><DrinkPicture recipe={r} className="h-14 w-12" /></span></> : <div className="grid h-full place-items-center p-3 text-primary"><DrinkPicture recipe={r} className="h-full w-auto" /></div>}</div>
                      <div className="p-4">
                        <p className="eyebrow truncate">{catName(r.category_id) ?? "Uncategorised"}</p>
                        <h3 className="mt-1 truncate text-base uppercase tracking-[0.08em]">{r.name}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">{[r.technique, r.difficulty, `${r.ingredients.length} ingredients`].filter(Boolean).join(" · ")}</p>
                      </div>
                    </button>
                    <button aria-label={r.is_favorite ? "Remove from favourites" : "Add to favourites"} aria-pressed={r.is_favorite} onClick={() => fav.mutate(r)}
                      className="absolute right-3 top-3 rounded-full bg-ink/70 p-2 text-primary backdrop-blur hover:bg-ink"><Heart className={`h-4 w-4 ${r.is_favorite ? "fill-current" : ""}`} /></button>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
          <TabsContent value="tools" className="grid gap-6 lg:grid-cols-2">
            <MeasureCalculator />
            <CostCalculator />
            <p className="text-xs text-muted-foreground lg:col-span-2">Recipe scaling: open any recipe and change its servings — every ingredient recalculates, and you can save the scaled version as a new recipe.</p>
          </TabsContent>
        </Tabs>
      </main>

      <RecipeForm open={formOpen} onOpenChange={setFormOpen} initial={editing.input} title={editing.title} categories={cats}
        imageUrl={editing.input?.image_path ? urls[editing.input.image_path] : undefined} onSave={save} />

      <RecipeDetail recipe={viewing} categoryName={viewing ? catName(viewing.category_id) : null} imageUrl={viewing?.image_path ? urls[viewing.image_path] : undefined}
        onClose={() => setViewId(null)}
        onEdit={() => { if (!viewing) return; setEditing({ id: viewing.id, input: toInput(viewing), title: "Edit recipe" }); setViewId(null); setFormOpen(true); }}
        onDuplicate={() => viewing && duplicate(viewing)}
        onDelete={() => setToDelete(viewing)}
        onFavorite={() => viewing && fav.mutate(viewing)}
        onPdf={() => viewing && exportRecipePDF(viewing, catName(viewing.category_id), viewing.image_path ? urls[viewing.image_path] : undefined).catch((e) => toast.error(e.message))}
        onSaveScaled={(s) => viewing && duplicate(viewing, { ...toInput(viewing), name: `${viewing.name} (×${s} servings)`, servings: s, is_favorite: false,
          ingredients: scaleIngredients(viewing.ingredients, Number(viewing.servings), s).map((i) => ({ ...i, note: i.note ?? "" })) })} />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete “{toDelete?.name}”?</AlertDialogTitle><AlertDialogDescription>This permanently removes the recipe and its photo. This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (toDelete) del.mutate(toDelete); setToDelete(null); }}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!importPlan} onOpenChange={(o) => !o && setImportPlan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Import {importPlan?.items.length} recipes</AlertDialogTitle>
            <AlertDialogDescription>{importPlan?.duplicates.length ? `${importPlan.duplicates.length} have the same name as existing recipes (e.g. ${importPlan.duplicates.slice(0, 3).join(", ")}). How should duplicates be handled?` : "No duplicates found."} Photos are not part of backups.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter className="flex-wrap gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {importPlan?.duplicates.length ? (<>
              <Button variant="goldOutline" onClick={() => runImport("skip")}>Skip duplicates</Button>
              <Button variant="goldOutline" onClick={() => runImport("rename")}>Import as copies</Button>
            </>) : null}
            <Button variant="gold" onClick={() => runImport("all")}>{importPlan?.duplicates.length ? "Import all anyway" : "Import"}</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="bg-background p-4"><p className="text-[0.65rem] uppercase tracking-widest text-muted-foreground">{label}</p><p className="mt-1 font-display text-3xl font-light text-gold-gradient">{value}</p></div>
);
