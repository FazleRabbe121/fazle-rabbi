export function Monogram({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`inline-grid place-items-center rounded-sm border border-primary/60 font-display text-sm font-semibold tracking-wider text-gold-gradient ${className}`}>
      FR
    </span>
  );
}
