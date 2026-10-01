"use client";

import { useCallback, useEffect, useRef } from "react";
import { apiHeaders } from "@/lib/security/csrf-client";
import type { CartAddonSelection } from "@/lib/cart/addons";
import type { CartLine } from "@/types";

export function useCartReminders(email: string, lines: CartLine[], addons: CartAddonSelection, mysteryGift: boolean, paid: { current: boolean }) {
  const requests = useRef<Promise<unknown>>(Promise.resolve());
  const version = useRef(0);
  const timer = useRef<number | null>(null);
  const saved = useRef<string | null>(null);
  const payload = JSON.stringify({ email, lines, addons, mysteryGift });
  const captureNow = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    const currentVersion = version.current;
    const request = requests.current.catch(() => {}).then(async () => {
      if (paid.current || version.current !== currentVersion) return false;
      if (saved.current === payload) return true;
      const response = await fetch("/api/checkout/reminders", {
        method: "POST", headers: apiHeaders(), body: payload, keepalive: true,
      });
      if (!response.ok && response.status !== 503) console.warn("Cart reminder capture failed", response.status);
      if (response.ok) saved.current = payload;
      return response.ok;
    }).catch(() => false);
    requests.current = request;
    return request;
  }, [payload, paid]);
  useEffect(() => {
    ++version.current;
    timer.current = window.setTimeout(() => { void captureNow(); }, 800);
    return () => { if (timer.current !== null) window.clearTimeout(timer.current); };
  }, [captureNow]);
  return captureNow;
}
