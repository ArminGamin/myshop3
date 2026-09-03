"use client";

import { useEffect, useState } from "react";
import { useConsent } from "@/lib/consent";
import { useMobileChromeFlag } from "@/lib/mobile-chrome";
import { useMotionReady } from "@/lib/motion";
import { Button } from "@/components/ui/button";

export function CookieBanner() {
  const { consent, hydrated, save, rejectAll, managerOpen, closeManager } = useConsent();
  const motionReady = useMotionReady();
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!motionReady) return;
    const timer = window.setTimeout(() => setEntered(true), 900);
    return () => clearTimeout(timer);
  }, [motionReady]);

  const isManager = Boolean(consent);
  const shouldRender = hydrated && (!consent || managerOpen);
  const bannerVisible = shouldRender && (isManager || entered);
  useMobileChromeFlag("cookieBanner", bannerVisible);

  if (!shouldRender) return null;

  return (
    <div
      role="dialog"
      aria-label="Slapukų nustatymai"
      data-mobile-cookie=""
      className={`fixed inset-x-2 z-[90] mx-auto max-w-xl rounded-cozy border border-cream-300 bg-cream-50 p-4 shadow-lift transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:inset-x-6 sm:p-5 ${
        bannerVisible
          ? "bottom-[max(0.75rem,env(safe-area-inset-bottom))] translate-y-0 opacity-100 sm:bottom-6"
          : "pointer-events-none bottom-[max(0.75rem,env(safe-area-inset-bottom))] translate-y-2 opacity-0 sm:bottom-6"
      }`}
    >
      <p className="font-display text-lg font-semibold text-ink-900">🍪 Slapukų nustatymai</p>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-600">
        Būtinieji slapukai užtikrina parduotuvės darbą (krepšelis, atsisakymų atmintis).
        Statistikos ir rinkodaros slapukus naudojame tik su jūsų sutikimu.{" "}
        <a href="/slapuku-politika" className="font-semibold text-burgundy-600 underline underline-offset-2">
          Slapukų politika
        </a>
      </p>
      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
        <Button
          onClick={() => {
            save({ analytics: true, marketing: true });
            closeManager();
          }}
          className="min-h-11 flex-1"
        >
          Priimti viską
        </Button>
        {isManager ? (
          <Button variant="secondary" className="min-h-11 flex-1" onClick={closeManager}>
            Uždaryti
          </Button>
        ) : (
          <Button
            variant="secondary"
            className="min-h-11 flex-1"
            onClick={() => {
              rejectAll();
              closeManager();
            }}
          >
            Tik būtinieji
          </Button>
        )}
      </div>
    </div>
  );
}
