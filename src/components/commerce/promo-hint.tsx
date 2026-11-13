"use client";

import { useState } from "react";
import { Check, Copy, Tag } from "lucide-react";
import { bestPromo, promoDiscountCents, promoEligibleCents, promoLadder } from "@/lib/commerce/promo";
import { formatPrice } from "@/lib/format";

// Krepšelyje parodo geriausią tinkamą nuolaidos kodą ir kitą laiptelį.
export function PromoHint({ subtotalCents, lines }: { subtotalCents: number; lines: { slug: string; lineTotalCents: number }[] }) {
  const { next } = promoLadder(subtotalCents);
  const best = bestPromo(subtotalCents, lines);
  const [copied, setCopied] = useState(false);
  if (!best) return null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(best!.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Jei kopijuoti nepavyko, kodas vis tiek matomas.
    }
  }

  return (
    <div className="rounded-[14px] border-[1.5px] border-dashed border-gold-500 bg-cream-50 px-3.5 py-3">
      <div className="flex items-center gap-3">
        <span aria-hidden className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-gold-200 text-burgundy-700">
          <Tag className="size-4" strokeWidth={2} />
        </span>
        <p className="min-w-0 flex-1 text-[13.5px] font-medium leading-snug text-ink-600">
          Kodas <strong className="font-extrabold tracking-wide text-burgundy-700">{best.code}</strong> – −{best.percentOff} %
          {best.slugPrefix ? " LEGO rinkiniams" : " jūsų krepšeliui"}. Sutaupysite{" "}
          <strong className="text-ink-900">{formatPrice(promoDiscountCents(best, subtotalCents, promoEligibleCents(best, lines)))}</strong>.
        </p>
        <button
          type="button"
          onClick={copy}
          aria-label={`Kopijuoti kodą ${best.code}`}
          className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full bg-burgundy-600 px-3.5 text-[12.5px] font-bold text-cream-50 transition hover:bg-burgundy-700"
        >
          {copied ? <Check aria-hidden className="size-3.5" strokeWidth={2.6} /> : <Copy aria-hidden className="size-3.5" strokeWidth={2.2} />}
          {copied ? "Nukopijuota" : "Kopijuoti"}
        </button>
      </div>
      <p className="mt-2 text-[12.5px] font-medium leading-snug text-ink-400">
        {next ? (
          <>
            Pridėkite dar <strong className="text-burgundy-600">{formatPrice(next.minSubtotalCents - subtotalCents)}</strong> – su{" "}
            <strong className="text-ink-600">{next.code}</strong> gausite −{next.percentOff} %.{" "}
          </>
        ) : null}
        Kodą įveskite atsiskaitant.
      </p>
    </div>
  );
}
