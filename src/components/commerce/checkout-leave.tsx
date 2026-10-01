"use client";

import { useEffect, useRef } from "react";
import { Gift, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartExitPreview } from "./cart-exit-preview";
import { CheckoutReviews } from "./reviews-marquee";

export function CheckoutLeave({ open, onStay, onLeave }: { open: boolean; onStay: () => void; onLeave: () => void }) {
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.focus({ preventScroll: true });
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        onStay();
      } else if (event.key === "Tab") {
        const targets = dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), a[href]');
        if (!targets?.length) return;
        const first = targets[0];
        const last = targets[targets.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener("keydown", onKey, true);
    return () => { document.removeEventListener("keydown", onKey, true); previous?.focus({ preventScroll: true }); };
  }, [open, onStay]);

  if (!open) return null;

  return (
    <div className="pointer-events-auto fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-forest-700/45 backdrop-blur-[2px]" onClick={onStay} aria-hidden />
      <div ref={dialog} role="dialog" tabIndex={-1} aria-modal="true" aria-labelledby="checkout-leave-title" className="relative max-h-[92dvh] w-full max-w-xl overflow-y-auto overflow-x-hidden rounded-cozy border border-gold-300/60 bg-cream-50 px-5 py-6 text-center shadow-lift outline-none sm:px-7 sm:py-8">
        <button type="button" onClick={onStay} aria-label="Uždaryti" className="absolute right-2 top-2 flex size-11 items-center justify-center rounded-full text-ink-600 hover:bg-cream-200"><X className="size-5" /></button>
        <span className="mx-auto flex size-16 items-center justify-center rounded-full border border-gold-400 bg-gold-200 text-burgundy-600"><Gift className="size-7" strokeWidth={1.6} /></span>
        <h2 id="checkout-leave-title" className="mt-4 font-display text-2xl font-bold text-ink-900">Jūsų dovanos dar laukia</h2>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink-600">Užbaikite užsakymą arba išsaugokite krepšelį, kad galėtumėte grįžti vėliau.</p>
        <CartExitPreview />
        <Button type="button" size="lg" className="relative mt-5 min-h-14 w-full text-lg font-extrabold" onClick={onStay}>Tęsti užsakymą →</Button>
        <button type="button" onClick={onLeave} className="mx-auto mt-2 block min-h-11 w-full px-3 text-sm font-medium text-ink-600 underline underline-offset-4 hover:text-burgundy-600">Grįžti į parduotuvę</button>
        <div className="mt-3 text-left"><CheckoutReviews /></div>
      </div>
    </div>
  );
}
