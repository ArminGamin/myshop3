"use client";

import { useCallback, useEffect, useState } from "react";
import { useIsMobile } from "@/lib/mobile-chrome";

export function formatMmSs(total: number) {
  const sec = Math.max(0, Math.floor(total));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const RESERVE_KEY = "jaukumas.checkout-reserve.v2";
const RESERVE_MS_DESKTOP = 45 * 60 * 1000;
const RESERVE_MS_MOBILE = 20 * 60 * 1000;

export function useCheckoutReserve() {
  const isMobile = useIsMobile();
  const reserveMs = isMobile ? RESERVE_MS_MOBILE : RESERVE_MS_DESKTOP;
  const [seconds, setSeconds] = useState<number | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let end = Number(sessionStorage.getItem(RESERVE_KEY) || 0);
    if (!Number.isFinite(end) || end <= 0) {
      end = Date.now() + reserveMs;
      sessionStorage.setItem(RESERVE_KEY, String(end));
    }
    const tick = () => setSeconds(Math.max(0, Math.round((end - Date.now()) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [reserveMs, nonce]);

  const refresh = useCallback(() => {
    const end = Date.now() + reserveMs;
    sessionStorage.setItem(RESERVE_KEY, String(end));
    setNonce((n) => n + 1);
  }, [reserveMs]);

  return { seconds, expired: seconds === 0, refresh };
}
