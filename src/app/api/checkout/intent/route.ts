import { SeverityNumber } from "@opentelemetry/api-logs";
import { after, NextResponse } from "next/server";
import { posthogLoggerProvider } from "../../../../../instrumentation";
import { getStripe } from "@/lib/stripe";
import { denyPost } from "@/lib/security/guard";
import { buildOrder, orderMetadata, orderTotalError, parseLines } from "@/lib/cart/server-order";
import { validateCustomer } from "@/lib/checkout/customer";
import { store } from "@/lib/config/store.config";
import { orderSnapshot, snapshotMetadata } from "@/lib/email/templates";
import { readCartSession } from "@/lib/email/tokens";

export const runtime = "nodejs";

const posthogCheckoutLogger = posthogLoggerProvider?.getLogger("posthog.checkout");

export async function POST(req: Request) {
  const blocked = denyPost(req, "checkout");
  if (blocked) return blocked;

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Atsiskaitymas dar nesukonfigūruotas." }, { status: 503 });
  }

  let body: { lines?: unknown; addons?: unknown; customer?: unknown; mysteryGift?: unknown; expectedTotalCents?: unknown };
  try {
    body = await req.json();
    if (!body || typeof body !== "object") throw new Error("Invalid payload");
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

  const totalError = orderTotalError(order, body.expectedTotalCents);
  if (totalError) return NextResponse.json({ error: totalError, totalCents: order.totalCents }, { status: 409 });

  if (order.totalCents < 1 || order.totalCents > 1_000_000) {
    return NextResponse.json({ error: "Netinkama suma." }, { status: 400 });
  }

  try {
    const intent = await stripe.paymentIntents.create({
      amount: order.totalCents,
      currency: "eur",
      description: `${store.brand.name} užsakymas`,
      // Be receipt_email Stripe nesiunčia savo kvito – klientas gauna tik mūsų patvirtinimo laišką.
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
      metadata: { ...orderMetadata(order, {
        email: customer.email,
        phone: customer.phone,
        name: customer.name,
        surname: customer.surname,
        address: `${customer.address}, ${customer.city} ${customer.postalCode}`,
      }), ...snapshotMetadata(orderSnapshot(order)), email_cart_run: readCartSession(req)?.runId ?? "" },
    });

    posthogCheckoutLogger?.emit({
      body: "checkout payment intent created",
      severityNumber: SeverityNumber.INFO,
      attributes: {
        event: "checkout.payment_intent_created",
        currency: "eur",
        item_count: order.lineItems.length,
        total_cents: order.totalCents,
      },
    });
    after(async () => {
      await posthogLoggerProvider?.forceFlush();
    });

    return NextResponse.json({ clientSecret: intent.client_secret, totalCents: order.totalCents });
  } catch (e) {
    console.error("PaymentIntent klaida:", e);
    posthogCheckoutLogger?.emit({
      body: "checkout payment intent creation failed",
      severityNumber: SeverityNumber.ERROR,
      attributes: {
        event: "checkout.payment_intent_failed",
        currency: "eur",
        item_count: order.lineItems.length,
        total_cents: order.totalCents,
        error_type: e instanceof Error ? e.name : "unknown_error",
      },
    });
    after(async () => {
      await posthogLoggerProvider?.forceFlush();
    });

    return NextResponse.json({ error: "Nepavyko pradėti mokėjimo." }, { status: 500 });
  }
}
