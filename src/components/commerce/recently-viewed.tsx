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
      <h2 id="recent-heading" className="mb-5 font-display text-2xl font-semibold text-ink-900">
        Jūsų peržiūrėtos prekės
      </h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
        {items.slice(0, 4).map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}
