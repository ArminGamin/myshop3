import type { Metadata } from "next";
import { products } from "@/lib/data/products";
import { ProductGrid } from "@/components/commerce/product-card";
import { TrustStrip } from "@/components/commerce/trust-strip";
import { DeadlineBanner } from "@/components/commerce/deadline-banner";

export const metadata: Metadata = {
  title: "Kalėdinės dovanos iki 30 €",
  description:
    "Iš TikTok atėjote į teisingą vietą: jaukios kalėdinės dovanos iki 30 eurų su pristatymu per 1–2 d. d.",
  robots: { index: false },
  alternates: { canonical: "/tiktok" },
};

// Kampanijos nukreipimo puslapis — be blaškymosi, tik pasiūlymas iš reklamos.
export default function TikTokLanding() {
  const items = products
    .filter((p) => p.inStock && p.priceCents <= 3000)
    .sort((a, b) => Number(b.bestseller) - Number(a.bestseller));

  return (
    <div className="pb-16">
      <section className="glow-candle texture-knit px-4 pb-12 pt-14 text-center sm:pt-16">
        <p className="mb-3 inline-block rounded-full bg-ink-900 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-gold-300">
          Iš TikTok? Jūs vietoje 🎬
        </p>
        <h1 className="mx-auto max-w-xl font-display text-4xl font-semibold leading-tight text-ink-900 sm:text-5xl">
          🎁 Kalėdinės dovanos iki 30 €
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-600">
            Tos pačios prekės, kurias matėte vaizdo įraše — pristatome per 1–2 d. d.,
            grąžinimas per 14 dienų.
        </p>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ProductGrid products={items} />
      </div>

      <div className="mt-14">
        <DeadlineBanner />
      </div>
      <TrustStrip tone="cream" />
    </div>
  );
}
