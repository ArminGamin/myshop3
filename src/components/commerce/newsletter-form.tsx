"use client";

import { useState, type FormEvent } from "react";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { apiHeaders } from "@/lib/security/csrf-client";
import { emailError } from "@/lib/security/email";

export function NewsletterForm({
  source = "footer-section",
  compact = false,
}: {
  source?: string;
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [honey, setHoney] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error" | "invalid">("idle");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const mailErr = emailError(email);
    if (mailErr) {
      setStatus("invalid");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({ email, consent: true, source, honey }),
      });
      if (!res.ok) throw new Error();
      track("sign_up", { source });
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div
        role="status"
        className={`rounded-cozy border border-gold-400/55 bg-cream-100 px-5 py-4 text-center text-[14px] font-semibold leading-relaxed text-burgundy-700 ${
          compact ? "" : "mx-auto max-w-md"
        }`}
      >
        Ačiū! Nuolaidos kodas išsiųstas į <strong>{email}</strong>.
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={compact ? "w-full" : "mx-auto w-full max-w-md"}
      noValidate
    >
      <input
        type="text"
        value={honey}
        onChange={(e) => setHoney(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={`nl-email-${source}`} className="sr-only">
          El. paštas
        </label>
        <input
          id={`nl-email-${source}`}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Jūsų el. paštas"
          inputMode="email"
          autoComplete="email"
          className="min-h-12 flex-1 rounded-full border border-cream-400 bg-white px-5 text-base text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-gold-500"
        />
        <Button type="submit" disabled={status === "loading"} className="w-full sm:w-auto">
          {status === "loading" ? "Siunčiama…" : "Gauti nuolaidą"}
        </Button>
      </div>
      {(status === "invalid" || status === "error") && (
        <p role="alert" className="mt-2 text-left text-xs font-semibold text-burgundy-600">
          {status === "invalid"
            ? "Įveskite gmail.com, outlook.com, icloud.com arba inbox.lt paštą."
            : "Kažkas nepavyko — pabandykite dar kartą."}
        </p>
      )}
    </form>
  );
}
