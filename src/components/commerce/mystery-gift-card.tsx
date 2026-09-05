"use client";

import Image from "next/image";
import { Gift } from "lucide-react";
import { MYSTERY_GIFT } from "@/lib/cart/mystery-gift";
import { formatPrice } from "@/lib/format";

export function MysteryGiftCard({
  selected,
  onToggle,
}: {
  selected: boolean;
  onToggle: (next: boolean) => void;
}) {
  return (
    <div
      className={`rounded-cozy border p-3 ${
        selected
          ? "border-forest-400 bg-forest-100/80"
          : "border-gold-300/70 bg-gradient-to-br from-cream-50 to-gold-200/40"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="relative size-14 shrink-0 overflow-hidden rounded-cozy border border-cream-300 bg-cream-100">
          <Image src={MYSTERY_GIFT.image} alt="" width={56} height={56} className="size-full object-cover" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink-900">
            <Gift className="size-3.5 text-burgundy-600" strokeWidth={1.8} />
            {MYSTERY_GIFT.name}
          </p>
          <p className="mt-0.5 text-[12px] leading-snug text-ink-600">{MYSTERY_GIFT.tagline}</p>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
            <span className="text-[12px] font-medium text-ink-400 line-through">
              {formatPrice(MYSTERY_GIFT.compareAtCents)}
            </span>
            <span className="text-sm font-bold text-burgundy-600">{formatPrice(MYSTERY_GIFT.priceCents)}</span>
          </p>
          <p className="mt-1 text-[12px] font-bold text-forest-500">
            {selected ? "Nemokamas pristatymas jau jūsų" : "+ Atrakinkite nemokamą pristatymą"}
          </p>
        </div>
        {selected ? (
          <button
            type="button"
            onClick={() => onToggle(false)}
            className="inline-flex min-h-11 shrink-0 items-center text-[12px] font-semibold text-ink-400 underline underline-offset-4 hover:text-burgundy-600"
          >
            ✕ Pašalinti
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onToggle(true)}
            className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-forest-400 bg-white px-3 text-[12px] font-bold text-forest-600 hover:bg-forest-100"
          >
            Pridėti
          </button>
        )}
      </div>
    </div>
  );
}
