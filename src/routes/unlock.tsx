import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BookLock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthShell } from "./login";
import { checkPasscode, isUnlocked, markUnlocked } from "@/lib/passcode";

export const Route = createFileRoute("/unlock")({
  head: () => ({
    meta: [
      { title: "Private Recipe Book — Fazle Rabbi" },
      { name: "description", content: "Enter the passcode to open Fazle Rabbi's private recipe book." },
      { property: "og:title", content: "Private Recipe Book — Fazle Rabbi" },
      { property: "og:description", content: "Passcode-protected cocktail recipe book." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: UnlockPage,
});

function UnlockPage() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => { if (isUnlocked()) navigate({ to: "/dashboard", replace: true }); else refs.current[0]?.focus(); }, [navigate]);

  async function submit(code: string) {
    setBusy(true); setErr("");
    const ok = await checkPasscode(code);
    setBusy(false);
    if (ok) { markUnlocked(); navigate({ to: "/dashboard", replace: true }); }
    else { setErr("Incorrect passcode. Please try again."); setDigits(["", "", "", ""]); refs.current[0]?.focus(); }
  }
  function setAt(i: number, v: string) {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = digits.map((x, k) => (k === i ? d : x)); setDigits(next);
    if (d && i < 3) refs.current[i + 1]?.focus();
    if (next.every(Boolean)) void submit(next.join(""));
  }

  return (
    <AuthShell title="Private Recipe Book">
      <BookLock className="mb-4 h-8 w-8 text-primary" aria-hidden />
      <form onSubmit={(e) => { e.preventDefault(); void submit(digits.join("")); }} className="space-y-6">
        <fieldset>
          <legend className="mb-4 text-sm text-muted-foreground">Enter the 4-digit passcode to open the recipe book.</legend>
          <div className="flex justify-center gap-3">
            {digits.map((d, i) => (
              <input key={i} ref={(el) => { refs.current[i] = el; }} value={d} inputMode="numeric" type="password" autoComplete="off" maxLength={1}
                aria-label={`Passcode digit ${i + 1}`} onChange={(e) => setAt(i, e.target.value)}
                onKeyDown={(e) => { if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus(); }}
                className="h-14 w-12 rounded-sm border border-primary/40 bg-background text-center font-display text-2xl text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40" />
            ))}
          </div>
        </fieldset>
        {err && <p role="alert" className="text-center text-sm text-destructive">{err}</p>}
        <Button type="submit" variant="gold" size="lg" className="w-full" disabled={busy || digits.some((d) => !d)}>{busy && <Loader2 className="animate-spin" />}Open recipe book</Button>
      </form>
    </AuthShell>
  );
}
