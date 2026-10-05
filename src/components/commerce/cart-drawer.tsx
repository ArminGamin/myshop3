"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Minus, Plus, ShieldCheck, ShoppingBag, Truck, X } from "lucide-react";
import { resolveItems, subtotalOf, useCart } from "@/lib/cart/context";
import {
  addonAmounts,
  type CartAddonSelection,
} from "@/lib/cart/addons";
import { store, flags } from "@/lib/config/store.config";
import { useIsMobile, useMobileChromeFlag } from "@/lib/mobile-chrome";
import { formatPrice } from "@/lib/format";
import { findPairsWithUpsell } from "@/lib/cart/pairs-with-upsell";
import { Button } from "@/components/ui/button";
import { Overlay } from "@/components/ui/overlay";
import { ProductImage } from "./product-art";
import { addonLineLabel, CartAddonRows } from "./cart-addons";
import { CheckoutLeave } from "./checkout-leave";
import { MYSTERY_GIFT } from "@/lib/cart/mystery-gift";
import { useCheckoutAddons, useMysterySelection, updateCheckoutAddons } from "@/lib/checkout/draft-store";

export function FreeShippingBar({ subtotalCents }: { subtotalCents: number }) {
  if (!flags.ENABLE_FREE_SHIPPING_BAR) return null;
  const threshold = store.shipping.freeThresholdCents;
  const remaining = threshold - subtotalCents;
  const pct = Math.min(100, Math.round((subtotalCents / threshold) * 100));

  if (remaining <= 0) {
    return (
      <div className="cart-ship cart-ship-done">
        <span aria-hidden className="cart-ship-seal">
          <Check className="size-4" strokeWidth={2.6} />
        </span>
        <div className="min-w-0">
          <p className="text-[14px] font-bold leading-snug text-cream-50">
            Atrakinta! Nemokamas pristatymas jau jūsų
          </p>
          <p className="mt-0.5 text-[12.5px] font-medium text-cream-100/80">
            Siunta keliauja be jokio papildomo mokesčio.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-ship">
      <p className="flex items-center gap-2 text-[13.5px] font-medium text-ink-900">
        <Truck aria-hidden className="size-4 shrink-0 text-burgundy-600" strokeWidth={1.9} />
        <span>
          Trūksta tik <strong className="text-burgundy-700">{formatPrice(remaining)}</strong> iki nemokamo pristatymo
        </span>
      </p>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Pažanga iki nemokamo pristatymo"
        className="cart-ship-track mt-2.5"
      >
        <div className="cart-ship-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function CartDrawer() {
  const cart = useCart();
  const items = resolveItems(cart.lines).filter((i) => i.slug !== MYSTERY_GIFT.slug);
  const subtotal = subtotalOf(items);
  const open = cart.drawerOpen;
  const isMobile = useIsMobile();
  useMobileChromeFlag("cartOpen", open);
  const addons = useCheckoutAddons();
  const mystery = useMysterySelection();
  const [leaveOpen, setLeaveOpen] = useState(false);

  const mysteryCents = mystery ? MYSTERY_GIFT.priceCents : 0;

  function updateAddons(next: CartAddonSelection) {
    updateCheckoutAddons(next);
  }

  const extras = addonAmounts(subtotal + mysteryCents, addons);
  const payable = subtotal + mysteryCents + extras.total;
  const freeShipping = mystery || subtotal >= store.shipping.freeThresholdCents;
  const count = items.reduce((n, i) => n + i.qty, 0);

  const upsell = findPairsWithUpsell(items);

  const summaryRows: { label: string; cents: number }[] = [
    { label: "Tarpinė suma", cents: subtotal },
    ...(mysteryCents ? [{ label: MYSTERY_GIFT.name, cents: mysteryCents }] : []),
    ...(extras.protection ? [{ label: addonLineLabel("protection"), cents: extras.protection }] : []),
    ...(extras.donation ? [{ label: addonLineLabel("donation"), cents: extras.donation }] : []),
    ...(extras.priority ? [{ label: addonLineLabel("priority"), cents: extras.priority }] : []),
  ];

  function close() {
    setLeaveOpen(false);
    cart.closeDrawer();
  }

  function requestClose() {
    if (items.length > 0) {
      setLeaveOpen(true);
      return;
    }
    close();
  }

  function beginCheckout() {
    cart.openCheckout();
  }

  return (
    <>
    <Overlay
      open={open}
      onClose={requestClose}
      label="Krepšelis"
      side={isMobile ? "bottom" : "right"}
      widthClass={isMobile ? "max-w-none" : "max-w-lg"}
    >
      {/* Antraštė */}
      <div className="cart-head flex shrink-0 items-center justify-between gap-3 px-5 py-4">
        <h2 className="flex items-center gap-3 font-display text-[1.75rem] font-bold leading-none text-ink-900">
          <span aria-hidden className="cart-head-icon">
            <ShoppingBag className="size-5" strokeWidth={1.8} />
          </span>
          <span>
            Jūsų <em className="font-semibold text-burgundy-600">krepšelis</em>
          </span>
          {items.length > 0 ? (
            <span className="cart-count num" aria-label={`${count} prekės`}>
              {count}
            </span>
          ) : null}
        </h2>
        <button
          type="button"
          onClick={requestClose}
          aria-label="Uždaryti krepšelį"
          className="cart-close inline-flex size-11 shrink-0 items-center justify-center rounded-full"
        >
          <X className="block size-5 shrink-0" strokeWidth={1.8} />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
          <span aria-hidden className="cart-empty-icon">
            <ShoppingBag className="size-8" strokeWidth={1.5} />
          </span>
          <p className="mt-2 font-display text-[1.8rem] font-bold leading-tight text-ink-900">
            Jūsų krepšelis dar tuščias
          </p>
          <p className="max-w-xs text-sm font-medium leading-relaxed text-ink-600">
            Gal laikas išsirinkti pirmąją dovaną? Bestselleriai išsirinkimo problemą
            išsprendžia greičiausiai.
          </p>
          <Link href="/dovanos/bestselleriai" onClick={close}>
            <Button className="hero-cta mt-2">Peržiūrėti dovanas</Button>
          </Link>
          <Link
            href="/rask-dovana"
            onClick={close}
            className="text-sm font-semibold text-burgundy-600 underline underline-offset-4"
          >
            Arba atlikite dovanų testą →
          </Link>
        </div>
      ) : (
        <>
          <div className="cart-body flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-y-contain px-4 py-4 sm:px-5">
            <FreeShippingBar
              subtotalCents={mystery ? store.shipping.freeThresholdCents : subtotal}
            />

            <ul className="flex flex-col gap-2.5">
              {items.map((item) => (
                <li key={`${item.slug}-${item.variantId}`} className="cart-line">
                  <Link
                    href={`/produktai/${item.slug}`}
                    onClick={close}
                    className="cart-line-media"
                    aria-hidden
                    tabIndex={-1}
                  >
                    <ProductImage
                      images={item.variant.images?.length ? item.variant.images : item.product.images}
                      seed={item.product.artSeed}
                      alt=""
                      size="thumb"
                      className="size-full object-cover"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/produktai/${item.slug}`}
                          onClick={close}
                          className="line-clamp-2 text-[14.5px] font-semibold leading-snug text-ink-900 transition hover:text-burgundy-600"
                        >
                          {item.product.name}
                        </Link>
                        {item.variant.name !== "Standartinis rinkinys" &&
                        item.variant.name !== "Vienetas" ? (
                          <p className="mt-0.5 truncate text-xs font-medium text-ink-400">{item.variant.name}</p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => cart.removeItem(item.slug, item.variantId)}
                        aria-label={`Pašalinti ${item.product.name}`}
                        className="cart-remove -mr-2 -mt-2 inline-flex size-10 shrink-0 items-center justify-center rounded-full"
                      >
                        <X className="block size-4 shrink-0" strokeWidth={2.25} />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="cart-stepper">
                        <button
                          type="button"
                          onClick={() => cart.setQty(item.slug, item.variantId, item.qty - 1)}
                          aria-label={`Sumažinti ${item.product.name} kiekį`}
                          className="cart-stepper-btn"
                        >
                          <Minus className="block size-3.5 shrink-0" strokeWidth={2.25} />
                        </button>
                        <span className="num w-7 text-center text-sm font-bold text-ink-900">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => cart.setQty(item.slug, item.variantId, item.qty + 1)}
                          aria-label={`Padidinti ${item.product.name} kiekį`}
                          className="cart-stepper-btn"
                        >
                          <Plus className="block size-3.5 shrink-0" strokeWidth={2.25} />
                        </button>
                      </div>
                      <span className="num text-[16px] font-extrabold leading-none text-burgundy-600">
                        {formatPrice(item.lineTotalCents)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {isMobile ? (
              <CartAddonRows
                compact
                selected={addons}
                onChange={updateAddons}
              />
            ) : null}

            {/* Krepšelio papildymas */}
            {upsell ? (
              <div className="cart-upsell">
                <p className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-gold-600">
                  Puikiai dera su jūsų pasirinkimu
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="cart-line-media">
                    <ProductImage
                      images={upsell.images}
                      seed={upsell.artSeed}
                      alt=""
                      size="thumb"
                      className="size-full object-cover"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[13.5px] font-semibold leading-snug text-ink-900">{upsell.name}</p>
                    <p className="num mt-0.5 text-[14px] font-extrabold text-burgundy-600">
                      {formatPrice(upsell.priceCents)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="cart-upsell-add"
                    onClick={() => cart.addItem(upsell.slug, upsell.defaultVariantId)}
                  >
                    <Plus className="size-4" strokeWidth={2.4} />
                    Pridėti
                  </button>
                </div>
              </div>
            ) : null}

            {isMobile ? null : (
              <CartAddonRows
                selected={addons}
                onChange={updateAddons}
              />
            )}
          </div>

          <div className="cart-foot shrink-0 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-5 sm:pt-4">
            <dl className="space-y-0.5 text-[13px] text-ink-600 sm:space-y-1 sm:text-[13.5px]">
              {summaryRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3">
                  <dt>{row.label}</dt>
                  <dd className="num font-semibold text-ink-900">{formatPrice(row.cents)}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-2.5 flex items-end justify-between gap-3 border-t border-gold-400/35 pt-2.5 sm:mt-3 sm:pt-3">
              <div>
                <p className="text-sm font-semibold text-ink-900">{freeShipping ? "Iš viso" : "Suma be pristatymo"}</p>
                <p className={`mt-0.5 text-[12.5px] ${freeShipping ? "font-semibold text-forest-500" : "font-medium text-ink-600"}`}>
                  {freeShipping
                    ? "Nemokamas pristatymas įskaičiuotas"
                    : `Pristatymas: +${formatPrice(store.shipping.flatRateCents)}. Galutinė suma: ${formatPrice(payable + store.shipping.flatRateCents)}.`}
                </p>
              </div>
              <span className="num shrink-0 text-[1.85rem] font-extrabold leading-none tracking-tight text-burgundy-600 sm:text-[2.1rem]">
                {formatPrice(payable)}
              </span>
            </div>
            <Button
              size="lg"
              className="hero-cta mt-3 min-h-[3.25rem] w-full whitespace-normal text-center text-[15.5px] leading-snug sm:mt-4 sm:min-h-14 sm:text-[16px]"
              onClick={beginCheckout}
            >
              <ShieldCheck className="size-5 shrink-0" strokeWidth={2} />
              Saugiai tęsti atsiskaitymą →
            </Button>
            <div className="mt-1 flex items-center justify-between gap-3 sm:mt-2">
              <p className="flex items-center gap-1.5 text-xs font-medium text-ink-400">
                <Truck className="size-3.5" /> Pristatymas per 4-6 d.
              </p>
              <button
                type="button"
                onClick={close}
                className="flex min-h-11 items-center text-sm font-semibold text-ink-600 underline decoration-gold-500/70 underline-offset-4 transition hover:text-burgundy-600"
              >
                Tęsti apsipirkimą
              </button>
            </div>
          </div>
        </>
      )}
    </Overlay>
    <CheckoutLeave
      open={open && leaveOpen}
      onStay={() => {
        setLeaveOpen(false);
      }}
      onLeave={() => {
        setLeaveOpen(false);
        close();
      }}
    />
    </>
  );
}
