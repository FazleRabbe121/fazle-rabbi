import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Monogram } from "@/components/site/Monogram";
import { publicAsset } from "@/lib/media";
import { isUnlocked } from "@/lib/passcode";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Recipe Book Sign In — Fazle Rabbi" },
      { name: "description", content: "Sign in or create an account for the private cocktail recipe book." },
      { property: "og:title", content: "Recipe Book Sign In — Fazle Rabbi" },
      { property: "og:description", content: "Sign in to your private cocktail recipe book." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({ email: z.string().trim().email("Enter a valid email").max(255), password: z.string().min(6, "Password must be at least 6 characters").max(200) });

export function AuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-navy-glow px-5 py-16">
      <div className="w-full max-w-md border border-border bg-card/80 p-8 shadow-gold backdrop-blur md:p-10">
        <Link to="/" className="mb-8 flex items-center gap-3" aria-label="Back to website"><Monogram /><span className="eyebrow">Fazle Rabbi</span></Link>
        <h1 className="mb-6 text-2xl font-light uppercase tracking-[0.15em]">{title}</h1>
        {children}
      </div>
    </main>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [sent, setSent] = useState("");

  useEffect(() => {
    if (!isUnlocked()) { navigate({ to: "/unlock", replace: true }); return; }
    supabase.auth.getUser().then(({ data }) => { if (data.user) navigate({ to: "/dashboard", replace: true }); });
  }, [navigate]);

  async function onSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr("");
    const fd = Object.fromEntries(new FormData(e.currentTarget));
    const p = schema.safeParse(fd);
    if (!p.success) return setErr(p.error.issues[0]?.message ?? "Invalid input");
    if (fd["confirm"] !== p.data.password) return setErr("Passwords do not match.");
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({ ...p.data, options: { emailRedirectTo: window.location.origin + publicAsset("") } });
    setBusy(false);
    if (error) return setErr(error.message);
    if (data.session) return navigate({ to: "/dashboard", replace: true });
    setSent(p.data.email); setMode("login");
  }

  async function onLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr("");
    const p = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!p.success) return setErr(p.error.issues[0]?.message ?? "Invalid input");
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(p.data);
    setBusy(false);
    if (error) return setErr(error.message === "Invalid login credentials" ? "Incorrect email or password." : error.message);
    navigate({ to: "/dashboard", replace: true });
  }

  async function onForgot(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr("");
    const email = z.string().trim().email().safeParse(new FormData(e.currentTarget).get("email"));
    if (!email.success) return setErr("Enter a valid email");
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.data, { redirectTo: window.location.origin + publicAsset("reset-password") });
    setBusy(false);
    if (error) return setErr(error.message);
    toast.success("If that email has an account, a reset link is on its way.");
    setMode("login");
  }

  return (
    <AuthShell title={mode === "forgot" ? "Reset password" : "Private Recipe Book"}>
      {mode !== "forgot" && (
        <div role="tablist" aria-label="Account" className="mb-6 grid grid-cols-2 border border-border">
          {(["login", "signup"] as const).map((m) => (
            <button key={m} role="tab" aria-selected={mode === m} type="button" onClick={() => { setMode(m); setErr(""); }}
              className={`py-2 font-display text-xs uppercase tracking-[0.2em] ${mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary"}`}>{m === "login" ? "Sign in" : "Create account"}</button>
          ))}
        </div>
      )}
      {sent && mode === "login" && <p role="status" className="mb-5 border border-primary/40 bg-primary/10 p-3 text-sm text-gold-soft">Check {sent} for a confirmation link, then sign in here.</p>}
      {mode === "signup" ? (
        <form onSubmit={onSignup} className="space-y-5" noValidate>
          <div className="space-y-2"><Label htmlFor="semail">Email</Label><Input id="semail" name="email" type="email" autoComplete="email" required /></div>
          <div className="space-y-2"><Label htmlFor="spass">Password</Label><Input id="spass" name="password" type="password" autoComplete="new-password" required /></div>
          <div className="space-y-2"><Label htmlFor="sconf">Confirm password</Label><Input id="sconf" name="confirm" type="password" autoComplete="new-password" required /></div>
          {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
          <Button type="submit" variant="gold" size="lg" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />}Create account</Button>
        </form>
      ) : mode === "login" ? (
        <form onSubmit={onLogin} className="space-y-5" noValidate>
          <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" autoComplete="email" required /></div>
          <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" autoComplete="current-password" required /></div>
          {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
          <Button type="submit" variant="gold" size="lg" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />}Sign in</Button>
          <button type="button" className="w-full text-center text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline" onClick={() => { setMode("forgot"); setErr(""); }}>Forgot password?</button>
        </form>
      ) : (
        <form onSubmit={onForgot} className="space-y-5" noValidate>
          <p className="text-sm text-muted-foreground">Enter your email and we'll send a secure link to set a new password.</p>
          <div className="space-y-2"><Label htmlFor="femail">Email</Label><Input id="femail" name="email" type="email" autoComplete="email" required /></div>
          {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
          <Button type="submit" variant="gold" size="lg" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />}Send reset link</Button>
          <button type="button" className="w-full text-center text-sm text-muted-foreground hover:text-primary" onClick={() => { setMode("login"); setErr(""); }}>Back to sign in</button>
        </form>
      )}
      <p className="mt-8 text-center text-xs text-muted-foreground">Each account sees only its own recipes.</p>
    </AuthShell>
  );
}
