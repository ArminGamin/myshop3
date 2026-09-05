"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Mail, MessageCircleHeart, Share2 } from "lucide-react";
import { flags, store } from "@/lib/config/store.config";
import { bestsellers } from "@/lib/data/products";
import { formatPrice } from "@/lib/format";
import { track } from "@/lib/analytics";
import { ButtonLink } from "@/components/ui/button";
import { ProductArt } from "@/components/commerce/product-art";

interface Order {
  id: string;
  amountTotalCents: number;
  email: string | null;
  paid: boolean;
}

function CelebrateLayer() {
  return (
    <div className="celebrate-layer" aria-hidden>
      {Array.from({ length: 8 }, (_, i) => (
        <span key={`b${i}`} className="celebrate-balloon" />
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <span key={`s${i}`} className="celebrate-sparkle" />
      ))}
    </div>
  );
}

export default function ThankYouPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [checked, setChecked] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    const session_id = new URLSearchParams(window.location.search).get("session_id");
    const payment_intent = new URLSearchParams(window.location.search).get("payment_intent");
    const query = session_id
      ? `session_id=${encodeURIComponent(session_id)}`
      : payment_intent
        ? `payment_intent=${encodeURIComponent(payment_intent)}`
        : null;
    if (query) setCelebrate(true);
    const first = setTimeout(() => {
      if (!query) {
        setChecked(true);
        return;
      }
      fetch(`/api/checkout/session?${query}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.order) {
            setOrder(data.order);
            if (data.order.paid) setCelebrate(true);
            if (data.order.paid && !sessionStorage.getItem("purchase-tracked")) {
              sessionStorage.setItem("purchase-tracked", "1");
              track("purchase", {
                value: data.order.amountTotalCents / 100,
                transaction_id: data.order.id,
              });
            }
          }
        })
        .catch(() => {})
        .finally(() => setChecked(true));
    }, 0);
    return () => clearTimeout(first);
  }, []);

  const suggestion = bestsellers()[0];

  return (
    <div className="texture-knit glow-candle relative min-h-[75vh] overflow-hidden">
      {celebrate ? <CelebrateLayer /> : null}
      <div className="relative mx-auto max-w-2xl px-4 py-14 text-center sm:px-6 lg:py-20">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-forest-100 text-forest-600">
          <CheckCircle2 className="size-9" strokeWidth={1.6} />
        </span>
        <h1 className="mt-5 font-display text-3xl font-semibold text-ink-900 sm:text-4xl">
          {celebrate ? "Kalėdos jau pakeliui!" : "Ačiū už jūsų užsakymą!"}
        </h1>
        {celebrate ? (
          <p className="mt-2 text-[15px] font-medium text-burgundy-600">Ačiū — jūsų dovana jau ruošiama.</p>
        ) : null}

        {!checked ? (
          <div className="mx-auto mt-8 h-24 max-w-md rounded-cozy skeleton" />
        ) : order ? (
          <div className="mx-auto mt-8 max-w-md rounded-cozy border border-cream-300 bg-white/80 p-6 text-left">
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-400">Užsakymo numeris</dt>
                <dd className="font-mono text-[13px] font-semibold text-ink-900">
                  {order.id.slice(-12).toUpperCase()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-400">Suma</dt>
                <dd className="font-bold text-burgundy-600">{formatPrice(order.amountTotalCents)}</dd>
              </div>
              {order.email ? (
                <div className="flex justify-between gap-4">
                  <dt className="shrink-0 text-ink-400">Patvirtinimas išsiųstas</dt>
                  <dd className="truncate font-medium text-ink-900">{order.email}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-ink-400">Pristatymo trukmė</dt>
                <dd className="font-medium text-ink-900">4–6 d. nuo išsiuntimo</dd>
              </div>
            </dl>
            <p className="mt-4 border-t border-cream-200 pt-3 text-[13px] leading-relaxed text-ink-600">
              Kai siunta iškeliauja, atsiunčiame sekimo numerį. Klausimai?{" "}
              <a href={`mailto:${store.contact.email}`} className="font-semibold text-burgundy-600 underline underline-offset-4">
                {store.contact.email}
              </a>
            </p>
          </div>
        ) : (
          <p className="mt-6 text-[15px] leading-relaxed text-ink-600">
            Užsakymo informaciją ieškokite el. pašte — ten išsiuntėme patvirtinimą ir
            sekimo instrukcijas.
          </p>
        )}

        <p className="mx-auto mt-10 max-w-md font-display text-xl leading-relaxed text-forest-600">
          „Linksmų Kalėdų ir jaukių švenčių namams — dabar dar šiltesnių.“ ✨
        </p>

        {flags.ENABLE_POST_PURCHASE_RECOMMENDATIONS && suggestion ? (
          <div className="mx-auto mt-10 max-w-sm rounded-cozy border border-gold-400/50 bg-gradient-to-br from-cream-100 to-white p-5 shadow-card">
            <p className="text-xs font-bold uppercase tracking-wide text-gold-600">
              Dar viena mintis
            </p>
            <Link
              href={`/produktai/${suggestion.slug}`}
              className="group mt-3 flex items-center gap-4 text-left"
            >
              <ProductArt seed={suggestion.artSeed} size="thumb" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-ink-900 group-hover:text-burgundy-600">
                  {suggestion.name}
                </span>
                <span className="text-sm font-bold text-burgundy-600">
                  {formatPrice(suggestion.priceCents)}
                </span>
              </span>
            </Link>
          </div>
        ) : null}

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink href="/dovanos/visos-dovanos" variant="secondary" size="md">
            Tęsti apsipirkimą
          </ButtonLink>
          <a
            href={store.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-ink-600 underline underline-offset-4 hover:text-burgundy-600"
          >
            <Share2 className="size-4" /> Pasidalinkite džiaugsmu Instagram
          </a>
        </div>

        <ul className="mx-auto mt-12 grid max-w-lg gap-3 text-left text-[13px] leading-relaxed text-ink-600 sm:grid-cols-2">
          <li className="flex items-start gap-2">
            <Mail className="mt-0.5 size-4 shrink-0 text-burgundy-600" />
            Atsiliepimą paprašysime po kelių dienų — mums svarbi jūsų nuomonė.
          </li>
          <li className="flex items-start gap-2">
            <MessageCircleHeart className="mt-0.5 size-4 shrink-0 text-burgundy-600" />
            Dovana ne ta, kurios tikėjotės? Grąžiname per 14 d. d. be klausimų.
          </li>
        </ul>
      </div>
    </div>
  );
}
