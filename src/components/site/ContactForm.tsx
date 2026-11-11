import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ENQUIRY_TYPES } from "@/content/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().max(40).regex(/^[+\d\s().-]*$/, "Invalid phone number").optional().or(z.literal("")),
  organisation: z.string().trim().max(150).optional().or(z.literal("")),
  enquiry_type: z.enum(ENQUIRY_TYPES),
  message: z.string().trim().min(10, "Message should be at least 10 characters").max(3000),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date").optional().or(z.literal("")),
  event_venue: z.string().trim().max(150).optional().or(z.literal("")),
  guest_count: z.union([z.literal(""), z.coerce.number().int("Whole number").min(1, "At least 1").max(100000)]).optional(),
});
export const BOOK_EVENT = "fr:book-event";

const COOLDOWN_KEY = "fr_contact_last";

export function ContactForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [serverError, setServerError] = useState("");
  const startedAt = useRef(Date.now());
  const [type, setType] = useState<string>("Recruitment");
  useEffect(() => { const on = () => setType("Event booking"); window.addEventListener(BOOK_EVENT, on); return () => window.removeEventListener(BOOK_EVENT, on); }, []);
  const isEvent = type === "Event booking";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("website")) { setStatus("sent"); return; } // honeypot: silently drop bots
    if (Date.now() - startedAt.current < 2500) { setServerError("Please take a moment before sending."); return; }
    const last = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
    if (Date.now() - last < 60_000) { setServerError("You've just sent a message — please wait a minute before sending another."); return; }
    const parsed = contactSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0] as string, i.message])));
      return;
    }
    setErrors({}); setServerError(""); setStatus("sending");
    const v = parsed.data;
    const { error } = await supabase.from("contact_messages").insert({ ...v, phone: v.phone || null, organisation: v.organisation || null,
      event_date: isEvent && v.event_date ? v.event_date : null, event_venue: isEvent && v.event_venue ? v.event_venue : null, guest_count: isEvent && typeof v.guest_count === "number" ? v.guest_count : null });
    if (error) {
      setStatus("error");
      setServerError(error.message.includes("RATE_LIMIT") ? "Too many messages in a short time. Please try again later." : "Your message couldn't be sent. Please try again or email directly.");
      return;
    }
    localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div role="status" className="flex flex-col items-center rounded-sm border border-primary/40 bg-card p-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-primary" />
        <h3 className="mt-4 text-xl uppercase tracking-[0.15em]">Thank you</h3>
        <p className="mt-2 text-muted-foreground">Your enquiry has been received. I'll reply within 1–2 business days.</p>
        <Button variant="goldOutline" className="mt-6" onClick={() => { setStatus("idle"); startedAt.current = Date.now(); }}>Send another</Button>
      </div>
    );
  }

  const field = (name: string, label: string, el: React.ReactNode) => (
    <div className="space-y-2">
      <Label htmlFor={name} className="font-display text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">{label}</Label>
      {el}
      {errors[name] && <p id={`${name}-err`} className="text-xs text-destructive">{errors[name]}</p>}
    </div>
  );
  const aria = (n: string) => ({ id: n, name: n, "aria-invalid": !!errors[n], "aria-describedby": errors[n] ? `${n}-err` : undefined });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5 rounded-sm border border-border bg-card/70 p-6 md:p-8">
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="website">Website</label><input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {field("name", "Full name *", <Input {...aria("name")} autoComplete="name" maxLength={100} />)}
        {field("email", "Email *", <Input {...aria("email")} type="email" autoComplete="email" maxLength={255} />)}
        {field("phone", "Phone", <Input {...aria("phone")} type="tel" autoComplete="tel" maxLength={40} />)}
        {field("organisation", "Organisation / Venue", <Input {...aria("organisation")} autoComplete="organization" maxLength={150} />)}
      </div>
      {field("enquiry_type", "Enquiry type *",
        <select {...aria("enquiry_type")} value={type} onChange={(e) => setType(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground">
          {ENQUIRY_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>)}
      {isEvent && (
        <div className="grid gap-5 md:grid-cols-3">
          {field("event_date", "Event date", <Input {...aria("event_date")} type="date" />)}
          {field("event_venue", "Venue or city", <Input {...aria("event_venue")} maxLength={150} />)}
          {field("guest_count", "Approx. guests", <Input {...aria("guest_count")} type="number" inputMode="numeric" min={1} />)}
        </div>
      )}
      {field("message", "Message *", <Textarea {...aria("message")} rows={6} maxLength={3000} />)}
      {serverError && <p role="alert" className="text-sm text-destructive">{serverError}</p>}
      <Button type="submit" variant="gold" size="lg" disabled={status === "sending"} className="w-full md:w-auto">
        {status === "sending" && <Loader2 className="h-4 w-4 animate-spin" />} Send enquiry
      </Button>
    </form>
  );
}
