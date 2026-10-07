import type { Metadata } from "next";
import { Gift, Sparkles, Timer } from "lucide-react";
import { GiftFinderQuiz } from "@/components/commerce/gift-finder-quiz";

export const metadata: Metadata = {
  title: "Rask tinkamą dovaną per 30 sekundžių",
  description:
    "Atsakykite į 4 klausimus ir mes parodysime kalėdines dovanas, kurios geriausiai tinka jūsų žmogui: pagal gavėją, biudžetą ir tipą.",
  alternates: { canonical: "/rask-dovana" },
};

export default function GiftFinderPage() {
  return (
    <div className="quiz-page">
      <div className="mx-auto max-w-4xl px-4 pb-14 pt-6 sm:px-6 sm:pb-20 sm:pt-10">
        <div className="mb-7 text-center sm:mb-10">
          <p className="quiz-eyebrow">
            <Gift className="size-3.5" strokeWidth={2} aria-hidden />
            Dovanų radiklis
          </p>
          <h1 className="mt-4 font-display text-[2.5rem] font-bold leading-[1.02] tracking-[-0.01em] text-ink-900 sm:text-[3.6rem]">
            Rask tinkamą <em>dovaną</em>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[15.5px] font-medium leading-relaxed text-ink-600 sm:text-[17px]">
            Keturi greiti klausimai ir jau žinote, ką dėti po egle.
          </p>
          <ul className="quiz-perks mt-5" aria-label="Privalumai">
            <li>
              <Timer className="size-3.5" strokeWidth={2} aria-hidden />
              ~30 sekundžių
            </li>
            <li>
              <Sparkles className="size-3.5" strokeWidth={2} aria-hidden />
              Asmeninės rekomendacijos
            </li>
          </ul>
        </div>
        <GiftFinderQuiz />
      </div>
    </div>
  );
}
