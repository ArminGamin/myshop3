"use client";

import { useEffect, useState } from "react";
import { flags } from "@/lib/config/store.config";
import { getChristmasCountdown, type ChristmasCountdown } from "@/lib/config/deadline";

const units: { key: keyof Pick<ChristmasCountdown, "days" | "hours" | "minutes" | "seconds">; label: string }[] = [
  { key: "days", label: "dienos" },
  { key: "hours", label: "val." },
  { key: "minutes", label: "min." },
  { key: "seconds", label: "sek." },
];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function Spark() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-2.5 shrink-0 text-gold-400">
      <path
        fill="currentColor"
        d="M12 1.1 13.7 8.6 21.2 10.4 13.7 12.2 12 19.7 10.3 12.2 2.8 10.4 10.3 8.6Z"
      />
    </svg>
  );
}

export function ChristmasCountdown() {
  const [parts, setParts] = useState<ChristmasCountdown | null>(null);

  useEffect(() => {
    const tick = () => setParts(getChristmasCountdown());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!flags.ENABLE_COUNTDOWN) return null;

  return (
    <div className="xmas-count mt-3 sm:mt-5" aria-live="polite">
      <div className="xmas-count-head flex items-center gap-1.5">
        <Spark />
        <p className="font-sans text-[9px] font-extrabold uppercase tracking-[0.2em] text-gold-400">
          Iki Kalėdų
        </p>
        <Spark />
      </div>
      <p className="xmas-count-row font-display text-[1.45rem] font-bold leading-none text-cream-50 sm:text-[1.65rem]">
        {units.map((unit, i) => (
          <span key={unit.key}>
            {i > 0 ? <span className="xmas-count-sep mx-1.5 text-[0.85rem]">·</span> : null}
            <span className={unit.key === "seconds" ? "xmas-count-tick" : undefined}>
              {parts ? (unit.key === "days" ? parts.days : pad(parts[unit.key])) : "··"}
            </span>
          </span>
        ))}
      </p>
      <p className="xmas-count-labels font-sans text-[8px] font-extrabold uppercase tracking-[0.16em] text-gold-400/80">
        {units.map((unit, i) => (
          <span key={unit.key}>
            {i > 0 ? <span className="xmas-count-sep mx-1">·</span> : null}
            {unit.label}
          </span>
        ))}
      </p>
    </div>
  );
}