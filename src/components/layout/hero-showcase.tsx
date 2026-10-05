"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import { HeroSeal } from "@/components/layout/hero-seal";

export type HeroSlide = {
  slug: string;
  name: string;
  price: string;
  image: string;
  focus?: string;
};

const SLIDE_MS = 5600;

const BOKEH: { x: number; y: number; s: number; d: number; tone: "gold" | "rose" }[] = [
  { x: 4, y: 18, s: 54, d: 0, tone: "gold" },
  { x: 88, y: 8, s: 34, d: 1.4, tone: "gold" },
  { x: 96, y: 52, s: 70, d: 2.6, tone: "rose" },
  { x: 10, y: 78, s: 40, d: 3.4, tone: "rose" },
  { x: 74, y: 92, s: 28, d: 0.8, tone: "gold" },
  { x: 26, y: 4, s: 22, d: 2, tone: "gold" },
  { x: 100, y: 28, s: 18, d: 4.2, tone: "gold" },
];

// Hero vitrina: arkos formos „langas", kuriame keičiasi dovanų nuotraukos.
// Skaidrė keičiasi, kai pasibaigia progreso juostos animacija, todėl
// sustabdžius (užvedus pelę ar fokusuojant) juosta ir laikmatis sutampa.
export function HeroShowcase({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  // Kitos skaidrės įkeliamos tik po puslapio „load", kad nekonkuruotų su LCP.
  const [warm, setWarm] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let idle = 0;
    const go = () => {
      const run = () => setWarm(true);
      if ("requestIdleCallback" in window) idle = window.requestIdleCallback(run, { timeout: 2500 });
      else idle = setTimeout(run, 1200) as unknown as number;
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => {
      window.removeEventListener("load", go);
      if ("cancelIdleCallback" in window) window.cancelIdleCallback(idle);
      window.clearTimeout(idle);
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  // Kai hero nematomas, jo begalinės animacijos sustabdomos (taupo bateriją).
  useEffect(() => {
    const section = stageRef.current?.closest("section");
    if (!section || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) section.removeAttribute("data-offscreen");
      else section.setAttribute("data-offscreen", "");
    });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Švelnus paralaksas: rašome tik CSS kintamuosius, React būsena nesikeičia.
  useEffect(() => {
    const stage = stageRef.current;
    const section = stage?.closest("section");
    if (!stage || !section || reduced) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        stage.style.setProperty("--px", x.toFixed(3));
        stage.style.setProperty("--py", y.toFixed(3));
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      stage.style.setProperty("--px", "0");
      stage.style.setProperty("--py", "0");
    };

    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced]);

  if (slides.length === 0) return null;
  const current = slides[active];

  const advance = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setWarm(true);
    setActive((i) => (i + 1) % slides.length);
  };

  return (
    <div
      ref={stageRef}
      className="hero-stage hero-cluster"
      onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div aria-hidden className="hero-halo" />
      <div aria-hidden className="hero-bokeh">
        {BOKEH.map((b, i) => (
          <span
            key={i}
            data-tone={b.tone}
            style={
              {
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: b.s,
                height: b.s,
                animationDelay: `${-b.d}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="hero-depth hero-depth-1">
        <div aria-hidden className="hero-arch-frame" />
        <div
          className="hero-arch"
          role="group"
          aria-roledescription="karuselė"
          aria-label="Dovanų idėjos"
        >
          {slides.map((slide, i) => (
            <div
              key={slide.slug}
              className="hero-slide"
              data-active={i === active || undefined}
              aria-hidden={i !== active}
            >
              {i === 0 || warm ? (
              <Image
                src={slide.image}
                alt={slide.name}
                fill
                priority={i === 0}
                quality={85}
                sizes="(min-width: 1024px) 31rem, (min-width: 640px) 23rem, 74vw"
                className="object-cover"
                style={{ objectPosition: slide.focus ?? "50% 40%" }}
              />
              ) : null}
            </div>
          ))}
          <div aria-hidden className="hero-arch-sheen" />
        </div>
      </div>

      <div className="hero-depth hero-depth-2 hero-seal-pos">
        <HeroSeal />
      </div>

      <div className="hero-depth hero-depth-3 hero-chip-pos">
        <Link href={`/produktai/${current.slug}`} className="hero-chip group">
          <span key={`thumb-${active}`} className="hero-chip-thumb hero-chip-swap">
            <Image src={current.image} alt="" width={96} height={96} quality={70} className="h-full w-full object-cover" />
          </span>
          <span key={`text-${active}`} className="hero-chip-swap min-w-0 flex-1">
            <span className="line-clamp-2 text-[12.5px] font-semibold leading-snug text-ink-900 sm:text-[13.5px]">
              {current.name}
            </span>
            <span className="font-display text-[1.15rem] font-bold leading-tight text-burgundy-600 sm:text-[1.3rem]">
              {current.price}
            </span>
          </span>
          <span className="hero-chip-go" aria-hidden>
            <ArrowUpRight className="size-4" strokeWidth={2} />
          </span>
          <span aria-hidden className="hero-chip-progress">
            <span
              key={`bar-${active}`}
              className="hero-chip-bar"
              onAnimationEnd={advance}
              style={{
                animationDuration: `${SLIDE_MS}ms`,
                animationPlayState: paused || reduced ? "paused" : "running",
              }}
            />
          </span>
        </Link>
      </div>

      <div className="hero-dots" role="group" aria-label="Pasirinkite dovaną">
        {slides.map((slide, i) => (
          <button
            key={slide.slug}
            type="button"
            aria-pressed={i === active}
            aria-label={`Rodyti: ${slide.name}`}
            data-active={i === active || undefined}
            onClick={() => {
              setWarm(true);
              setActive(i);
            }}
            className="hero-dot"
          />
        ))}
      </div>
    </div>
  );
}
