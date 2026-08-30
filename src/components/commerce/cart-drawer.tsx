"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Minus, Plus, ShieldCheck, ShoppingBag, Truck, X } from "lucide-react";
import { resolveItems, subtotalOf, useCart } from "@/lib/cart/context";
import { startCheckout } from "@/lib/cart/checkout-client";
import {
  addonAmounts,
  CART_ADDON_DEFAULTS,
  donationBaseCents,
  donationCents,
  readCartAddons,
  writeCartAddons,
  type CartAddonSelection,
} from "@/lib/cart/addons";
import { store, flags } from "@/lib/config/store.config";
import { formatPrice } from "@/lib/format";
import { getProduct } from "@/lib/data/products";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Overlay } from "@/components/ui/overlay";
import { ProductImage } from "./product-art";
import { addonLineLabel, CartAddonRows } from "./cart-addons";

export function FreeShippingBar({ subtotalCents }: { subtotalCents: number }) {
  if (!flags.ENABLE_FREE_SHIPPING_BAR) return null;
  const threshold = store.shipping.freeThresholdCents;
  const remaining = threshold - subtotalCents;
  const pct = Math.min(100, Math.round((subtotalCents / threshold) * 100));

  if (remaining <= 0) {
    return (
      <p className="flex items-start gap-2 rounded-cozy border border-gold-500 bg-cream-50 px-4 py-3 text-[13.5px] font-semibold text-burgundy-700">
        <Check className="mt-0.5 size-4 shrink-0 text-gold-500" strokeWidth={2.4} />
        Puiku! Jūsų užsakymui taikomas nemokamas pristatymas.
      </p>
    );
  }

  return (
    <div className="rounded-cozy bg-cream-200/70 px-4 py-3">
      <p className="text-[13px] font-medium text-ink-900">
        Trūksta tik <strong>{formatPrice(remaining)}</strong> iki nemokamo pristatymo
      </p>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Pažanga iki nemokamo pristatymo"
        className="mt-2 h-2 overflow-hidden rounded-full bg-white"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold-400 to-burgundy-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function CartDrawer() {
  const cart = useCart();
  const items = resolveItems(cart.lines);
  const subtotal = subtotalOf(items);
  const open = cart.drawerOpen;
  const freeShipping = subtotal >= store.shipping.freeThresholdCents;
  const [addons, setAddons] = useState<CartAddonSelection>(CART_ADDON_DEFAULTS);

  useEffect(() => {
    setAddons(readCartAddons());
  }, []);

  useEffect(() => {
    const beforeDonation = donationBaseCents(subtotal, addons);
    if (donationCents(beforeDonation) > 0) return;
    setAddons((prev) => {
      if (!prev.donation) return prev;
      const next = { ...prev, donation: false };
      writeCartAddons(next);
      return next;
    });
  }, [subtotal, addons.protection, addons.priority]);

  function updateAddons(next: CartAddonSelection) {
    setAddons(next);
    writeCartAddons(next);
  }

  const extras = addonAmounts(subtotal, addons);
  const payable = subtotal + extras.total;
  const bodyRef = useRef<HTMLDivElement>(null);
  const [bodyScrollable, setBodyScrollable] = useState(false);

  // Krepšelio papildymo pasiūlymas — pirmoji prekė, dar esanti krepšelyje
  const inCartSlugs = new Set(items.map((i) => i.slug));
  const upsell =
    flags.ENABLE_CART_UPSELL && items.length > 0
      ? items.flatMap((i) => i.product.pairsWith)
          .filter((s) => !inCartSlugs.has(s))
          .map((s) => getProduct(s))
          .find((p) => p?.inStock) ?? null
      : null;

  useEffect(() => {
    const el = bodyRef.current;
    if (!el || !open || items.length === 0) {
      setBodyScrollable(false);
      return;
    }

    function measure() {
      if (!el) return;
      setBodyScrollable(el.scrollHeight > el.clientHeight + 2);
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [open, items, upsell, addons, subtotal, extras.total]);

  function close() {
    cart.closeDrawer();
  }

  return (
    <Overlay open={open} onClose={close} label="Krepšelis" widthClass="max-w-md">
      {/* Antraštė */}
      <div className="flex shrink-0 items-center justify-between border-b border-cream-300/70 px-5 py-4">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-ink-900">
          <ShoppingBag className="size-5 text-burgundy-600" strokeWidth={1.8} />
          Jūsų krepšelis
          {items.length > 0 ? (
            <span className="text-sm font-normal text-ink-400">
              ({items.reduce((n, i) => n + i.qty, 0)})
            </span>
          ) : null}
        </h2>
        <button
          type="button"
          onClick={close}
          aria-label="Uždaryti krepšelį"
          className="flex size-10 items-center justify-center rounded-full transition hover:bg-cream-200"
        >
          <X className="size-5" strokeWidth={1.8} />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
          <ShoppingBag className="size-10 text-burgundy-600" strokeWidth={1.5} />
          <p className="font-display text-xl font-semibold text-ink-900">
            Jūsų krepšelis dar tuščias
          </p>
          <p className="max-w-xs text-sm leading-relaxed text-ink-600">
            Gal laikas išsirinkti pirmąją dovaną? Bestselleriai išsirinkimo problemą
            išsprendžia greičiausiai.
          </p>
          <Link href="/dovanos/bestselleriai" onClick={close}>
            <Button className="mt-2">Peržiūrėti dovanas</Button>
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
          <div
            ref={bodyRef}
            className={`flex min-h-0 flex-1 flex-col gap-3 px-5 py-3 ${
              bodyScrollable ? "overflow-y-auto overscroll-y-contain" : "overflow-y-hidden"
            }`}
          >
            <FreeShippingBar subtotalCents={subtotal} />

            <ul className="divide-y divide-cream-300/60">
              {items.map((item) => (
                <li key={`${item.slug}-${item.variantId}`} className="flex gap-3.5 py-4 first:pt-1">
                  <Link
                    href={`/produktai/${item.slug}`}
                    onClick={close}
                    className="shrink-0 overflow-hidden rounded-xl"
                    aria-hidden
                    tabIndex={-1}
                  >
                    <ProductImage
                      images={item.product.images}
                      seed={item.product.artSeed}
                      alt=""
                      size="thumb"
                      className="size-14 object-cover"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/produktai/${item.slug}`}
                      onClick={close}
                      className="line-clamp-2 text-sm font-semibold leading-snug text-ink-900 hover:text-burgundy-600"
                    >
                      {item.product.name}
                    </Link>
                    {item.variant.name !== "Standartinis rinkinys" &&
                    item.variant.name !== "Vienetas" ? (
                      <p className="mt-0.5 truncate text-xs text-ink-400">{item.variant.name}</p>
                    ) : null}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-cream-300 bg-white">
                        <button
                          type="button"
                          onClick={() => cart.setQty(item.slug, item.variantId, item.qty - 1)}
                          aria-label={`Sumažinti ${item.product.name} kiekį`}
                          className="flex size-8 items-center justify-center rounded-full text-ink-600 hover:text-burgundy-600"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm font-bold">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => cart.setQty(item.slug, item.variantId, item.qty + 1)}
                          aria-label={`Padidinti ${item.product.name} kiekį`}
                          className="flex size-8 items-center justify-center rounded-full text-ink-600 hover:text-burgundy-600"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-burgundy-600">
                          {formatPrice(item.lineTotalCents)}
                        </span>
                        <button
                          type="button"
                          onClick={() => cart.removeItem(item.slug, item.variantId)}
                          aria-label={`Pašalinti ${item.product.name}`}
                          className="-mr-1.5 flex size-11 items-center justify-center rounded-full text-ink-600 transition hover:bg-cream-200 hover:text-burgundy-700"
                        >
                          <X className="size-5" strokeWidth={2.25} />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Krepšelio papildymas */}
            {upsell ? (
              <div className="rounded-cozy border border-gold-300/60 bg-gradient-to-br from-cream-100 to-cream-200/50 p-4">
                <p className="text-[13px] font-semibold text-ink-900">
                  Puikiai dera su jūsų pasirinkimu
                </p>
                <div className="mt-2.5 flex items-center gap-3">
                  <ProductImage
                    images={upsell.images}
                    seed={upsell.artSeed}
                    alt=""
                    size="thumb"
                    className="size-14 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-ink-900">{upsell.name}</p>
                    <p className="text-[13px] font-bold text-burgundy-600">
                      {formatPrice(upsell.priceCents)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => cart.addItem(upsell.slug, upsell.defaultVariantId)}
                  >
                    Pridėti +
                  </Button>
                </div>
              </div>
            ) : null}

            <CartAddonRows
              subtotalCents={subtotal}
              selected={addons}
              onChange={updateAddons}
            />
          </div>

          <div className="shrink-0 border-t border-cream-300/70 bg-cream-100/80 px-5 py-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <p className="mb-2.5 flex items-center justify-center gap-1.5 text-xs text-ink-400">
              <Truck className="size-3.5" /> Pristatymas per 4–6 d. ·{" "}
              <ShieldCheck className="size-3.5" /> Saugus atsiskaitymas
            </p>
            <div className="flex items-center justify-between text-[13px] text-ink-600">
              <span>Tarpinė suma</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {extras.protection ? (
              <div className="mt-1 flex items-center justify-between text-[13px] text-ink-600">
                <span>{addonLineLabel("protection")}</span>
                <span>{formatPrice(extras.protection)}</span>
              </div>
            ) : null}
            {extras.donation ? (
              <div className="mt-1 flex items-center justify-between text-[13px] text-ink-600">
                <span>{addonLineLabel("donation")}</span>
                <span>{formatPrice(extras.donation)}</span>
              </div>
            ) : null}
            {extras.priority ? (
              <div className="mt-1 flex items-center justify-between text-[13px] text-ink-600">
                <span>{addonLineLabel("priority")}</span>
                <span>{formatPrice(extras.priority)}</span>
              </div>
            ) : null}
            <div className="mt-2 flex items-center justify-between text-[15px] font-bold text-ink-900">
              <span>Iš viso</span>
              <span>{formatPrice(payable)}</span>
            </div>
            <p className="mt-0.5 text-xs text-ink-400">
              {freeShipping
                ? "Nemokamas pristatymas įskaičiuotas"
                : "Pristatymo kaina apskaičiuojama atsiskaitymo metu."}
            </p>
            <Button
              size="lg"
              className="mt-3 w-full whitespace-normal text-center text-[15px] leading-snug"
              onClick={() => {
                track("begin_checkout", { value: payable / 100 });
                void startCheckout(cart.lines);
              }}
            >
              SAUGIAI TĘSTI ATSISKAITYMĄ →
            </Button>
            <button
              type="button"
              onClick={close}
              className="mx-auto mt-2.5 block text-sm font-medium text-ink-600 underline underline-offset-4 hover:text-burgundy-600"
            >
              Tęsti apsipirkimą
            </button>
          </div>
        </>
      )}
    </Overlay>
  );
}
