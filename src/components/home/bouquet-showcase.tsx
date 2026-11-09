import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BOUQUET_HREF, bouquetProducts } from "@/lib/data/bouquets";
import { formatPrice } from "@/lib/format";
import { ProductCard } from "@/components/commerce/product-card";
import { ProductImage } from "@/components/commerce/product-art";
import { HomeHeading, HomeMoreMobile } from "@/components/home/home-heading";

// Saldainių puokštės pagrindiniame puslapyje: didelė nuotrauka + 6 puokštės.
export function BouquetShowcase() {
  const items = bouquetProducts();
  if (items.length === 0) return null;
  const from = Math.min(...items.map((p) => p.priceCents));
  const cover = items.find((p) => p.slug === "saldainiu-puokste-rozine-prabanga") ?? items[0];

  return (
    <section className="bq-band" aria-labelledby="bq-home-heading">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <p className="bq-eyebrow">
          <span className="bq-eyebrow-tag">Nauja</span>
          Rankų darbo
        </p>
        <HomeHeading
          id="bq-home-heading"
          title={
            <>
              Saldainių puokštės <em>dovanai</em>
            </>
          }
          sub={`Kinder, Milka, Ferrero ir kiti mėgstami skanėstai, sudėti į puokštę su kaspinu. Paruošta įteikti – nuo ${formatPrice(from)}.`}
          action={{ href: BOUQUET_HREF, label: "Visos puokštės" }}
        />

        <div className="bq-band-grid">
          <Link href={BOUQUET_HREF} className="bq-feature group">
            <span className="bq-feature-media">
              <ProductImage
                fill
                images={cover.images}
                seed={cover.artSeed}
                alt={cover.name}
                size="hero"
                sizes="(min-width: 1024px) 19rem, 70vw"
                className="object-cover object-top transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
              />
            </span>
            <span className="bq-feature-body">
              <span className="bq-feature-kicker">{items.length} puokštės</span>
              <span className="bq-feature-title">Saldi staigmena su kaspinu</span>
              <span className="bq-feature-text">Išsirink nuotaiką: rožinę, violetinę, raudoną, auksinę, spalvingą ar braškių.</span>
              <span className="bq-feature-cta">
                Žiūrėti visas <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
              </span>
            </span>
          </Link>
          {items.map((product) => (
            <div key={product.slug}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <HomeMoreMobile href={BOUQUET_HREF} label="Visos puokštės" />
      </div>
    </section>
  );
}
