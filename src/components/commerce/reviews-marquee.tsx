"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { STOREFRONT_REVIEWS, REVIEW_SUMMARY, type StorefrontReview } from "@/lib/data/reviews";
import { SectionHeading, Stars } from "@/components/ui/primitives";

function ReviewCard({ review, compact = false }: { review: StorefrontReview; compact?: boolean }) {
  return (
    <article
      className={`rounded-cozy border border-cream-300 bg-white shadow-card ${
        compact ? "w-[min(16.5rem,78vw)] shrink-0 p-3" : "w-[18.5rem] shrink-0 p-4"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <Image
          src={review.image}
          alt=""
          width={compact ? 36 : 44}
          height={compact ? 36 : 44}
          className={`rounded-full object-cover ${compact ? "size-9" : "size-11"}`}
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink-900">{review.name}</p>
          <p className="text-xs text-ink-400">{review.city}</p>
        </div>
      </div>
      <div className="mt-2">
        <Stars value={review.rating} size={compact ? 12 : 14} />
      </div>
      <p className={`mt-1.5 font-bold text-burgundy-700 ${compact ? "text-[11px]" : "text-xs"}`}>
        Pirkta: {review.bought}
      </p>
      <p className={`mt-2 font-semibold leading-relaxed text-ink-600 ${compact ? "text-[12px]" : "text-[13px]"}`}>{review.text}</p>
    </article>
  );
}

export function ReviewsMarquee() {
  const track = [...STOREFRONT_REVIEWS, ...STOREFRONT_REVIEWS];
  return (
    <section className="overflow-hidden py-9 lg:py-11" aria-label="Ką sako klientai">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Tikri atsiliepimai" title="Ką sako klientai" />
      </div>
      <div className="reviews-marquee mt-7">
        <div className="reviews-marquee-track">
          {track.map((review, i) => (
            <ReviewCard key={`${review.id}-${i}`} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function CheckoutReviews() {
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const slice = STOREFRONT_REVIEWS.slice(0, 5);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    function onScroll() {
      if (!el) return;
      const card = el.firstElementChild as HTMLElement | null;
      if (!card) return;
      const step = card.offsetWidth + 10;
      setIndex(Math.round(el.scrollLeft / step));
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="mt-5 border-t border-cream-300 pt-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Stars value={REVIEW_SUMMARY.rating} size={14} />
        <span className="text-sm font-bold text-ink-900">{String(REVIEW_SUMMARY.rating).replace(".", ",")}</span>
        <span className="text-xs text-ink-400">({REVIEW_SUMMARY.count} atsiliepimai)</span>
        <span className="inline-flex items-center gap-0.5 rounded-full bg-forest-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-forest-600">
          <Check className="size-3" strokeWidth={2.4} /> Tikri
        </span>
      </div>
      <div
        ref={scroller}
        className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slice.map((review) => (
          <div key={review.id} className="snap-start">
            <ReviewCard review={review} compact />
          </div>
        ))}
      </div>
      <div className="mt-2.5 flex justify-center gap-1.5">
        {slice.map((review, i) => (
          <span
            key={review.id}
            className={`size-1.5 rounded-full ${i === index ? "bg-gold-500" : "bg-cream-400"}`}
          />
        ))}
      </div>
    </div>
  );
}
