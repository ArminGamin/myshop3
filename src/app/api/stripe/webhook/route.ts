import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { notifyDiscordOrder } from "@/lib/orders/discord-webhook";
import { getStripe } from "@/lib/stripe";
import { queuePurchaseEmail } from "@/lib/email/automation";

export const runtime = "nodejs";

function logOrder(payload: Record<string, unknown>) {
  console.log("[ORDER]", JSON.stringify({ ...payload, ts: new Date().toISOString() }));
}

async function handlePaidOrder(input: {
  orderId: string;
  amountCents: number;
  metadata: Stripe.Metadata;
  shipping?: Stripe.PaymentIntent.Shipping | Stripe.Checkout.Session.CustomerDetails["address"] | null;
  customerName?: string | null;
}) {
  logOrder({
    type: "paid",
    orderId: input.orderId,
    amountCents: input.amountCents,
    email: input.metadata.email,
    metadata: input.metadata,
  });
  await queuePurchaseEmail(input.orderId, input.metadata);
  await notifyDiscordOrder(input);
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
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status !== "paid") break;
      await handlePaidOrder({
        orderId: session.id,
        amountCents: session.amount_total ?? 0,
        metadata: { ...(session.metadata ?? {}), email: session.customer_details?.email || session.metadata?.email || "" },
        shipping: session.customer_details?.address ?? null,
        customerName: session.customer_details?.name ?? null,
      });
      break;
    }
    case "payment_intent.succeeded": {
      const intent = event.data.object as Stripe.PaymentIntent;
      if (!intent.metadata?.cart) break;
      await handlePaidOrder({
        orderId: intent.id,
        amountCents: intent.amount_received || intent.amount,
        metadata: intent.metadata,
        shipping: intent.shipping ?? null,
        customerName: intent.shipping?.name ?? null,
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
