"use client";

import Link from "next/link";
import { resolveItems, subtotalOf, useCart } from "@/lib/cart/context";
import { startCheckout } from "@/lib/cart/checkout-client";
import { store } from "@/lib/config/store.config";
import { formatPrice } from "@/lib/format";
import { Button, ButtonLink } from "@/components/ui/button";
import { ProductArt } from "@/components/commerce/product-art";

// Pilnas krepšelio puslapis — atsarginis variantas šalia drawer.
export default function CartPage() {
  const cart = useCart();
  const items = resolveItems(cart.lines);
  const subtotal = subtotalOf(items);
  const remaining = store.shipping.freeThresholdCents - subtotal;

  return (
    <div className="mx-auto max-w-3xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <h1 className="font-display text-[1.75rem] font-semibold text-ink-900 sm:text-3xl">Jūsų krepšelis</h1>

      {items.length === 0 ? (
        <div className="mt-8 rounded-cozy border border-cream-300 bg-white/60 p-6 text-center sm:mt-10 sm:p-10">
          <p className="font-display text-xl font-semibold text-ink-900">
            Jūsų krepšelis dar tuščias 🎁
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-600">
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

          <div className="mt-6 rounded-cozy bg-cream-100 p-5">
            <div className="flex justify-between font-display text-lg font-bold text-ink-900">
              <span>Tarpinė suma</span>
              <span>{formatPrice(subtotal)}</span>
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
              onClick={() => void startCheckout(cart.lines)}
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
