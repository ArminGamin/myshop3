export function formatPrice(cents: number): string {
  const amount = new Intl.NumberFormat("lt-LT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
  return `${amount.replace(/\s/g, "\u00A0")}\u00A0€`;
}

export function discountPercent(price: number, compareAt: number | null): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function formatRating(value: number): string {
  return value.toFixed(1).replace(".", ",");
}
