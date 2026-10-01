import { sendPrepurchaseDiscordReport, type PrepurchaseReport, type PrepurchaseKind } from "@/lib/email/prepurchase-discord";

export async function prepurchaseNotificationWorkflow(report: PrepurchaseReport, kind: PrepurchaseKind) {
  "use workflow";
  return await notifyPrepurchase(report, kind);
}

async function notifyPrepurchase(report: PrepurchaseReport, kind: PrepurchaseKind) {
  "use step";
  return await sendPrepurchaseDiscordReport(report, kind);
}
notifyPrepurchase.maxRetries = 10;
