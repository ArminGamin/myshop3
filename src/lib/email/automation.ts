import { getRun, start } from "workflow/api";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { emailConfigured } from "./resend";
import { purchaseConfirmationWorkflow } from "@/workflows/customer-emails";

export async function cancelCartReminders(runId: string) {
  const run = getRun(runId);
  if (!(await run.exists)) return;
  const status = await run.status;
  if (status === "pending" || status === "running") await run.cancel();
}

export async function queuePurchaseEmail(orderId: string, metadata: Stripe.Metadata) {
  if (!emailConfigured()) throw new Error("Customer email automation is not configured");
  if (metadata.email_cart_run) await cancelCartReminders(metadata.email_cart_run);
  const stripe = getStripe()!;
  const latest = orderId.startsWith("pi_") ? await stripe.paymentIntents.retrieve(orderId) : await stripe.checkout.sessions.retrieve(orderId);
  const current = latest.metadata ?? {};
  if (current.email_confirmation_sent) return;
  if (current.email_confirmation_run) {
    const previous = getRun(current.email_confirmation_run);
    if (await previous.exists && await previous.status !== "failed") return;
  }
  const run = await start(purchaseConfirmationWorkflow, [orderId]);
  const update = { email_confirmation_run: run.runId };
  if (orderId.startsWith("pi_")) await stripe.paymentIntents.update(orderId, { metadata: update });
  else await stripe.checkout.sessions.update(orderId, { metadata: update });
}
