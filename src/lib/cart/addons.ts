import { store } from "@/lib/config/store.config";

export type CartAddonId = "protection" | "donation" | "priority";

export interface CartAddonSelection {
  protection: boolean;
  donation: boolean;
  priority: boolean;
}

export const CART_ADDON_DEFAULTS: CartAddonSelection = {
  protection: true,
  donation: false,
  priority: false,
};

const STORAGE_KEY = "jaukumas.cart-addons.v1";

export function donationCents(amountCents: number): number {
  const step = store.addons.donation.stepCents;
  if (amountCents <= 0) return 0;
  const next = Math.ceil(amountCents / step) * step;
  return next > amountCents ? next - amountCents : 0;
}

export function donationTargetCents(amountCents: number): number {
  return amountCents + donationCents(amountCents);
}

export function donationBaseCents(subtotalCents: number, selected: CartAddonSelection): number {
  const protection = selected.protection ? store.addons.protection.priceCents : 0;
  const priority = selected.priority ? store.addons.priority.priceCents : 0;
  return subtotalCents + protection + priority;
}

export function addonAmounts(subtotalCents: number, selected: CartAddonSelection) {
  const protection = selected.protection ? store.addons.protection.priceCents : 0;
  const priority = selected.priority ? store.addons.priority.priceCents : 0;
  const beforeDonation = subtotalCents + protection + priority;
  const donation = donationCents(beforeDonation);
  const donationAmt = selected.donation && donation > 0 ? donation : 0;
  return {
    protection,
    donation: donationAmt,
    priority,
    total: protection + donationAmt + priority,
  };
}

function isSelection(value: unknown): value is CartAddonSelection {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as CartAddonSelection).protection === "boolean" &&
    typeof (value as CartAddonSelection).donation === "boolean" &&
    typeof (value as CartAddonSelection).priority === "boolean"
  );
}

export function readCartAddons(): CartAddonSelection {
  if (typeof window === "undefined") return { ...CART_ADDON_DEFAULTS };
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (isSelection(parsed)) return parsed;
  } catch {
    /* neprieinama */
  }
  return { ...CART_ADDON_DEFAULTS };
}

export function writeCartAddons(selection: CartAddonSelection) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
  } catch {
    /* neprieinama */
  }
}

export function parseCheckoutAddons(value: unknown): CartAddonSelection {
  if (!isSelection(value)) {
    return { protection: false, donation: false, priority: false };
  }
  return value;
}
