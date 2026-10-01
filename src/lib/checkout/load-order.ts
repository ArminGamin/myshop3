import "server-only";
import { getStripe } from "@/lib/stripe";
import { store } from "@/lib/config/store.config";
import type { CheckoutOrderView } from "@/lib/checkout/order-view";

const SESSION_ID_RE = /^cs_(?:test_)?[a-zA-Z0-9_]{10,120}$/;
const PAYMENT_INTENT_RE = /^pi_(?:test_)?[a-zA-Z0-9_]{10,120}$/;

export async function loadCheckoutOrder(input: {
  paymentIntentId?: string | null;
  sessionId?: string | null;
}): Promise<CheckoutOrderView | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  try {
    if (input.sessionId && SESSION_ID_RE.test(input.sessionId)) {
      const session = await stripe.checkout.sessions.retrieve(input.sessionId);
      const paid = session.payment_status === "paid";
      return {
        id: session.id,
        amountTotalCents: session.amount_total ?? 0,
        email: session.customer_details?.email ?? session.customer_email ?? null,
        paid,
        processing: !paid && session.status === "complete",
        shippingEstimate: store.shipping.estimate,
      };
    }

    if (input.paymentIntentId && PAYMENT_INTENT_RE.test(input.paymentIntentId)) {
      const intent = await stripe.paymentIntents.retrieve(input.paymentIntentId);
      return {
        id: intent.id,
        amountTotalCents: intent.amount_received || intent.amount,
        email: intent.receipt_email ?? intent.metadata.email ?? null,
        paid: intent.status === "succeeded",
        processing: intent.status === "processing",
        shippingEstimate: store.shipping.estimate,
      };
    }
  } catch {
    return null;
  }

  return null;
}
