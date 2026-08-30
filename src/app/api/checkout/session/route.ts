import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

// Dėkojame puslapio duomenys: patikriname sesiją serveryje, kad klientas
// negalėtų sugalvoti užsakymo.
export async function GET(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ configured: false }, { status: 503 });
  }
  const session_id = new URL(req.url).searchParams.get("session_id");
  if (!session_id || !session_id.startsWith("cs_")) {
    return NextResponse.json({ error: "Netinkama sesija." }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    return NextResponse.json({
      configured: true,
      order: {
        id: session.id,
        amountTotalCents: session.amount_total ?? 0,
        email: session.customer_details?.email ?? null,
        paid: session.payment_status === "paid",
        shippingEstimate: "4–6 d.",
      },
    });
  } catch {
    return NextResponse.json({ error: "Sesija nerasta." }, { status: 404 });
  }
}
