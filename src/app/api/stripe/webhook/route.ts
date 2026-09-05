import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

function logOrder(payload: Record<string, unknown>) {
  console.log("[ORDER]", JSON.stringify({ ...payload, ts: new Date().toISOString() }));
  const hook = process.env.ORDER_WEBHOOK_URL;
  if (!hook) return;
  fetch(hook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

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
      logOrder({
        type: event.type,
        orderId: session.id,
        amountCents: session.amount_total,
        currency: session.currency,
        email: session.customer_details?.email,
        shipping: session.customer_details?.address,
        metadata: session.metadata,
      });
      break;
    }
    case "payment_intent.succeeded": {
      const intent = event.data.object;
      if (!intent.metadata?.cart) break;
      logOrder({
        type: event.type,
        orderId: intent.id,
        amountCents: intent.amount_received || intent.amount,
        currency: intent.currency,
        email: intent.receipt_email ?? intent.metadata.email,
        shipping: intent.shipping,
        metadata: intent.metadata,
      });
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
