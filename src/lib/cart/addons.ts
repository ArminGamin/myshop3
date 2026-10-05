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

export function addonAmounts(_subtotalCents: number, selected: CartAddonSelection) {
  const protection = selected.protection ? store.addons.protection.priceCents : 0;
  const priority = selected.priority ? store.addons.priority.priceCents : 0;
  return {
    protection,
    donation: 0,
    priority,
    total: protection + priority,
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
    if (isSelection(parsed)) return { ...parsed, donation: false };
  } catch {
    /* neprieinama */
  }
  return { ...CART_ADDON_DEFAULTS };
}

export function writeCartAddons(selection: CartAddonSelection) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...selection, donation: false }));
  } catch {
    /* neprieinama */
  }
}

export function parseCheckoutAddons(value: unknown): CartAddonSelection {
  if (!isSelection(value)) {
    return { protection: false, donation: false, priority: false };
  }
  return { ...value, donation: false };
}
