import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { loadCheckoutOrder } from "@/lib/checkout/load-order";
import { CheckoutSuccess } from "@/components/commerce/checkout-success";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Užsakymas priimtas",
  robots: { index: false, follow: false },
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ payment_intent?: string; session_id?: string; redirect_status?: string }>;
}) {
  const params = await searchParams;
  if (params.redirect_status === "failed" || params.redirect_status === "canceled") {
    redirect("/checkout?klaida=mokejimas");
  }

  const hasLookup = Boolean(params.payment_intent || params.session_id);
  const order = await loadCheckoutOrder({
    paymentIntentId: params.payment_intent ?? null,
    sessionId: params.session_id ?? null,
  });

  if (hasLookup && order && !order.paid && !order.processing) {
    redirect("/checkout?klaida=mokejimas");
  }

  return <CheckoutSuccess order={order} missing={hasLookup && !order} />;
}
