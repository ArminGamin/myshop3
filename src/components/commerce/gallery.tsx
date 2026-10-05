"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/types";
import { ProductImage, ProductArt } from "./product-art";
import { useProductVariant } from "./product-variant";

export function Gallery({ product }: { product: Product }) {
  const { variantId } = useProductVariant(product.defaultVariantId);
  const images = useMemo(() => {
    const selected = product.variants.find((v) => v.id === variantId);
    if (selected?.images && selected.images.length > 0) return selected.images;
    return product.images;
  }, [product, variantId]);
  const [selection, setSelection] = useState({ variantId, index: 0 });
  if (selection.variantId !== variantId) setSelection({ variantId, index: 0 });
  const active = selection.variantId === variantId ? selection.index : 0;
  const [zoom, setZoom] = useState(false);

  const hasImages = images.length > 0;
  const current = images[active] ?? images[0];
  const many = hasImages && images.length > 1;
  const go = (step: number) =>
    setSelection({ variantId, index: (active + step + images.length) % images.length });

  return (
    <div className="pdp-gallery flex flex-col gap-3 lg:flex-row-reverse lg:gap-4">
      <div className="relative min-w-0 flex-1">
        <div
          className={`gallery-still pdp-stage relative aspect-square overflow-hidden sm:aspect-[4/5] ${
            hasImages ? "cursor-zoom-in" : ""
          }`}
          onMouseEnter={() => {
            if (hasImages && window.matchMedia("(hover: hover)").matches) setZoom(true);
          }}
          onMouseLeave={() => setZoom(false)}
        >
          {current ? (
            <ProductImage
              images={[current]}
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
        {many ? (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Ankstesnė nuotrauka" className="pdp-arrow left-3">
              <ChevronLeft className="size-5" strokeWidth={2} />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Kita nuotrauka" className="pdp-arrow right-3">
              <ChevronRight className="size-5" strokeWidth={2} />
            </button>
          </>
        ) : null}
      </div>

      {many ? (
        <div className="no-scrollbar flex gap-2.5 overflow-x-auto lg:w-20 lg:flex-col lg:overflow-visible" role="tablist" aria-label="Prekės nuotraukos">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Nuotrauka ${i + 1}`}
              onClick={() => setSelection({ variantId, index: i })}
              className="pdp-thumb"
              data-active={i === active || undefined}
            >
              <ProductImage images={[src]} seed={`${product.artSeed}-${i}`} alt="" size="thumb" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
