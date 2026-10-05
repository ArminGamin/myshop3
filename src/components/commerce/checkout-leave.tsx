"use client";

import { useEffect, useRef } from "react";
import { Gift, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartExitPreview } from "./cart-exit-preview";
import { CheckoutReviews } from "./reviews-marquee";
import { HeroGarland } from "@/components/layout/hero-garland";

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
      <div className="leave-backdrop absolute inset-0 bg-forest-700/55 backdrop-blur-[3px]" onClick={onStay} aria-hidden />
      <div ref={dialog} role="dialog" tabIndex={-1} aria-modal="true" aria-labelledby="checkout-leave-title" className="leave-dialog relative max-h-[92dvh] w-full max-w-xl overflow-y-auto overflow-x-hidden rounded-[1.4rem] border border-gold-300/70 bg-cream-50 text-center shadow-lift outline-none">
        <div className="leave-hero relative overflow-hidden px-5 pb-8 pt-14 sm:px-8 sm:pt-16">
          <HeroGarland />
          <div aria-hidden className="leave-hero-glow" />
          <button type="button" onClick={onStay} aria-label="Uždaryti" className="absolute right-2 top-2 z-[2] flex size-11 items-center justify-center rounded-full text-cream-50 transition hover:bg-white/15"><X className="size-5" /></button>
          <span className="leave-gift relative mx-auto flex size-[4.5rem] items-center justify-center rounded-full text-burgundy-700">
            <Gift className="relative z-[1] size-8" strokeWidth={1.6} />
            <span aria-hidden className="leave-spark leave-spark-1" />
            <span aria-hidden className="leave-spark leave-spark-2" />
            <span aria-hidden className="leave-spark leave-spark-3" />
          </span>
          <h2 id="checkout-leave-title" className="relative mt-5 font-display text-[2rem] font-bold leading-[1.05] text-cream-50 sm:text-[2.35rem]">
            Jūsų dovanos <em className="font-semibold text-gold-300">dar laukia</em>
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-[15px] font-medium leading-relaxed text-cream-100/90">Užbaikite užsakymą arba išsaugokite krepšelį, kad galėtumėte grįžti vėliau.</p>
        </div>
        <div className="px-5 pb-6 sm:px-7 sm:pb-8">
          <div className="leave-cart -mt-4">
            <CartExitPreview />
          </div>
          <Button type="button" size="lg" className="hero-cta relative mt-5 min-h-14 w-full text-lg font-extrabold" onClick={onStay}>Tęsti užsakymą →</Button>
          <button type="button" onClick={onLeave} className="mx-auto mt-2 block min-h-11 w-full px-3 text-sm font-medium text-ink-600 underline underline-offset-4 hover:text-burgundy-600">Grįžti į parduotuvę</button>
          <div className="mt-3 text-left"><CheckoutReviews /></div>
        </div>
      </div>
    </div>
  );
}
