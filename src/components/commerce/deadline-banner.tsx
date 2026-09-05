"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDeadlineInfo } from "@/lib/config/deadline";
import { store } from "@/lib/config/store.config";

// Sezoninio pristatymo termino modulis. Skaičiuojamas kliente, kad
// statiniai puslapiai niekada nerodytų pasenusios informacijos.
export function DeadlineBanner() {
  const [info, setInfo] = useState<ReturnType<typeof getDeadlineInfo> | null>(null);

  useEffect(() => {
    // pirmas įvertinimas po mount (kliento laikas), tada kas minutę
    const first = setTimeout(() => setInfo(getDeadlineInfo()), 0);
    const t = setInterval(() => setInfo(getDeadlineInfo()), 60_000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);

  if (!info || info.phase === "none") {
    // Terminas nesukonfigūruotas arba jau praėjęs — paskutinės minutės žinutė.
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-cozy border border-gold-400/50 bg-gradient-to-r from-cream-100 via-white to-cream-100 p-6 text-center sm:p-8">
          <p className="font-display text-xl font-semibold text-ink-900">
            Ieškote paskutinės minutės dovanos?
          </p>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-ink-600">
            Pristatome per 4–6 dienas, o dovanų testą išsilaikysite per 30 sekundžių.
          </p>
          <Link
            href={store.shipping.lastMinuteHint}
            className="mt-4 inline-flex min-h-11 items-center rounded-full bg-burgundy-600 px-6 font-semibold text-cream-50 transition hover:bg-burgundy-700"
          >
            Rasti dovaną greitai →
          </Link>
        </div>
      </div>
    );
  }

  const dateStr = info.deadlineDate
    ? new Intl.DateTimeFormat("lt-LT", { day: "numeric", month: "long" }).format(info.deadlineDate)
    : "";

  if (info.phase === "near") {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-cozy bg-burgundy-600 p-6 text-center text-cream-50 shadow-lift sm:p-8">
          <p className="font-display text-xl font-extrabold sm:text-2xl">
            Kalėdos jau visai čia. Paskutinės dienos užsakymams!
          </p>
          <p className="mt-2 text-sm font-semibold opacity-90">
            Užsisakykite iki <strong>{dateStr}</strong>. Jei vėluojame mes, pristatymas jums nemokamas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="texture-knit rounded-cozy border border-gold-400/55 bg-cream-100 p-6 text-center sm:p-8">
        <p className="font-display text-xl font-extrabold text-ink-900 sm:text-2xl">
          Užsisakykite iki <span className="text-burgundy-600">{dateStr}</span>. Dovana spės pasiekti jus{" "}
          <span className="text-burgundy-600">iki Kalėdų</span>!
        </p>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-ink-600">
          Visus Kalėdinius užsakymus ruošiame su pirmenybe ir siunčiame sekimo numerį.
        </p>
      </div>
    </div>
  );
}
