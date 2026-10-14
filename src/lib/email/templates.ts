import { formatOrderNumber } from "@/lib/orders/order-number";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { BuiltOrder } from "@/lib/cart/server-order";
import { bundleUnitPriceCents } from "@/lib/commerce/pricing";
import { bestsellers, products } from "@/lib/data/products";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types";
import type { EmailItem, NewsletterKind, OrderEmailSnapshot, ReminderHour } from "./types";

const FILES = {
  purchase: "kaledu_kampelis_purchase_confirmation.html",
  1: "01_po_1_valandos.html",
  24: "02_po_24_valandu.html",
  48: "03_po_48_valandu.html",
  72: "04_po_72_valandu_paskutinis.html",
  welcome: "kaledu_kampelis_newsletter_welcome.html",
  picks: "kaledu_kampelis_newsletter_2_tau_gali_patikti.html",
  recipients: "kaledu_kampelis_newsletter_3_kam_ieskai_dovanos.html",
  bundles: "kaledu_kampelis_newsletter_4_kuo_daugiau_tuo_pigiau.html",
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
    shipping_method: "Pristatymas į nurodytą adresą · 3–4 darbo dienos",
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

const byReviews = (a: Product, b: Product) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0);

// Picks come from the live catalog at send time, so a sold-out product never shows up.
export function newsletterPicks(kind: "picks" | "bundles"): Product[] {
  const top = bestsellers().sort(byReviews).slice(0, 4);
  if (kind === "picks") return top;
  // Gifts under 30 € that people buy several of, not repeating the first email.
  return products.filter((p) => p.inStock && p.priceCents <= 3000 && !top.includes(p)).sort(byReviews).slice(0, 4);
}

function productCards(base: string, items: Product[], showPairPrice: boolean): string {
  const cell = (p: Product) => `<td width="50%" valign="top" style="padding:0 7px 24px;"><a href="${escapeHtml(`${base}/produktai/${p.slug}`)}" target="_blank" style="display:block;">`
    + `<img src="${escapeHtml(base + p.images[0])}" width="260" alt="${escapeHtml(p.name)}" style="display:block;width:100%;max-width:260px;height:auto;border:0;border-radius:14px;background-color:#F7F0E6;">`
    + `<div style="margin-top:10px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;font-weight:700;color:#401518;">${escapeHtml(p.name)}</div>`
    + `<div style="margin-top:4px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:20px;font-weight:700;color:#571925;">${formatPrice(p.priceCents)}</div>`
    + (showPairPrice ? `<div style="margin-top:2px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:19px;color:#6D615B;">2 vnt. po ${formatPrice(bundleUnitPriceCents(p.priceCents, 2))}</div>` : "")
    + `</a></td>`;
  const rows: string[] = [];
  for (let i = 0; i < items.length; i += 2) rows.push(`<tr>${items.slice(i, i + 2).map(cell).join("")}</tr>`);
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${rows.join("")}</table>`;
}

export async function renderNewsletter(kind: NewsletterKind, siteUrl: string, unsubscribeUrl: string) {
  const base = siteUrl.replace(/\/$/, "");
  return render(kind, {
    site_url: escapeHtml(base),
    shop_url: escapeHtml(`${base}/dovanos/visos-dovanos`),
    quiz_url: escapeHtml(`${base}/rask-dovana`),
    unsubscribe_url: escapeHtml(unsubscribeUrl),
    products: kind === "picks" || kind === "bundles" ? productCards(base, newsletterPicks(kind), kind === "bundles") : "",
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
