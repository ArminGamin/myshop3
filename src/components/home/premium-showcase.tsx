import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/format";
import { ProductCard } from "@/components/commerce/product-card";
import { ProductImage } from "@/components/commerce/product-art";
import { HomeHeading, HomeMoreMobile } from "@/components/home/home-heading";

// Premium sekcija: didelė išskirtinė dovana kairėje ir keturios premium
// prekės šalia, viename tinklelyje.
export function PremiumShowcase({ featured, products }: { featured?: Product; products: Product[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20" aria-labelledby="prem-heading">
      <HomeHeading
        id="prem-heading"
        title={
          <>
            Premium dovanos, kai norisi <em>nustebinti</em>
          </>
        }
        sub="Kai dovana turi kalbėti pati už save."
        action={{ href: "/dovanos/premium-dovanos", label: "Visos premium dovanos" }}
      />

      <div className="mt-8 grid grid-cols-2 items-start gap-x-3 gap-y-5 sm:mt-10 sm:gap-x-4 sm:gap-y-6 lg:grid-cols-4 lg:gap-x-6">
        {featured ? (
          <Link href={`/produktai/${featured.slug}`} className="home-spotlight group col-span-2 lg:row-span-2 lg:self-stretch">
            <span className="home-spotlight-media">
              <ProductImage
                fill
                images={featured.images}
                seed={featured.artSeed}
                alt={featured.name}
                size="hero"
                sizes="(min-width: 1024px) 38rem, 100vw"
                className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
              />
            </span>
            <span className="home-spotlight-body">
              <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-gold-300">
                Didžiausias efektas vienu pasirinkimu
              </span>
              <span className="mt-2 block font-display text-[1.9rem] font-bold leading-[1.05] text-cream-50 sm:text-[2.4rem]">
                {featured.name}
              </span>
              <span className="mt-3 block max-w-md text-[14.5px] font-medium leading-relaxed text-cream-100/90 sm:text-[15px]">
                Full HD filmai ant sienos iki 120 colių. Dovana, kuri nustebina vos išėmus iš dėžės!
              </span>
              <span className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                <span className="font-display text-[2.6rem] font-bold leading-none text-gold-300">
                  {formatPrice(featured.priceCents)}
                </span>
                <span className="home-spotlight-cta">
                  Žiūrėti dovaną <ArrowRight className="size-4" strokeWidth={2} />
                </span>
              </span>
            </span>
          </Link>
        ) : null}
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>

      <HomeMoreMobile href="/dovanos/premium-dovanos" label="Visos premium dovanos" />
    </section>
  );
}
