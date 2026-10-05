"use client";

import { useEffect, useState } from "react";
import { flags } from "@/lib/config/store.config";
import {
  getChristmasCountdown,
  lithuanianDayWord,
  type ChristmasCountdown,
} from "@/lib/config/deadline";

const RING_TEXT = "Iki Kalėdų ✦ Pristatymas per 4-6 d. ✦ ";
// Apskritimo ilgis (r = 47), kad tekstas tolygiai apjuostų visą žiedą.
const RING_LENGTH = 295;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

// Auksinis antspaudas su atgaline atskaita iki Kalėdų. Sekundės tiksi
// tik vizualiai: ekrano skaitytuvams pateikiamas vienas sakinys.
export function HeroSeal() {
  const [parts, setParts] = useState<ChristmasCountdown | null>(null);

  useEffect(() => {
    const tick = () => setParts(getChristmasCountdown());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!flags.ENABLE_COUNTDOWN) return null;

  const days = parts?.days ?? null;
  const label =
    days === null ? "Iki Kalėdų" : `Iki Kalėdų liko ${days} ${lithuanianDayWord(days)}`;

  return (
    <div className="hero-seal" role="timer" aria-label={label}>
      <svg aria-hidden viewBox="0 0 120 120" className="hero-seal-ring">
        <defs>
          <path id="hero-seal-path" d="M60 60m-47 0a47 47 0 1 1 94 0a47 47 0 1 1-94 0" />
        </defs>
        <text>
          <textPath href="#hero-seal-path" textLength={RING_LENGTH} lengthAdjust="spacing">
            {RING_TEXT.toUpperCase()}
          </textPath>
        </text>
      </svg>
      <div aria-hidden className="hero-seal-core">
        <span className="hero-seal-days">{days ?? "··"}</span>
        <span className="hero-seal-unit">{days === null ? "dienos" : lithuanianDayWord(days)}</span>
        <span className="hero-seal-clock">
          {parts ? `${pad(parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}` : "··:··:··"}
        </span>
      </div>
    </div>
  );
}
