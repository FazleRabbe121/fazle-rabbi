import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Award, Coffee, GlassWater, Linkedin, Mail, MessageCircle, Phone, Sparkles, Star } from "lucide-react";
import { site } from "@/content/site";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Section } from "@/components/site/Section";
import { Lightbox, type LightboxItem } from "@/components/site/Lightbox";
import { ContactForm } from "@/components/site/ContactForm";
import { Monogram } from "@/components/site/Monogram";
import { Button } from "@/components/ui/button";
import { useReveal } from "@/hooks/use-reveal";

const TITLE = "Fazle Rabbi — Professional Bartender, Barista & Mixologist";
const DESC = "Portfolio of Fazle Rabbi: luxury bartending, signature cocktails, specialty coffee and latte art. Available for hospitality recruitment and private events.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
    links: [{ rel: "canonical", href: site.siteUrl + "/" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org", "@type": "Person", name: site.name, jobTitle: "Bartender, Barista and Mixologist",
        description: DESC, url: site.siteUrl, email: `mailto:${site.contact.email}`, sameAs: [site.contact.linkedin, site.contact.instagram],
        knowsAbout: ["Mixology", "Cocktails", "Specialty coffee", "Latte art", "Bar operations", "Hospitality"],
      }),
    }],
  }),
  component: Home,
});

