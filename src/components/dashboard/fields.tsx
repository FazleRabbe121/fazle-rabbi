import { Label } from "@/components/ui/label";
export const selectCls = "h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground";
export function Field({ label, htmlFor, children, className = "" }: { label: string; htmlFor?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label htmlFor={htmlFor} className="font-display text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
export const num = (v: string): number | null => (v.trim() === "" || isNaN(Number(v)) ? null : Number(v));
