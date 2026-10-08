import { formatOrderNumber } from "@/lib/orders/order-number";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { BuiltOrder } from "@/lib/cart/server-order";
import type { EmailItem, OrderEmailSnapshot, ReminderHour } from "./types";

const FILES = {
  purchase: "kaledu_kampelis_purchase_confirmation.html",
  1: "01_po_1_valandos.html",
  24: "02_po_24_valandu.html",
  48: "03_po_48_valandu.html",
  72: "04_po_72_valandu_paskutinis.html",
  welcome: "kaledu_kampelis_newsletter_welcome.html",
} as const;

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}

export function euro(cents: number): string {
  return new Intl.NumberFormat("lt-LT", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export function orderSnapshot(order: BuiltOrder): OrderEmailSnapshot {
  const items = order.lineItems.map((line) => {
    const price = line.price_data!;
    return { name: price.product_data!.name, quantity: line.quantity ?? 1, unitAmount: price.unit_amount ?? 0 };
  });
  return { items, totalCents: order.totalCents, shippingCents: order.shippingCents };
}

function itemsHtml(items: EmailItem[]): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${items.map((item) => `<tr><td style="padding:8px 0;color:#625751;">${escapeHtml(item.name)} × ${item.quantity}</td><td align="right" style="padding:8px 0;color:#571925;white-space:nowrap;">${escapeHtml(euro(item.unitAmount * item.quantity))}</td></tr>`).join("")}</table>`;
}

async function render(kind: keyof typeof FILES, replacements: Record<string, string>): Promise<string> {
  const template = await readFile(path.join(process.cwd(), "emails", FILES[kind]), "utf8");
  const html = template.replace(/<!--[^]*?-->/g, "").replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => {
    if (!(key in replacements)) throw new Error(`Missing email template value: ${key}`);
    return replacements[key];
  });
  return html;
}

export async function renderPurchase(input: {
  orderId: string;
  paidAt: number;
  order: OrderEmailSnapshot;
  address: string;
}) {
  const items = [...input.order.items, { name: "Pristatymas", quantity: 1, unitAmount: input.order.shippingCents }];
  return render("purchase", {
    order_number: escapeHtml(formatOrderNumber(input.orderId)),
    order_date: escapeHtml(new Intl.DateTimeFormat("lt-LT", { timeZone: "Europe/Vilnius", dateStyle: "long" }).format(new Date(input.paidAt))),
    order_total: escapeHtml(euro(input.order.totalCents)),
    order_items: itemsHtml(items),
    shipping_method: "Pristatymas į nurodytą adresą · 4–6 darbo dienos",
    shipping_address: escapeHtml(input.address).replace(/\n/g, "<br>"),
  });
}

export async function renderReminder(hour: ReminderHour, order: OrderEmailSnapshot, checkoutUrl: string, unsubscribeUrl: string) {
  const html = await render(hour, {
    cart_items: itemsHtml([...order.items, { name: "Pristatymas", quantity: 1, unitAmount: order.shippingCents }]),
    cart_total: escapeHtml(euro(order.totalCents)),
    checkout_url: escapeHtml(checkoutUrl),
  });
  return html.replace(/mailto:kaleddovanos@gmail\.com\?subject=Atsisakau%20naujienlaiskio/g, escapeHtml(unsubscribeUrl))
    .replace(/Atsisakyti naujienlaiškio/g, "Atsisakyti krepšelio priminimų");
}

export const NEWSLETTER_UNSUBSCRIBE = "mailto:kaleddovanos@gmail.com?subject=Atsisakau%20naujienlaiskio";

export async function renderNewsletterWelcome(siteUrl: string) {
  const base = siteUrl.replace(/\/$/, "");
  return render("welcome", {
    shop_url: escapeHtml(`${base}/dovanos/visos-dovanos`),
    quiz_url: escapeHtml(`${base}/rask-dovana`),
  });
}

export function snapshotMetadata(snapshot: OrderEmailSnapshot): Record<string, string> {
  const json = JSON.stringify(snapshot);
  const metadata: Record<string, string> = {};
  for (let i = 0; i < json.length; i += 450) metadata[`email_order_${i / 450}`] = json.slice(i, i + 450);
  if (Object.keys(metadata).length > 35) throw new Error("Order email snapshot exceeds Stripe metadata limit");
  return metadata;
}

export function readSnapshot(metadata: Record<string, string>): OrderEmailSnapshot | null {
  const chunks: string[] = [];
  for (let i = 0; metadata[`email_order_${i}`] !== undefined; i++) chunks.push(metadata[`email_order_${i}`]);
  if (!chunks.length) return null;
  return JSON.parse(chunks.join("")) as OrderEmailSnapshot;
}
