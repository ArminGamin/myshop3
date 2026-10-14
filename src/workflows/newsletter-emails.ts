import { createHook, getWorkflowMetadata, sleep } from "workflow";
import { getStripe } from "@/lib/stripe";
import { sendEmail } from "@/lib/email/resend";
import { renderNewsletter } from "@/lib/email/templates";
import { sealToken } from "@/lib/email/tokens";
import type { NewsletterKind } from "@/lib/email/types";

const DAY = 24 * 60 * 60_000;
const UNSUBSCRIBE_TTL = 365 * DAY;

export const NEWSLETTER_SERIES: { kind: NewsletterKind; day: number; subject: string }[] = [
  { kind: "welcome", day: 0, subject: "🎄 Sveiki atvykę į Kalėdų Kampelį!" },
  { kind: "picks", day: 2, subject: "🎁 Šias dovanas renkasi dažniausiai" },
  { kind: "recipients", day: 5, subject: "🎄 Kam šiemet ieškai dovanos?" },
  { kind: "bundles", day: 9, subject: "✨ Ta pati dovana keliems – iki 15 % pigiau" },
];

export async function newsletterSeriesWorkflow(email: string, startedAt: number) {
  "use workflow";
  // One series per address: signing up again while it runs starts nothing new.
  const hook = createHook({ token: `newsletter:${email}` });
  if (await hook.getConflict()) return { status: "duplicate" };
  const { workflowRunId } = getWorkflowMetadata();
  for (const item of NEWSLETTER_SERIES) {
    if (item.day) await sleep(new Date(startedAt + item.day * DAY));
    if (!(await sendNewsletterEmail(email, item, startedAt, workflowRunId))) return { status: "purchased" };
  }
  return { status: "complete" };
}

async function sendNewsletterEmail(email: string, item: (typeof NEWSLETTER_SERIES)[number], startedAt: number, runId: string) {
  "use step";
  // Someone who already bought gets no more "come shop" emails.
  const paid = await getStripe()?.paymentIntents.search({
    query: `status:'succeeded' AND metadata['customer_email']:'${email}' AND created>=${Math.floor(startedAt / 1000)}`,
    limit: 1,
  });
  if (paid?.data.length) return false;
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kaledukampelis.com";
  const token = sealToken({ purpose: "newsletter-unsubscribe", runId, email }, UNSUBSCRIBE_TTL);
  const unsubscribeUrl = `${base}/api/email/unsubscribe?token=${encodeURIComponent(token)}`;
  const html = await renderNewsletter(item.kind, base, unsubscribeUrl);
  await sendEmail({ to: email, subject: item.subject, html, idempotencyKey: `newsletter/${runId}/${item.kind}`, unsubscribeUrl });
  return true;
}
sendNewsletterEmail.maxRetries = 10;
