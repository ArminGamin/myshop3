import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ configured: false }, { status: 503 });
  }

  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id");
  const paymentIntentId = url.searchParams.get("payment_intent");

  try {
    if (sessionId?.startsWith("cs_")) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return NextResponse.json({
        configured: true,
        order: {
          id: session.id,
          amountTotalCents: session.amount_total ?? 0,
          email: session.customer_details?.email ?? session.customer_email ?? null,
          paid: session.payment_status === "paid",
          shippingEstimate: "4–6 d.",
        },
      });
    }

    if (paymentIntentId?.startsWith("pi_")) {
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return NextResponse.json({
        configured: true,
        order: {
          id: intent.id,
          amountTotalCents: intent.amount_received || intent.amount,
          email: intent.receipt_email ?? intent.metadata.email ?? null,
          paid: intent.status === "succeeded",
          shippingEstimate: "4–6 d.",
        },
      });
    }
  } catch {
    return NextResponse.json({ error: "Sesija nerasta." }, { status: 404 });
  }

  return NextResponse.json({ error: "Netinkama sesija." }, { status: 400 });
}
