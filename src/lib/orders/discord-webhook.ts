import type Stripe from "stripe";
import { addonAmounts, type CartAddonSelection } from "@/lib/cart/addons";
import { MYSTERY_GIFT } from "@/lib/cart/mystery-gift";
import { bundleUnitPriceCents } from "@/lib/commerce/pricing";
import { store } from "@/lib/config/store.config";
import { getProduct } from "@/lib/data/products";
import { readSnapshot } from "@/lib/email/templates";

type CartLine = { s: string; v: string; q: number };

type OrderLine = {
  name: string;
  variant: string | null;
  qty: number;
  lineCents: number;
};

function formatEuro(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

function makeOrderNumber(stripeId: string): string {
  const suffix = stripeId.replace(/\D/g, "").slice(-3) || String(Math.floor(Math.random() * 900) + 100);
  return `ORD-${Date.now()}-${suffix}`;
}

function parseCart(raw: string | undefined): CartLine[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((line) => {
      if (!line || typeof line !== "object") return [];
      const s = typeof (line as CartLine).s === "string" ? (line as CartLine).s : "";
      const v = typeof (line as CartLine).v === "string" ? (line as CartLine).v : "";
      const q = Math.max(1, Math.floor(Number((line as CartLine).q) || 1));
      return s ? [{ s, v, q }] : [];
    });
  } catch {
    return [];
  }
}

function parseAddons(raw: string | undefined) {
  if (!raw) return { protection: false, donation: 0, priority: false, mystery: false };
  try {
    const parsed = JSON.parse(raw) as { p?: number; d?: number; r?: number; m?: number };
    return {
      protection: parsed.p === 1,
      donation: Math.max(0, Number(parsed.d) || 0),
      priority: parsed.r === 1,
      mystery: parsed.m === 1,
    };
  } catch {
    return { protection: false, donation: 0, priority: false, mystery: false };
  }
}

function buildOrderLines(cart: CartLine[], addonsRaw: string | undefined): OrderLine[] {
  const lines: OrderLine[] = [];
  let subtotal = 0;

  for (const line of cart) {
    const product = getProduct(line.s);
    if (!product) continue;
    const variant = product.variants.find((v) => v.id === line.v) ?? product.variants[0];
    const unit = bundleUnitPriceCents(product.priceCents + (variant.priceDeltaCents ?? 0), line.q);
    subtotal += unit * line.q;
    lines.push({
      name: product.name,
      variant: variant?.name ?? null,
      qty: line.q,
      lineCents: unit * line.q,
    });
  }

  const addons = parseAddons(addonsRaw);
  if (addons.mystery) {
    subtotal += MYSTERY_GIFT.priceCents;
    lines.push({
      name: MYSTERY_GIFT.name,
      variant: "Atsitiktinė",
      qty: 1,
      lineCents: MYSTERY_GIFT.priceCents,
    });
  }

  const addonSelection: CartAddonSelection = {
    protection: addons.protection,
    donation: addons.donation > 0,
    priority: addons.priority,
  };
  const extras = addonAmounts(subtotal, addonSelection);
  if (extras.protection) {
    lines.push({ name: "Apsauga nuo pažeidimo pristatant", variant: null, qty: 1, lineCents: extras.protection });
  }
  if (extras.donation) {
    lines.push({ name: store.addons.donation.lineLabel, variant: null, qty: 1, lineCents: extras.donation });
  }
  if (extras.priority) {
    lines.push({ name: "Užsakymo prioritetas", variant: null, qty: 1, lineCents: extras.priority });
  }

  return lines;
}

function savedOrderLines(metadata: Stripe.Metadata): OrderLine[] {
  const snapshot = readSnapshot(metadata);
  return snapshot
    ? snapshot.items.map((item) => ({ name: item.name, variant: null, qty: item.quantity, lineCents: item.unitAmount * item.quantity }))
    : buildOrderLines(parseCart(metadata.cart), metadata.addons);
}

