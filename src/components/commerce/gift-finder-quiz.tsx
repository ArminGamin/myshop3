"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import type { OccasionId, Product, RecipientId, VibeId } from "@/types";
import { products } from "@/lib/data/products";
import { track } from "@/lib/analytics";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/commerce/product-art";
import { QuizGlyph } from "@/components/ui/line-icons";

interface Step {
  id: string;
  q: string;
  hint: string;
  options: { value: string; label: string }[];
}

const steps: Step[] = [
  {
    id: "recipient",
    q: "Kam dovana?",
    hint: "Pasirinkite žmogų, kurį norite nudžiuginti.",
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
    hint: "Parodysime tik į jį telpančias dovanas.",
    options: [
      { value: "iki-20", label: "Iki 20 €" },
      { value: "20-30", label: "20–30 €" },
      { value: "30-50", label: "30–50 €" },
      { value: "50-plus", label: "50 €+" },
    ],
  },
  {
    id: "vibe",
    q: "Koks tai žmogus?",
    hint: "Kas geriausiai jį ar ją apibūdina?",
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
    hint: "Paskutinis klausimas – ir dovanos jau laukia.",
    options: [
      { value: "kaledos", label: "Kalėdos" },
      { value: "slaptas-senelis", label: "Slaptasis Kalėdų Senelis" },
      { value: "seimos-svente", label: "Šeimos šventė" },
      { value: "draugams", label: "Draugams" },
      { value: "partneriui", label: "Partneriui" },
    ],
  },
];

const budgetRange = {
  "iki-20": [0, 2000],
  "20-30": [2000, 3000],
  "30-50": [3000, 5000],
  "50-plus": [5000, Infinity],
} as const;

const MAX_SCORE = 12.5;

type Answers = Partial<Record<string, string>>;
type Scored = { p: Product; score: number };

