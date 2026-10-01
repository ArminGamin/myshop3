import { FatalError, RetryableError } from "workflow";
import type { CartEmailInput } from "@/lib/email/types";

export type PrepurchaseKind = "cart" | "email";
export type PrepurchaseReport = { cart: CartEmailInput; cartRunId: string; test?: boolean };
export const PREPURCHASE_WEBHOOKS = {
  cart: "PRE_PURCHASE_WEBHOOK_URL",
  email: "PRE_PURCHASE_EMAIL_WEBHOOK_URL",
} as const;

export function prepurchaseDiscordPayload(report: PrepurchaseReport, kind: PrepurchaseKind) {
  const { cart } = report;
  const money = (cents: number) => `${(cents / 100).toFixed(2)} €`;
  const products = cart.order.items.map(item => `• ${item.name} × ${item.quantity} — ${money(item.unitAmount * item.quantity)}`).join("\n");
  return {
    allowed_mentions: { parse: [] },
    embeds: [{
      title: `${report.test ? "[TEST] " : ""}${kind === "email" ? "Pirkėjo el. paštas užfiksuotas" : "Pradėtas užsakymas — krepšelis išsaugotas"}`,
      description: "Kontaktas ir krepšelis išsaugoti. Priminimai suplanuoti po 1, 24, 48 ir 72 val., jei užsakymas liks neapmokėtas.",
      color: 0xc5a149,
      fields: [
        { name: "El. paštas", value: cart.email, inline: false },
        { name: "Krepšelio suma", value: money(cart.order.totalCents), inline: true },
        { name: "Užfiksuota (Vilnius)", value: new Intl.DateTimeFormat("lt-LT", { timeZone: "Europe/Vilnius", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).format(new Date(cart.startedAt)), inline: false },
        { name: "Krepšelis", value: products.slice(0, 1024) || "—", inline: false },
        { name: "Krepšelio sesija", value: report.cartRunId, inline: false },
      ],
      timestamp: new Date(cart.startedAt).toISOString(),
    }],
  };
}

export async function sendPrepurchaseDiscordReport(report: PrepurchaseReport, kind: PrepurchaseKind) {
  const webhook = process.env[PREPURCHASE_WEBHOOKS[kind]];
  if (!webhook) throw new FatalError("Pre-purchase Discord webhook is not configured");
  const url = new URL(webhook);
  url.searchParams.set("wait", "true");
  const response = await fetch(url, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prepurchaseDiscordPayload(report, kind)), signal: AbortSignal.timeout(15_000),
  });
  if (response.status === 429 || response.status >= 500) throw new RetryableError(`Pre-purchase Discord notification failed (${response.status})`, { retryAfter: "1m" });
  if (!response.ok) throw new FatalError(`Pre-purchase Discord notification rejected (${response.status})`);
  return (await response.json() as { id: string }).id;
}
