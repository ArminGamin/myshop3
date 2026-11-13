import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products } from "@/lib/data/products";
import { productRank } from "@/lib/data/product-order";
import { formatPrice } from "@/lib/format";
import { ProductCard } from "@/components/commerce/product-card";
import { ProductImage } from "@/components/commerce/product-art";
import { HomeHeading, HomeMoreMobile } from "@/components/home/home-heading";

const LEGO_HREF = "/dovanos/lego-rinkiniai";

// LEGO rinkiniai pagrindiniame puslapyje – ta pati sandara kaip puokščių juostos.
export function LegoShowcase() {
  const items = products
    .filter((p) => p.inStock && p.slug.startsWith("lego-"))
    .sort((a, b) => productRank(a.slug) - productRank(b.slug));
  if (items.length === 0) return null;
  const from = Math.min(...items.map((p) => p.priceCents));
  const cover = items.find((p) => p.slug === "lego-kaledu-senelio-roges-40499") ?? items[0];

  return (
    <section className="bq-band lego-band" aria-labelledby="lego-home-heading">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <p className="bq-eyebrow">
          <span className="bq-eyebrow-tag">Nauja</span>
          Originalūs rinkiniai
        </p>
        <HomeHeading
          id="lego-home-heading"
          title={
            <>
              LEGO® rinkiniai <em>vaikams</em>
            </>
          }
          sub={`Kalėdiniai rinkiniai ir mėgstami personažai – nauji, originaliose gamintojo pakuotėse. Nuo ${formatPrice(from)}.`}
          action={{ href: LEGO_HREF, label: "Visi LEGO" }}
        />

        <div className="bq-band-grid">
          <Link href={LEGO_HREF} className="bq-feature group">
            <span className="bq-feature-media">
              <ProductImage
                fill
                images={cover.images}
                seed={cover.artSeed}
                alt={cover.name}
                size="hero"
                sizes="(min-width: 1024px) 19rem, 70vw"
                className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
              />
            </span>
            <span className="bq-feature-body">
              <span className="bq-feature-kicker">{items.length} rinkiniai</span>
              <span className="bq-feature-title">Dovana, kurią statys per atostogas</span>
              <span className="bq-feature-text">Nuo šventinių rogių iki Ferrari – vaikams nuo 9 metų.</span>
              <span className="bq-feature-cta">
                Žiūrėti visus <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
              </span>
            </span>
          </Link>
          {items.map((product) => (
            <div key={product.slug}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <HomeMoreMobile href={LEGO_HREF} label="Visi LEGO" />
      </div>
    </section>
  );
}
