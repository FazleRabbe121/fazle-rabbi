import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CALC_UNITS, convert, costSummary, formatAmount, ingredientCost, type CalcUnit, type CostRow } from "@/lib/measure";
import { Field, selectCls } from "./fields";

const card = "border border-border bg-card/70 p-6";

export function MeasureCalculator() {
  const [amount, setAmount] = useState(1);
  const [from, setFrom] = useState<CalcUnit>("oz");
  return (
    <section className={card} aria-labelledby="mc">
      <h2 id="mc" className="mb-1 text-lg uppercase tracking-[0.15em]">Measurement converter</h2>
      <p className="mb-5 text-xs text-muted-foreground">Bar-standard conversions. Grams assume water density (approximate).</p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Amount" htmlFor="mamt"><Input id="mamt" type="number" step="any" min={0} value={amount} onChange={(e) => setAmount(Number(e.target.value) || 0)} /></Field>
        <Field label="From" htmlFor="mfrom"><select id="mfrom" className={selectCls} value={from} onChange={(e) => setFrom(e.target.value as CalcUnit)}>{CALC_UNITS.map((u) => <option key={u}>{u}</option>)}</select></Field>
      </div>
      <ul className="mt-5 grid grid-cols-3 gap-px bg-border">
        {CALC_UNITS.filter((u) => u !== from).map((u) => (
          <li key={u} className="bg-background p-3 text-center"><span className="block font-display text-lg text-primary">{formatAmount(convert(amount, from, u))}</span><span className="text-xs uppercase tracking-widest text-muted-foreground">{u}</span></li>
        ))}
      </ul>
    </section>
  );
}

export function CostCalculator() {
  const [rows, setRows] = useState<CostRow[]>([{ name: "Gin", bottleCost: 28, bottleSizeMl: 700, pourMl: 50 }, { name: "Lemon juice", bottleCost: 3, bottleSizeMl: 1000, pourMl: 25 }]);
  const [extras, setExtras] = useState(0.3);
  const [servings, setServings] = useState(1);
  const [price, setPrice] = useState(12);
  const s = costSummary(rows, extras, servings, price);
  const upd = (n: number, k: keyof CostRow, v: string) => setRows(rows.map((r, i) => i === n ? { ...r, [k]: k === "name" ? v : Number(v) || 0 } : r));
  return (
    <section className={card} aria-labelledby="cc">
      <h2 id="cc" className="mb-1 text-lg uppercase tracking-[0.15em]">Cocktail cost calculator</h2>
      <p className="mb-5 text-xs text-muted-foreground">Ingredient cost = bottle cost ÷ bottle size × pour.</p>
      <div className="space-y-2">
        <div className="hidden grid-cols-[1.5fr_1fr_1fr_1fr_70px_auto] gap-2 text-[0.65rem] uppercase tracking-widest text-muted-foreground sm:grid"><span>Ingredient</span><span>Bottle cost</span><span>Bottle ml</span><span>Pour ml</span><span>Cost</span><span /></div>
        {rows.map((r, n) => (
          <div key={n} className="grid grid-cols-3 gap-2 sm:grid-cols-[1.5fr_1fr_1fr_1fr_70px_auto]">
            <Input aria-label="Ingredient" className="col-span-3 sm:col-span-1" value={r.name} onChange={(e) => upd(n, "name", e.target.value)} />
            <Input aria-label="Bottle cost" type="number" step="0.01" value={r.bottleCost} onChange={(e) => upd(n, "bottleCost", e.target.value)} />
            <Input aria-label="Bottle size ml" type="number" value={r.bottleSizeMl} onChange={(e) => upd(n, "bottleSizeMl", e.target.value)} />
            <Input aria-label="Pour ml" type="number" step="any" value={r.pourMl} onChange={(e) => upd(n, "pourMl", e.target.value)} />
            <span className="self-center font-display text-sm text-primary">{ingredientCost(r).toFixed(2)}</span>
            <Button variant="ghost" size="icon" aria-label="Remove" onClick={() => setRows(rows.filter((_, i) => i !== n))}><Trash2 /></Button>
          </div>
        ))}
        <Button variant="goldOutline" size="sm" onClick={() => setRows([...rows, { name: "", bottleCost: 0, bottleSizeMl: 700, pourMl: 0 }])}><Plus />Add ingredient</Button>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <Field label="Garnish / extras" htmlFor="cex"><Input id="cex" type="number" step="0.01" value={extras} onChange={(e) => setExtras(Number(e.target.value) || 0)} /></Field>
        <Field label="Servings" htmlFor="csv"><Input id="csv" type="number" min={1} value={servings} onChange={(e) => setServings(Number(e.target.value) || 1)} /></Field>
        <Field label="Selling price" htmlFor="cpr"><Input id="cpr" type="number" step="0.01" value={price} onChange={(e) => setPrice(Number(e.target.value) || 0)} /></Field>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
        {[["Total cost", s.total.toFixed(2)], ["Cost / serving", s.perServing.toFixed(2)], ["Margin", s.marginPct == null ? "—" : `${s.marginPct.toFixed(1)}%`], ["Pour cost", s.pourCostPct == null ? "—" : `${s.pourCostPct.toFixed(1)}%`]].map(([k, v]) => (
          <div key={k} className="bg-background p-3"><dt className="text-[0.65rem] uppercase tracking-widest text-muted-foreground">{k}</dt><dd className="font-display text-xl text-primary">{v}</dd></div>
        ))}
      </dl>
    </section>
  );
}
