"use client";

import { useEffect } from "react";
import { Mail, PackageCheck } from "lucide-react";
import { store } from "@/lib/config/store.config";
import { clearCustomerDraft } from "@/lib/checkout/customer";
import type { CheckoutOrderView } from "@/lib/checkout/order-view";
import { formatPrice } from "@/lib/format";
import { track } from "@/lib/analytics";
import { cartStore } from "@/lib/cart/store";
import { ButtonLink } from "@/components/ui/button";
import { CheckoutSteps } from "./checkout-decor";

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

  return (
    <div className="relative mx-auto max-w-2xl overflow-hidden px-4 py-12 sm:px-6 lg:py-16">
      {order?.paid ? <SuccessCelebration /> : null}
      <div className="relative text-center">
        <div className="mb-6 flex justify-center">
          {order ? <CheckoutSteps current={order.paid ? 3 : 2} /> : null}
        </div>
        {order?.paid ? <GiftBox /> : null}
        <h1 className="mt-4 font-display text-3xl font-bold text-ink-900 sm:text-4xl">
          {order?.paid ? "Ačiū! Jūsų užsakymas priimtas 🎁" : order?.processing ? "Mokėjimas apdorojamas" : "Mokėjimas nepatvirtintas"}
        </h1>
        {order?.paid ? (
          <p className="mt-3 text-[15px] font-medium text-ink-600">
            Patvirtinimą išsiuntėme el. paštu. Kai siunta iškeliaus, atsiųsime sekimo numerį.
          </p>
        ) : null}

        {missing ? (
          <p role="alert" className="mt-6 rounded-cozy border border-burgundy-300 bg-burgundy-100 px-4 py-3 text-sm font-semibold text-burgundy-700">
            Nepavyko rasti šio mokėjimo. Jei suma nuskaičiuota, susisiekite su mumis. Kitu atveju grįžkite ir bandykite dar kartą.
          </p>
        ) : null}

        {order ? (
          <div className="mx-auto mt-8 max-w-md rounded-cozy border border-cream-300 bg-white/80 p-6 text-left">
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-400">Užsakymo numeris</dt>
                <dd className="font-mono text-[13px] font-semibold text-ink-900">{order.id.slice(-12).toUpperCase()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-400">Suma</dt>
                <dd className="num font-extrabold text-burgundy-700">{formatPrice(order.amountTotalCents)}</dd>
              </div>
              {order.email ? (
                <div className="flex justify-between gap-4">
                  <dt className="shrink-0 text-ink-400">Patvirtinimas</dt>
                  <dd className="truncate font-medium text-ink-900">{order.email}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-ink-400">Pristatymas</dt>
                <dd className="font-medium text-ink-900">{order.shippingEstimate} nuo išsiuntimo</dd>
              </div>
            </dl>
          </div>
        ) : !missing ? (
          <p className="mt-6 text-[15px] leading-relaxed text-ink-600">
            Šiame puslapyje nėra patvirtinto mokėjimo. Grįžkite į krepšelį ir užbaikite užsakymą.
          </p>
        ) : null}

        {order?.paid ? <ul className="mx-auto mt-8 max-w-md space-y-3 text-left text-sm text-ink-600">
          <li className="flex gap-2.5">
            <Mail className="mt-0.5 size-4 shrink-0 text-burgundy-600" strokeWidth={1.8} />
            <span>Užsakymo patvirtinimą atsiųsime el. paštu.</span>
          </li>
          <li className="flex gap-2.5">
            <PackageCheck className="mt-0.5 size-4 shrink-0 text-burgundy-600" strokeWidth={1.8} />
            <span>Kai siunta iškeliaus, atsiųsime jos sekimo numerį.</span>
          </li>
        </ul> : null}

        <div className="mt-8">
          <ButtonLink href="/dovanos/visos-dovanos" size="lg">
            Tęsti apsipirkimą
          </ButtonLink>
        </div>
        <p className="mt-6 text-xs text-ink-400">
          Klausimai?{" "}
          <a href={`mailto:${store.contact.email}`} className="font-semibold text-burgundy-600 underline underline-offset-4">
            {store.contact.email}
          </a>
        </p>
      </div>
    </div>
  );
}

function GiftBox() {
  return (
    <div className="checkout-gift mx-auto" aria-hidden="true">
      <span className="checkout-gift-lid" />
      <span className="checkout-gift-box" />
    </div>
  );
}

function SuccessCelebration() {
  return (
    <div className="checkout-confetti" aria-hidden="true">
      {Array.from({ length: 14 }, (_, i) => (
        <span key={i} style={{ left: `${6 + ((i * 7) % 90)}%`, animationDelay: `${(i % 7) * 0.18}s` }} />
      ))}
    </div>
  );
}
