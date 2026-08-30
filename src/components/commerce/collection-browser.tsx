"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import type { Product } from "@/types";
import { PRICE_RANGES } from "@/lib/data/collections";
import { ProductGrid } from "./product-card";

type SortId = "recommended" | "price-asc" | "price-desc" | "newest";

const sortLabels: Record<SortId, string> = {
  recommended: "Rekomenduojama",
  "price-asc": "Kaina: žemiausia",
  "price-desc": "Kaina: aukščiausia",
  newest: "Naujausios",
};

// Kolekcijos peržiūra su kainų filtrais ir rikiavimu.
export function CollectionBrowser({
  products,
  initialQuery,
}: {
  products: Product[];
  initialQuery?: string;
}) {
  const [range, setRange] = useState<string | null>(null);
  const [sort, setSort] = useState<SortId>("recommended");

  const visible = useMemo(() => {
    let list = products;
    if (range) {
      const test = PRICE_RANGES.find((r) => r.id === range)?.test;
      if (test) list = list.filter(test);
    }
    switch (sort) {
      case "price-asc":
        return [...list].sort((a, b) => a.priceCents - b.priceCents);
      case "price-desc":
        return [...list].sort((a, b) => b.priceCents - a.priceCents);
      case "newest":
        return [...list].sort(
          (a, b) => Number(b.isNew) - Number(a.isNew) || Number(b.bestseller) - Number(a.bestseller)
        );
      default:
        return [...list].sort(
          (a, b) => Number(b.bestseller) - Number(a.bestseller)
        );
    }
  }, [products, range, sort]);

  // Iš testų atėję filtrai (?recipient=... ir kt.)
  void initialQuery;

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:mb-6">
        <span className="flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wide text-ink-400">
          <SlidersHorizontal className="size-4" /> Filtruoti:
        </span>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          <FilterChip active={range === null} onClick={() => setRange(null)}>
            Visos
          </FilterChip>
          {PRICE_RANGES.map((r) => (
            <FilterChip key={r.id} active={range === r.id} onClick={() => setRange(r.id)}>
              {r.label}
            </FilterChip>
          ))}
        </div>

        <label className="flex w-full items-center gap-2 text-sm text-ink-600 sm:ml-auto sm:w-auto">
          Rikiuoti
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortId)}
            className="min-h-11 flex-1 rounded-full border border-cream-400 bg-white px-3 py-2 text-base font-semibold text-ink-900 outline-none focus:border-gold-500 sm:flex-none sm:text-sm"
          >
            {Object.entries(sortLabels).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="py-16 text-center font-display text-xl text-ink-600">
          Šiame filtre prekių nėra — pabandykite kitą diapazoną.
        </p>
      ) : (
        <ProductGrid products={visible} />
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-10 shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition ${
        active
          ? "border-burgundy-600 bg-burgundy-600 text-cream-50"
          : "border-cream-400 bg-white text-ink-600 hover:border-burgundy-600/50"
      }`}
    >
      {children}
    </button>
  );
}
