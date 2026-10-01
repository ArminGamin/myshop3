export const MAX_QTY = 10;
// Leave room for the gift and three add-ons in Stripe's 100-line Checkout limit.
export const MAX_ORDER_LINES = 90;

export function normalizeQuantity(value: unknown): number {
  const qty = typeof value === "number" || typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(qty) && qty >= 1 ? Math.min(MAX_QTY, Math.floor(qty)) : 0;
}
