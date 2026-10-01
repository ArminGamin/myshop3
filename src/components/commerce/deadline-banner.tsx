"use client";

import { useEffect, useState } from "react";
import { getDeadlineInfo } from "@/lib/config/deadline";

// Sezoninio pristatymo termino modulis. Skaičiuojamas kliente, kad
// statiniai puslapiai niekada nerodytų pasenusios informacijos.
export function DeadlineBanner({ className = "" }: { className?: string }) {
  const [info, setInfo] = useState<ReturnType<typeof getDeadlineInfo> | null>(null);

  useEffect(() => {
    // pirmas įvertinimas po mount (kliento laiko), tada kas minutę
    const first = setTimeout(() => setInfo(getDeadlineInfo()), 0);
    const t = setInterval(() => setInfo(getDeadlineInfo()), 60_000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);

  if (!info || info.phase === "none") return null;

  const rawDateStr = info.deadlineDate
    ? new Intl.DateTimeFormat("lt-LT", { day: "numeric", month: "long" }).format(info.deadlineDate)
    : "";
  const dateStr = rawDateStr.trim().endsWith(".") ? rawDateStr.trim() : `${rawDateStr.trim()}.`;

  if (info.phase === "near") {
    return (
      <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
        <div className="rounded-cozy bg-burgundy-600 p-6 text-center text-cream-50 shadow-lift sm:p-8">
          <p className="font-display text-xl font-extrabold sm:text-2xl">
            Kalėdos jau visai čia. Paskutinės dienos užsakymams!
          </p>
          <p className="mt-2 text-sm font-semibold opacity-90">
            Užsisakykite iki <strong>{dateStr}</strong> Jei vėluojame mes, pristatymas jums nemokamas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="texture-knit rounded-cozy border border-gold-400/55 bg-cream-100 p-6 text-center sm:p-8">
        <p className="font-display text-xl font-extrabold text-ink-900 sm:text-2xl">
          Užsisakykite iki <span className="text-burgundy-600">{dateStr}</span> Dovana spės pasiekti jus{" "}
          <span className="text-burgundy-600">iki Kalėdų</span>!
        </p>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-ink-600">
          Visus Kalėdinius užsakymus ruošiame su pirmenybe ir siunčiame sekimo numerį.
        </p>
      </div>
    </div>
  );
}
