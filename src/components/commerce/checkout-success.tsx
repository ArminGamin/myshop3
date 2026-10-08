"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, Gift, Mail, PackageCheck, Truck } from "lucide-react";
import { store } from "@/lib/config/store.config";
import { clearCustomerDraft } from "@/lib/checkout/customer";
import type { CheckoutOrderView } from "@/lib/checkout/order-view";
import { formatPrice } from "@/lib/format";
import { track } from "@/lib/analytics";
import { cartStore } from "@/lib/cart/store";
import { ButtonLink } from "@/components/ui/button";
import { CheckoutSteps } from "./checkout-decor";

const SEAL_TEXT = `AČIŪ ✦ ${store.brand.name.toUpperCase()} ✦ `;

export function CheckoutSuccess({
  order,
  missing,
}: {
  order: CheckoutOrderView | null;
  missing: boolean;
}) {
  useEffect(() => {
    if (!order?.paid) return;
    const key = `jaukumas.purchase.${order.id}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      track("purchase", {
        value: order.amountTotalCents / 100,
        transaction_id: order.id,
      });
    }
    cartStore.clear();
    clearCustomerDraft();
  }, [order]);

  const orderNumber = order ? order.id.slice(-12).toUpperCase() : "";

  return (
    <div className="success-shell relative overflow-hidden">
      {order?.paid ? <SuccessCelebration /> : null}
      <div className="relative mx-auto max-w-2xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12 lg:pb-20">
        <div className="mb-8 flex justify-center">
          {order ? <CheckoutSteps current={order.paid ? 3 : 2} /> : null}
        </div>

        <div className="text-center">
          {order?.paid ? <SuccessSeal /> : null}
          <h1 className="success-title mt-6 font-display text-[2.4rem] font-bold leading-[1.04] tracking-[-0.01em] text-ink-900 sm:text-[3.4rem]">
            {order?.paid ? (
              <>
                Ačiū! Užsakymas <em>priimtas</em>
              </>
            ) : order?.processing ? (
              "Mokėjimas apdorojamas"
            ) : (
              "Mokėjimas nepatvirtintas"
            )}
          </h1>
          {order?.paid ? (
            <p className="success-sub mx-auto mt-3 max-w-md text-[15.5px] font-medium leading-relaxed text-ink-600 sm:text-[17px]">
              Jūsų dovanos jau ruošiamos kelionei. Patvirtinimą išsiuntėme el. paštu.
            </p>
          ) : null}
        </div>

        {missing ? (
          <p role="alert" className="mt-6 rounded-cozy border border-burgundy-300 bg-burgundy-100 px-4 py-3 text-center text-sm font-semibold text-burgundy-700">
            Nepavyko rasti šio mokėjimo. Jei suma nuskaičiuota, susisiekite su mumis. Kitu atveju grįžkite ir bandykite dar kartą.
          </p>
        ) : null}

        {order ? (
          <div className="success-ticket mx-auto mt-9 max-w-md">
            <div className="success-ticket-head">
              <p className="success-ticket-label">Užsakymo numeris</p>
              <CopyNumber value={orderNumber} />
            </div>
            <dl className="success-ticket-body">
              <div>
                <dt>Suma</dt>
                <dd className="num text-[17px] font-extrabold text-burgundy-700">{formatPrice(order.amountTotalCents)}</dd>
              </div>
              {order.email ? (
                <div>
                  <dt>Patvirtinimas</dt>
                  <dd className="truncate">{order.email}</dd>
                </div>
              ) : null}
              <div>
                <dt>Pristatymas</dt>
                <dd>{order.shippingEstimate} nuo išsiuntimo</dd>
              </div>
            </dl>
          </div>
        ) : !missing ? (
          <p className="mt-6 text-center text-[15px] leading-relaxed text-ink-600">
            Šiame puslapyje nėra patvirtinto mokėjimo. Grįžkite į krepšelį ir užbaikite užsakymą.
          </p>
        ) : null}

        {order?.paid ? (
          <section aria-labelledby="kas-toliau" className="mx-auto mt-10 max-w-md">
            <h2 id="kas-toliau" className="text-center font-display text-[1.6rem] font-bold text-ink-900">
              Kas <em>toliau?</em>
            </h2>
            <ol className="success-steps mt-5">
              <li className="is-done">
                <span className="success-step-dot">
                  <Mail className="size-4" strokeWidth={2} aria-hidden />
                </span>
                <div>
                  <p className="success-step-title">Patvirtinimas el. paštu</p>
                  <p className="success-step-text">Užsakymo informaciją jau išsiuntėme.</p>
                </div>
              </li>
              <li>
                <span className="success-step-dot">
                  <PackageCheck className="size-4" strokeWidth={2} aria-hidden />
                </span>
                <div>
                  <p className="success-step-title">Kruopščiai supakuojame</p>
                  <p className="success-step-text">Patikriname kiekvieną prekę ir paruošiame siuntą.</p>
                </div>
              </li>
              <li>
                <span className="success-step-dot">
                  <Truck className="size-4" strokeWidth={2} aria-hidden />
                </span>
                <div>
                  <p className="success-step-title">Siunta pakeliui</p>
                  <p className="success-step-text">Atsiųsime sekimo numerį, kai siunta iškeliaus.</p>
                </div>
              </li>
            </ol>
          </section>
        ) : null}

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink href="/dovanos/visos-dovanos" size="lg">
            Tęsti apsipirkimą
          </ButtonLink>
          {order?.paid ? (
            <Link href="/rask-dovana" className="success-ghost">
              <Gift className="size-4" strokeWidth={2} aria-hidden />
              Rasti dovaną kitam
              <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
            </Link>
          ) : null}
        </div>
        <p className="mt-7 text-center text-xs text-ink-400">
          Klausimai?{" "}
          <a href={`mailto:${store.contact.email}`} className="font-semibold text-burgundy-600 underline underline-offset-4">
            {store.contact.email}
          </a>
        </p>
      </div>
    </div>
  );
}

function CopyNumber({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="success-copy"
      onClick={() => {
        navigator.clipboard
          ?.writeText(value)
          .then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
          })
          .catch(() => {});
      }}
      aria-label={`Kopijuoti užsakymo numerį ${value}`}
    >
      <span className="font-mono text-[15px] font-bold tracking-[0.08em]">{value}</span>
      {copied ? <Check className="size-3.5" strokeWidth={2.4} aria-hidden /> : <Copy className="size-3.5" strokeWidth={2} aria-hidden />}
      <span className="sr-only" aria-live="polite">{copied ? "Nukopijuota" : ""}</span>
    </button>
  );
}

// Auksinis antspaudas su besisukančiu užrašu ir varnele centre.
function SuccessSeal() {
  return (
    <div className="success-seal mx-auto" aria-hidden="true">
      <svg viewBox="0 0 120 120" className="success-seal-ring">
        <defs>
          <path id="success-ring-path" d="M60 60m-48 0a48 48 0 1 1 96 0a48 48 0 1 1-96 0" />
        </defs>
        <text>
          <textPath href="#success-ring-path" textLength={300} lengthAdjust="spacing">
            {SEAL_TEXT}
          </textPath>
        </text>
      </svg>
      <span className="success-seal-core">
        <svg viewBox="0 0 24 24" className="success-check">
          <path d="M5 12.5l4.2 4.2L19 7" />
        </svg>
      </span>
    </div>
  );
}

function SuccessCelebration() {
  return (
    <div className="checkout-confetti" aria-hidden="true">
      {Array.from({ length: 18 }, (_, i) => (
        <span key={i} style={{ left: `${4 + ((i * 7) % 92)}%`, animationDelay: `${(i % 9) * 0.16}s` }} />
      ))}
    </div>
  );
}
