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
  })
    .format(date)
    .replace(/\s*d\.\s*$/u, "");
}

export type ChristmasCountdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
};

export function nextChristmas(now: Date = new Date()): Date {
  const year = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Vilnius",
    year: "numeric",
  }).format(now);
  const y = Number(year);
  const first = new Date(`${y}-12-25T00:00:00+02:00`);
  if (now.getTime() < first.getTime()) return first;
  return new Date(`${y + 1}-12-25T00:00:00+02:00`);
}

export function getChristmasCountdown(now: Date = new Date()): ChristmasCountdown {
  const totalMs = Math.max(0, nextChristmas(now).getTime() - now.getTime());
  const totalSeconds = Math.floor(totalMs / 1000);
  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
    totalMs,
  };
}
