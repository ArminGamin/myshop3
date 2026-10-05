"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Clock, Search, Sparkles, TrendingUp, X } from "lucide-react";
import { searchProducts } from "@/lib/search";
import { bestsellers } from "@/lib/data/products";
import { store } from "@/lib/config/store.config";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types";
import { ProductImage } from "@/components/commerce/product-art";
import { track } from "@/lib/analytics";
import { usePresence } from "@/lib/motion";

const RECENT_KEY = "jaukumas.recent-searches.v1";
const trending = bestsellers()
  .filter((p) => p.images.length > 0)
  .slice(0, 4);

function giftWord(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "dovana";
  if (mod10 >= 2 && mod10 <= 9 && (mod100 < 11 || mod100 > 19)) return "dovanos";
  return "dovanų";
}

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

  const trimmed = query.trim();

  return (
    <div className="pointer-events-none fixed inset-0 z-[80]">
      <div
        className={`overlay-backdrop absolute inset-0 bg-forest-700/55 backdrop-blur-[3px] ${visible ? "is-visible" : ""}`}
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Paieška"
        className={`overlay-panel overlay-panel-up absolute inset-x-0 top-0 mx-auto max-w-3xl p-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:p-6 ${visible ? "is-visible" : ""}`}
      >
        <div className="search-shell overflow-hidden rounded-[1.4rem]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch(query);
            }}
            className="flex items-center gap-2 p-3 sm:gap-3 sm:p-4"
          >
            <label className="search-field flex min-w-0 flex-1 items-center gap-2.5 rounded-full px-1.5 sm:gap-3">
              <span aria-hidden className="search-field-icon">
                <Search className="size-[1.15rem]" strokeWidth={2} />
              </span>
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ieškokite: žvakė, pledas, dovana mamai…"
                aria-label="Paieškos frazė"
                className="search-input h-12 min-w-0 flex-1 bg-transparent text-base font-medium text-ink-900 placeholder:text-ink-400 sm:h-14 sm:text-[17px]"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  aria-label="Išvalyti paiešką"
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-ink-400 transition hover:bg-cream-200 hover:text-ink-900"
                >
                  <X className="size-4" strokeWidth={2} />
                </button>
              ) : null}
            </label>
            <button
              type="button"
              onClick={onClose}
              aria-label="Uždaryti paiešką"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-ink-600 transition hover:bg-cream-200 hover:text-ink-900"
            >
              <X className="block size-5 shrink-0" strokeWidth={1.8} />
            </button>
          </form>

          <div className="max-h-[66dvh] overflow-y-auto px-3 pb-4 sm:px-5 sm:pb-5">
            {results === null ? (
              <div className="space-y-6 px-1 pt-1">
                {recent.length > 0 ? (
                  <div>
                    <p className="search-label">
                      <Clock className="size-3.5" /> Paskutinės paieškos
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recent.map((term) => (
                        <button key={term} type="button" onClick={() => submitSearch(term)} className="search-chip search-chip-recent">
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div>
                  <p className="search-label">
                    <TrendingUp className="size-3.5" /> Populiarios paieškos
                  </p>
                  <div className="search-chips -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
                    {store.search.popularQueries.map((term) => (
                      <button key={term} type="button" onClick={() => setQuery(term)} className="search-chip">
                        <Search aria-hidden className="size-3.5 opacity-55" strokeWidth={2} />
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
                {trending.length > 0 ? (
                  <div>
                    <p className="search-label">
                      <Sparkles className="size-3.5" /> Dažniausiai perkama
                    </p>
                    <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
                      {trending.map((product) => (
                        <li key={product.slug}>
                          <Link href={`/produktai/${product.slug}`} onClick={onClose} className="search-pick group">
                            <span className="search-pick-media">
                              <ProductImage
                                fill
                                images={product.images}
                                seed={product.artSeed}
                                alt=""
                                size="card"
                                sizes="(min-width: 640px) 10rem, 45vw"
                                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                              />
                            </span>
                            <span className="mt-2 line-clamp-2 text-[13px] font-semibold leading-snug text-ink-900 transition group-hover:text-burgundy-600">
                              {product.name}
                            </span>
                            <span className="font-display text-[1.05rem] font-bold text-burgundy-600">
                              {formatPrice(product.priceCents)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : results.length === 0 ? (
              <EmptySearch query={query} onClose={onClose} />
            ) : (
              <>
                <p className="search-label px-1 pt-1">
                  Rasta {results.length} {giftWord(results.length)}
                </p>
                <ul className="space-y-1">
                  {results.map((product) => (
                    <li key={product.slug}>
                      <Link
                        href={`/produktai/${product.slug}`}
                        onClick={() => {
                          track("search", { search_term: query });
                          onClose();
                        }}
                        className="search-row group"
                      >
                        <ProductImage images={product.images} seed={product.artSeed} alt="" size="thumb" className="size-14 shrink-0 rounded-[0.85rem] object-cover sm:size-16" />
                        <span className="min-w-0 flex-1">
                          <span className="line-clamp-2 text-[14.5px] font-semibold leading-snug text-ink-900 transition group-hover:text-burgundy-600">
                            <Highlight text={product.name} term={trimmed} />
                          </span>
                          <span className="block truncate text-[13px] text-ink-600">{product.tagline}</span>
                          <span className="mt-0.5 block font-display text-[1.05rem] font-bold text-burgundy-600 sm:hidden">
                            {formatPrice(product.priceCents)}
                          </span>
                        </span>
                        <span className="hidden shrink-0 font-display text-[1.2rem] font-bold text-burgundy-600 sm:block">
                          {formatPrice(product.priceCents)}
                        </span>
                        <span aria-hidden className="search-row-go">
                          <ArrowUpRight className="size-4" strokeWidth={2} />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={() => submitSearch(query)} className="search-all">
                  Rodyti visus rezultatus
                  <ArrowRight className="size-4" strokeWidth={2} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Paryškina įvestą frazę prekės pavadinime.
function Highlight({ text, term }: { text: string; term: string }) {
  if (term.length < 2) return <>{text}</>;
  const index = text.toLowerCase().indexOf(term.toLowerCase());
  if (index < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark className="search-mark">{text.slice(index, index + term.length)}</mark>
      {text.slice(index + term.length)}
    </>
  );
}

function EmptySearch({ query, onClose }: { query: string; onClose: () => void }) {
  return (
    <div className="px-5 pb-6 pt-4 text-center">
      <span aria-hidden className="search-empty-icon">
        <Search className="size-6" strokeWidth={1.6} />
      </span>
      <p className="mt-4 font-display text-[1.6rem] font-bold leading-tight text-ink-900">Nieko neradome</p>
      <p className="mx-auto mt-1.5 max-w-xs text-sm leading-relaxed text-ink-600">
        „{query}“ tokios prekės neturime. Bet tikrai turime jaukią dovaną:
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link
          href="/rask-dovana"
          onClick={onClose}
          className="cta-fill inline-flex min-h-11 items-center rounded-full px-5 py-2.5 text-sm font-bold text-cream-50"
        >
          Rasti dovaną →
        </Link>
        <Link
          href="/dovanos/bestselleriai"
          onClick={onClose}
          className="inline-flex min-h-11 items-center rounded-full border border-cream-300 bg-white/70 px-5 py-2.5 text-sm font-semibold text-ink-900 transition hover:border-gold-400"
        >
          Bestselleriai
        </Link>
      </div>
    </div>
  );
}
