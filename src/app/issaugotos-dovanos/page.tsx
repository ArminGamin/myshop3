"use client";

import Link from "next/link";
import { ArrowRight, Heart, ShoppingBag, Truck } from "lucide-react";
import { bestsellers, getProduct } from "@/lib/data/products";
import { useWishlist } from "@/lib/behavior/storage";
import { useCart } from "@/lib/cart/context";
import { store } from "@/lib/config/store.config";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types";
import { ProductCard } from "@/components/commerce/product-card";
import { ButtonLink } from "@/components/ui/button";

function itemWord(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "dovana";
  if (mod10 >= 2 && mod10 <= 9 && (mod100 < 11 || mod100 > 19)) return "dovanos";
  return "dovanų";
}

export default function WishlistPage() {
  const wishlist = useWishlist();
  const cart = useCart();
  const items = wishlist.items
    .map((s) => getProduct(s))
    .filter((p): p is Product => p !== undefined);

  const totalCents = items.reduce((sum, p) => sum + p.priceCents, 0);
  // Prekės su dydžiais pridedamos tik produkto puslapyje, pasirinkus dydį.
  const quickAdd = items.filter((p) => p.inStock && !p.sizeGroups);
  const freeFrom = store.shipping.freeThresholdCents;
  const suggestions = bestsellers()
    .filter((p) => !wishlist.items.includes(p.slug))
    .slice(0, 4);

  function addAll() {
    quickAdd.forEach((p) => cart.addItem(p.slug, p.defaultVariantId, 1, { silent: true }));
    cart.openDrawer();
  }

  return (
    <div className="pb-14 lg:pb-20">
      <section className="wish-hero relative overflow-hidden border-b border-gold-400/30">
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:px-8 lg:py-14">
          <div className="flex items-center gap-4 pl-1.5 sm:gap-5 sm:pl-0">
            <span aria-hidden className="wish-seal">
              <Heart className="size-7" strokeWidth={1.8} fill="currentColor" />
            </span>
            <div>
              <h1 className="home-h2 font-display text-[2.1rem] font-bold leading-[1.02] text-ink-900 sm:text-[3.2rem]">
                Įsimintos <em>dovanos</em>
              </h1>
              <p className="mt-2 text-[15px] font-medium text-ink-600">
                {items.length
                  ? `${items.length} ${itemWord(items.length)} jūsų sąraše`
                  : "Čia atsiras dovanos, pažymėtos širdele"}
              </p>
            </div>
          </div>

          {items.length ? (
            <div className="wish-summary">
              <div className="flex items-end justify-between gap-6">
                <div>
                  <p className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-gold-600">Sąrašo vertė</p>
                  <p className="num mt-1 text-[2rem] font-extrabold leading-none text-burgundy-600">
                    {formatPrice(totalCents)}
                  </p>
                </div>
                <p className="flex max-w-[11rem] items-center gap-1.5 text-right text-[12.5px] font-semibold leading-snug text-forest-500">
                  <Truck aria-hidden className="size-4 shrink-0" strokeWidth={1.9} />
                  {totalCents >= freeFrom
                    ? "Kartu gausite nemokamą pristatymą"
                    : `Iki nemokamo pristatymo: ${formatPrice(freeFrom - totalCents)}`}
                </p>
              </div>
              {quickAdd.length ? (
                <button type="button" onClick={addAll} className="cta-fill hero-cta mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] px-5 text-[15px] font-bold">
                  <ShoppingBag className="size-[1.1rem]" strokeWidth={2} />
                  {quickAdd.length === items.length ? "Visas į krepšelį" : `${quickAdd.length} į krepšelį`}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {!items.length ? (
          <div className="wish-empty mx-auto mt-10 max-w-2xl px-6 py-12 text-center sm:mt-14 sm:px-12">
            <span aria-hidden className="wish-empty-icon">
              <Heart className="size-8" strokeWidth={1.6} />
            </span>
            <p className="mt-5 font-display text-[2rem] font-bold leading-tight text-ink-900">
              Sąrašas dar tuščias
            </p>
            <p className="mx-auto mt-3 max-w-sm text-[15px] font-medium leading-relaxed text-ink-600">
              Spustelėkite širdelę ant prekės, kad ją išsaugotumėte vėliau. Ypač patogu
              renkantis Kalėdų dovanas iš anksto.
            </p>
            <ButtonLink href="/dovanos/visos-dovanos" size="lg" className="hero-cta mt-7">
              Peržiūrėti dovanas
            </ButtonLink>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 items-start gap-x-3 gap-y-6 sm:mt-12 md:grid-cols-3 md:gap-x-4 md:gap-y-8 lg:grid-cols-4 lg:gap-x-6">
            {items.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}

        {suggestions.length ? (
          <section className="mt-16 border-t border-gold-400/30 pt-10 sm:mt-20 sm:pt-12" aria-labelledby="wish-more">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <h2 id="wish-more" className="home-h2 font-display text-[1.9rem] font-bold leading-[1.06] text-ink-900 sm:text-[2.4rem]">
                Gal patiks ir <em>šios</em>
              </h2>
              <Link href="/dovanos/bestselleriai" className="home-more group inline-flex">
                Visi bestselleriai
                <span className="home-more-icon">
                  <ArrowRight className="size-4" strokeWidth={2} />
                </span>
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 items-start gap-x-3 gap-y-6 md:grid-cols-3 md:gap-x-4 lg:grid-cols-4 lg:gap-x-6">
              {suggestions.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        ) : null}

        <p className="mt-12 text-center text-[13px] text-ink-400">
          Išsaugotos dovanos matomos tik šiame įrenginyje ir naršyklėje.
        </p>
      </div>
    </div>
  );
}
