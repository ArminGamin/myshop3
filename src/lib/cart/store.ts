"use client";

import { getProduct } from "@/lib/data/products";
import type { CartItemResolved, CartLine } from "@/types";
import { track } from "@/lib/analytics";
import { bundleUnitPriceCents } from "@/lib/commerce/pricing";
import { MAX_QTY, normalizeQuantity } from "@/lib/cart/limits";

// Krepšelio išorinė parduotuvė (useSyncExternalStore) — be hydratacijos
// neatitikimų ir be sinchroninių setState efektuose.
const STORAGE_KEY = "jaukumas.cart.v1";
export { MAX_QTY };

type Listener = () => void;

let lines: CartLine[] = [];
let loaded = false;
let hydratedFlag = false;
const listeners = new Set<Listener>();

function isCartLines(v: unknown): v is CartLine[] {
  return (
    Array.isArray(v) &&
    v.every(
      (l): l is CartLine =>
        !!l &&
        typeof l === "object" &&
        typeof (l as CartLine).slug === "string" &&
        typeof (l as CartLine).variantId === "string" &&
        typeof (l as CartLine).qty === "number"
    )
  );
}

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // localStorage neprieinamas
  }
}

export const cartStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  get(): CartLine[] {
    return lines;
  },
  hydrated(): boolean {
    return hydratedFlag;
  },
  init() {
    if (loaded) return;
    loaded = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : null;
      if (isCartLines(parsed)) {
        lines = parsed.map((l) => ({ ...l, qty: normalizeQuantity(l.qty) }))
          .filter((l) => {
            const product = getProduct(l.slug);
            return l.qty > 0 && product && (!product.sizeGroups || product.variants.some((v) => v.id === l.variantId));
          });
      }
    } catch {
      // sugedęs įrašas — pradedame tuščiu
    }
    hydratedFlag = true;
    emit();
  },
  add(line: CartLine, opts?: { silent?: boolean }) {
    line = { ...line, qty: normalizeQuantity(line.qty) };
    const product = getProduct(line.slug);
    if (!line.qty || !product?.inStock || (product.sizeGroups && !product.variants.some((v) => v.id === line.variantId))) return;
    const existing = lines.find(
      (l) => l.slug === line.slug && l.variantId === line.variantId
    );
    lines = existing
      ? lines.map((l) =>
          l === existing ? { ...l, qty: Math.min(MAX_QTY, l.qty + line.qty) } : l
        )
      : [...lines, line];
    persist();
    emit();
    if (product && !opts?.silent) {
      track("add_to_cart", {
        item_id: line.slug,
        item_name: product.name,
        quantity: line.qty,
        value: ((product.priceCents + (product.variants.find((v) => v.id === line.variantId)?.priceDeltaCents ?? 0)) * line.qty) / 100,
      });
    }
  },
  setQty(slug: string, variantId: string, qty: number) {
    qty = normalizeQuantity(qty);
    if (qty <= 0) return cartStore.remove(slug, variantId);
    lines = lines.map((l) =>
      l.slug === slug && l.variantId === variantId ? { ...l, qty: Math.min(MAX_QTY, qty) } : l
    );
    persist();
    emit();
  },
  remove(slug: string, variantId: string) {
    lines = lines.filter((l) => !(l.slug === slug && l.variantId === variantId));
    persist();
    emit();
  },
  clear() {
    if (lines.length === 0) return;
    lines = [];
    persist();
    emit();
  },
};

export function resolveItems(items: CartLine[]): CartItemResolved[] {
  const resolved: CartItemResolved[] = [];
  for (const line of items) {
    const qty = normalizeQuantity(line.qty);
    if (!qty) continue;
    const product = getProduct(line.slug);
    if (!product || !product.inStock) continue;
    if (product.sizeGroups && !product.variants.some((v) => v.id === line.variantId)) continue;
    const variant =
      product.variants.find((v) => v.id === line.variantId) ?? product.variants[0];
    const unitPriceCents = bundleUnitPriceCents(product.priceCents + (variant.priceDeltaCents ?? 0), qty);
    resolved.push({
      ...line,
      qty,
      product,
      variant,
      unitPriceCents,
      lineTotalCents: unitPriceCents * qty,
    });
  }
  return resolved;
}

export function subtotalOf(items: CartItemResolved[]): number {
  return items.reduce((sum, i) => sum + i.lineTotalCents, 0);
}

export function countOf(linesArg: CartLine[]): number {
  return linesArg.reduce((sum, l) => sum + l.qty, 0);
}
