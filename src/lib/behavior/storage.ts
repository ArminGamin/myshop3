"use client";

import { useCallback, useSyncExternalStore } from "react";

// ─── Mažas pub-sub localStorage parduotuvių pagrindas ───────────

function createStore<T>(key: string, fallback: T, validate: (v: unknown) => v is T) {
  let value: T = fallback;
  let loaded = false;
  const listeners = new Set<() => void>();

  function load() {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (validate(parsed)) value = parsed;
      }
    } catch {
      // nepaisome
    }
  }

  function persist() {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // nepaisome
    }
  }

  return {
    get(): T {
      load();
      return value;
    },
    set(next: T) {
      value = next;
      loaded = true;
      persist();
      listeners.forEach((l) => l());
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === "string");

const EMPTY_SLUGS: string[] = [];

// ─── Pageidavimų sąrašas ────────────────────────────────────────

const wishlistStore = createStore<string[]>("jaukumas.wishlist.v1", EMPTY_SLUGS, isStringArray);

export function useWishlist() {
  const items = useSyncExternalStore(wishlistStore.subscribe, wishlistStore.get, wishlistStore.get);

  const toggle = useCallback((slug: string) => {
    const current = wishlistStore.get();
    const next = current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [...current, slug];
    wishlistStore.set(next);
    return next.includes(slug);
  }, []);

  return { items, toggle, has: (slug: string) => items.includes(slug) };
}

// ─── Neseniai peržiūrėtos prekės ───────────────────────────────

const recentStore = createStore<string[]>("jaukumas.recent.v1", EMPTY_SLUGS, isStringArray);

export function pushRecentlyViewed(slug: string) {
  if (!slug) return;
  const current = recentStore.get().filter((s) => s !== slug);
  recentStore.set([slug, ...current].slice(0, 8));
}

export function useRecentlyViewed(excludeSlug?: string) {
  return useSyncExternalStore(recentStore.subscribe, recentStore.get, recentStore.get).filter(
    (s) => s !== excludeSlug
  );
}
