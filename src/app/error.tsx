"use client";

import { Button, ButtonLink } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="texture-knit">
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="font-display text-5xl" aria-hidden>🕯️</p>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink-900">
          Kažkur užgeso žvakutė
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
          Įvyko netikėta klaida. Pabandykite dar kartą — arba parašykite mums, jei
          nepavyks ir iš trečio karto.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink href="/">Į pradžią</ButtonLink>
          <Button variant="secondary" size="lg" onClick={() => reset()}>
            Bandyti dar kartą
          </Button>
        </div>
      </div>
    </div>
  );
}
