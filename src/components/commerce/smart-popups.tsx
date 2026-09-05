"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { store, flags } from "@/lib/config/store.config";
import { countOf, useCart } from "@/lib/cart/context";
import { useExitIntent } from "@/lib/behavior/use-exit-intent";
import { track } from "@/lib/analytics";
import { useConsent } from "@/lib/consent";
import { usePresence } from "@/lib/motion";
import { apiHeaders } from "@/lib/security/csrf-client";
import { isAllowedEmail } from "@/lib/security/email";

type PopupKind = "welcome" | "exit-cart" | "exit-quiz" | null;

const DISMISS_KEY = "jaukumas.popup-dismissed.v1";

function readDismissed(): number | null {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    return raw ? Number(raw) : null;
  } catch {
    return null;
  }
}

function writeDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    /* neprieinama */
  }
}

// Elgsenos iššokančių langų variklis su prioritetų sistema:
// 1. krepšelio ketinimas  2. išeinantis ketinimas  3. el. pašto gavimas.
// Vienas didelis pertraukimas per sesiją, vėsinimo laikotarpis tarp sesijų.
export function SmartPopups() {
  const cart = useCart();
  const { consent, hydrated } = useConsent();
  const [kind, setKind] = useState<PopupKind>(null);
  const shownRef = useRef(false);
  const hydratedRef = useRef(cart.hydrated);

  useEffect(() => {
    hydratedRef.current = cart.hydrated;
  }, [cart.hydrated]);

  const eligible = useCallback((): PopupKind => {
    if (!flags.ENABLE_POPUP) return null;
    if (!hydrated || !consent) return null;
    if (sessionStorage.getItem("jaukumas.popup-shown")) return null;
    const dismissedAt = readDismissed();
    if (dismissedAt && Date.now() - dismissedAt < store.popups.cooldownHours * 3_600_000)
      return null;
    return "pending" as unknown as PopupKind;
  }, [hydrated, consent]);

  const show = useCallback((candidate: Exclude<PopupKind, null>) => {
    if (shownRef.current || !eligible()) return;
    shownRef.current = true;
    sessionStorage.setItem("jaukumas.popup-shown", "1");
    setKind(candidate);
    track("popup_view", { popup_type: candidate });
  }, [eligible]);

  // Išėjimo ketinimas
  useExitIntent(
    flags.ENABLE_EXIT_INTENT
      ? () => {
          const withCart = hydratedRef.current && countOf(cart.lines) > 0;
          show(withCart ? "exit-cart" : "exit-quiz");
        }
      : () => {}
  );

  // Laiko / slinkimo trigeriai — el. pašto pasisveikinimui
  useEffect(() => {
    if (!flags.ENABLE_POPUP || !flags.ENABLE_EMAIL_CAPTURE) return;
    let done = false;
    function tryShow() {
      if (done || shownRef.current || !eligible()) return;
      const seenBefore = localStorage.getItem("jaukumas.visited-before");
      done = true;
      show(seenBefore ? "welcome" : "welcome");
    }

    const timer = setTimeout(tryShow, store.popups.timerSeconds * 1000);

    function onScroll() {
      const doc = document.documentElement;
      const percent =
        ((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100 || 0;
      if (percent >= store.popups.scrollPercent) tryShow();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [show, eligible]);

  useEffect(() => {
    try {
      localStorage.setItem("jaukumas.visited-before", String(Date.now()));
    } catch {
      /* neprieinama */
    }
  }, []);

  function dismiss() {
    writeDismissed();
    setKind(null);
  }

  const { mounted, visible } = usePresence(kind !== null);
  const kindRef = useRef(kind);
  if (kind) kindRef.current = kind;
  const displayKind = kind ?? kindRef.current;

  if (!flags.ENABLE_POPUP) return null;
  if (!mounted || !displayKind) return null;

  if (displayKind === "welcome")
    return <WelcomePopup visible={visible} onClose={dismiss} />;
  if (displayKind === "exit-cart")
    return <CartReminderPopup visible={visible} onClose={dismiss} />;
  if (displayKind === "exit-quiz")
    return <ExitQuizPopup visible={visible} onClose={dismiss} />;

  return null;
}

function PopupShell({
  onClose,
  children,
  label,
  visible,
}: {
  onClose: () => void;
  children: React.ReactNode;
  label: string;
  visible: boolean;
}) {
  return (
    <div className="smart-popup-root pointer-events-none fixed inset-0 z-[85] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className={`overlay-backdrop absolute inset-0 bg-ink-900/50 ${visible ? "is-visible" : ""}`}
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`overlay-panel overlay-panel-up texture-knit relative max-h-[min(90dvh,36rem)] w-full max-w-md overflow-y-auto rounded-t-cozy bg-cream-50 p-5 shadow-lift sm:rounded-cozy sm:p-7 pb-[max(1.25rem,env(safe-area-inset-bottom))] ${visible ? "is-visible" : ""}`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Uždaryti"
          className="absolute right-3 top-3 inline-flex size-11 items-center justify-center rounded-full text-ink-600 transition hover:bg-cream-200 hover:text-ink-900"
        >
          <X className="block size-5 shrink-0" strokeWidth={1.8} />
        </button>
        {children}
      </div>
    </div>
  );
}

function WelcomePopup({ onClose, visible }: { onClose: () => void; visible: boolean }) {
  return (
    <PopupShell visible={visible} onClose={onClose} label="Sveiki atvykę">
      <p className="text-center font-display text-4xl" aria-hidden>🎄</p>
      <h2 className="mt-2 text-center font-display text-2xl font-semibold leading-snug text-ink-900">
        Gaukite {store.popups.discountPercentFirstOrder} % nuolaidą pirmajam užsakymui
      </h2>
      <p className="mx-auto mt-2 max-w-xs text-center text-sm leading-relaxed text-ink-600">
        Taip pat sužinosite apie naujas dovanas ir specialius Kalėdinius pasiūlymus.
      </p>
      <div className="mt-5">
        <NewsletterInline onSuccess={onClose} />
      </div>
    </PopupShell>
  );
}

function ExitQuizPopup({ onClose, visible }: { onClose: () => void; visible: boolean }) {
  return (
    <PopupShell visible={visible} onClose={onClose} label="Palaukite">
      <p className="text-center font-display text-4xl" aria-hidden>🎁</p>
      <h2 className="mt-2 text-center font-display text-2xl font-semibold text-ink-900">
        Palaukite! Dar neišsirinkote dovanos?
      </h2>
      <p className="mx-auto mt-2 max-w-xs text-center text-sm leading-relaxed text-ink-600">
        Atsakykite į 4 klausimus — parodysime dovanas, kurios tiks būtent jūsų žmogui.
      </p>
      <div className="mt-5 flex flex-col gap-2">
        <Link href="/rask-dovana" onClick={onClose}>
          <span className="flex min-h-12 items-center justify-center rounded-full bg-burgundy-600 px-6 text-[15px] font-semibold text-cream-50 transition hover:bg-burgundy-700">
            Rasti dovaną →
          </span>
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="min-h-10 text-sm font-medium text-ink-600 underline underline-offset-4 hover:text-burgundy-600"
        >
          Ne, ačiū
        </button>
      </div>
    </PopupShell>
  );
}

function CartReminderPopup({ onClose, visible }: { onClose: () => void; visible: boolean }) {
  const router = useRouter();
  return (
    <PopupShell visible={visible} onClose={onClose} label="Jūsų dovana dar laukia">
      <p className="text-center font-display text-4xl" aria-hidden>🎅</p>
      <h2 className="mt-2 text-center font-display text-2xl font-semibold text-ink-900">
        Jūsų dovana dar laukia 🎁
      </h2>
      <p className="mx-auto mt-2 max-w-xs text-center text-sm leading-relaxed text-ink-600">
        Krepšelyje jau yra prekių. Užbaikite užsakymą, kad spėtumėte iki Kalėdų.
      </p>
      <div className="mt-5 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => {
            track("popup_convert", { popup_type: "exit-cart" });
            onClose();
            router.push("/krepselis");
          }}
          className="flex min-h-12 items-center justify-center rounded-full bg-burgundy-600 px-6 text-[15px] font-semibold text-cream-50 transition hover:bg-burgundy-700"
        >
          Peržiūrėti krepšelį →
        </button>
        <button
          type="button"
          onClick={onClose}
          className="min-h-10 text-sm font-medium text-ink-600 underline underline-offset-4 hover:text-burgundy-600"
        >
          Dar apsižvalgysiu
        </button>
      </div>
    </PopupShell>
  );
}

function NewsletterInline({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isAllowedEmail(email)) {
      setState("error");
      return;
    }
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({ email, consent: true, source: "popup-welcome" }),
      });
      if (!res.ok) throw new Error();
      track("sign_up", { source: "popup-welcome" });
      track("popup_convert", { popup_type: "welcome" });
      setState("ok");
      setTimeout(onSuccess, 1800);
    } catch {
      setState("error");
    }
  }

  if (state === "ok")
    return (
      <p role="status" className="rounded-cozy border border-gold-400/55 bg-cream-100 py-3 text-center text-sm font-semibold text-burgundy-700">
        🎄 Nuolaida išsiųsta!
      </p>
    );

  return (
    <form onSubmit={submit} className="space-y-3">
      <label htmlFor="popup-email" className="sr-only">
        El. paštas
      </label>
      <input
        id="popup-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Jūsų el. paštas"
        inputMode="email"
        autoComplete="email"
        className="min-h-12 w-full rounded-full border border-cream-400 bg-white px-5 text-base outline-none focus:border-gold-500"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="flex min-h-12 w-full items-center justify-center rounded-full bg-gold-500 text-[15px] font-bold text-burgundy-800 transition hover:bg-gold-400 disabled:opacity-50"
      >
        {state === "loading" ? "Siunčiama…" : `Gauti ${store.popups.discountPercentFirstOrder} % nuolaidą`}
      </button>
      {state === "error" ? (
        <p role="alert" className="text-center text-xs font-semibold text-burgundy-600">
          Įveskite gmail.com, outlook.com, icloud.com arba inbox.lt paštą.
        </p>
      ) : null}
    </form>
  );
}
