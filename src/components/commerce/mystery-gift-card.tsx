"use client";

import Image from "next/image";
import { Gift } from "lucide-react";
import { MYSTERY_GIFT } from "@/lib/cart/mystery-gift";
import { formatPrice } from "@/lib/format";

export function MysteryGiftCard({
  selected,
  onToggle,
  shippingUnlock = true,
}: {
  selected: boolean;
  onToggle: (next: boolean) => void;
  shippingUnlock?: boolean;
}) {
  return (
    <div
      className={`rounded-cozy border p-4 ${
        selected
          ? "border-burgundy-400 bg-burgundy-100/50"
          : "border-gold-300/70 bg-gradient-to-br from-cream-50 to-gold-200/40"
      }`}
    >
      <div className="grid grid-cols-[3rem_minmax(0,1fr)] items-start gap-3 sm:flex sm:gap-4">
        <span className="relative size-12 shrink-0 overflow-hidden rounded-[12px] border border-cream-300 bg-cream-100 sm:size-16">
          <Image src={MYSTERY_GIFT.image} alt="" width={64} height={64} className="size-full object-cover" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-base font-semibold text-ink-900">
            <Gift className="size-3.5 text-burgundy-600" strokeWidth={1.8} />
            {MYSTERY_GIFT.name}
          </p>
          <p className="mt-0.5 text-sm leading-snug text-ink-600">{MYSTERY_GIFT.tagline}</p>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
            <span className="num text-sm font-medium text-ink-400 line-through">
              {formatPrice(MYSTERY_GIFT.compareAtCents)}
            </span>
            <span className="num text-base font-bold text-burgundy-700">{formatPrice(MYSTERY_GIFT.priceCents)}</span>
          </p>
          {shippingUnlock ? (
            <p className="mt-1 text-sm font-bold text-burgundy-700">
              {selected ? "Nemokamas pristatymas jau jūsų" : "+ Atrakinkite nemokamą pristatymą"}
            </p>
          ) : null}
        </div>
        {selected ? (
          <button
            type="button"
            onClick={() => onToggle(false)}
            className="col-span-2 inline-flex min-h-11 shrink-0 items-center justify-center text-sm font-semibold text-ink-400 underline underline-offset-4 hover:text-burgundy-600"
          >
            ✕ Pašalinti
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onToggle(true)}
            className="col-span-2 inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-burgundy-500 bg-white px-3 text-sm font-bold text-burgundy-700 hover:bg-burgundy-100"
          >
            Pridėti
          </button>
        )}
      </div>
    </div>
  );
}
