import { store } from "@/lib/config/store.config";

export interface BundleTier {
  qty: number;
  discountPct: number;
  label?: string;
}

// Kiekio nuolaidų konfigūracija — tikros kainos, be išpūstų „buvusių“ kainų.
export const bundleTiers: BundleTier[] =
  store.bundles?.tiers ?? [
    { qty: 2, discountPct: 10, label: "Populiariausias" },
    { qty: 3, discountPct: 15, label: "Didžiausia vertė" },
  ];

export function tierDiscountPct(qty: number): number {
  let pct = 0;
  for (const t of bundleTiers) {
    if (qty >= t.qty) pct = Math.max(pct, t.discountPct);
  }
  return pct;
}

// Vieneto kaina taikant kiekio nuolaidą (naudojama ir kliente, ir serveryje,
// kad atsiskaitymo suma visada sutaptų su rodoma).
export function bundleUnitPriceCents(unitCents: number, qty: number): number {
  const pct = tierDiscountPct(qty);
  if (!pct) return unitCents;
  return Math.round((unitCents * (100 - pct)) / 100);
}
