"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Clock, Search, X } from "lucide-react";
import { searchProducts } from "@/lib/search";
import { store } from "@/lib/config/store.config";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types";
import { ProductArt } from "@/components/commerce/product-art";
import { track } from "@/lib/analytics";
import { usePresence } from "@/lib/motion";

const RECENT_KEY = "jaukumas.recent-searches.v1";

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[] | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { mounted, visible } = usePresence(open);

  useEffect(() => {
    if (!mounted || !visible) return;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    const t = setTimeout(() => {
      try {
        const raw = localStorage.getItem(RECENT_KEY);
        if (raw) setRecent(JSON.parse(raw).slice(0, 4));
      } catch {
        // nepaisome
      }
    }, 0);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, [mounted, visible]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (query.trim().length < 2) {
      const t = setTimeout(() => setResults(null), 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setResults(searchProducts(query));
    }, 180);
    return () => clearTimeout(t);
  }, [query]);

  function submitSearch(term: string) {
    const q = term.trim();
    if (q.length < 2) return;
    track("search", { search_term: q });
    try {
      const next = [q, ...recent.filter((r) => r !== q)].slice(0, 6);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      // nepaisome
    }
    router.push(`/paieska?q=${encodeURIComponent(q)}`);
    onClose();
  }

  if (!mounted) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[80]">
      <div
        className={`overlay-backdrop absolute inset-0 bg-ink-900/45 ${visible ? "is-visible" : ""}`}
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Paieška"
        className={`overlay-panel overlay-panel-up absolute inset-x-0 top-0 mx-auto max-w-2xl p-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:p-5 ${visible ? "is-visible" : ""}`}
      >
        <div className="overflow-hidden rounded-cozy bg-cream-50 shadow-lift">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch(query);
            }}
            className="flex items-center gap-2 border-b border-cream-300/70 px-3 py-2"
          >
            <Search className="ml-1 size-5 shrink-0 text-ink-400" strokeWidth={1.8} />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ieškokite: žvakė, pledas, dovana mamai…"
              aria-label="Paieškos frazė"
              className="h-12 w-full bg-transparent text-base text-ink-900 outline-none placeholder:text-ink-400"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Uždaryti paiešką"
              className="inline-flex size-11 items-center justify-center rounded-full hover:bg-cream-200"
            >
              <X className="block size-5 shrink-0" strokeWidth={1.8} />
            </button>
          </form>

          <div className="max-h-[62dvh] overflow-y-auto p-3">
            {results === null ? (
              <div className="p-2">
                {recent.length > 0 ? (
                  <>
                    <p className="mb-2 flex items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wide text-ink-400">
                      <Clock className="size-3.5" /> Paskutinės paieškos
                    </p>
                    <div className="mb-4 flex flex-wrap gap-1.5">
                      {recent.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => submitSearch(term)}
                          className="inline-flex min-h-11 items-center rounded-full bg-cream-200 px-4 py-2 text-sm font-medium text-ink-900 transition hover:bg-cream-300"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </>
                ) : null}
                <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-ink-400">
                  Populiarios paieškos
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {store.search.popularQueries.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setQuery(term)}
                      className="inline-flex min-h-11 items-center rounded-full border border-cream-300 bg-white/60 px-4 py-2 text-sm font-medium text-ink-600 transition hover:border-gold-400 hover:text-burgundy-600"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            ) : results.length === 0 ? (
              <EmptySearch query={query} onClose={onClose} />
            ) : (
              <ul className="space-y-0.5">
                {results.map((product) => (
                  <li key={product.slug}>
                    <Link
                      href={`/produktai/${product.slug}`}
                      onClick={() => {
                        track("search", { search_term: query });
                        onClose();
                      }}
                      className="flex items-center gap-3 rounded-cozy p-2 transition hover:bg-cream-200/70"
                    >
                      <ProductArt seed={product.artSeed} size="thumb" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14.5px] font-semibold text-ink-900">
                          {product.name}
                        </span>
                        <span className="block truncate text-[13px] text-ink-600">
                          {product.tagline}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-bold text-burgundy-600">
                        {formatPrice(product.priceCents)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptySearch({ query, onClose }: { query: string; onClose: () => void }) {
  return (
    <div className="p-5 text-center">
      <p className="font-display text-lg font-semibold text-ink-900">Nieko neradome 😕</p>
      <p className="mx-auto mt-1 max-w-xs text-sm leading-relaxed text-ink-600">
        „{query}“ tokios prekės neturime. Bet tikrai turime jaukią dovaną:
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Link
          href="/rask-dovana"
          onClick={onClose}
          className="rounded-full bg-burgundy-600 px-4 py-2.5 text-sm font-semibold text-cream-50 hover:bg-burgundy-700"
        >
          Rasti dovaną →
        </Link>
        <Link
          href="/dovanos/bestselleriai"
          onClick={onClose}
          className="rounded-full border border-cream-300 bg-white/60 px-4 py-2.5 text-sm font-semibold text-ink-900 hover:border-gold-400"
        >
          Bestselleriai
        </Link>
      </div>
    </div>
  );
}