function buildDiscordEmbed(input: {
  orderId: string;
  amountCents: number;
  metadata: Stripe.Metadata;
  shipping?: Stripe.PaymentIntent.Shipping | Stripe.Checkout.Session.CustomerDetails["address"] | null;
  customerName?: string | null;
}) {
  const meta = input.metadata;
  const lines = savedOrderLines(meta);
  const orderNumber = makeOrderNumber(input.orderId);

  const name = meta.name || input.customerName?.split(" ")[0] || "—";
  const surname = meta.surname || input.customerName?.split(" ").slice(1).join(" ") || "—";
  const email = meta.email || "—";
  const phone = meta.phone || "—";
  const address =
    meta.address ||
    (input.shipping && "line1" in input.shipping
      ? [
          input.shipping.line1,
          input.shipping.line2,
          input.shipping.city,
          input.shipping.postal_code,
        ]
          .filter(Boolean)
          .join(", ")
      : "") ||
    "—";

  const productsValue = lines.length
    ? lines.map((line) => `• ${line.name} × ${line.qty} — ${formatEuro(line.lineCents)}`).join("\n")
    : "—";

  const colorsValue = lines.some((line) => line.variant)
    ? lines
        .filter((line) => line.variant)
        .map((line) => `• ${line.name}: ${line.variant}`)
        .join("\n")
    : "—";

  return {
    embeds: [
      {
        title: "💳 Naujas Stripe užsakymas (Apmokėta)",
        color: 0x57f287,
        fields: [
          { name: "Užsakymo numeris", value: orderNumber, inline: true },
          { name: "Suma", value: formatEuro(input.amountCents), inline: true },
          { name: "\u200B", value: "\u200B", inline: false },
          { name: "Vardas", value: name, inline: true },
          { name: "Pavardė", value: surname, inline: true },
          { name: "El. paštas", value: email, inline: true },
          { name: "Telefonas", value: phone, inline: true },
          { name: "Adresas", value: address, inline: false },
          { name: "Prekės", value: productsValue.length > 1024 ? productsValue.slice(0, 900) + "\n… Visas sąrašas pridėtame faile." : productsValue, inline: false },
          ...(colorsValue !== "—"
            ? [{ name: "Spalva", value: colorsValue.slice(0, 1024), inline: false }]
            : []),
        ],
        footer: {
          text: "KALEDU KAMPELIS",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

export async function notifyDiscordOrder(input: {
  orderId: string;
  amountCents: number;
  metadata: Stripe.Metadata;
  shipping?: Stripe.PaymentIntent.Shipping | Stripe.Checkout.Session.CustomerDetails["address"] | null;
  customerName?: string | null;
}): Promise<boolean> {
  const hook = process.env.ORDER_WEBHOOK_URL;
  if (!hook) return false;

  const payload = buildDiscordEmbed(input);
  const lines = savedOrderLines(input.metadata);
  const details = lines.map((line) => `• ${line.name}${line.variant ? ` — ${line.variant}` : ""} × ${line.qty} — ${formatEuro(line.lineCents)}`).join("\n");
  let body: string | FormData = JSON.stringify(payload);
  if (details.length > 1024) {
    const attachment = new FormData();
    attachment.set("payload_json", JSON.stringify(payload));
    attachment.append("files[0]", new Blob([
      `Užsakymas: ${input.orderId}\nSuma: ${formatEuro(input.amountCents)}\n\n${details}\n`,
    ], { type: "text/plain;charset=utf-8" }), "uzsakymas.txt");
    body = attachment;
  }

  try {
    const res = await fetch(hook, {
      method: "POST",
      headers: typeof body === "string" ? { "Content-Type": "application/json" } : undefined,
      body,
    });
    if (!res.ok) {
      console.error("[ORDER-DISCORD] Nepavyko:", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (error) {
    console.error("[ORDER-DISCORD] Klaida:", error);
    return false;
  }
}
