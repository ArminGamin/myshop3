import { store } from "@/lib/config/store.config";

export const DELIVERY_METHODS = {
  omniva: { label: "Omniva paštomatas", rateCents: store.shipping.pickupRateCents },
  lpexpress: { label: "LP Express paštomatas", rateCents: store.shipping.pickupRateCents },
  dpd: { label: "DPD Pickup paštomatas", rateCents: store.shipping.pickupRateCents },
  home: { label: "Kurjeris į namus", rateCents: store.shipping.flatRateCents },
} as const;

export type DeliveryMethod = keyof typeof DELIVERY_METHODS;

export function deliveryMethod(value: unknown): DeliveryMethod {
  return typeof value === "string" && Object.hasOwn(DELIVERY_METHODS, value) ? (value as DeliveryMethod) : "home";
}

export function isPickup(method: DeliveryMethod) {
  return method !== "home";
}

export function deliveryRateCents(method: DeliveryMethod, free: boolean) {
  return free ? 0 : DELIVERY_METHODS[method].rateCents;
}
