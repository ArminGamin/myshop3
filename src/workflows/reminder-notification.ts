import { sendReminderDiscordReport, type ReminderSendReport } from "@/lib/email/reminder-discord";

export async function reminderNotificationWorkflow(report: ReminderSendReport) {
  "use workflow";
  return await notifyReminder(report);
}

async function notifyReminder(report: ReminderSendReport) {
  "use step";
  return await sendReminderDiscordReport(report);
}
notifyReminder.maxRetries = 10;
