"use client";

import type { CartLine } from "@/types";
import { track } from "@/lib/analytics";
import { apiHeaders } from "@/lib/security/csrf-client";
import type { CheckoutCustomer } from "@/lib/checkout/customer";
import { addonAmounts, readCartAddons } from "./addons";
import { MYSTERY_GIFT, readMysteryGift } from "./mystery-gift";
import { resolveItems, subtotalOf } from "./context";
import { store } from "@/lib/config/store.config";

export async function startCheckout(
  lines: CartLine[],
  customer?: CheckoutCustomer
): Promise<boolean> {
  try {
    const addons = readCartAddons();
    const mysteryGift = readMysteryGift();
    const subtotal = subtotalOf(resolveItems(lines));
    const mysteryCents = mysteryGift ? MYSTERY_GIFT.priceCents : 0;
    const shipping = mysteryGift || subtotal >= store.shipping.freeThresholdCents ? 0 : store.shipping.flatRateCents;
    const expectedTotalCents = subtotal + mysteryCents + addonAmounts(subtotal + mysteryCents, addons).total + shipping;
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: apiHeaders(),
      body: JSON.stringify({ lines, addons, customer, mysteryGift, expectedTotalCents }),
    });
    if (!res.ok) {
      console.error("Checkout klaida:", await res.text());
      return false;
    }
    const data: { url?: string; totalCents?: number } = await res.json();
    if (!data.url || data.totalCents !== expectedTotalCents) return false;
    track("begin_checkout", {
      value: expectedTotalCents / 100,
    });
    window.location.href = data.url;
    return true;
  } catch (e) {
    console.error("Nepavyko pradėti atsiskaitymo:", e);
    return false;
  }
}
