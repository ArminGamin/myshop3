"use client";

import type { CartLine } from "@/types";
import { track } from "@/lib/analytics";
import { addonAmounts, readCartAddons } from "./addons";
import { resolveItems, subtotalOf } from "./context";

// Kliento pagalbininkas: siunčia krepšelį į serverį ir nukreipia į
// Stripe Checkout. Kainos serveryje perskaičiuojamos iš katalogo.
export async function startCheckout(lines: CartLine[]): Promise<boolean> {
  try {
    const addons = readCartAddons();
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines, addons }),
    });
    if (!res.ok) {
      console.error("Checkout klaida:", await res.text());
      return false;
    }
    const data: { url: string } = await res.json();
    const subtotal = subtotalOf(resolveItems(lines));
    track("begin_checkout", {
      value: (subtotal + addonAmounts(subtotal, addons).total) / 100,
    });
    window.location.href = data.url;
    return true;
  } catch (e) {
    console.error("Nepavyko pradėti atsiskaitymo:", e);
    return false;
  }
}