function Home() {
  useReveal();
  return (
    <>
      <a href="#about" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">Skip to content</a>
      <Nav />
      <main>
        <Hero />
        <About />
        <Experience />
        <Expertise />
        <Signature />
        <Gallery />
        <Highlights />
        <Certifications />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

function About() {
  return (
    <Section id="about" eyebrow="01 — About me" title={site.about.heading}>
      <div className="grid items-center gap-12 lg:grid-cols-[5fr_7fr]">
        <div className="reveal relative">
          <div className="absolute -inset-3 border border-primary/30" aria-hidden="true" />
          <img src={site.images.portrait} alt={`Portrait of ${site.name} behind the bar`} width={1024} height={1280} loading="lazy" className="relative aspect-[4/5] w-full object-cover" />
        </div>
        <div className="reveal space-y-6">
          {site.about.paragraphs.map((p) => <p key={p} className="text-lg leading-relaxed text-muted-foreground">{p}</p>)}
          <dl className="grid grid-cols-2 gap-6 pt-6 sm:grid-cols-4">
            {site.about.stats.map((s) => (
              <div key={s.label} className="border-l border-primary/40 pl-4">
                <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{s.label}</dt>
                <dd className="mt-1 font-display text-3xl font-light text-gold-gradient">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  );
}

function Experience() {
  return (
    <Section id="experience" eyebrow="02 — Professional experience" title="A career built behind the bar" className="bg-navy-glow">
      <ol className="relative ml-3 border-l border-primary/30 md:ml-0">
        {site.experience.map((e) => (
          <li key={e.role + e.period} className="reveal relative mb-14 pl-8 md:grid md:grid-cols-[220px_1fr] md:gap-10 md:pl-12">
            <span className="absolute -left-[7px] top-1.5 h-3.5 w-3.5 rotate-45 border border-primary bg-background" aria-hidden="true" />
            <p className="eyebrow mb-2 md:mb-0">{e.period}</p>
            <div>
              <h3 className="text-xl uppercase tracking-[0.12em] text-foreground">{e.role}</h3>
              <p className="mt-1 font-serif italic text-gold-soft">{e.venue}</p>
              <ul className="mt-4 space-y-2 text-muted-foreground">
                {e.points.map((p) => <li key={p} className="flex gap-3"><span className="mt-2.5 h-px w-4 shrink-0 bg-primary" />{p}</li>)}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function Expertise() {
  return (
    <>
      <Section id="skills" eyebrow="03 — Hospitality skills" title="Service, operations, leadership">
        <ul className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {site.hospitalitySkills.map((s) => (
            <li key={s} className="reveal flex items-center gap-3 bg-background p-6 text-sm uppercase tracking-[0.12em] text-foreground"><Star className="h-4 w-4 text-primary" />{s}</li>
          ))}
        </ul>
      </Section>
      <div id="expertise">
        <ExpertiseBlock id="mixology" eyebrow="04 — Mixology & cocktail expertise" title="The art of balance" intro={site.mixology.intro} items={site.mixology.items} icon={<GlassWater className="h-5 w-5" />} />
        <ExpertiseBlock id="coffee" eyebrow="05 — Coffee & barista expertise" title="From bean to latte art" intro={site.coffee.intro} items={site.coffee.items} icon={<Coffee className="h-5 w-5" />} navy />
      </div>
    </>
  );
}

function ExpertiseBlock({ id, eyebrow, title, intro, items, icon, navy }: { id: string; eyebrow: string; title: string; intro: string; items: readonly { title: string; text: string }[]; icon: React.ReactNode; navy?: boolean }) {
  return (
    <Section id={id} eyebrow={eyebrow} title={title} intro={intro} className={navy ? "bg-secondary/40" : ""}>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, n) => (
          <article key={it.title} className="reveal group border border-border bg-card/60 p-7 transition-all duration-500 hover:-translate-y-1 hover:border-primary/60 hover:shadow-gold" style={{ transitionDelay: `${n * 60}ms` }}>
            <span className="text-primary">{icon}</span>
            <h3 className="mt-5 text-sm font-semibold uppercase tracking-[0.18em]">{it.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{it.text}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

function Signature() {
  return (
    <Section id="signature" eyebrow="06 — Signature cocktails" title="Signature serves">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {site.signatureCocktails.map((c) => (
          <article key={c.name} className="reveal group relative overflow-hidden">
            <img src={c.image} alt={`${c.name} cocktail`} width={1024} height={1280} loading="lazy" className="aspect-[4/5] w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <p className="eyebrow">{c.spirit}</p>
              <h3 className="mt-2 text-xl uppercase tracking-[0.12em] text-ivory">{c.name}</h3>
              <p className="mt-2 text-sm text-ivory/75">{c.description}</p>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

function Gallery() {
  const cats = useMemo(() => ["All", ...new Set(site.cocktailGallery.map((g) => g.category))], []);
  const [filter, setFilter] = useState("All");
  const shown = site.cocktailGallery.filter((g) => filter === "All" || g.category === filter);
  const [cIdx, setCIdx] = useState<number | null>(null);
  const [kIdx, setKIdx] = useState<number | null>(null);
  const coffee: LightboxItem[] = site.coffeeGallery.map((g) => ({ src: g.src, alt: g.alt }));
  return (
    <>
      <Section id="gallery" eyebrow="07 — Cocktail gallery" title="Behind the glass" className="bg-navy-glow">
        <div role="group" aria-label="Filter gallery" className="reveal mb-8 flex flex-wrap gap-2">
          {cats.map((c) => (
            <button key={c} onClick={() => setFilter(c)} aria-pressed={filter === c}
              className={`rounded-sm border px-4 py-2 font-display text-[0.68rem] uppercase tracking-[0.2em] transition-colors ${filter === c ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary hover:text-primary"}`}>{c}</button>
          ))}
        </div>
        <ul className="columns-2 gap-4 md:columns-3 [&>li]:mb-4">
          {shown.map((g, i) => (
            <li key={g.alt} className="break-inside-avoid">
              <button onClick={() => setCIdx(i)} className="group block w-full overflow-hidden" aria-label={`Open image: ${g.alt}`}>
                <img src={g.src} alt={g.alt} loading="lazy" className="w-full transition-transform duration-700 group-hover:scale-105" />
              </button>
            </li>
          ))}
        </ul>
        <Lightbox items={shown} index={cIdx} onClose={() => setCIdx(null)} onIndex={setCIdx} />
      </Section>
      <Section id="coffee-gallery" eyebrow="08 — Coffee art gallery" title="Latte art & espresso">
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {coffee.map((g, i) => (
            <li key={g.alt}><button onClick={() => setKIdx(i)} className="group block w-full overflow-hidden" aria-label={`Open image: ${g.alt}`}>
              <img src={g.src} alt={g.alt} loading="lazy" width={1024} height={1024} className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </button></li>
          ))}
        </ul>
        <Lightbox items={coffee} index={kIdx} onClose={() => setKIdx(null)} onIndex={setKIdx} />
      </Section>
    </>
  );
}

function Highlights() {
  return (
    <Section id="highlights" eyebrow="09 — Career highlights" title="Moments that matter" className="bg-secondary/40">
      <ul className="grid gap-6 md:grid-cols-2">
        {site.highlights.map((h) => (
          <li key={h.title} className="reveal flex items-start gap-6 border-b border-border pb-6">
            <span className="font-display text-4xl font-light text-gold-gradient">{h.year}</span>
            <p className="pt-2 text-foreground"><Sparkles className="mr-2 inline h-4 w-4 text-primary" />{h.title}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function Certifications() {
  return (
    <Section id="certifications" eyebrow="10 — Certifications & training" title="Credentials">
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {site.certifications.map((c) => (
          <li key={c.name} className="reveal border border-primary/30 bg-card/60 p-6">
            <Award className="h-6 w-6 text-primary" />
            <h3 className="mt-4 text-sm font-semibold uppercase leading-snug tracking-[0.12em]">{c.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{c.issuer}</p>
            <p className="eyebrow mt-3">{c.year}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function Contact() {
  const c = site.contact;
  return (
    <Section id="contact" eyebrow="11 — Contact & recruitment enquiries" title="Let's create something exceptional" intro={c.availability} className="bg-navy-glow">
      <div className="grid gap-12 lg:grid-cols-[2fr_3fr]">
        <div className="reveal space-y-4">
          <Button asChild variant="goldOutline" size="lg" className="w-full justify-start"><a href={c.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin className="h-4 w-4" />LinkedIn profile</a></Button>
          <Button asChild variant="goldOutline" size="lg" className="w-full justify-start"><a href={c.whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" />Message on WhatsApp</a></Button>
          <Button asChild variant="goldOutline" size="lg" className="w-full justify-start"><a href={`mailto:${c.email}`}><Mail className="h-4 w-4" />{c.email}</a></Button>
          <Button asChild variant="ghostGold" size="lg" className="w-full justify-start"><a href={`tel:${c.phone.replace(/\s/g, "")}`}><Phone className="h-4 w-4" />{c.phone}</a></Button>
        </div>
        <div className="reveal"><ContactForm /></div>
      </div>
    </Section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border px-5 py-10 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs uppercase tracking-[0.2em] text-muted-foreground md:flex-row">
        <span className="flex items-center gap-3"><Monogram className="h-7 w-7 text-xs" />© {new Date().getFullYear()} {site.name}</span>
        <span>Bartender · Barista · Mixologist</span>
      </div>
    </footer>
  );
}
