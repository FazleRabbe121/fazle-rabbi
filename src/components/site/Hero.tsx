import { useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/content/site";
import { HERO_VIDEO_SRC, CV_URL } from "@/lib/media";

export function Hero() {
  const [videoFailed, setVideoFailed] = useState(false);
  return (
    <section id="top" aria-label="Introduction" className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
      <img src={site.images.heroPoster} alt="" aria-hidden="true" width={1920} height={1088} fetchPriority="high" className="absolute inset-0 h-full w-full animate-slow-zoom object-cover" />
      {!videoFailed && (
        <video className="absolute inset-0 h-full w-full object-cover" src={HERO_VIDEO_SRC} poster={site.images.heroPoster}
          autoPlay muted loop playsInline preload="metadata" aria-hidden="true" onError={() => setVideoFailed(true)} />
      )}
      <div className="absolute inset-0 bg-hero-overlay" />
      <div className="absolute inset-0 bg-navy-glow opacity-60" />
      <div className="relative z-10 mx-auto max-w-5xl px-5 pt-20 text-center">
        <p className="eyebrow animate-rise mb-6">{site.location}</p>
        <h1 className="animate-rise text-5xl font-light uppercase tracking-[0.18em] text-ivory sm:text-7xl md:text-8xl" style={{ animationDelay: "0.15s" }}>
          Fazle <span className="font-semibold text-gold-gradient">Rabbi</span>
        </h1>
        <div className="gold-rule animate-rise mx-auto my-7 w-48" style={{ animationDelay: "0.3s" }} />
        <p className="animate-rise font-display text-xs uppercase tracking-[0.3em] text-gold-soft sm:text-sm md:tracking-[0.45em]" style={{ animationDelay: "0.4s" }}>
          Professional Bartender <span className="text-primary">|</span> Barista <span className="text-primary">|</span> Mixologist
        </p>
        <p className="animate-rise mx-auto mt-6 max-w-xl font-serif text-xl italic text-ivory/90 md:text-2xl" style={{ animationDelay: "0.55s" }}>
          “{site.tagline}”
        </p>
        <div className="animate-rise mt-10 flex flex-wrap justify-center gap-3" style={{ animationDelay: "0.7s" }}>
          <Button asChild variant="gold" size="lg"><a href="#experience">Explore My Portfolio</a></Button>
          <Button asChild variant="goldOutline" size="lg"><a href="#signature">Discover My Cocktails</a></Button>
          <Button asChild variant="goldOutline" size="lg"><a href="#contact">Contact Me</a></Button>
          <Button asChild variant="ghostGold" size="lg"><a href={CV_URL} download><Download className="h-4 w-4" />Download CV</a></Button>
        </div>
      </div>
      <a href="#about" aria-label="Scroll to About" className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-primary motion-safe:animate-bounce"><ChevronDown /></a>
    </section>
  );
}
