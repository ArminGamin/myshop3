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
      { value: "iki-15", label: "Iki 15 €" },
      { value: "15-20", label: "15–20 €" },
      { value: "20-25", label: "20–25 €" },
      { value: "25-plus", label: "25 €+" },
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
  "iki-15": [0, 1499],
  "15-20": [1500, 1999],
  "20-25": [2000, 2499],
  "25-plus": [2500, Infinity],
} as const;

// Atitikimo procentui: gavėjas 3 + biudžetas 4 + pobūdis 3 + proga 2.
const MAX_MATCH = 12;

type Answers = Partial<Record<string, string>>;
type Scored = { p: Product; score: number; match: number };

// Deterministinis „atsitiktinumas“ lygiems rezultatams išmaišyti pagal atsakymus.
function tieBreak(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967296;
}

function scoreProducts(a: Answers): Scored[] {
  const inBudget = products.filter((p) => {
    if (!p.inStock) return false;
    if (!a.budget) return true;
    const [min, max] = budgetRange[a.budget as keyof typeof budgetRange];
    return p.priceCents >= min && p.priceCents <= max;
  });
  // Gavėjas svarbiausias: jei tinkančių pakanka, rodome tik jiems skirtas dovanas.
  const forRecipient = inBudget.filter((p) => a.recipient && p.recipients.includes(a.recipient as RecipientId));
  const pool = forRecipient.length >= 3 ? forRecipient : inBudget;
  const seed = `${a.recipient}|${a.budget}|${a.vibe}|${a.occasion}`;

  return pool
    .map((p) => {
      const forWho = Boolean(a.recipient && p.recipients.includes(a.recipient as RecipientId));
      const vibe = Boolean(a.vibe && p.vibes.includes(a.vibe as VibeId));
      const occasion = Boolean(a.occasion && p.occasions.includes(a.occasion as OccasionId));
      // Siauresnės (specifiškesnės) prekės už tą patį atitikimą gauna daugiau taškų,
      // kad universalios prekės neužgožtų visų rezultatų.
      let score = 0;
      if (forWho) score += 3 + 2 / p.recipients.length;
      if (vibe) score += 3 + 2 / p.vibes.length;
      if (occasion && a.occasion !== "kaledos") score += 2 + 1 / p.occasions.length;
      if (p.bestseller) score += 0.3;
      score += tieBreak(seed + p.slug) * 0.6;
      const match = (forWho ? 3 : 0) + 4 + (vibe ? 3 : 0) + (occasion ? 2 : 0);
      return { p, score, match };
    })
    .filter((x) => x.match >= 7)
    .sort((x, y) => y.score - x.score)
    .slice(0, 6);
}

function fallbackPicks(): Scored[] {
  return products
    .filter((p) => p.inStock && p.bestseller)
    .slice(0, 6)
    .map((p) => ({ p, score: 0, match: 0 }));
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
              {results.map(({ p, match }, i) => {
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
                        <span className="quiz-match">{Math.min(99, Math.round((match / MAX_MATCH) * 100))}%</span>
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
