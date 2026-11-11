import type { ReactNode } from "react";

export function Section({ id, eyebrow, title, intro, children, className = "" }: { id: string; eyebrow: string; title: ReactNode; intro?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`relative px-5 py-24 md:px-8 md:py-32 ${className}`}>
      <div className="mx-auto max-w-7xl">
        <header className="reveal mb-14 max-w-3xl">
          <p className="eyebrow mb-4">{eyebrow}</p>
          <h2 id={`${id}-title`} className="text-3xl font-light uppercase leading-tight tracking-[0.08em] text-foreground md:text-5xl">{title}</h2>
          {intro && <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">{intro}</p>}
        </header>
        {children}
      </div>
    </section>
  );
}
