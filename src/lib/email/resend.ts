import { FatalError, RetryableError } from "workflow";

export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM && process.env.EMAIL_AUTOMATION_SECRET);
}

export async function sendEmail(input: { to: string; subject: string; html: string; idempotencyKey: string; unsubscribeUrl?: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!key || !from) throw new FatalError("Resend is not configured");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    signal: AbortSignal.timeout(15_000),
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": input.idempotencyKey },
    body: JSON.stringify({
      from, to: [input.to], subject: input.subject, html: input.html,
      reply_to: "kaleddovanos@gmail.com",
      ...(input.unsubscribeUrl ? { headers: { "List-Unsubscribe": `<${input.unsubscribeUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } } : {}),
    }),
  });
  if (response.status === 409) {
    const conflict = await response.json() as { name?: string };
    if (conflict.name === "invalid_idempotent_request") throw new FatalError("Resend idempotency payload changed");
    throw new RetryableError("Concurrent Resend request", { retryAfter: "1m" });
  }
  if (response.status === 429 || response.status >= 500) {
    throw new RetryableError(`Resend temporarily unavailable (${response.status})`, { retryAfter: "1m" });
  }
  if (!response.ok) throw new FatalError(`Resend rejected the email (${response.status})`);
  const result = await response.json() as { id: string };
  return result.id;
}
