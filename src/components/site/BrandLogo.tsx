import { site } from "@/content/site";
import { publicAsset } from "@/lib/media";

const sizes = {
  venue: "h-14 w-14",
  training: "h-11 w-11",
  timeline: "h-10 w-10",
};

/** Keep the original artwork contained; optical adjustments only shrink it. */
export function BrandLogo({ src, alt, size = "venue" }: {
  src: string;
  alt: string;
  size?: keyof typeof sizes;
}) {
  const adjustment = site.logoPresentation[src];
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-sm border border-border bg-ivory p-1 ${sizes[size]}`}>
      <img
        src={publicAsset(src)}
        alt={alt}
        aria-hidden={alt === "" ? true : undefined}
        loading="lazy"
        className="h-full w-full object-contain"
        style={{ transform: `scale(${adjustment?.scale ?? 1})` }}
      />
    </span>
  );
}