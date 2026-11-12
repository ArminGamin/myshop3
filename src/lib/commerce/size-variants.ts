import type { ProductSizeGroup, ProductVariant } from "@/types";
import { bundleUnitPriceCents } from "@/lib/commerce/pricing";

export const SIZE_SELECTION_REQUIRED = "select-sizes";

export function sizeLabel(size: string): string {
  return size.replace(/^(Kids|Mom|Dad)\s+/, "").replace(/^(\d+(?:-\d+)?)Y$/, (_, age: string) => `${age.replace("-", "–")} m.`);
}

export function sizeVariantId(sizes: { id: ProductSizeGroup["id"]; size: string }[]): string {
  const roleOrder = { child: 0, woman: 1, man: 2 };
  return `size:${[...sizes]
    .sort((a, b) => roleOrder[a.id] - roleOrder[b.id])
    .map(({ id, size }) => `${id}=${encodeURIComponent(size)}`)
    .join(";")}`;
}

// Pirkėjas renkasi tik tuos megztinius, kurių reikia: grupė be dydžio į pirkinį neįeina.
export function selectedSizeVariantId(
  groups: ProductSizeGroup[],
  selections: Partial<Record<ProductSizeGroup["id"], string>>
): string | null {
  const chosen = groups.filter((group) => selections[group.id]);
  return chosen.length > 0 && chosen.every((group) => group.sizes.includes(selections[group.id]!))
    ? sizeVariantId(chosen.map((group) => ({ id: group.id, size: selections[group.id]! })))
    : null;
}

export function sizeVariantCount(variantId: string): number {
  return variantId.startsWith("size:") ? variantId.slice(5).split(";").length : 1;
}

// Visi galimi deriniai (bet kuris megztinių poaibis). unitCents – vieno megztinio kaina:
// keli megztiniai kainuoja kaip kiekio rinkinys (2 vnt. −10 %, 3 vnt. −15 %).
export function makeSizeVariants(groups: ProductSizeGroup[], unitCents?: number): ProductVariant[] {
  if (groups.length === 0) return [];
  let combinations: { sizes: { id: ProductSizeGroup["id"]; size: string }[]; names: string[] }[] = [{ sizes: [], names: [] }];
  for (const group of groups) {
    combinations = combinations.flatMap((combination) => [
      ...(groups.length > 1 ? [combination] : []),
      ...group.sizes.map((size) => ({
        sizes: [...combination.sizes, { id: group.id, size }],
        names: [...combination.names, `${group.label}: ${sizeLabel(size)}`],
      })),
    ]);
  }
  return combinations
    .filter(({ sizes }) => sizes.length > 0)
    .map(({ sizes, names }) => {
      const n = sizes.length;
      const delta = unitCents && n > 1 ? bundleUnitPriceCents(unitCents, n) * n - unitCents : 0;
      return { id: sizeVariantId(sizes), name: names.join(" · "), ...(delta ? { priceDeltaCents: delta } : {}) };
    });
}
