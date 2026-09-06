export const VARIANT_SWATCH: Record<string, string> = {
  kreminis: "bg-cream-200",
  kremisinis: "bg-cream-200",
  kremine: "bg-cream-200",
  vyndaris: "bg-burgundy-600",
  bordo: "bg-burgundy-600",
  melynas: "bg-indigo-500",
  "perlu-balta": "bg-cream-50",
  grafitinis: "bg-ink-900",
  zalias: "bg-forest-600",
  pilkelis: "bg-cream-400",
  rudas: "bg-copper-600",
  juodas: "bg-ink-900",
  raudona: "bg-cranberry-500",
  vysnine: "bg-burgundy-700",
  auksinis: "bg-gold-400",
  baltas: "bg-cream-50",
  plienas: "bg-cream-400",
  anglis: "bg-ink-900",
  roze: "bg-rose-400",
  nefritas: "bg-pine-500",
};

const LIGHT_SWATCH = /cream|gold-400|rose-400/;

export function variantSwatch(id: string) {
  if (VARIANT_SWATCH[id]) return VARIANT_SWATCH[id];
  const base = Object.keys(VARIANT_SWATCH).find((key) => id === key || id.startsWith(`${key}-`));
  return base ? VARIANT_SWATCH[base] : null;
}

export function variantButtonClasses(id: string, selected: boolean) {
  const base =
    "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2.5 text-[13.5px] font-semibold transition";
  if (!selected) {
    return `${base} border-cream-400 bg-white text-ink-900 hover:border-burgundy-600/50`;
  }
  const swatch = variantSwatch(id);
  if (!swatch) {
    return `${base} border-burgundy-600 bg-burgundy-600 text-cream-50`;
  }
  if (LIGHT_SWATCH.test(swatch)) {
    return `${base} border-ink-300 ${swatch} text-ink-900`;
  }
  const border = swatch.replace("bg-", "border-");
  return `${base} ${border} ${swatch} text-cream-50`;
}

export function variantSwatchRingClass(id: string, selected: boolean) {
  const swatch = variantSwatch(id);
  if (selected && swatch && LIGHT_SWATCH.test(swatch)) return "ring-ink-400";
  return selected ? "ring-cream-50" : "ring-cream-400";
}
