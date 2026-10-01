import { flags } from "@/lib/config/store.config";
import { getProduct } from "@/lib/data/products";
import type { Product } from "@/types";

type CartLine = { slug: string; product: { pairsWith: string[] } };

export function findPairsWithUpsell(items: CartLine[]): Product | null {
  if (!flags.ENABLE_CART_UPSELL || items.length === 0) return null;
  const inCartSlugs = new Set(items.map((i) => i.slug));
  return (
    items
      .flatMap((i) => i.product.pairsWith)
      .filter((s) => !inCartSlugs.has(s))
      .map((s) => getProduct(s))
      .find((p) => p?.inStock && !p.sizeGroups) ?? null
  );
}
