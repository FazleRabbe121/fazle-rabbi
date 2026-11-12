import { site } from "@/content/site";
import { publicAsset } from "@/lib/media";

type Item = { name: string; logo?: string };

function Tile({ item }: { item: Item }) {
  return (
    <li className="group flex h-full flex-col items-center justify-start gap-5 border border-border bg-card/40 px-6 py-10 text-center transition-all duration-500 hover:-translate-y-1 hover:border-primary/50 hover:bg-card/70 hover:shadow-gold">
      {item.logo ? (
        <img
          src={publicAsset(item.logo)}
          alt={item.name}
          loading="lazy"
          className="h-24 w-24 rounded-sm bg-ivory object-contain p-2.5 shadow-gold transition-transform duration-500 group-hover:scale-[1.05]"
        />
      ) : (
        <span aria-hidden="true" className="flex h-24 w-24 items-center justify-center rounded-sm border border-primary/20 bg-ivory font-display text-2xl text-bronze">✦</span>
      )}
      <span
        aria-hidden={item.logo ? true : undefined}
        className="font-display text-[0.68rem] uppercase leading-relaxed tracking-[0.2em] text-muted-foreground transition-colors duration-500 group-hover:text-gold-soft"
      >
        {item.name}
      </span>
    </li>
  );
}

export function VenueLogos() {
  return (
    <section aria-label="Where I have worked and trained" className="border-y border-border bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h3 className="eyebrow text-center">Where I have worked</h3>
        <span aria-hidden="true" className="gold-rule mx-auto mt-5 block w-full max-w-xs" />
        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {site.venues.map((v) => <Tile key={v.name} item={v} />)}
        </ul>

        <h3 className="eyebrow mt-14 text-center">Trained with</h3>
        <span aria-hidden="true" className="gold-rule mx-auto mt-5 block w-full max-w-xs" />
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-5">
          {site.trainedWith.map((t) => (
            <li key={t.name}>
              {t.logo ? (
                <img src={publicAsset(t.logo)} alt={t.name} loading="lazy" className="h-14 w-14 rounded-sm bg-ivory object-contain p-2 shadow-gold" />
              ) : (
                <span className="font-display text-sm font-medium uppercase tracking-[0.3em] text-gold-gradient">{t.name}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
