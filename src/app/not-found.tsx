import Link from "next/link";
import { bestsellers } from "@/lib/data/products";
import { ProductGrid } from "@/components/commerce/product-card";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="texture-knit glow-candle">
      <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 sm:py-20">
        <p className="font-display text-5xl font-bold text-burgundy-600 sm:text-6xl">404</p>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink-900 sm:text-3xl">
          Šis puslapis dingo kaip sniegas 🌨️
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink-600">
          Bet dovanos — čia, kur jų visada galima rasti. Pradėkite nuo bestsellerių arba
          atlikite 30 sekundžių dovanų testą.
        </p>
        <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <ButtonLink href="/rask-dovana" size="lg" className="w-full sm:w-auto">
            Rasti dovaną →
          </ButtonLink>
          <ButtonLink href="/dovanos/visos-dovanos" variant="secondary" size="lg" className="w-full sm:w-auto">
            Visos dovanos
          </ButtonLink>
        </div>

        <div className="mt-14 text-left">
          <h2 className="mb-6 font-display text-xl font-semibold text-ink-900">
            Populiariausios prekės
          </h2>
          <ProductGrid products={bestsellers().slice(0, 4)} />
        </div>

        <p className="mt-10 text-sm text-ink-400">
          Manote, kad tai mūsų klaida?{" "}
          <Link href="/kontaktai" className="font-semibold text-burgundy-600 underline underline-offset-4">
            Praneškite mums
          </Link>
        </p>
      </div>
    </div>
  );
}
