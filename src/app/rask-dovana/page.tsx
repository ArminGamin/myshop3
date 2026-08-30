import type { Metadata } from "next";
import { GiftFinderQuiz } from "@/components/commerce/gift-finder-quiz";

export const metadata: Metadata = {
  title: "Rask tinkamą dovaną per 30 sekundžių",
  description:
    "Atsakykite į 4 klausimus ir mes parodysime kalėdines dovanas, kurios geriausiai tinka jūsų žmogui: pagal gavėją, biudžetą ir tipą.",
  alternates: { canonical: "/rask-dovana" },
};

export default function GiftFinderPage() {
  return (
    <div className="texture-knit glow-candle">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-gold-600">
            Dovanų radiklis
          </p>
          <h1 className="font-display text-[1.75rem] font-semibold text-ink-900 sm:text-4xl">
            Rask tinkamą dovaną
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink-600">
            Keturi greiti klausimai — ir jau žinote, ką dėti po egle.
          </p>
        </div>
        <div className="rounded-cozy border border-cream-300 bg-white/70 p-4 shadow-card sm:p-6">
          <GiftFinderQuiz />
        </div>
      </div>
    </div>
  );
}
