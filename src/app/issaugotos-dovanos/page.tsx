"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { getProduct } from "@/lib/data/products";
import { useWishlist } from "@/lib/behavior/storage";
import { ProductCard } from "@/components/commerce/product-card";
import { ButtonLink } from "@/components/ui/button";

export default function WishlistPage() {
  const wishlist = useWishlist();
  const items = wishlist.items
    .map((s) => getProduct(s))
    .filter((p) => p !== undefined);

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <h1 className="flex items-center gap-3 font-display text-[1.75rem] font-extrabold text-ink-900 sm:text-3xl">
        <Heart className="size-7 text-burgundy-600" strokeWidth={1.8} />
        Įsimintos dovanos
      </h1>

      {!wishlist.items.length ? (
        <div className="mt-8 rounded-cozy border border-cream-300 bg-white/60 p-6 text-center sm:mt-10 sm:p-10">
          <p className="font-sans text-3xl font-extrabold text-ink-900">
            Sąrašas dar tuščias 🎁
          </p>
          <p className="mx-auto mt-3 max-w-sm text-base font-extrabold leading-relaxed text-ink-600">
            Spustelėkite širdelę ant prekės, kad ją išsaugotumėte vėliau — ypač patogu
            renkantis Kalėdų dovanas iš anksto.
          </p>
          <ButtonLink href="/dovanos/visos-dovanos" className="mt-6">
            Peržiūrėti dovanas
          </ButtonLink>
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm text-ink-600">
            {items.length} {items.length === 1 ? "prekė" : "prekės"} · sąrašas išlieka šiame
            įrenginyje
          </p>
          <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3 md:gap-x-4 md:gap-y-8 lg:grid-cols-4 lg:gap-x-6">
            {items.map(
              (p) => p && <ProductCard key={p.slug} product={p} />
            )}
          </div>
          <p className="mt-10 text-sm text-ink-400">
            Norite pasidalinti su šeima? Nukopijuokite nuorodą:{" "}
            <Link href="/issaugotos-dovanos" className="font-semibold text-burgundy-600">
              kaledukampelis.lt/issaugotos-dovanos
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
