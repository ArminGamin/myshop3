"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { searchProducts } from "@/lib/search";
import { bestsellers } from "@/lib/data/products";
import { store } from "@/lib/config/store.config";
import { ProductGrid } from "@/components/commerce/product-card";
import { track } from "@/lib/analytics";

function SearchResults() {
  const params = useSearchParams();
  const q = (params.get("q") ?? "").trim();
  const results = useMemo(() => searchProducts(q), [q]);

  useEffect(() => {
    if (q.length >= 2) track("search", { search_term: q });
  }, [q]);

  if (q.length < 2) {
    return (
      <div className="py-10 text-center">
        <p className="font-display text-xl font-semibold text-ink-900">
          Įrašykite, ko ieškote
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {store.search.popularQueries.map((term) => (
            <Link
              key={term}
              href={`/paieska?q=${encodeURIComponent(term)}`}
              className="rounded-full border border-cream-400 bg-white px-4 py-2 text-sm font-medium text-ink-600 hover:border-gold-400"
            >
              {term}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="py-10">
        <p className="text-center font-display text-xl font-semibold text-ink-900">
          Nieko neradome 😕
        </p>
        <p className="mx-auto mt-2 max-w-sm text-center text-sm leading-relaxed text-ink-600">
          „{q}“ — tokios prekės neturime, bet šie bestselleriai džiugina beveik visus:
        </p>
        <div className="mt-8">
          <ProductGrid products={bestsellers().slice(0, 4)} />
        </div>
        <p className="mt-8 text-center">
          <Link
            href="/rask-dovana"
            className="inline-flex min-h-11 items-center rounded-full bg-burgundy-600 px-6 text-sm font-semibold text-cream-50 hover:bg-burgundy-700"
          >
            Arba atlikite dovanų testą →
          </Link>
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="mb-6 text-sm text-ink-600">
        Rezultatai frazei <strong>„{q}“</strong>: {results.length}
      </p>
      <ProductGrid products={results} />
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <h1 className="mb-6 font-display text-[1.75rem] font-semibold text-ink-900 sm:mb-8 sm:text-3xl">Paieška</h1>
      <Suspense fallback={<div className="skeleton h-64 rounded-cozy" />}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
