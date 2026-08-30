"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ShieldCheck, ShoppingBag, Truck, Undo2 } from "lucide-react";
import type { Product } from "@/types";
import { useCart } from "@/lib/cart/context";
import { bundleUnitPriceCents, bundleTiers } from "@/lib/commerce/pricing";
import { store } from "@/lib/config/store.config";
import { formatPrice, discountPercent } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

// Pagrindinė pirkimo forma: variantai + kiekio rinkiniai (1/2/3) + CTA.
export function AddToCartForm({ product }: { product: Product }) {
  const cart = useCart();
  const [variantId, setVariantId] = useState(product.defaultVariantId);
  const [qtyChoice, setQtyChoice] = useState(1);

  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const baseUnit = product.priceCents + (variant.priceDeltaCents ?? 0);
  const unit = bundleUnitPriceCents(baseUnit, qtyChoice);
  const total = unit * qtyChoice;
  const compareTotal =
    product.compareAtPriceCents && qtyChoice === 1 ? product.compareAtPriceCents : null;
  const discount = discountPercent(unit, compareTotal);
  const savings = baseUnit * qtyChoice - total;

  const tierOptions = useMemo(
    () => [{ qty: 1 }, ...bundleTiers.map((t) => ({ qty: t.qty }))],
    []
  );

  return (
    <div className="space-y-5">
      {/* Variantai */}
      {product.variants.length > 1 ? (
        <fieldset>
          <legend className="mb-2 text-[13px] font-bold uppercase tracking-wide text-ink-600">
            Pasirinkite variantą
          </legend>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Variantas">
            {product.variants.map((v) => {
              const selected = v.id === variantId;
              return (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setVariantId(v.id)}
                  className={`min-h-11 rounded-full border px-4 py-2.5 text-[13.5px] font-semibold transition ${
                    selected
                      ? "border-burgundy-600 bg-burgundy-600 text-cream-50"
                      : "border-cream-400 bg-white text-ink-900 hover:border-burgundy-600/50"
                  }`}
                >
                  {v.name}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {/* Kiekio rinkiniai */}
      {store.bundles?.enabled && bundleTiers.length > 0 ? (
        <fieldset>
          <legend className="mb-2 text-[13px] font-bold uppercase tracking-wide text-ink-600">
            Rinkinys — kuo daugiau, tuo pigiau
          </legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {tierOptions.map(({ qty }) => {
              const u = bundleUnitPriceCents(baseUnit, qty);
              const t = u * qty;
              const pct = qty === 1 ? 0 : Math.round(((baseUnit - u) / baseUnit) * 100);
              const tierMeta = bundleTiers.find((x) => x.qty === qty);
              const selected = qtyChoice === qty;
              return (
                <button
                  key={qty}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setQtyChoice(qty)}
                  className={`relative rounded-cozy border-2 p-3.5 text-left transition ${
                    selected ? "border-burgundy-600 bg-burgundy-100/50" : "border-cream-300 bg-white hover:border-gold-400"
                  }`}
                >
                  {tierMeta?.label ? (
                    <span
                      className={`absolute -top-2.5 left-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        qty === 1 ? "hidden" : "bg-gold-400 text-burgundy-800"
                      }`}
                    >
                      {tierMeta.label}
                    </span>
                  ) : null}
                  <p className="text-sm font-bold text-ink-900">
                    {qty === 1 ? "Vienas" : qty === 2 ? "Du" : "Trys"}
                  </p>
                  <p className="mt-0.5 text-[15px] font-extrabold text-burgundy-600">
                    {formatPrice(t)}
                  </p>
                  <p className="text-xs text-ink-400">
                    {qty > 1 ? `${formatPrice(u)} / vnt.` : formatPrice(baseUnit)}
                    {pct > 0 ? ` · −${pct} %` : ""}
                  </p>
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {/* Kaina ir CTA */}
      <div>
        <div className="flex items-baseline gap-2.5">
          <span className="font-display text-3xl font-bold text-burgundy-600">
            {formatPrice(total)}
          </span>
          {compareTotal ? (
            <s className="text-lg text-ink-400">{formatPrice(compareTotal * 1)}</s>
          ) : null}
          {discount ? (
            <span className="rounded-full bg-burgundy-100 px-2.5 py-1 text-xs font-bold text-burgundy-600">
              −{discount} %
            </span>
          ) : null}
        </div>
        {savings > 0 ? (
          <p className="mt-1 text-[13px] font-semibold text-burgundy-600">
            Sutaupote {formatPrice(savings)} su rinkiniu ✓
          </p>
        ) : null}

        <Button
          size="lg"
          className="mt-4 w-full"
          disabled={!product.inStock}
          onClick={() => {
            track("add_to_cart", {
              item_id: product.slug,
              item_name: product.name,
              value: total / 100,
              quantity: qtyChoice,
            });
            cart.addItem(product.slug, variantId, qtyChoice);
          }}
        >
          <ShoppingBag className="size-5" strokeWidth={2} />
          {product.inStock ? "Į krepšelį" : "Prekės nėra sandėlyje"}
        </Button>

        <ul className="mt-4 space-y-2 text-[13.5px] text-ink-600">
          <li className="flex items-center gap-2">
            <ShieldCheck className="size-4 shrink-0 text-burgundy-600" />
            Saugus atsiskaitymas per Stripe
          </li>
          <li className="flex items-center gap-2">
            <Truck className="size-4 shrink-0 text-burgundy-600" />
            Pristatymas visoje Lietuvoje per 4–6 d.
          </li>
          <li className="flex items-center gap-2">
            <Undo2 className="size-4 shrink-0 text-burgundy-600" />
            Grąžinimas be priežasties per 14 d. d.
          </li>
        </ul>
      </div>

      {/* Nauda */}
      <ul className="grid gap-2 rounded-cozy border border-gold-400/40 bg-cream-100 p-4 sm:grid-cols-2">
        {product.benefits.map((b) => (
          <li key={b} className="flex items-start gap-2 text-[13.5px] font-medium leading-snug text-ink-900">
            <Check className="mt-0.5 size-4 shrink-0 text-gold-500" strokeWidth={2.5} />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Mobilioji lipni pirkimo juosta — pasirodo nuslinkus žemiau pagrindinio CTA.
export function StickyBuyBar({ product }: { product: Product }) {
  const cart = useCart();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 640);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible || dismissed || !cart.hydrated) return null;

  return (
    <div className="animate-slide-up-mobile fixed inset-x-0 bottom-0 z-[65] border-t border-cream-300 bg-cream-50/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 shadow-lift backdrop-blur-md lg:hidden">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold text-ink-900">{product.name}</p>
          <p className="text-[15px] font-extrabold text-burgundy-600">
            {formatPrice(product.priceCents)}
          </p>
        </div>
        <Button
          onClick={() => cart.addItem(product.slug, product.defaultVariantId)}
          className="shrink-0"
        >
          <ShoppingBag className="size-4" strokeWidth={2} />
          Į krepšelį
        </Button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Paslėpti pirkimo juostą"
          className="absolute -top-10 right-3 flex size-11 items-center justify-center rounded-full bg-ink-900/80 text-cream-50"
        >
          ×
        </button>
      </div>
    </div>
  );
}
