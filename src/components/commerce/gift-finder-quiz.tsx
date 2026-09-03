"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { OccasionId, RecipientId, VibeId } from "@/types";
import { products } from "@/lib/data/products";
import { track } from "@/lib/analytics";
import { ProductImage } from "@/components/commerce/product-art";
import { QuizGlyph } from "@/components/ui/line-icons";

interface Step {
  id: string;
  q: string;
  options: { value: string; label: string }[];
}

const steps: Step[] = [
  {
    id: "recipient",
    q: "Kam dovana?",
    options: [
      { value: "jai", label: "Jai" },
      { value: "jam", label: "Jam" },
      { value: "porai", label: "Porai" },
      { value: "seimai", label: "Šeimai" },
      { value: "draugui", label: "Draugui" },
      { value: "kolegai", label: "Kolegei" },
      { value: "tevams", label: "Tėvams" },
    ],
  },
  {
    id: "budget",
    q: "Koks biudžetas?",
    options: [
      { value: "iki-20", label: "Iki 20 €" },
      { value: "20-30", label: "20–30 €" },
      { value: "30-50", label: "30–50 €" },
      { value: "50-plus", label: "50 €+" },
    ],
  },
  {
    id: "vibe",
    q: "Koks žmogaus tipas?",
    options: [
      { value: "praktiskas", label: "Praktiškas" },
      { value: "romantiskas", label: "Romantiškas" },
      { value: "linksmas", label: "Linksmas" },
      { value: "minimalistas", label: "Minimalistas" },
      { value: "jaukus", label: "Mėgstantis jaukumą" },
      { value: "technologiskas", label: "Technologijų mėgėjas" },
    ],
  },
  {
    id: "occasion",
    q: "Kokia proga?",
    options: [
      { value: "kaledos", label: "Kalėdos" },
      { value: "slaptas-senelis", label: "Slaptas Kalėdų Senelis" },
      { value: "seimos-svente", label: "Šeimos šventė" },
      { value: "draugams", label: "Draugams" },
      { value: "partneriui", label: "Partneriui" },
    ],
  },
];

const budgetRange = {
  "iki-20": [0, 2000],
  "20-30": [1900, 3000],
  "30-50": [2900, 5000],
  "50-plus": [4900, Infinity],
} as const;

type Answers = Partial<Record<string, string>>;

function scoreProducts(a: Answers) {
  return products
    .filter((p) => p.inStock)
    .map((p) => {
      let score = 0;
      if (a.recipient && p.recipients.includes(a.recipient as RecipientId)) score += 3;
      if (a.budget) {
        const [min, max] = budgetRange[a.budget as keyof typeof budgetRange];
        if (p.priceCents >= min && p.priceCents <= max) score += 4;
      }
      if (a.vibe && p.vibes.includes(a.vibe as VibeId)) score += 3;
      if (a.occasion && p.occasions.includes(a.occasion as OccasionId)) score += 2;
      if (p.bestseller) score += 0.5;
      return { p, score };
    })
    .filter((x) => x.score >= 3)
    .sort((x, y) => y.score - x.score)
    .slice(0, 6);
}

// Interaktyvus „Rask tinkamą dovaną“ testas — greitas, mobiliai pritaikytas.
export function GiftFinderQuiz({ compact = false }: { compact?: boolean }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const router = useRouter();
  const done = stepIndex >= steps.length;
  const results = useMemo(() => (done ? scoreProducts(answers) : []), [done, answers]);

  function pick(stepId: string, value: string) {
    const next = { ...answers, [stepId]: value };
    setAnswers(next);
    if (stepId === steps[0].id) track("quiz_start");
    if (stepIndex + 1 > steps.length - 1 || Object.keys(next).length === steps.length) {
      track("quiz_complete");
      setStepIndex(steps.length);
    } else {
      setStepIndex((i) => i + 1);
    }
  }

  function reset() {
    setAnswers({});
    setStepIndex(0);
  }

  if (done) {
    const url =
      `/dovanos/visos-dovanos` +
      (aToQuery(answers) ? `?${aToQuery(answers)}` : "");
    void url;
    return (
      <div className={compact ? "quiz-step" : "quiz-step rounded-cozy bg-white/60 p-4 sm:p-8"}>
        <div className="mb-5 flex items-center justify-between">
          <p className="font-display text-xl font-semibold text-ink-900">
            Jūsų dovanos
          </p>
          <button
            type="button"
            onClick={reset}
            className="text-sm font-semibold text-burgundy-600 underline underline-offset-4"
          >
            Pradėti iš naujo
          </button>
        </div>
        {results.length === 0 ? (
          <p className="text-sm leading-relaxed text-ink-600">
            Šie kriterijai per griežti — bet turime puikių bestsellerių, kurie tinka beveik
            visiems:
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {results.map(({ p }) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => router.push(`/produktai/${p.slug}`)}
                className="group rounded-cozy border border-cream-300 bg-cream-50 p-3 text-left transition hover:border-gold-400 hover:shadow-card"
              >
                <span className="block aspect-square w-full overflow-hidden rounded-lg">
                  <QuizArt images={p.images} seed={p.artSeed} alt={p.name} />
                </span>
                <span className="mt-2 line-clamp-2 block text-[12.5px] font-semibold leading-tight text-ink-900 group-hover:text-burgundy-600">
                  {p.name}
                </span>
                <span className="mt-1 block text-[13px] font-bold text-burgundy-600">
                  Nuo {(p.priceCents / 100).toFixed(2).replace(".", ",")} €
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const step = steps[stepIndex];

  return (
    <div className={compact ? "" : "rounded-cozy bg-white/60 p-4 sm:p-8"}>
      {/* Progreso juosta */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex flex-1 gap-1.5" aria-hidden>
          {steps.map((s, i) => (
            <span
              key={s.id}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= stepIndex ? "bg-gold-500" : "bg-cream-300"
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-bold text-ink-400">
          {stepIndex + 1}/{steps.length}
        </span>
      </div>

      <div key={step.id} className="quiz-step">
        <h3 className="font-display text-xl font-semibold text-ink-900 sm:text-2xl">{step.q}</h3>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:grid-cols-3 sm:gap-2.5 lg:grid-cols-4">
          {step.options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => pick(step.id, opt.value)}
              className="group flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-cozy border-2 border-cream-300 bg-cream-50 px-2.5 py-3 transition-[transform,border-color,background-color] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-gold-400 hover:bg-gold-200/30 active:scale-[0.98] sm:min-h-28 sm:gap-1.5 sm:px-3 sm:py-4"
            >
              <span className="text-burgundy-600 transition-transform duration-500 group-hover:scale-[1.06]">
                <QuizGlyph value={opt.value} />
              </span>
              <span className="text-center text-[13.5px] font-semibold leading-tight text-ink-900">
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {stepIndex > 0 ? (
        <button
          type="button"
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          className="mt-4 text-sm font-medium text-ink-600 underline underline-offset-4 hover:text-burgundy-600"
        >
          ← Atgal
        </button>
      ) : null}
    </div>
  );
}

function QuizArt({ images, seed, alt }: { images: string[]; seed: string; alt: string }) {
  return <ProductImage images={images} seed={seed} alt={alt} size="card" className="h-full w-full object-cover" />;
}

function aToQuery(a: Answers): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(a)) if (v) params.set(k, v);
  return params.toString();
}
