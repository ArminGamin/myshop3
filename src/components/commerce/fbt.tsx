"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/types";
import { getProduct } from "@/lib/data/products";
import { useCart } from "@/lib/cart/context";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { ProductImage } from "./product-art";

// „Dažnai perkama kartu" — 2–3 papildančios prekės su bendro rinkinio kaina.
export function FrequentlyBoughtTogether({ product }: { product: Product }) {
  const cart = useCart();
  const companions = useMemo(
    () =>
      product.pairsWith
        .map((s) => getProduct(s))
        .filter((p): p is Product => p !== undefined && p.inStock && !p.sizeGroups)
        .slice(0, 2),
    [product]
  );

  const [selected, setSelected] = useState<string[]>(companions.map((c) => c.slug));

  if (product.sizeGroups || companions.length === 0) return null;

  const chosen = companions.filter((c) => selected.includes(c.slug));
  const totalCents =
    product.priceCents + chosen.reduce((sum, c) => sum + c.priceCents, 0);
  const separateCents =
    (product.compareAtPriceCents ?? product.priceCents) +
    chosen.reduce((sum, c) => sum + (c.compareAtPriceCents ?? c.priceCents), 0);

  function toggle(slug: string) {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  function addAll() {
    cart.addItem(product.slug, product.defaultVariantId, 1, { silent: true });
    for (const c of chosen) {
      cart.addItem(c.slug, c.defaultVariantId, 1, { silent: true });
    }
    cart.openDrawer();
  }

  return (
    <section aria-labelledby="fbt-heading" className="pdp-fbt">
      <h2 id="fbt-heading" className="home-h2 font-display text-[1.8rem] font-bold leading-[1.06] text-ink-900 sm:text-[2.2rem]">
        Dažnai perkama <em>kartu</em>
      </h2>
      <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-8">
        <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
          {[product, ...companions].map((p, i) => (
            <div key={p.slug} className="flex min-w-0 items-center gap-2 sm:gap-3">
              {i > 0 ? <span aria-hidden className="pdp-fbt-plus hidden sm:flex">+</span> : null}
              <label
                className={`pdp-fbt-item ${i === 0 ? "pointer-events-none" : ""}`}
                data-selected={i === 0 || selected.includes(p.slug) || undefined}
              >
                <span aria-hidden className="pdp-tier-check">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                <input
                  type="checkbox"
                  checked={i === 0 || selected.includes(p.slug)}
                  onChange={() => toggle(p.slug)}
                  disabled={i === 0}
                  aria-label={`Įtraukti ${p.name}`}
                  className="sr-only"
                />
                <ProductImage
                  images={p.images}
                  seed={p.artSeed}
                  alt={p.name}
                  size="thumb"
                  className="aspect-square w-full rounded-lg object-cover"
                />
                <span className="line-clamp-2 text-[11.5px] font-semibold leading-tight text-ink-900">
                  {p.name}
                </span>
                <span className="num text-[12.5px] font-extrabold text-burgundy-600">
                  {formatPrice(p.priceCents)}
                </span>
              </label>
            </div>
          ))}
        </div>

        <div className="pdp-fbt-total lg:ml-auto lg:text-right">
          <p className="text-[13px] text-ink-600">
            Bendra kaina ({1 + chosen.length} prekės)
          </p>
          <p className="num mt-1 text-[1.8rem] font-extrabold leading-none text-burgundy-600">
            {formatPrice(totalCents)}
          </p>
          {separateCents > totalCents ? (
            <p className="mt-1 text-xs font-semibold text-forest-500">
              Pirkus atskirai: <s>{formatPrice(separateCents)}</s>
            </p>
          ) : null}
          <Button onClick={addAll} className="hero-cta mt-4 w-full lg:w-auto">
            Pridėti visus į krepšelį
          </Button>
        </div>
      </div>
    </section>
  );
}
