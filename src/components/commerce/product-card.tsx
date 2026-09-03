"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import type { Product } from "@/types";
import { discountPercent, formatPrice } from "@/lib/format";
import { useCart } from "@/lib/cart/context";
import { useWishlist } from "@/lib/behavior/storage";
import { flags } from "@/lib/config/store.config";
import { Badge } from "@/components/ui/primitives";
import { ProductImage } from "./product-art";

export function ProductCard({ product }: { product: Product }) {
  const cart = useCart();
  const wishlist = useWishlist();
  const discount = discountPercent(product.priceCents, product.compareAtPriceCents);
  const inWishlist = wishlist.has(product.slug);

  return (
    <article className="group relative flex flex-col">
      <div className="gold-shimmer relative overflow-hidden rounded-cozy bg-cream-200 shadow-card transition-shadow duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:shadow-lift after:pointer-events-none after:absolute after:inset-0 after:z-[1] after:rounded-cozy after:content-[''] after:shadow-[inset_0_0_0_1px_rgb(201_162_75/0.22)]">
        <Link
          href={`/produktai/${product.slug}`}
          aria-label={product.name}
          className="block aspect-[4/5]"
        >
          <ProductImage
            images={product.images}
            seed={product.artSeed}
            alt={product.name}
            size="card"
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035]"
          />
        </Link>

        {/* Ženkleliai */}
        <div className="pointer-events-none absolute left-2 top-2 z-[3] flex flex-col items-start gap-1 sm:left-3 sm:top-3 sm:gap-1.5">
          {discount ? <Badge tone="gold">−{discount} %</Badge> : null}
          {product.bestseller ? <Badge>Bestselleris</Badge> : product.isNew ? <Badge>Naujiena</Badge> : null}
        </div>

        {flags.ENABLE_WISHLIST ? (
          <button
            type="button"
            onClick={() => wishlist.toggle(product.slug)}
            aria-label={inWishlist ? "Pašalinti iš pageidavimų" : "Įsiminti dovaną"}
            aria-pressed={inWishlist}
            className={`absolute right-2 top-2 z-[2] flex size-11 items-center justify-center rounded-full backdrop-blur-sm transition sm:right-2.5 sm:top-2.5 ${
              inWishlist
                ? "bg-burgundy-600 text-cream-50"
                : "bg-white/85 text-ink-600 hover:text-burgundy-600"
            }`}
          >
            <Heart className="size-4.5" strokeWidth={1.8} fill={inWishlist ? "currentColor" : "none"} />
          </button>
        ) : null}

        {/* Greitas pridėjimas — atsiranda užvedus (desktop) */}
        <div className="absolute inset-x-3 bottom-3 z-[2] hidden translate-y-1 opacity-0 transition-[opacity,transform] duration-500 sm:block sm:pointer-events-none sm:group-hover:pointer-events-auto sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
          <button
            type="button"
            onClick={() => cart.addItem(product.slug, product.defaultVariantId)}
            className="flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-ink-900/82 py-2.5 text-[13px] font-semibold text-cream-50 backdrop-blur-sm transition hover:bg-burgundy-600"
          >
            <ShoppingBag className="size-3.5" strokeWidth={2} />
            Į krepšelį
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-0.5 pt-2.5 sm:px-1 sm:pt-3.5">
        <Link href={`/produktai/${product.slug}`} className="flex-1">
          <h3 className="line-clamp-2 text-[14px] font-semibold leading-snug text-ink-900 transition group-hover:text-burgundy-600 sm:text-[14.5px]">
            {product.name}
          </h3>
        </Link>
        {flags.ENABLE_REVIEWS && product.rating && product.reviewCount ? (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-600">
            <span aria-hidden className="text-gold-500">★★★★★</span>
            {String(product.rating).replace(".", ",")} ({product.reviewCount})
          </p>
        ) : null}
        <p className="mt-0.5 hidden line-clamp-1 text-[13px] text-ink-600 sm:block">{product.tagline}</p>
        <div className="mt-1.5 flex items-baseline gap-2 sm:mt-2">
          <span className="text-[14px] font-bold text-burgundy-600 sm:text-[15px]">
            {formatPrice(product.priceCents)}
          </span>
          {product.compareAtPriceCents ? (
            <s className="text-[12px] text-ink-400 sm:text-[13px]">{formatPrice(product.compareAtPriceCents)}</s>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => cart.addItem(product.slug, product.defaultVariantId)}
          className="mt-2 flex min-h-11 w-full items-center justify-center rounded-full border border-burgundy-600/25 bg-white/70 text-[13px] font-semibold text-burgundy-600 transition hover:bg-burgundy-600 hover:text-cream-50 sm:hidden"
        >
          Į krepšelį
        </button>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-4 sm:gap-y-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
