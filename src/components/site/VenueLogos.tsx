import { site } from "@/content/site";
import { BrandLogo } from "@/components/site/BrandLogo";

type Item = { name: string; logo?: string };

function Tile({ item }: { item: Item }) {
  return (
    <li className="flex min-w-0 flex-col items-center gap-2 px-1 py-2 text-center">
      {item.logo ? (
        <BrandLogo src={item.logo} alt={item.name} />
      ) : (
        <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-sm border border-border bg-ivory p-1 font-display text-lg text-bronze">✦</span>
      )}
      <span
        aria-hidden={item.logo ? true : undefined}
        className="line-clamp-2 min-h-7 w-full font-display text-[0.6rem] uppercase leading-[14px] tracking-normal text-muted-foreground"
      >
        {item.name}
      </span>
    </li>
  );
}

export function VenueLogos() {
  return (
    <section aria-label="Where I have worked and trained" className="border-y border-border bg-background py-8 sm:py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h3 className="eyebrow text-center">Where I have worked</h3>
        <span aria-hidden="true" className="gold-rule mx-auto mt-3 block w-full max-w-xs" />
        <ul className="mt-5 grid grid-cols-3 gap-x-2 gap-y-3 lg:grid-cols-6">
          {site.venues.map((v) => <Tile key={v.name} item={v} />)}
        </ul>

        <h3 className="eyebrow mt-6 text-center">Trained with</h3>
        <span aria-hidden="true" className="gold-rule mx-auto mt-3 block w-full max-w-xs" />
        <ul className="mt-4 flex flex-wrap items-start justify-center gap-x-6 gap-y-3">
          {site.trainedWith.map((t) => (
            <li key={t.name} className="flex min-h-11 max-w-40 flex-col items-center justify-center gap-2 text-center">
              {t.logo ? (
                <>
                  <BrandLogo src={t.logo} alt={t.name} size="training" />
                  <span aria-hidden="true" className="line-clamp-2 min-h-7 font-display text-[0.6rem] uppercase leading-[14px] tracking-normal text-muted-foreground">{t.name}</span>
                </>
              ) : (
                <span className="font-display text-[0.6rem] font-medium uppercase leading-relaxed tracking-normal text-gold-soft">{t.name}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
