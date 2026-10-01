"use client";

import { useState, type FormEvent } from "react";
import { resolveItems, subtotalOf, useCart } from "@/lib/cart/context";
import { addonAmounts } from "@/lib/cart/addons";
import { MYSTERY_GIFT } from "@/lib/cart/mystery-gift";
import { patchCustomerDraft, useCheckoutAddons, useCustomerDraft, useMysterySelection } from "@/lib/checkout/draft-store";
import { store } from "@/lib/config/store.config";
import { formatPrice } from "@/lib/format";
import { apiHeaders } from "@/lib/security/csrf-client";
import { isAllowedEmail, normalizeEmail } from "@/lib/security/email";
import { ProductImage } from "./product-art";

export function CartExitPreview() {
  const cart = useCart();
  const addons = useCheckoutAddons();
  const customer = useCustomerDraft();
  const mysteryGift = useMysterySelection();
  const items = resolveItems(cart.lines).filter((item) => item.slug !== MYSTERY_GIFT.slug);
  const subtotal = subtotalOf(items);
  const giftCents = mysteryGift ? MYSTERY_GIFT.priceCents : 0;
  const extras = addonAmounts(subtotal + giftCents, addons);
  const shipping = mysteryGift || subtotal >= store.shipping.freeThresholdCents ? 0 : store.shipping.flatRateCents;
  const [email, setEmail] = useState(customer.email);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveCart(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const address = normalizeEmail(email);
    if (!isAllowedEmail(address)) {
      setError("Įveskite galiojantį el. pašto adresą.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/checkout/reminders", {
        method: "POST", headers: apiHeaders(), keepalive: true,
        body: JSON.stringify({ email: address, lines: cart.lines, addons, mysteryGift }),
      });
      if (!response.ok || !(await response.json()).saved) throw new Error("capture_failed");
      patchCustomerDraft("email", address);
      setSaved(true);
    } catch {
      setError("Nepavyko išsaugoti krepšelio. Pabandykite dar kartą.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative mt-5 rounded-[12px] border border-cream-300 bg-white p-3 text-left sm:p-4">
      <h3 className="text-sm font-semibold text-ink-900">Jūsų krepšelis</h3>
      <ul className="mt-3 max-h-44 space-y-3 overflow-y-auto">
        {items.map((item) => (
          <li key={`${item.slug}-${item.variantId}`} className="flex items-center gap-3">
            <ProductImage images={item.variant.images?.length ? item.variant.images : item.product.images} seed={item.product.artSeed} alt={`${item.product.name} — ${item.variant.name}`} size="thumb" sizes="56px" className="size-14 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-snug text-ink-900">{item.product.name}</p>
              <p className="text-xs text-ink-500">{item.variant.name} · Kiekis: {item.qty}</p>
            </div>
            <span className="num shrink-0 text-sm font-semibold text-burgundy-700">{formatPrice(item.lineTotalCents)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 space-y-1.5 border-t border-cream-200 pt-3 text-xs text-ink-600">
        {mysteryGift && <div className="flex justify-between gap-3"><span>{MYSTERY_GIFT.name}</span><span>{formatPrice(giftCents)}</span></div>}
        {extras.total > 0 && <div className="flex justify-between gap-3"><span>Pasirinkti priedai</span><span>{formatPrice(extras.total)}</span></div>}
        <div className="flex justify-between gap-3"><span>Pristatymas</span><span>{shipping === 0 ? "Nemokamas" : formatPrice(shipping)}</span></div>
        <div className="flex justify-between gap-3 pt-1 text-base font-bold text-ink-900"><span>Iš viso</span><span className="num">{formatPrice(subtotal + giftCents + extras.total + shipping)}</span></div>
      </div>
      {saved ? <p role="status" className="mt-4 text-sm font-medium text-forest-600">Krepšelis išsaugotas. Jei neužbaigsite užsakymo, atsiųsime priminimą.</p> : !isAllowedEmail(customer.email) ? (
        <details className="mt-4 border-t border-cream-200 pt-4">
          <summary className="min-h-11 cursor-pointer text-sm font-semibold text-burgundy-700">Išsaugoti krepšelį el. paštu</summary>
          <form onSubmit={saveCart} noValidate>
          <label htmlFor="exit-cart-email" className="sr-only">Išsaugoti krepšelį el. paštu</label>
          <p className="mt-1 text-xs leading-relaxed text-ink-500">Jei neužbaigsite užsakymo, priminsime apie jūsų pasirinktas dovanas.</p>
          <input id="exit-cart-email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(null); }} placeholder="Jūsų el. paštas" aria-invalid={Boolean(error)} aria-describedby={error ? "exit-cart-email-error" : undefined} className="mt-3 min-h-11 w-full rounded-lg border border-cream-300 bg-cream-50 px-3 text-sm text-ink-900 outline-none focus:border-burgundy-500 focus:ring-2 focus:ring-burgundy-100" />
          {error && <p id="exit-cart-email-error" role="alert" className="mt-2 text-xs text-burgundy-700">{error}</p>}
          <button type="submit" disabled={busy} className="mt-2 min-h-11 w-full rounded-full border border-burgundy-600 px-4 text-sm font-semibold text-burgundy-700 disabled:opacity-60">{busy ? "Saugoma…" : "Išsaugoti krepšelį"}</button>
          </form>
        </details>
      ) : null}
    </div>
  );
}
