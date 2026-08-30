import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getProduct } from "@/lib/data/products";
import { getStripe } from "@/lib/stripe";
import { bundleUnitPriceCents } from "@/lib/commerce/pricing";
import { store } from "@/lib/config/store.config";
import { addonAmounts, parseCheckoutAddons } from "@/lib/cart/addons";

export const runtime = "nodejs";

interface CheckoutBody {
  lines?: { slug: string; variantId: string; qty: number }[];
  addons?: unknown;
}

// Kuria Stripe Checkout sesiją. Kainos VISADA perskaičiuojamos iš katalogo —
// kliento atsiųstos sumos nepasitikima.
export async function POST(req: Request) {
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

  let body: CheckoutBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Netinkama užklausa." }, { status: 400 });
  }

  const rawLines = body.lines ?? [];
  if (!Array.isArray(rawLines) || rawLines.length === 0) {
    return NextResponse.json({ error: "Krepšelis tuščias." }, { status: 400 });
  }

  // Validuojame ir perskaičiuojame
  let subtotal = 0;
  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  for (const line of rawLines.slice(0, 30)) {
    const product = getProduct(line.slug);
    if (!product || !product.inStock) continue;
    const qty = Math.min(10, Math.max(1, Math.floor(Number(line.qty) || 0)));
    if (!qty) continue;
    const variant =
      product.variants.find((v) => v.id === line.variantId) ?? product.variants[0];
    const unit = bundleUnitPriceCents(product.priceCents + (variant.priceDeltaCents ?? 0), qty);
    subtotal += unit * qty;
    line_items.push({
      quantity: qty,
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

  if (line_items.length === 0) {
    return NextResponse.json({ error: "Prekės nerastos arba neprieinamos." }, { status: 400 });
  }

  const addons = parseCheckoutAddons(body.addons);
  const extras = addonAmounts(subtotal, addons);
  if (extras.protection) {
    line_items.push({
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: extras.protection,
        product_data: { name: "Apsauga nuo pažeidimo pristatant" },
      },
    });
  }
  if (extras.donation) {
    line_items.push({
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: extras.donation,
        product_data: { name: store.addons.donation.lineLabel },
      },
    });
  }
  if (extras.priority) {
    line_items.push({
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: extras.priority,
        product_data: { name: "Užsakymo prioritetas" },
      },
    });
  }

  // Pristatymas: nemokamas nuo slenksčio, kitaip fiksuota kaina.
  const freeShipping = subtotal >= store.shipping.freeThresholdCents;
  const shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[] = [
    {
      shipping_rate_data: {
        type: "fixed_amount",
        fixed_amount: {
          amount: freeShipping ? 0 : store.shipping.flatRateCents,
          currency: "eur",
        },
        display_name: freeShipping
          ? "Nemokamas pristatymas (nuo 80 €)"
          : "Pristatymas Lietuvoje",
        delivery_estimate: {
          minimum: { unit: "business_day", value: 4 },
          maximum: { unit: "business_day", value: 6 },
        },
      },
    },
  ];

  const origin = req.headers.get("origin") ?? store.brand.url;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "lt",
      line_items,
      shipping_options: shippingOptions,
      shipping_address_collection: {
        allowed_countries: ["LT", "LV", "EE"],
      },
      phone_number_collection: { enabled: true },
      billing_address_collection: "auto",
      success_url: `${origin}/dekojame?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/krepselis?atnaujinta=1`,
      metadata: {
        cart: JSON.stringify(
          rawLines.map((l) => ({ s: l.slug, v: l.variantId, q: l.qty }))
        ).slice(0, 400),
        addons: JSON.stringify({
          p: addons.protection ? 1 : 0,
          d: addons.donation ? extras.donation : 0,
          r: addons.priority ? 1 : 0,
        }),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Stripe klaida:", e);
    return NextResponse.json(
      { error: "Nepavyko sukurti atsiskaitymo sesijos." },
      { status: 500 }
    );
  }
}
