import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Heart, Package, ShieldCheck, Truck } from "lucide-react";
import { products, canViewProduct, getProduct } from "@/lib/data/products";
import { store } from "@/lib/config/store.config";
import { discountPercent, formatPrice } from "@/lib/format";
import { breadcrumbSchema, productSchema } from "@/lib/seo/schema";
import { JsonLd } from "@/components/seo/json-ld";
import { RECIPIENT_LABELS } from "@/types";
import { Gallery } from "@/components/commerce/gallery";
import { AddToCartForm, StickyBuyBar } from "@/components/commerce/add-to-cart";
import { ProductVariantProvider } from "@/components/commerce/product-variant";
import { FrequentlyBoughtTogether } from "@/components/commerce/fbt";
import { TrackProductView } from "@/components/commerce/track-product-view";
import { RecentlyViewed } from "@/components/commerce/recently-viewed";
import { ProductCard } from "@/components/commerce/product-card";
import { ProductTitle } from "@/components/commerce/product-title";
import { ProductReviews } from "@/components/commerce/product-reviews";
import { getProductReviews } from "@/lib/data/product-reviews";
import { Badge } from "@/components/ui/primitives";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!canViewProduct(product)) notFound();
  const draftPreview = !product.inStock;
  return {
    title: draftPreview ? `${product.name} — peržiūros juodraštis` : `${product.name} — ${formatPrice(product.priceCents)}`,
    description: draftPreview ? product.tagline : `${product.tagline} Nemokamas pristatymas nuo ${store.shipping.freeThresholdCents / 100} €. Pristatome per 4–6 dienas.`,
    robots: draftPreview ? { index: false, follow: false } : undefined,
    alternates: { canonical: `/produktai/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.tagline,
      type: "website",
      url: `/produktai/${product.slug}`,
      ...(product.images[0] ? { images: [{ url: product.images[0], alt: product.name }] } : {}),
    },
    twitter: {
      card: product.images[0] ? "summary_large_image" : "summary",
      title: product.name,
      description: product.tagline,
      ...(product.images[0] ? { images: [product.images[0]] } : {}),
    },
  };
}

function reviewWord(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "atsiliepimas";
  if (mod10 >= 2 && mod10 <= 9 && (mod100 < 11 || mod100 > 19)) return "atsiliepimai";
  return "atsiliepimų";
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!canViewProduct(product)) notFound();
  const draftPreview = !product.inStock;
  const discount = discountPercent(product.priceCents, product.compareAtPriceCents);
  const reviews = getProductReviews(product.sku);

  const related = product.pairsWith
    .map((s) => getProduct(s))
    .filter((p) => p && p.inStock)
    .slice(0, 4);

  return (
    <div data-product-page="" className="pdp mx-auto max-w-7xl px-4 pb-mobile-sticky pt-3 sm:px-6 sm:pt-4 lg:px-8 lg:pb-16 lg:pt-8">
      {draftPreview ? (
        <p className="mb-5 rounded-cozy border border-gold-400 bg-cream-100 p-4 text-sm font-semibold text-ink-900">
          Peržiūros juodraštis — tiekėjo komplektacija dar tikrinama. Pirkti negalima.
        </p>
      ) : null}
      {/* Naršymo takeliai */}
      <nav aria-label="Naršymo takelis" className="mb-3 flex flex-wrap items-center gap-1 text-[13px] text-ink-400 sm:mb-6">
        <Link href="/" className="inline-flex min-h-9 items-center hover:text-burgundy-600">Pradžia</Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <Link href="/dovanos/visos-dovanos" className="inline-flex min-h-9 items-center hover:text-burgundy-600">Dovanos</Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <span className="max-w-[46vw] truncate font-medium text-ink-600">{product.name}</span>
      </nav>

      <ProductVariantProvider product={product}>
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-14">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Gallery product={product} />
          </div>

          <div className="pdp-buy flex flex-col">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {discount ? <Badge tone="gold">−{discount} %</Badge> : null}
              {product.bestseller ? <Badge>Bestselleris</Badge> : product.isNew ? <Badge>Naujiena</Badge> : null}
              {product.rating && product.reviewCount ? (
                <span className="pdp-rating">
                  <span aria-hidden className="text-gold-500">★★★★★</span>
                  <strong className="num text-ink-900">{String(product.rating).replace(".", ",")}</strong>
                  <span>
                    ({product.reviewCount} {reviewWord(product.reviewCount)})
                  </span>
                </span>
              ) : null}
              <span className="ml-auto text-[11.5px] font-medium tracking-wide text-ink-400">SKU: {product.sku}</span>
            </div>

            <h1 className="font-display text-[2rem] font-bold leading-[1.05] tracking-[-0.01em] text-ink-900 sm:text-[2.75rem]">
              <ProductTitle name={product.name} />
            </h1>
            <p className="mt-3 text-[15.5px] leading-relaxed text-ink-600">{product.tagline}</p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-gold-600">Puiki dovana</span>
              {product.recipients.map((r) => (
                <span key={r} className="pdp-recipient">
                  <Heart aria-hidden className="size-3" strokeWidth={2.4} fill="currentColor" />
                  {RECIPIENT_LABELS[r]}
                </span>
              ))}
            </div>

            <div className="pdp-divider" aria-hidden />

            <AddToCartForm product={product} />
          </div>
        </div>
      </ProductVariantProvider>

      {/* Aprašymas ir savybės */}
      <section className="mt-16 grid gap-8 lg:mt-20 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14" aria-labelledby="desc-heading">
        <div>
          <h2 id="desc-heading" className="home-h2 font-display text-[2rem] font-bold leading-[1.06] text-ink-900 sm:text-[2.5rem]">
            Apie <em>prekę</em>
          </h2>
          <div className="mt-5 max-w-[65ch] space-y-4 text-[15.5px] leading-relaxed text-ink-600">
            {product.description.map((para) => (
              <p key={para.slice(0, 24)}>{para}</p>
            ))}
          </div>

          {!draftPreview ? (
            <ul className="pdp-promise mt-9">
              {[
                {
                  icon: <Truck className="size-5" strokeWidth={1.7} />,
                  t: "Pristatymas",
                  d: `Per 4–6 d. · nuo ${formatPrice(store.shipping.flatRateCents)} arba nemokamai`,
                },
                {
                  icon: <ShieldCheck className="size-5" strokeWidth={1.7} />,
                  t: "Kokybė",
                  d: "Aukštos kokybės medžiagos ir kruopšti atranka",
                },
                {
                  icon: <Package className="size-5" strokeWidth={1.7} />,
                  t: "Pakuotė",
                  d: "Paruošta dovanoti iš karto",
                },
              ].map((x) => (
                <li key={x.t}>
                  <span className="pdp-promise-icon">{x.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-ink-900">{x.t}</p>
                    <p className="mt-0.5 text-[13px] leading-snug text-ink-600">{x.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <aside aria-labelledby="specs-heading" className="pdp-specs h-fit">
          <h2 id="specs-heading" className="font-display text-[1.5rem] font-bold text-ink-900">
            Savybės
          </h2>
          <dl className="mt-4 text-sm">
            {product.specs.map((spec) => (
              <div key={spec.label} className="pdp-spec-row">
                <dt className="text-ink-400">{spec.label}</dt>
                <dd className="text-right font-semibold text-ink-900">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </section>

      {/* Atsiliepimai */}
      <ProductReviews reviews={reviews} rating={product.rating} />

      {/* Dažnai perkama kartu */}
      <div className="mt-16">
        <FrequentlyBoughtTogether product={product} />
      </div>

      {/* Susijusios prekės */}
      {related.length > 0 ? (
        <section className="mt-16" aria-labelledby="rel-heading">
          <h2 id="rel-heading" className="home-h2 mb-7 font-display text-[2rem] font-bold leading-[1.06] text-ink-900 sm:text-[2.5rem]">
            Jums taip pat <em>gali patikti</em>
          </h2>
          <div className="grid grid-cols-2 items-start gap-x-3 gap-y-6 md:grid-cols-4 md:gap-x-4 md:gap-y-8 lg:gap-x-6">
            {related.map((p) => (
              <ProductCard key={p!.slug} product={p!} />
            ))}
          </div>
        </section>
      ) : null}

      <RecentlyViewed excludeSlug={product.slug} />

      <StickyBuyBar product={product} />

      <JsonLd
        data={[
          ...(draftPreview ? [] : [productSchema(product)]),
          breadcrumbSchema([
            { name: "Pradžia", href: "/" },
            { name: "Dovanos", href: "/dovanos/visos-dovanos" },
            { name: product.name, href: `/produktai/${product.slug}` },
          ]),
        ]}
      />
      {!draftPreview ? <TrackProductView product={product} /> : null}
    </div>
  );
}
