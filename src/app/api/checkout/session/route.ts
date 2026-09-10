import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { clientIp, takeToken } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

const SESSION_ID_RE = /^cs_(?:test_)?[a-zA-Z0-9_]{10,120}$/;
const PAYMENT_INTENT_RE = /^pi_(?:test_)?[a-zA-Z0-9_]{10,120}$/;

export async function GET(req: Request) {
  const ip = clientIp(req);
  const check = takeToken(ip, "sessionQuery");
  if (!check.ok) {
    return NextResponse.json(
      { error: "Per daug užklausų. Bandykite vėliau." },
      { status: 429, headers: { "Retry-After": String(check.retryAfterSec) } }
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ configured: false }, { status: 503 });
  }

  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id")?.trim() ?? null;
  const paymentIntentId = url.searchParams.get("payment_intent")?.trim() ?? null;

  if (sessionId && !SESSION_ID_RE.test(sessionId)) {
    return NextResponse.json({ error: "Netinkamas sesijos formatas." }, { status: 400 });
  }
  if (paymentIntentId && !PAYMENT_INTENT_RE.test(paymentIntentId)) {
    return NextResponse.json({ error: "Netinkamas mokėjimo formatas." }, { status: 400 });
  }

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
