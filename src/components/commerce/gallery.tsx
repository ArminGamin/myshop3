"use client";

import { useState } from "react";
import type { Product } from "@/types";
import { ProductImage, ProductArt } from "./product-art";

export function Gallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const hasImages = product.images.length > 0;

  return (
    <div className="flex flex-col gap-3">
      <div
        className={`gallery-still relative aspect-square overflow-hidden rounded-cozy bg-cream-200 shadow-lift ring-1 ring-gold-400/30 sm:aspect-[4/5] ${
          hasImages ? "cursor-zoom-in" : ""
        }`}
        onMouseEnter={() => {
          if (hasImages && window.matchMedia("(hover: hover)").matches) setZoom(true);
        }}
        onMouseLeave={() => setZoom(false)}
      >
        {hasImages ? (
          <ProductImage
            images={[product.images[active]]}
            seed={product.artSeed}
            alt={product.name}
            size="hero"
            priority={active === 0}
            className={`h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${zoom ? "scale-125" : "scale-100"}`}
          />
        ) : (
          <ProductArt seed={product.artSeed} size="hero" className="h-full w-full" />
        )}
      </div>

      {hasImages && product.images.length > 1 ? (
        <div className="no-scrollbar flex gap-2 overflow-x-auto" role="tablist" aria-label="Prekės nuotraukos">
          {product.images.map((src, i) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Nuotrauka ${i + 1}`}
              onClick={() => setActive(i)}
              className={`size-16 shrink-0 overflow-hidden rounded-xl border-2 transition sm:size-20 ${
                i === active ? "border-burgundy-600" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <ProductImage images={[src]} seed={`${product.artSeed}-${i}`} alt="" size="thumb" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
