"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/types";
import { getProduct } from "@/lib/data/products";
import { useCart } from "@/lib/cart/context";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { ProductImage } from "./product-art";

// „Dažnai perkama kartu" — 2–3 papildančios prekės su bendro rinkinio kaina.
export function FrequentlyBoughtTogether({ product }: { product: Product }) {
  const cart = useCart();
  const companions = useMemo(
    () =>
      product.pairsWith
        .map((s) => getProduct(s))
        .filter((p): p is Product => p !== undefined && p.inStock)
        .slice(0, 2),
    [product]
  );

  const [selected, setSelected] = useState<string[]>(companions.map((c) => c.slug));

  if (companions.length === 0) return null;

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
    <section aria-labelledby="fbt-heading" className="rounded-cozy border border-cream-300 bg-white/60 p-5 sm:p-6">
      <h2 id="fbt-heading" className="font-display text-xl font-semibold text-ink-900">
        Dažnai perkama kartu
      </h2>
      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
          {[product, ...companions].map((p, i) => (
            <div key={p.slug} className="flex min-w-0 items-center gap-2 sm:gap-3">
              {i > 0 ? <span aria-hidden className="hidden text-xl text-gold-500 sm:inline">+</span> : null}
              <label
                className={`flex w-full cursor-pointer flex-col items-center gap-1.5 rounded-cozy border-2 p-1.5 text-center transition sm:w-36 sm:p-2.5 ${
                  i === 0 || selected.includes(p.slug)
                    ? "border-burgundy-600/70 bg-burgundy-100/30"
                    : "border-cream-300 opacity-60 hover:opacity-100"
                } ${i === 0 ? "pointer-events-none" : ""}`}
              >
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
                <span className="text-[12px] font-bold text-burgundy-600">
                  {formatPrice(p.priceCents)}
                </span>
              </label>
            </div>
          ))}
        </div>

        <div className="lg:ml-auto lg:text-right">
          <p className="text-[13px] text-ink-600">
            Bendra kaina ({1 + chosen.length} prekės)
          </p>
          <p className="font-display text-2xl font-bold text-ink-900">
            {formatPrice(totalCents)}
          </p>
          {separateCents > totalCents ? (
            <p className="text-xs text-forest-500">
              Pirkus atskirai: <s>{formatPrice(separateCents)}</s>
            </p>
          ) : null}
          <Button onClick={addAll} className="mt-3 w-full lg:w-auto">
            Pridėti visus į krepšelį
          </Button>
        </div>
      </div>
    </section>
  );
}
