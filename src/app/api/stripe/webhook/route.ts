import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

// Stripe webhook: patvirtina mokėjimo įvykius. Čia galima prijungti
// užsakymų saugojimą, Klaviyo „Placed Order" įvykį ar kitas integracijas.
export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Webhook nesukonfigūruotas." }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Trūksta parašo." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const payload = await req.text();
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (e) {
    console.error("Webhook parašo klaida:", e);
    return NextResponse.json({ error: "Netinkamas parašas." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      console.log("[ORDER]", JSON.stringify({
        id: session.id,
        amount_total: session.amount_total,
        currency: session.currency,
        email: session.customer_details?.email,
        shipping: session.customer_details?.address,
        metadata: session.metadata,
        ts: new Date().toISOString(),
      }));
      // TODO integracijos: užsakymų DB, Klaviyo Placed Order, SMS — per env:
      // ORDER_WEBHOOK_URL nurodyta nuoroda gauna tą patį JSON (pvz., Make/Zapier).
      const hook = process.env.ORDER_WEBHOOK_URL;
      if (hook) {
        fetch(hook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: event.type,
            orderId: session.id,
            amountCents: session.amount_total,
            currency: session.currency,
            email: session.customer_details?.email,
            metadata: session.metadata,
          }),
        }).catch(() => {});
      }
      break;
    }
    case "checkout.session.expired":
      console.log("[ORDER-EXPIRED]", event.data.object.id);
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