function scoreProducts(a: Answers): Scored[] {
  return products
    .filter((p) => p.inStock)
    .filter((p) => {
      if (!a.budget) return true;
      const [min, max] = budgetRange[a.budget as keyof typeof budgetRange];
      return p.priceCents >= min && p.priceCents <= max;
    })
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

function fallbackPicks(): Scored[] {
  return products
    .filter((p) => p.inStock && p.bestseller)
    .slice(0, 6)
    .map((p) => ({ p, score: 0 }));
}

const labelOf = (stepId: string, value?: string) =>
  steps.find((s) => s.id === stepId)?.options.find((o) => o.value === value)?.label;

// Interaktyvus „Rask tinkamą dovaną“ testas — greitas, mobiliai pritaikytas.
export function GiftFinderQuiz() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [picked, setPicked] = useState<string | null>(null);
  const [direction, setDirection] = useState<"fwd" | "back">("fwd");
  const advanceRef = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const done = stepIndex >= steps.length;
  const matched = useMemo(() => (done ? scoreProducts(answers) : []), [done, answers]);
  const results = matched.length ? matched : done ? fallbackPicks() : [];

  useEffect(
    () => () => {
      if (advanceRef.current !== null) window.clearTimeout(advanceRef.current);
    },
    []
  );

  function keepInView() {
    const el = rootRef.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function pick(stepId: string, value: string) {
    if (picked) return;
    setAnswers((prev) => ({ ...prev, [stepId]: value }));
    setPicked(value);
    if (stepId === steps[0].id) track("quiz_start");
    // Trumpa pauzė, kad matytųsi pasirinkimas, tada kitas klausimas.
    advanceRef.current = window.setTimeout(() => {
      setPicked(null);
      setDirection("fwd");
      if (stepIndex + 1 >= steps.length) {
        track("quiz_complete");
        setStepIndex(steps.length);
      } else {
        setStepIndex(stepIndex + 1);
      }
      keepInView();
    }, 260);
  }

  function back() {
    setDirection("back");
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function reset() {
    setAnswers({});
    setDirection("back");
    setStepIndex(0);
    keepInView();
  }

  const progress = done ? 1 : Math.max(stepIndex / steps.length, 0.04);
  const chips = steps
    .map((s, i) => (done || i < stepIndex ? labelOf(s.id, answers[s.id]) : undefined))
    .filter((v): v is string => Boolean(v));

  return (
    <div ref={rootRef} className="quiz-card relative overflow-hidden rounded-[28px]">
      <div className="quiz-card-glow" aria-hidden />

      <div className="relative p-5 sm:p-9">
        <div className="flex min-h-9 items-center justify-between gap-4">
          <p className="quiz-step-label">
            {done ? (
              <>
                <Sparkles className="size-3.5" strokeWidth={2} aria-hidden />
                Jūsų rezultatai
              </>
            ) : (
              <>
                Klausimas <span className="text-ink-900">{stepIndex + 1}</span> iš {steps.length}
              </>
            )}
          </p>
          {done ? (
            <button type="button" onClick={reset} className="quiz-back">
              <RotateCcw className="size-3.5" strokeWidth={2.2} aria-hidden />
              Iš naujo
            </button>
          ) : stepIndex > 0 ? (
            <button type="button" onClick={back} className="quiz-back">
              <ArrowLeft className="size-3.5" strokeWidth={2.2} aria-hidden />
              Atgal
            </button>
          ) : null}
        </div>

        <div className="quiz-progress mt-3" aria-hidden>
          <span style={{ transform: `scaleX(${progress})` }} />
          {steps.map((s, i) => (
            <i
              key={s.id}
              className={done || i < stepIndex ? "is-done" : ""}
              style={{ left: `${((i + 1) / steps.length) * 100}%` }}
            />
          ))}
        </div>

        {chips.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Jūsų pasirinkimai">
            {chips.map((chip) => (
              <li key={chip} className="quiz-chip">
                {chip}
              </li>
            ))}
          </ul>
        ) : null}

        {done ? (
          <div className="quiz-enter-fwd mt-6">
            <h3 className="font-display text-[1.9rem] font-bold leading-[1.08] text-ink-900 sm:text-[2.4rem]">
              {matched.length ? (
                <>
                  Štai jūsų <em>dovanos</em>
                </>
              ) : (
                <>
                  Pabandykime <em>kitaip</em>
                </>
              )}
            </h3>
            <p className="mt-2 text-[15px] font-medium text-ink-600">
              {matched.length
                ? "Atrinkome pagal jūsų atsakymus – tinkamiausios pirmos."
                : "Šie kriterijai per griežti, bet šios dovanos tinka beveik visiems:"}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {results.map(({ p, score }, i) => {
                const top = i === 0 && matched.length > 0;
                return (
                  <Link
                    key={p.slug}
                    href={`/produktai/${p.slug}`}
                    className={`quiz-result group${top ? " is-top" : ""}`}
                    style={{ animationDelay: `${i * 70}ms` }}
                  >
                    <span className="relative block aspect-square overflow-hidden rounded-[16px]">
                      <ProductImage
                        images={p.images}
                        seed={p.artSeed}
                        alt={p.name}
                        size="card"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                      />
                      {top ? <span className="quiz-top-badge">Geriausias atitikimas</span> : null}
                    </span>
                    <span className="mt-3 line-clamp-2 block text-[13.5px] font-bold leading-snug text-ink-900">
                      {p.name}
                    </span>
                    <span className="mt-auto flex items-center justify-between gap-2 pt-2">
                      <span className="text-[14px] font-extrabold text-burgundy-600">{formatPrice(p.priceCents)}</span>
                      {matched.length ? (
                        <span className="quiz-match">{Math.min(99, Math.round((score / MAX_SCORE) * 100))}%</span>
                      ) : null}
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/dovanos/visos-dovanos" className="quiz-cta">
                Visos dovanos
                <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
              </Link>
              <button type="button" onClick={reset} className="quiz-ghost">
                Pradėti iš naujo
              </button>
            </div>
          </div>
        ) : (
          <QuizStep
            key={steps[stepIndex].id}
            step={steps[stepIndex]}
            direction={direction}
            selected={picked ?? answers[steps[stepIndex].id] ?? null}
            onPick={pick}
          />
        )}
      </div>
    </div>
  );
}

function QuizStep({
  step,
  direction,
  selected,
  onPick,
}: {
  step: Step;
  direction: "fwd" | "back";
  selected: string | null;
  onPick: (stepId: string, value: string) => void;
}) {
  const odd = step.options.length % 2 === 1;
  return (
    <div className={`mt-6 ${direction === "fwd" ? "quiz-enter-fwd" : "quiz-enter-back"}`}>
      <h3 className="font-display text-[1.9rem] font-bold leading-[1.08] text-ink-900 sm:text-[2.4rem]">{step.q}</h3>
      <p className="mt-2 text-[15px] font-medium text-ink-600">{step.hint}</p>

      <div role="group" aria-label={step.q} className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
        {step.options.map((opt, i) => {
          const isSelected = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onPick(step.id, opt.value)}
              className={`quiz-option group${isSelected ? " is-selected" : ""}${
                odd && i === step.options.length - 1 ? " col-span-2 sm:col-span-1" : ""
              }`}
              style={{ animationDelay: `${60 + i * 45}ms` }}
            >
              <span className="quiz-option-medal">
                <QuizGlyph value={opt.value} />
              </span>
              <span className="text-center text-[14px] font-bold leading-tight text-ink-900">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
