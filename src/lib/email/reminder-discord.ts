import { FatalError, RetryableError } from "workflow";
import type { ReminderHour } from "@/lib/email/types";

export type ReminderSendReport = {
  recipient: string;
  hour: ReminderHour;
  emailId: string;
  sentAt: string;
  cartRunId: string;
  test?: boolean;
};

export function reminderDiscordPayload(report: ReminderSendReport) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Vilnius", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(report.sentAt));
  const date = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return {
    allowed_mentions: { parse: [] },
    embeds: [{
      title: `${report.test ? "[TEST] " : ""}Krepšelio priminimas išsiųstas`,
      description: "Resend patvirtino laiško priėmimą siuntimui.",
      color: 0x7a2336,
      fields: [
        { name: "Gavėjas", value: report.recipient, inline: false },
        { name: "Priminimas", value: `${report.hour} val. priminimas`, inline: true },
        { name: "Siuntimo laikas (Vilnius)", value: `${date.year}-${date.month}-${date.day} ${date.hour}:${date.minute}:${date.second}`, inline: true },
        { name: "Resend laiško ID", value: report.emailId, inline: false },
        { name: "Krepšelio sesija", value: report.cartRunId, inline: false },
      ],
      timestamp: report.sentAt,
    }],
  };
}

export async function sendReminderDiscordReport(report: ReminderSendReport) {
  const webhook = process.env.REMINDER_WEBHOOK_URL;
  if (!webhook) throw new FatalError("Reminder Discord webhook is not configured");
  const url = new URL(webhook);
  url.searchParams.set("wait", "true");
  const response = await fetch(url, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reminderDiscordPayload(report)), signal: AbortSignal.timeout(15_000),
  });
  if (response.status === 429 || response.status >= 500) {
    throw new RetryableError(`Reminder Discord notification failed (${response.status})`, { retryAfter: "1m" });
  }
  if (!response.ok) throw new FatalError(`Reminder Discord notification rejected (${response.status})`);
  const message = await response.json() as { id: string };
  return message.id;
}
