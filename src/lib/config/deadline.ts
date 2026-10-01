import { store } from "./store.config";

export type DeadlinePhase = "none" | "before" | "near";

export interface DeadlineInfo {
  phase: DeadlinePhase;
  deadlineDate?: Date;
  daysLeft?: number;
}

const NEAR_DAYS = 7;

function vilniusYear(now: Date): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Vilnius", year: "numeric" }).format(now)
  );
}

function christmasEveEnd(year: number): Date {
  return new Date(`${year}-12-24T23:59:59+02:00`);
}

export function daysUntilChristmasEve(now: Date = new Date()): number {
  let year = vilniusYear(now);
  let target = new Date(`${year}-12-24T00:00:00+02:00`);
  if (now.getTime() >= target.getTime()) {
    year += 1;
    target = new Date(`${year}-12-24T00:00:00+02:00`);
  }
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86_400_000));
}

export function getDeadlineInfo(now: Date = new Date()): DeadlineInfo {
  const iso = store.shipping.lastChristmasOrderDateISO;
  if (!iso) return { phase: "none" };
  const deadline = new Date(iso);
  if (Number.isNaN(deadline.getTime())) return { phase: "none" };
  if (deadline.getTime() > christmasEveEnd(vilniusYear(deadline)).getTime()) return { phase: "none" };

  const diffMs = deadline.getTime() - now.getTime();
  if (diffMs <= 0) return { phase: "none" };

  const daysLeft = Math.ceil(diffMs / 86_400_000);
  return { phase: daysLeft <= NEAR_DAYS ? "near" : "before", deadlineDate: deadline, daysLeft };
}

function addBusinessDays(from: Date, days: number): Date {
  const date = new Date(from.getTime());
  let left = days;
  while (left > 0) {
    date.setUTCDate(date.getUTCDate() + 1);
    const day = date.getUTCDay();
    if (day !== 0 && day !== 6) left -= 1;
  }
  return date;
}

export function christmasDeliveryPromise(now: Date = new Date()): string | null {
  const info = getDeadlineInfo(now);
  if (!info.deadlineDate || info.phase === "none") return null;
  const christmas = nextChristmas(now);
  const eve = new Date(christmas.getTime() - 86_400_000);
  if (info.deadlineDate.getTime() > eve.getTime()) return null;
  if (now.getTime() > info.deadlineDate.getTime()) return null;
  if (addBusinessDays(now, 6).getTime() > christmas.getTime()) return null;
  return `Užsakykite iki ${formatDeadline(info.deadlineDate)} ir gausite iki Kalėdų`;
}

export function formatDeadline(date: Date): string {
  return new Intl.DateTimeFormat("lt-LT", {
    month: "long",
    day: "numeric",
  })
    .format(date)
    .replace(/\s*d\.\s*$/u, "");
}

/** Lithuanian plural for „diena“: 1 diena, 2 dienos, 5 dienos, 109 dienos, 10 dienų, 11 dienų */
export function lithuanianDayWord(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "diena";
  if (mod10 >= 2 && mod10 <= 9 && (mod100 < 11 || mod100 > 19)) return "dienos";
  return "dienų";
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
