"use client";

import Link from "next/link";
import { useState } from "react";
import { resolveItems, subtotalOf, useCart } from "@/lib/cart/context";
import { store } from "@/lib/config/store.config";
import { MYSTERY_GIFT, readMysteryGift, writeMysteryGift } from "@/lib/cart/mystery-gift";
import { formatPrice } from "@/lib/format";
import { track } from "@/lib/analytics";
import { Button, ButtonLink } from "@/components/ui/button";
import { ProductArt } from "@/components/commerce/product-art";
import { MysteryGiftCard } from "@/components/commerce/mystery-gift-card";

// Pilnas krepšelio puslapis — atsarginis variantas šalia drawer.
export default function CartPage() {
  const cart = useCart();
  const items = resolveItems(cart.lines).filter((i) => i.slug !== MYSTERY_GIFT.slug);
  const subtotal = subtotalOf(items);
  const [mystery, setMystery] = useState(readMysteryGift);
  const mysteryCents = mystery ? MYSTERY_GIFT.priceCents : 0;
  const remaining = mystery ? 0 : store.shipping.freeThresholdCents - subtotal;
  const payable = subtotal + mysteryCents;

  return (
    <div className="mx-auto max-w-3xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <h1 className="font-display text-[1.75rem] font-extrabold text-ink-900 sm:text-3xl">Jūsų krepšelis</h1>

      {items.length === 0 ? (
        <div className="mt-8 rounded-cozy border border-cream-300 bg-white/60 p-6 text-center sm:mt-10 sm:p-10">
          <p className="font-display text-xl font-extrabold text-ink-900">
            Jūsų krepšelis dar tuščias 🎁
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm font-bold leading-relaxed text-ink-600">
            Gal laikas išsirinkti pirmąją dovaną?
          </p>
          <ButtonLink href="/dovanos/bestselleriai" className="mt-6">
            Peržiūrėti dovanas
          </ButtonLink>
        </div>
      ) : (
        <>
          <ul className="mt-8 divide-y divide-cream-300 rounded-cozy border border-cream-300 bg-white/70">
            {items.map((item) => (
              <li key={`${item.slug}-${item.variantId}`} className="flex gap-4 p-4 sm:p-5">
                <ProductArt seed={item.product.artSeed} size="thumb" />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/produktai/${item.slug}`}
                    className="text-sm font-semibold text-ink-900 hover:text-burgundy-600"
                  >
                    {item.product.name}
                  </Link>
                  <p className="mt-1 text-xs text-ink-400">{item.variant.name}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[13px] text-ink-600">Kiekis: {item.qty}</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => cart.removeItem(item.slug, item.variantId)}
                        className="text-xs font-semibold text-ink-400 underline underline-offset-4 hover:text-burgundy-600"
                      >
                        Šalinti
                      </button>
                      <span className="text-sm font-bold text-burgundy-600">
                        {formatPrice(item.lineTotalCents)}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4">
            <MysteryGiftCard
              selected={mystery}
              onToggle={(next) => {
                setMystery(next);
                writeMysteryGift(next);
              }}
            />
          </div>

          <div className="mt-6 rounded-cozy bg-cream-100 p-5">
            <div className="flex justify-between text-sm text-ink-600">
              <span>Tarpinė suma</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {mysteryCents ? (
              <div className="mt-1 flex justify-between text-sm text-ink-600">
                <span>{MYSTERY_GIFT.name}</span>
                <span>{formatPrice(mysteryCents)}</span>
              </div>
            ) : null}
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-sm font-medium text-ink-600">Iš viso</span>
              <span className="text-3xl font-extrabold tracking-tight text-burgundy-600">
                {formatPrice(payable)}
              </span>
            </div>
            {remaining > 0 ? (
              <p className="mt-1 text-[13px] text-ink-600">
                Pridėkite dar {formatPrice(remaining)} — ir pristatysime nemokamai.
              </p>
            ) : (
              <p className="mt-1 text-[13px] font-semibold text-forest-500">
                🎉 Nemokamas pristatymas!
              </p>
            )}
            <Button
              size="lg"
              className="mt-4 w-full whitespace-normal text-center text-[15px] leading-snug"
              onClick={() => {
                track("begin_checkout", { value: payable / 100 });
                cart.openCheckout();
              }}
            >
              SAUGIAI TĘSTI ATSISKAITYMĄ →
            </Button>
            <ButtonLink href="/dovanos/visos-dovanos" variant="ghost" className="mt-2 w-full">
              Tęsti apsipirkimą
            </ButtonLink>
          </div>
        </>
      )}
    </div>
  );
}
