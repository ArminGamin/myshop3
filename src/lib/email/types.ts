import type { CartAddonSelection } from "@/lib/cart/addons";
import type { CheckoutLineIn } from "@/lib/cart/server-order";

export type EmailItem = { name: string; quantity: number; unitAmount: number };
export type OrderEmailSnapshot = { items: EmailItem[]; totalCents: number; shippingCents: number };
export type CartEmailInput = {
  email: string;
  lines: CheckoutLineIn[];
  addons: CartAddonSelection;
  mysteryGift: boolean;
  order: OrderEmailSnapshot;
  startedAt: number;
};
export const REMINDER_HOURS = [1, 24, 48, 72] as const;
export type ReminderHour = (typeof REMINDER_HOURS)[number];
