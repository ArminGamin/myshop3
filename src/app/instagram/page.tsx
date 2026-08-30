import type { Metadata } from "next";
import { bestsellers } from "@/lib/data/products";
import { ProductGrid } from "@/components/commerce/product-card";
import { TrustStrip } from "@/components/commerce/trust-strip";

export const metadata: Metadata = {
  title: "Populiariausios Kalėdų dovanos — iš Instagram",
  description:
    "Bestseleriai, kuriuos matote mūsų Instagram — su greitu pristatymu visoje Lietuvoje.",
  robots: { index: false },
  alternates: { canonical: "/instagram" },
};

export default function InstagramLanding() {
  return (
    <div className="pb-16">
      <section className="glow-candle texture-knit px-4 pb-12 pt-14 text-center sm:pt-16">
        <h1 className="mx-auto max-w-xl font-display text-4xl font-semibold leading-tight text-ink-900 sm:text-5xl">
          ✨ Bestselleriai, kuriuos pamatėte feede
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-600">
          Nemokamas pristatymas nuo 49 € · grąžinimas per 14 d. d.
        </p>
      </section>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ProductGrid products={bestsellers()} />
      </div>
      <TrustStrip tone="cream" />
    </div>
  );
}
