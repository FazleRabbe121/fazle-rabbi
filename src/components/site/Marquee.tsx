import { site } from "@/content/site";
import { publicAsset } from "@/lib/media";

type Item = { name: string; logo?: string };

function Mark({ item }: { item: Item }) {
  return item.logo
    ? <img src={publicAsset(item.logo)} alt={item.name} loading="lazy" className="h-10 w-auto object-contain opacity-70 grayscale transition duration-500 hover:opacity-100 hover:grayscale-0" />
    : <span className="whitespace-nowrap font-display text-sm font-medium uppercase tracking-[0.3em] text-gold-gradient">{item.name}</span>;
}

function Row({ title, items, reverse, seconds }: { title: string; items: Item[]; reverse?: boolean; seconds: number }) {
  const list = (hidden?: boolean) => (
    <ul className="marquee-list flex shrink-0 items-center gap-14 pr-14" aria-hidden={hidden || undefined}>
      {items.map((i) => <li key={i.name} className="flex items-center gap-14"><Mark item={i} /><span aria-hidden className="text-primary/50">✦</span></li>)}
    </ul>
  );
  return (
    <div>
      <h3 className="eyebrow mb-4 text-center">{title}</h3>
      <div tabIndex={0} aria-label={`${title}: ${items.map((i) => i.name).join(", ")}`} className="marquee group relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
        <div className={`marquee-track flex w-max ${reverse ? "marquee-reverse" : ""}`} style={{ animationDuration: `${seconds}s` }}>
          {list()}{list(true)}
        </div>
      </div>
    </div>
  );
}

export function Marquees() {
  return (
    <section aria-label="Where I have worked and trained" className="space-y-8 border-y border-border bg-background py-10">
      <Row title="Where I have worked" items={site.venues} seconds={40} />
      <Row title="Trained with" items={site.trainedWith} reverse seconds={30} />
    </section>
  );
}
