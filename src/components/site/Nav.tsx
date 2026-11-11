import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { Monogram } from "./Monogram";

export const NAV = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "expertise", label: "Expertise" },
  { id: "signature", label: "Cocktails" },
  { id: "gallery", label: "Gallery" },
  { id: "certifications", label: "Credentials" },
  { id: "contact", label: "Contact" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; }, [open]);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "border-b border-border bg-background/85 backdrop-blur-md" : "bg-transparent"}`}>
      <nav aria-label="Main" className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <a href="#top" className="flex items-center gap-3" aria-label="Fazle Rabbi — back to top">
          <Monogram />
          <span className="hidden font-display text-xs font-semibold uppercase tracking-[0.35em] text-foreground sm:inline">Fazle Rabbi</span>
        </a>
        <ul className="hidden items-center gap-7 lg:flex">
          {NAV.map((n) => (
            <li key={n.id}><a href={`#${n.id}`} className="font-display text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-primary">{n.label}</a></li>
          ))}
          <li><Link to="/login" className="font-display text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground hover:text-primary">Owner</Link></li>
        </ul>
        <button className="rounded-sm p-2 text-foreground lg:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </nav>
      {open && (
        <div className="fixed inset-0 top-[68px] z-40 bg-background/98 backdrop-blur-lg lg:hidden">
          <ul className="flex flex-col items-center gap-7 pt-14">
            {NAV.map((n) => (
              <li key={n.id}><a onClick={() => setOpen(false)} href={`#${n.id}`} className="font-display text-sm uppercase tracking-[0.35em] text-foreground hover:text-primary">{n.label}</a></li>
            ))}
            <li><Link to="/login" onClick={() => setOpen(false)} className="font-display text-sm uppercase tracking-[0.35em] text-muted-foreground">Owner login</Link></li>
          </ul>
        </div>
      )}
    </header>
  );
}
