"use client";

import { useConsent } from "@/lib/consent";
import { Button } from "@/components/ui/button";

// GDPR slapukų sutikimo juosta / nustatymų langas.
// Analitikos ir rinkodaros skriptai įkeliami TIK gavus sutikimą.
export function CookieBanner() {
  const { consent, hydrated, save, rejectAll, managerOpen, closeManager } = useConsent();

  if (!hydrated) return null;
  if (consent && !managerOpen) return null;

  const isManager = Boolean(consent);

  return (
    <div
      role="dialog"
      aria-label="Slapukų nustatymai"
      className={`fixed inset-x-3 z-[90] mx-auto max-w-xl rounded-cozy border border-cream-300 bg-cream-50 p-4 shadow-lift sm:inset-x-6 sm:p-5 ${
        isManager
          ? "bottom-[max(0.75rem,env(safe-area-inset-bottom))] sm:bottom-6"
          : "animate-fade-up bottom-[max(0.75rem,env(safe-area-inset-bottom))] sm:bottom-6"
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
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button
          onClick={() => {
            save({ analytics: true, marketing: true });
            closeManager();
          }}
          className="flex-1"
          size="sm"
        >
          Priimti viską
        </Button>
        {isManager ? (
          <Button variant="secondary" size="sm" className="flex-1" onClick={closeManager}>
            Uždaryti
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
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
