import { FatalError, getWorkflowMetadata, sleep } from "workflow";
import { getRun, start } from "workflow/api";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { buildOrder, parseLines } from "@/lib/cart/server-order";
import { store } from "@/lib/config/store.config";
import { sendEmail } from "@/lib/email/resend";
import { orderSnapshot, readSnapshot, renderPurchase, renderReminder } from "@/lib/email/templates";
import { cartFingerprint, sealToken } from "@/lib/email/tokens";
import { REMINDER_HOURS, type CartEmailInput, type ReminderHour } from "@/lib/email/types";
import type { ReminderSendReport } from "@/lib/email/reminder-discord";
import { reminderNotificationWorkflow } from "@/workflows/reminder-notification";
import { PREPURCHASE_WEBHOOKS, type PrepurchaseKind } from "@/lib/email/prepurchase-discord";
import { prepurchaseNotificationWorkflow } from "@/workflows/prepurchase-notification";

const SUBJECTS = {
  1: "Tavo dovanos laukia krepšelyje 🎁",
  24: "Dar gali pasirūpinti savo kalėdinėmis dovanomis",
  48: "Tavo Kalėdų Kampelio krepšelis vis dar laukia",
  72: "Paskutinis priminimas apie tavo dovanų krepšelį",
};

export async function cartReminderWorkflow(cart: CartEmailInput) {
  "use workflow";
  const { workflowRunId } = getWorkflowMetadata();
  const links = await prepareCartLinks(cart, workflowRunId);
  for (const kind of ["cart", "email"] as const) await queuePrepurchaseNotification(cart, workflowRunId, kind);
  for (const hour of REMINDER_HOURS) {
    await sleep(new Date(cart.startedAt + hour * 60 * 60_000));
    const sent = await sendCartReminder(cart, hour, workflowRunId, links);
    if (sent) await queueReminderNotification(sent);
  }
  return { status: "complete" };
}

async function prepareCartLinks(cart: CartEmailInput, runId: string) {
  "use step";
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kaledukampelis.com";
  const recoverToken = sealToken({ purpose: "recover", runId, cart });
  const fingerprint = cartFingerprint({ email: cart.email, lines: cart.lines, addons: cart.addons, mysteryGift: cart.mysteryGift });
  const unsubscribeToken = sealToken({ purpose: "unsubscribe", runId, fingerprint });
  const checkoutUrl = `${base}/api/checkout/recover?token=${encodeURIComponent(recoverToken)}`;
  const unsubscribeUrl = `${base}/api/email/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;
  return { checkoutUrl, unsubscribeUrl };
}

async function queuePrepurchaseNotification(cart: CartEmailInput, runId: string, kind: PrepurchaseKind) {
  "use step";
  if (!process.env[PREPURCHASE_WEBHOOKS[kind]] || await getRun(runId).status === "cancelled") return;
  const notification = await start(prepurchaseNotificationWorkflow, [{ cart, cartRunId: runId }, kind]);
  return notification.runId;
}
queuePrepurchaseNotification.maxRetries = 10;

async function sendCartReminder(cart: CartEmailInput, hour: ReminderHour, runId: string, { checkoutUrl, unsubscribeUrl }: { checkoutUrl: string; unsubscribeUrl: string }) {
  "use step";
  if (await getRun(runId).status === "cancelled") return;
  const stripe = getStripe();
  if (!stripe) throw new FatalError("Stripe is not configured");
  const paid = await stripe.paymentIntents.search({
    query: `status:'succeeded' AND metadata['email']:'${cart.email}' AND created>=${Math.floor(cart.startedAt / 1000) - 300}`,
    limit: 1,
  });
  if (paid.data.length > 0) return;
  const html = await renderReminder(hour, cart.order, checkoutUrl, unsubscribeUrl);
  const emailId = await sendEmail({ to: cart.email, subject: SUBJECTS[hour], html, idempotencyKey: `cart/${runId}/${hour}`, unsubscribeUrl });
  return { recipient: cart.email, hour, emailId, sentAt: new Date().toISOString(), cartRunId: runId } satisfies ReminderSendReport;
}
sendCartReminder.maxRetries = 10;

async function queueReminderNotification(report: ReminderSendReport) {
  "use step";
  if (!process.env.REMINDER_WEBHOOK_URL) return;
  const run = await start(reminderNotificationWorkflow, [report]);
  return run.runId;
}
queueReminderNotification.maxRetries = 10;

export async function purchaseConfirmationWorkflow(orderId: string) {
  "use workflow";
  return await sendPurchaseConfirmation(orderId);
}

async function sendPurchaseConfirmation(orderId: string) {
  "use step";
  const stripe = getStripe();
  if (!stripe) throw new FatalError("Stripe is not configured");
  const intent = orderId.startsWith("pi_") ? await stripe.paymentIntents.retrieve(orderId) : null;
  const session = intent ? null : await stripe.checkout.sessions.retrieve(orderId);
  const metadata = intent?.metadata ?? session?.metadata ?? {};
  if (metadata.email_confirmation_sent) return { status: "already_sent" };
  if (intent ? intent.status !== "succeeded" : session?.payment_status !== "paid") {
    throw new FatalError("Purchase confirmation requires a paid order");
  }
  const email = intent?.receipt_email || session?.customer_details?.email || metadata.email;
  if (!email) throw new FatalError("Paid order has no customer email");
  let order = readSnapshot(metadata);
  if (!order && session) {
    const items = [];
    for await (const line of stripe.checkout.sessions.listLineItems(session.id, { limit: 100 })) {
      items.push({ name: line.description || "Prekė", quantity: line.quantity ?? 1, unitAmount: (line.amount_total ?? 0) / (line.quantity || 1) });
    }
    order = { items, totalCents: session.amount_total ?? 0, shippingCents: session.total_details?.amount_shipping ?? 0 };
  }
  if (!order) {
    // Legacy PaymentIntents only retain the original cart metadata.
    let compact: { s: string; v: string; q: number }[];
    try { compact = JSON.parse(metadata.cart || "[]"); } catch { throw new FatalError("Legacy order has incomplete cart metadata"); }
    const flags = JSON.parse(metadata.addons || "{}");
    const built = buildOrder(parseLines(compact.map((line) => ({ slug: line.s, variantId: line.v, qty: line.q }))), { protection: flags.p === 1, donation: flags.d > 0, priority: flags.r === 1 }, flags.m === 1);
    if ("error" in built) throw new FatalError("Legacy order has no line items");
    order = orderSnapshot(built);
  }
  order.totalCents = intent ? intent.amount_received || intent.amount : session!.amount_total ?? order.totalCents;
  const shipping = intent?.shipping?.address ?? session?.customer_details?.address;
  const name = intent?.shipping?.name ?? session?.customer_details?.name;
  const address = shipping ? [name, shipping.line1, shipping.line2, [shipping.postal_code, shipping.city].filter(Boolean).join(" "), shipping.country].filter(Boolean).join("\n") : metadata.address || "Pristatymo adresas nurodytas užsakyme";
  const html = await renderPurchase({ orderId, paidAt: (intent?.created ?? session!.created) * 1000, order, address });
  const emailId = await sendEmail({ to: email, subject: `Užsakymas patvirtintas · ${store.brand.name}`, html, idempotencyKey: `purchase/${orderId}` });
  const update: Stripe.MetadataParam = { email_confirmation_sent: emailId };
  if (intent) await stripe.paymentIntents.update(orderId, { metadata: update });
  else await stripe.checkout.sessions.update(orderId, { metadata: update });
  return { status: "sent", emailId };
}
sendPurchaseConfirmation.maxRetries = 10;
