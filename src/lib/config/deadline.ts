import { store } from "./store.config";

export type DeadlinePhase = "none" | "before" | "near";

export interface DeadlineInfo {
  phase: DeadlinePhase;
  deadlineDate?: Date;
  daysLeft?: number;
}

const NEAR_DAYS = 7;

export function getDeadlineInfo(now: Date = new Date()): DeadlineInfo {
  const iso = store.shipping.christmasDeadlineISO;
  if (!iso) return { phase: "none" };
  const deadline = new Date(iso);
  if (Number.isNaN(deadline.getTime())) return { phase: "none" };

  const diffMs = deadline.getTime() - now.getTime();
  if (diffMs <= 0) return { phase: "none" }; // terminas praėjęs — modulis slepiamas

  const daysLeft = Math.ceil(diffMs / 86_400_000);
  return { phase: daysLeft <= NEAR_DAYS ? "near" : "before", deadlineDate: deadline, daysLeft };
}

export function formatDeadline(date: Date): string {
  return new Intl.DateTimeFormat("lt-LT", {
    month: "long",
    day: "numeric",
  }).format(date);
}
