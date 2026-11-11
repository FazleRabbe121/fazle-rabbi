import { useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type LightboxItem = { src: string; alt: string };

export function Lightbox({ items, index, onClose, onIndex }: { items: LightboxItem[]; index: number | null; onClose: () => void; onIndex: (i: number) => void }) {
  useEffect(() => {
    if (index == null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex((index + 1) % items.length);
      if (e.key === "ArrowLeft") onIndex((index - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [index, items.length, onClose, onIndex]);
  if (index == null || !items[index]) return null;
  const it = items[index];
  return (
    <div role="dialog" aria-modal="true" aria-label={it.alt} className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/95 p-4 backdrop-blur" onClick={onClose}>
      <button autoFocus aria-label="Close" className="absolute right-5 top-5 rounded-full border border-border p-2 text-foreground hover:text-primary" onClick={onClose}><X /></button>
      {items.length > 1 && (<>
        <button aria-label="Previous image" className="absolute left-3 rounded-full border border-border p-2 text-foreground hover:text-primary md:left-8" onClick={(e) => { e.stopPropagation(); onIndex((index - 1 + items.length) % items.length); }}><ChevronLeft /></button>
        <button aria-label="Next image" className="absolute right-3 rounded-full border border-border p-2 text-foreground hover:text-primary md:right-8" onClick={(e) => { e.stopPropagation(); onIndex((index + 1) % items.length); }}><ChevronRight /></button>
      </>)}
      <figure className="max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <img src={it.src} alt={it.alt} className="max-h-[82vh] w-auto rounded-sm object-contain shadow-gold" />
        <figcaption className="mt-3 text-center text-sm text-muted-foreground">{it.alt} · {index + 1}/{items.length}</figcaption>
      </figure>
    </div>
  );
}
