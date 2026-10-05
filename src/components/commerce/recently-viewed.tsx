"use client";

import { getProduct } from "@/lib/data/products";
import { useRecentlyViewed } from "@/lib/behavior/storage";
import type { Product } from "@/types";
import { ProductCard } from "./product-card";

// „Jūsų peržiūrėtos prekės“ — veikia be paskyros (localStorage).
export function RecentlyViewed({ excludeSlug }: { excludeSlug?: string }) {
  const slugs = useRecentlyViewed(excludeSlug);

  if (slugs.length === 0) return null;

  const items: Product[] = slugs
    .map((s) => getProduct(s))
    .filter((p): p is Product => Boolean(p));

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="recent-heading" className="mt-16">
      <h2 id="recent-heading" className="home-h2 mb-7 font-display text-[2rem] font-bold leading-[1.06] text-ink-900 sm:text-[2.5rem]">
        Jūsų <em>peržiūrėtos</em> prekės
      </h2>
      <div className="grid grid-cols-2 items-start gap-x-3 gap-y-6 md:grid-cols-3 md:gap-x-4 md:gap-y-8 lg:grid-cols-4 lg:gap-x-6">
        {items.slice(0, 4).map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}
