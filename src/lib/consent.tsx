"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { loadTrackers } from "@/lib/analytics";

const STORAGE_KEY = "jaukumas.consent.v1";

export interface ConsentState {
  analytics: boolean;
  marketing: boolean;
  ts: number;
}

// Išorinė parduotuvė — hydratacija per useSyncExternalStore be efekty.
let consent: ConsentState | null = null;
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export const consentStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  get(): ConsentState | null {
    return consent;
  },
  init() {
    if (loaded) return;
    loaded = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ConsentState;
        if (typeof parsed.analytics === "boolean" && typeof parsed.marketing === "boolean") {
          consent = parsed;
        }
      }
    } catch {
      // traktuojame kaip nesuteiktą sutikimą
    }
    emit();
  },
  save(choice: { analytics: boolean; marketing: boolean }) {
    consent = { ...choice, ts: Date.now() };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch {
      // localStorage neprieinamas
    }
    loadTrackers(choice);
    emit();
  },
};

interface ConsentContextValue {
  consent: ConsentState | null;
  hydrated: boolean;
  managerOpen: boolean;
  openManager: () => void;
  closeManager: () => void;
  save: (choice: { analytics: boolean; marketing: boolean }) => void;
  rejectAll: () => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const value = useSyncExternalStore(consentStore.subscribe, consentStore.get, () => null);
  const hydrated = useSyncExternalStore(
    consentStore.subscribe,
    () => loaded,
    () => false
  );
  const [managerOpen, setManagerOpen] = useState(false);

  useEffect(() => {
    consentStore.init();
  }, []);

  const save = useCallback((choice: { analytics: boolean; marketing: boolean }) => {
    consentStore.save(choice);
    setManagerOpen(false);
  }, []);

  return (
    <ConsentContext.Provider
      value={useMemo(
        () => ({
          consent: value,
          hydrated,
          managerOpen,
          openManager: () => setManagerOpen(true),
          closeManager: () => setManagerOpen(false),
          save,
          rejectAll: () => save({ analytics: false, marketing: false }),
        }),
        [value, hydrated, managerOpen, save]
      )}
    >
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent turi būti naudojamas ConsentProvider viduje");
  return ctx;
}
