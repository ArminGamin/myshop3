import type { ProductSizeGroup, ProductVariant } from "@/types";

export const SIZE_SELECTION_REQUIRED = "select-sizes";

export function sizeVariantId(sizes: { id: ProductSizeGroup["id"]; size: string }[]): string {
  const roleOrder = { child: 0, woman: 1, man: 2 };
  return `size:${[...sizes]
    .sort((a, b) => roleOrder[a.id] - roleOrder[b.id])
    .map(({ id, size }) => `${id}=${encodeURIComponent(size)}`)
    .join(";")}`;
}

export function selectedSizeVariantId(
  groups: ProductSizeGroup[],
  selections: Partial<Record<ProductSizeGroup["id"], string>>
): string | null {
  const sizes = groups.map((group) => ({ id: group.id, size: selections[group.id] ?? "" }));
  return groups.length > 0 && groups.every((group) => group.sizes.includes(selections[group.id] ?? ""))
    ? sizeVariantId(sizes)
    : null;
}

export function makeSizeVariants(groups: ProductSizeGroup[]): ProductVariant[] {
  if (groups.length === 0) return [];
  let combinations: { sizes: { id: ProductSizeGroup["id"]; size: string }[]; names: string[] }[] = [{ sizes: [], names: [] }];
  for (const group of groups) {
    combinations = combinations.flatMap((combination) =>
      group.sizes.map((size) => ({
        sizes: [...combination.sizes, { id: group.id, size }],
        names: [...combination.names, `${group.label}: ${size}`],
      }))
    );
  }
  return combinations.map(({ sizes, names }) => ({
    id: sizeVariantId(sizes),
    name: names.join(" · "),
  }));
}
