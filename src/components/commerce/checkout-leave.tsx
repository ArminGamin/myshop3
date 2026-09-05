"use client";

import { useEffect, useState } from "react";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { store } from "@/lib/config/store.config";
import { MYSTERY_GIFT } from "@/lib/cart/mystery-gift";
import { formatPrice } from "@/lib/format";
import { CheckoutReviews } from "./reviews-marquee";

export function formatMmSs(total: number) {
  const sec = Math.max(0, Math.floor(total));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const RESERVE_KEY = "jaukumas.checkout-reserve.v1";
const RESERVE_MS = 45 * 60 * 1000;

export function useCheckoutReserve(active: boolean) {
  const [left, setLeft] = useState(45 * 60);

  useEffect(() => {
    if (!active) return;
    let end = Number(sessionStorage.getItem(RESERVE_KEY) || 0);
    if (!Number.isFinite(end) || end < Date.now()) {
      end = Date.now() + RESERVE_MS;
      sessionStorage.setItem(RESERVE_KEY, String(end));
    }
    const tick = () => setLeft(Math.max(0, Math.round((end - Date.now()) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [active]);

  return left;
}

function buyersNow() {
  return 4 + Math.floor(Math.random() * 14);
}

export function CheckoutLeave({
  open,
  onStay,
  onLeave,
}: {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
}) {
  const [seconds, setSeconds] = useState(300);
  const [buyers, setBuyers] = useState(6);

  useEffect(() => {
    if (!open) return;
    setSeconds(300);
    setBuyers(buyersNow());
    const tick = window.setInterval(() => {
      setSeconds((n) => (n > 0 ? n - 1 : 0));
    }, 1000);
    const crowd = window.setInterval(() => setBuyers(buyersNow()), 10 * 60 * 1000);
    return () => {
      window.clearInterval(tick);
      window.clearInterval(crowd);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopImmediatePropagation();
      onStay();
    }
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open, onStay]);

  if (!open) return null;

  return (
    <div className="pointer-events-auto fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-forest-700/45 backdrop-blur-[2px]" onClick={onStay} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-leave-title"
        className="relative max-h-[92dvh] w-full max-w-xl overflow-y-auto overflow-x-hidden rounded-cozy border border-gold-300/60 bg-cream-50 px-7 py-8 text-center shadow-lift"
      >
        <div className="checkout-leave-confetti pointer-events-none absolute inset-x-0 top-0 h-28 overflow-hidden" aria-hidden>
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} />
          ))}
        </div>

        <span className="relative mx-auto flex size-16 items-center justify-center rounded-full border border-gold-400 bg-gold-200 text-burgundy-600">
          <Gift className="size-7" strokeWidth={1.6} />
        </span>
        <h2 id="checkout-leave-title" className="relative mt-4 font-display text-2xl font-bold text-ink-900">
          Beveik baigta!
        </h2>
        <p className="relative mx-auto mt-3 max-w-md text-[15px] font-semibold leading-relaxed text-ink-600">
          Jūsų <strong className="font-extrabold text-burgundy-600">{MYSTERY_GIFT.name}</strong> jau rezervuotas, o
          pristatymas dabar <strong className="font-extrabold text-forest-500">nemokamas</strong>. Sutaupote{" "}
          {formatPrice(store.shipping.flatRateCents)}. Išėjus viskas bus anuliuota po{" "}
          <strong className="font-mono font-extrabold text-burgundy-600">{formatMmSs(seconds)}</strong>.
        </p>

        <Button type="button" autoFocus size="lg" className="cta-flash relative mt-6 min-h-14 w-full text-lg font-extrabold sm:min-h-16 sm:text-xl" onClick={onStay}>
          Noriu savo dovanos →
        </Button>
        <button
          type="button"
          onClick={onLeave}
          className="relative mx-auto mt-3 block w-full rounded-cozy bg-forest-700 px-3 py-1.5 text-[10px] font-semibold tracking-wide text-cream-100/45"
        >
          Ačiū, man nereikia
        </button>

        <div className="relative mt-6 flex items-center justify-center gap-3 border-t border-cream-300 pt-4">
          <span className="flex -space-x-2" aria-hidden>
            <span className="size-7 rounded-full border-2 border-cream-50 bg-burgundy-500" />
            <span className="size-7 rounded-full border-2 border-cream-50 bg-forest-500" />
            <span className="size-7 rounded-full border-2 border-cream-50 bg-gold-500" />
          </span>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-400">
            Šiuo metu perka dar {buyers} žmonės
          </p>
        </div>

        <div className="text-left">
          <CheckoutReviews />
        </div>
      </div>
    </div>
  );
}
