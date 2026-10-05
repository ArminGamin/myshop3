"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Check, Gift, Heart, ShoppingBag, Truck, X } from "lucide-react";
import type { Product } from "@/types";
import { useCart } from "@/lib/cart/context";
import { useWishlist } from "@/lib/behavior/storage";
import { useMobileChromeFlag, useIsMobile } from "@/lib/mobile-chrome";
import { bundleUnitPriceCents, bundleTiers } from "@/lib/commerce/pricing";
import { selectedSizeVariantId, sizeLabel, SIZE_SELECTION_REQUIRED } from "@/lib/commerce/size-variants";
import { store } from "@/lib/config/store.config";
import { formatPrice, discountPercent } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import {
  variantButtonClasses,
  variantSwatch,
  variantSwatchRingClass,
} from "@/lib/commerce/color-swatches";
import { useProductVariant } from "./product-variant";

// Pagrindinė pirkimo forma: variantai + kiekio rinkiniai (1/2/3) + CTA.
export function AddToCartForm({ product }: { product: Product }) {
  const cart = useCart();
  const wishlist = useWishlist();
  const saved = wishlist.has(product.slug);
  const { variantId, setVariantId } = useProductVariant(product.defaultVariantId);
  const [qtyChoice, setQtyChoice] = useState(1);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

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
    <div id="product-size-selection" className="space-y-6">
      {/* Variantai */}
      {product.sizeGroups ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {product.sizeGroups.map((group) => (
            <label key={group.id} className="pdp-label block">
              {group.label} — dydis
              <select
                value={selectedSizes[group.id] ?? ""}
                onChange={(event) => {
                  const next = { ...selectedSizes, [group.id]: event.target.value };
                  setSelectedSizes(next);
                  setVariantId(selectedSizeVariantId(product.sizeGroups!, next) ?? SIZE_SELECTION_REQUIRED);
                }}
                required
                className="pdp-select mt-2 min-h-12 w-full px-3.5 text-sm font-semibold normal-case tracking-normal text-ink-900"
              >
                <option value="">Pasirinkite dydį</option>
                {group.sizes.map((size) => <option key={size} value={size}>{sizeLabel(size)}</option>)}
              </select>
            </label>
          ))}
        </div>
      ) : product.variants.length > 1 ? (
        <fieldset>
          <legend className="pdp-label mb-2.5">
            Pasirinkite variantą: <span className="normal-case tracking-normal text-ink-900">{variant.name}</span>
          </legend>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Variantas">
            {product.variants.map((v) => {
              const selected = v.id === variantId;
              const swatch = variantSwatch(v.id);
              return (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setVariantId(v.id)}
                  className={variantButtonClasses(v.id, selected)}
                >
                  {swatch ? (
                    <span
                      className={`size-4 shrink-0 rounded-full ring-1 ${variantSwatchRingClass(v.id, selected)} ${swatch}`}
                      aria-hidden
                    />
                  ) : null}
                  {v.name}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {/* Kiekio rinkiniai */}
      {product.inStock && store.bundles?.enabled && bundleTiers.length > 0 ? (
        <fieldset>
          <legend className="pdp-label mb-2.5">
            Rinkinys — kuo daugiau, tuo pigiau
          </legend>
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
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
                  className="pdp-tier"
                  data-selected={selected || undefined}
                >
                  <span aria-hidden className="pdp-tier-check">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {tierMeta?.label ? (
                    <span
                      className={`pdp-tier-tag ${qty === 1 ? "hidden" : ""}`}
                    >
                      {tierMeta.label}
                    </span>
                  ) : null}
                  <p className="text-sm font-bold text-ink-900">
                    {qty === 1 ? "Vienas" : qty === 2 ? "Du" : "Trys"}
                  </p>
                  <p className="num mt-1 text-[15px] font-extrabold text-burgundy-600 sm:text-base">
                    {formatPrice(t)}
                  </p>
                  <p className="text-[11.5px] leading-snug text-ink-400">
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
      <div className="pdp-checkout">
        <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
          <span className="num text-[2.15rem] font-extrabold leading-none tracking-tight text-burgundy-600">
            {product.priceCents > 0 ? formatPrice(total) : "Kaina tikslinama"}
          </span>
          {compareTotal ? (
            <s className="num pb-0.5 text-lg font-medium text-ink-400">{formatPrice(compareTotal * 1)}</s>
          ) : null}
          {discount ? <span className="pdp-save mb-1">−{discount} %</span> : null}
        </div>
        {savings > 0 ? (
          <p className="mt-1.5 text-[13px] font-semibold text-forest-500">
            Sutaupote {formatPrice(savings)} su rinkiniu
          </p>
        ) : null}

        <div className="mt-4 flex gap-2.5">
          <Button
            size="lg"
            className="hero-cta min-h-14 flex-1 text-[16px]"
            disabled={!product.inStock || (Boolean(product.sizeGroups) && variantId === SIZE_SELECTION_REQUIRED)}
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
            {!product.inStock ? "Prekė tikrinama" : variantId === SIZE_SELECTION_REQUIRED ? "Pasirinkite dydžius" : "Į krepšelį"}
          </Button>
          <button
            type="button"
            onClick={() => wishlist.toggle(product.slug)}
            aria-pressed={saved}
            aria-label={saved ? "Pašalinti iš įsimintų" : "Įsiminti dovaną"}
            className="pdp-save-btn"
            data-active={saved || undefined}
          >
            <Heart className="size-5" strokeWidth={1.9} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>

        {product.inStock ? (
          <ul className="pdp-trust mt-4">
            <li>
              <Truck aria-hidden className="size-4" strokeWidth={1.8} />
              Pristatymas per 4–6 d.
            </li>
            <li>
              <BadgeCheck aria-hidden className="size-4" strokeWidth={1.8} />
              Patikrinta kokybė
            </li>
            <li>
              <Gift aria-hidden className="size-4" strokeWidth={1.8} />
              Kruopščiai parinktos dovanos
            </li>
          </ul>
        ) : null}
      </div>

      {/* Nauda */}
      <ul className="pdp-benefits">
        {product.benefits.map((b) => (
          <li key={b}>
            <span aria-hidden className="pdp-benefit-check">
              <Check className="size-3" strokeWidth={3} />
            </span>
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
  const isMobile = useIsMobile();
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

  const showBar = product.inStock && isMobile && visible && !dismissed && cart.hydrated;
  useMobileChromeFlag("stickyBuy", showBar);

  if (!showBar) return null;

  return (
    <div
      data-mobile-sticky-buy=""
      className="pdp-sticky animate-slide-up-mobile fixed inset-x-0 bottom-0 z-[65] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 lg:hidden"
    >
      <div className="flex items-center gap-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold text-ink-900">{product.name}</p>
          <p className="num text-[15px] font-extrabold text-burgundy-600">
            {formatPrice(product.priceCents)}
          </p>
        </div>
        <Button
          onClick={() => {
            if (product.sizeGroups) {
              const form = document.getElementById("product-size-selection");
              form?.scrollIntoView({ behavior: "smooth", block: "center" });
              form?.querySelector("select")?.focus({ preventScroll: true });
            } else {
              cart.addItem(product.slug, product.defaultVariantId);
            }
          }}
          className="hero-cta shrink-0 px-4"
        >
          <ShoppingBag className="size-4" strokeWidth={2} />
          {product.sizeGroups ? "Rinktis dydžius" : "Į krepšelį"}
        </Button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Paslėpti pirkimo juostą"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-ink-500 transition hover:bg-cream-200 hover:text-ink-900"
        >
          <X className="block size-4 shrink-0" strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
}
