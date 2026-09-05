import type Stripe from "stripe";
import { getProduct } from "@/lib/data/products";
import { bundleUnitPriceCents } from "@/lib/commerce/pricing";
import { store } from "@/lib/config/store.config";
import { addonAmounts, parseCheckoutAddons, type CartAddonSelection } from "@/lib/cart/addons";
import { MYSTERY_GIFT, parseMysteryGift } from "@/lib/cart/mystery-gift";

export type CheckoutLineIn = { slug: string; variantId: string; qty: number };

export type BuiltOrder = {
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
  subtotal: number;
  extras: ReturnType<typeof addonAmounts>;
  shippingCents: number;
  totalCents: number;
  addons: CartAddonSelection;
  mysteryGift: boolean;
  mysteryCents: number;
  rawLines: CheckoutLineIn[];
};

export function parseLines(value: unknown): CheckoutLineIn[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 30).flatMap((line) => {
    if (!line || typeof line !== "object") return [];
    const slug = typeof (line as CheckoutLineIn).slug === "string" ? (line as CheckoutLineIn).slug : "";
    const variantId =
      typeof (line as CheckoutLineIn).variantId === "string" ? (line as CheckoutLineIn).variantId : "";
    const qty = Math.min(10, Math.max(1, Math.floor(Number((line as CheckoutLineIn).qty) || 0)));
    if (!slug || !qty) return [];
    return [{ slug, variantId, qty }];
  });
}

export function buildOrder(
  rawLines: CheckoutLineIn[],
  addonsRaw: unknown,
  mysteryRaw?: unknown
): BuiltOrder | { error: string } {
  const addons = parseCheckoutAddons(addonsRaw);
  const mysteryGift = parseMysteryGift(mysteryRaw);
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  let subtotal = 0;

  for (const line of rawLines) {
    const product = getProduct(line.slug);
    if (!product || !product.inStock) continue;
    const variant = product.variants.find((v) => v.id === line.variantId) ?? product.variants[0];
    const unit = bundleUnitPriceCents(product.priceCents + (variant.priceDeltaCents ?? 0), line.qty);
    subtotal += unit * line.qty;
    lineItems.push({
      quantity: line.qty,
      price_data: {
        currency: "eur",
        unit_amount: unit,
        product_data: {
          name: product.name + (variant.name ? ` — ${variant.name}` : ""),
          description: product.tagline.slice(0, 300),
        },
      },
    });
  }

  if (lineItems.length === 0) {
    return { error: "Prekės nerastos arba neprieinamos." };
  }

  const extras = addonAmounts(subtotal + (mysteryGift ? MYSTERY_GIFT.priceCents : 0), addons);
  const mysteryCents = mysteryGift ? MYSTERY_GIFT.priceCents : 0;
  if (mysteryCents) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: mysteryCents,
        product_data: { name: MYSTERY_GIFT.name, description: MYSTERY_GIFT.tagline },
      },
    });
  }
  if (extras.protection) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: extras.protection,
        product_data: { name: "Apsauga nuo pažeidimo pristatant" },
      },
    });
  }
  if (extras.donation) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: extras.donation,
        product_data: { name: store.addons.donation.lineLabel },
      },
    });
  }
  if (extras.priority) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: extras.priority,
        product_data: { name: "Užsakymo prioritetas" },
      },
    });
  }

  const shippingCents =
    mysteryGift || subtotal >= store.shipping.freeThresholdCents ? 0 : store.shipping.flatRateCents;
  const totalCents = subtotal + mysteryCents + extras.total + shippingCents;

  return {
    lineItems,
    subtotal,
    extras,
    shippingCents,
    totalCents,
    addons,
    mysteryGift,
    mysteryCents,
    rawLines,
  };
}

export function orderMetadata(order: BuiltOrder, customer?: { email?: string; phone?: string; address?: string }) {
  return {
    cart: JSON.stringify(order.rawLines.map((l) => ({ s: l.slug, v: l.variantId, q: l.qty }))).slice(0, 400),
    addons: JSON.stringify({
      p: order.addons.protection ? 1 : 0,
      d: order.addons.donation ? order.extras.donation : 0,
      r: order.addons.priority ? 1 : 0,
      m: order.mysteryGift ? 1 : 0,
    }),
    email: (customer?.email ?? "").slice(0, 80),
    phone: (customer?.phone ?? "").slice(0, 20),
    address: (customer?.address ?? "").slice(0, 400),
  };
}
