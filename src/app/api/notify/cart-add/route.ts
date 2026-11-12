import { NextResponse } from "next/server";
import { buildOrder, parseLines } from "@/lib/cart/server-order";
import { getProduct } from "@/lib/data/products";
import { csrfMatches } from "@/lib/security/csrf";
import { isSameOrigin } from "@/lib/security/origin";

export const runtime = "nodejs";

const money = (cents: number) => `${(cents / 100).toFixed(2)} €`;

// Pranešimas į Discord, kai lankytojas įsideda prekę į krepšelį (anonimiškai).
export async function POST(req: Request) {
  const webhook = process.env.ADD_TO_CART_WEBHOOK_URL;
  if (!webhook) return new NextResponse(null, { status: 204 });
  if (!isSameOrigin(req) || !csrfMatches(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let body: { line?: unknown; cart?: unknown; path?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid" }, { status: 400 }); }
  const [line] = parseLines([body.line]);
  const product = line ? getProduct(line.slug) : undefined;
  if (!line || !product?.inStock) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const variant = product.variants.find((v) => v.id === line.variantId);
  const unit = product.priceCents + (variant?.priceDeltaCents ?? 0);
  const order = buildOrder(parseLines(body.cart), {});
  const cartLines = "error" in order ? [] : order.lineItems;
  const cartText = cartLines
    .map((l) => `• ${l.price_data?.product_data?.name} × ${l.quantity} — ${money((l.price_data?.unit_amount ?? 0) * (l.quantity ?? 1))}`)
    .join("\n");
  const path = typeof body.path === "string" ? body.path.slice(0, 200) : "—";
  const ua = req.headers.get("user-agent") ?? "";
  const device = /Mobi|Android|iPhone/i.test(ua) ? "📱 Telefonas" : "💻 Kompiuteris";
  const city = decodeURIComponent(req.headers.get("x-vercel-ip-city") ?? "") || "—";
  const variantName = variant && product.variants.length > 1 ? ` (${variant.name})` : "";

  const payload = {
    allowed_mentions: { parse: [] },
    embeds: [{
      title: "🛒 Prekė įdėta į krepšelį",
      color: 0x571925,
      fields: [
        { name: "Prekė", value: `${product.name}${variantName} × ${line.qty} — ${money(unit * line.qty)}`, inline: false },
        { name: "Krepšelio suma", value: "error" in order ? "—" : money(order.subtotal), inline: true },
        { name: "Įrenginys", value: device, inline: true },
        { name: "Miestas", value: city, inline: true },
        { name: "Puslapis", value: path, inline: false },
        { name: "Visas krepšelis", value: cartText.slice(0, 1024) || "—", inline: false },
      ],
      timestamp: new Date().toISOString(),
    }],
  };

  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    // Pranešimas neprivalomas – klaida neturi trukdyti pirkėjui.
  }
  return new NextResponse(null, { status: 204 });
}
