import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { store } from "@/lib/config/store.config";
import { denyPost } from "@/lib/security/guard";
import { buildOrder, orderMetadata, parseLines } from "@/lib/cart/server-order";
import { validateCustomer } from "@/lib/checkout/customer";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const blocked = denyPost(req, "checkout");
  if (blocked) return blocked;

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      {
        error:
          "Atsiskaitymas dar nesukonfigūruotas. Pridėkite STRIPE_SECRET_KEY prie aplinkos kintamųjų (žr. .env.example).",
      },
      { status: 503 }
    );
  }

  let body: { lines?: unknown; addons?: unknown; customer?: unknown; mysteryGift?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Netinkama užklausa." }, { status: 400 });
  }

  const rawLines = parseLines(body.lines);
  if (rawLines.length === 0) {
    return NextResponse.json({ error: "Krepšelis tuščias." }, { status: 400 });
  }

  const order = buildOrder(rawLines, body.addons, body.mysteryGift);
  if ("error" in order) {
    return NextResponse.json({ error: order.error }, { status: 400 });
  }

  const customer =
    body.customer && typeof body.customer === "object"
      ? validateCustomer(body.customer).value
      : null;

  const origin = req.headers.get("origin") ?? store.brand.url;
  const shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[] = [
    {
      shipping_rate_data: {
        type: "fixed_amount",
        fixed_amount: { amount: order.shippingCents, currency: "eur" },
        display_name:
          order.shippingCents === 0
            ? order.mysteryGift
              ? "Nemokamas pristatymas (su siurprizu)"
              : "Nemokamas pristatymas (nuo 80 €)"
            : "Pristatymas Lietuvoje",
        delivery_estimate: {
          minimum: { unit: "business_day", value: 4 },
          maximum: { unit: "business_day", value: 6 },
        },
      },
    },
  ];

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "lt",
      line_items: order.lineItems,
      shipping_options: shippingOptions,
      shipping_address_collection: { allowed_countries: ["LT", "LV", "EE"] },
      phone_number_collection: { enabled: true },
      billing_address_collection: "auto",
      customer_email: customer?.email || undefined,
      success_url: `${origin}/dekojame?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/krepselis?atnaujinta=1`,
      metadata: orderMetadata(
        order,
        customer
          ? {
              email: customer.email,
              phone: customer.phone,
              address: `${customer.address}, ${customer.city} ${customer.postalCode}`,
            }
          : undefined
      ),
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Stripe klaida:", e);
    return NextResponse.json({ error: "Nepavyko sukurti atsiskaitymo sesijos." }, { status: 500 });
  }
}
