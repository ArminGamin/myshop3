import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { denyPost } from "@/lib/security/guard";
import { buildOrder, orderMetadata, parseLines } from "@/lib/cart/server-order";
import { validateCustomer } from "@/lib/checkout/customer";
import { store } from "@/lib/config/store.config";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const blocked = denyPost(req, "checkout");
  if (blocked) return blocked;

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Atsiskaitymas dar nesukonfigūruotas." }, { status: 503 });
  }

  let body: { lines?: unknown; addons?: unknown; customer?: unknown; mysteryGift?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Netinkama užklausa." }, { status: 400 });
  }

  const { errors, value: customer } = validateCustomer(
    body.customer && typeof body.customer === "object" ? body.customer : {}
  );
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Patikrinkite formos laukus.", errors }, { status: 400 });
  }

  const rawLines = parseLines(body.lines);
  if (rawLines.length === 0) {
    return NextResponse.json({ error: "Krepšelis tuščias." }, { status: 400 });
  }

  const order = buildOrder(rawLines, body.addons, body.mysteryGift);
  if ("error" in order) {
    return NextResponse.json({ error: order.error }, { status: 400 });
  }

  if (order.totalCents < 1 || order.totalCents > 1_000_000) {
    return NextResponse.json({ error: "Netinkama suma." }, { status: 400 });
  }

  try {
    const intent = await stripe.paymentIntents.create({
      amount: order.totalCents,
      currency: "eur",
      description: `${store.brand.name} užsakymas`,
      receipt_email: customer.email,
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      shipping: {
        name: `${customer.name} ${customer.surname}`,
        phone: customer.phone,
        address: {
          line1: customer.address,
          city: customer.city,
          state: customer.region || undefined,
          postal_code: customer.postalCode,
          country: "LT",
        },
      },
      metadata: orderMetadata(order, {
        email: customer.email,
        phone: customer.phone,
        address: `${customer.address}, ${customer.city} ${customer.postalCode}`,
      }),
    });

    return NextResponse.json({ clientSecret: intent.client_secret });
  } catch (e) {
    console.error("PaymentIntent klaida:", e);
    return NextResponse.json({ error: "Nepavyko pradėti mokėjimo." }, { status: 500 });
  }
}
