"use client";

import { useState } from "react";
import { Stars } from "@/components/ui/primitives";
import { ChevronDown } from "lucide-react";
import type { ProductReview } from "@/lib/data/product-reviews";

const INITIAL = 6;

export function ProductReviews({
  reviews,
  rating,
}: {
  reviews: ProductReview[];
  rating: number | null;
}) {
  const [expanded, setExpanded] = useState(false);
  if (reviews.length === 0) return null;
  const visible = expanded ? reviews : reviews.slice(0, INITIAL);

  return (
    <section className="reviews-shell mt-16" aria-labelledby="reviews-heading">
      <div className="grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-12">
        <aside className="reviews-aside lg:sticky lg:top-28 lg:self-start">
          <h2 id="reviews-heading" className="home-h2 font-display text-[2rem] font-bold leading-[1.06] text-ink-900 sm:text-[2.4rem]">
            Ką sako <em>pirkėjai</em>
          </h2>
          {rating ? (
            <div className="reviews-score mt-6">
              <p className="num reviews-score-value">{String(rating).replace(".", ",")}</p>
              <div>
                <Stars value={rating} size={18} />
                <p className="mt-0.5 text-[13px] font-semibold text-ink-600">vidutinis įvertinimas iš 5</p>
              </div>
            </div>
          ) : null}
          <p className="reviews-note">* Rodoma tik dalis pirkėjų atsiliepimų.</p>
        </aside>

        <div>
          <ul className="reviews-grid">
            {visible.map((review, i) => (
              <li key={`${review.name}-${i}`} className="review-card">
                <span aria-hidden className="review-quote">“</span>
                {review.rating ? (
                  <div className="mb-1.5">
                    <Stars value={review.rating} size={14} />
                  </div>
                ) : null}
                <p className="review-text">{review.text}</p>
                <p className="review-name">
                  {review.name}
                  {review.city ? <span className="font-medium text-ink-400">, {review.city}</span> : null}
                </p>
              </li>
            ))}
          </ul>

      {reviews.length > INITIAL ? (
        <div className="mt-6 flex justify-center lg:justify-start">
          <button type="button" onClick={() => setExpanded((v) => !v)} className="reviews-more" aria-expanded={expanded}>
            {expanded ? "Rodyti mažiau" : `Rodyti visus (${reviews.length})`}
            <ChevronDown aria-hidden className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`} strokeWidth={2} />
          </button>
        </div>
      ) : null}
        </div>
      </div>
    </section>
  );
}
