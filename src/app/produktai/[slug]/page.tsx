import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Package, ShieldCheck, Truck } from "lucide-react";
import { products, getProduct } from "@/lib/data/products";
import { store } from "@/lib/config/store.config";
import { discountPercent, formatPrice } from "@/lib/format";
import { breadcrumbSchema, productSchema } from "@/lib/seo/schema";
import { RECIPIENT_LABELS } from "@/types";
import { Gallery } from "@/components/commerce/gallery";
import { AddToCartForm, StickyBuyBar } from "@/components/commerce/add-to-cart";
import { FrequentlyBoughtTogether } from "@/components/commerce/fbt";
import { TrackProductView } from "@/components/commerce/track-product-view";
import { RecentlyViewed } from "@/components/commerce/recently-viewed";
import { ProductCard } from "@/components/commerce/product-card";
import { Badge } from "@/components/ui/primitives";
import { ProductPhotoNotice } from "@/components/commerce/product-photo-notice";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} — ${formatPrice(product.priceCents)}`,
    description: `${product.tagline} Nemokamas pristatymas nuo ${store.shipping.freeThresholdCents / 100} €. Pristatome per 4–6 dienas. Kokybės garantija.`,
    alternates: { canonical: `/produktai/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.tagline,
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product || !product.inStock) notFound();

  const related = product.pairsWith
    .map((s) => getProduct(s))
    .filter((p) => p && p.inStock)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-mobile-sticky pt-4 sm:px-6 lg:px-8 lg:pb-14 lg:pt-8">
      {/* Naršymo takeliai */}
      <nav aria-label="Naršymo takelis" className="mb-5 flex flex-wrap items-center gap-1 text-[13px] text-ink-400">
        <Link href="/" className="hover:text-burgundy-600">Pradžia</Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <Link href="/dovanos/visos-dovanos" className="hover:text-burgundy-600">Dovanos</Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <span className="max-w-[50vw] truncate font-medium text-ink-600">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Gallery product={product} />
          <ProductPhotoNotice />
        </div>

        <div className="flex flex-col lg:pt-2">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {discountPercent(product.priceCents, product.compareAtPriceCents) ? (
              <Badge tone="gold">
                −{discountPercent(product.priceCents, product.compareAtPriceCents)} %
              </Badge>
            ) : null}
            {product.bestseller ? <Badge>Bestselleris</Badge> : product.isNew ? <Badge>Naujiena</Badge> : null}
            <span className="ml-auto text-xs font-medium text-ink-400">SKU: {product.sku}</span>
          </div>

          <h1 className="font-display text-[1.75rem] font-semibold leading-tight text-ink-900 sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-2.5 text-[15px] leading-relaxed text-ink-600">{product.tagline}</p>

          <p className="mt-4 text-[13.5px] text-ink-600">
            Puiki dovana:{" "}
            <strong className="font-semibold text-ink-900">
              {product.recipients.map((r) => RECIPIENT_LABELS[r]).join(", ")}
            </strong>
          </p>

          <div className="mt-6">
            <AddToCartForm product={product} />
          </div>
        </div>
      </div>

      {/* Aprašymas ir savybės */}
      <section className="mt-12 grid gap-8 lg:grid-cols-[1fr_360px]" aria-labelledby="desc-heading">
        <div>
          <h2 id="desc-heading" className="font-display text-2xl font-semibold text-ink-900">
            Apie prekę
          </h2>
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-ink-600">
            {product.description.map((para) => (
              <p key={para.slice(0, 24)}>{para}</p>
            ))}
          </div>

          {/* Objektų atsakymai — pristatymas / kokybė */}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              {
                icon: <Truck className="size-5" strokeWidth={1.7} />,
                t: "Pristatymas",
                d: `Per 4–6 d. · nuo ${formatPrice(store.shipping.flatRateCents)} arba nemokamai`,
              },
              {
                icon: <ShieldCheck className="size-5" strokeWidth={1.7} />,
                t: "Kokybės garantija",
                d: "Aukštos kokybės medžiagos ir kruopšti atranka",
              },
              {
                icon: <Package className="size-5" strokeWidth={1.7} />,
                t: "Pakuotė",
                d: "Paruošta dovanoti iš karto",
              },
            ].map((x) => (
              <div key={x.t} className="rounded-cozy border border-cream-300 bg-white/60 p-4">
                <span className="text-burgundy-600">{x.icon}</span>
                <p className="mt-2 text-sm font-bold text-ink-900">{x.t}</p>
                <p className="mt-0.5 text-[13px] leading-snug text-ink-600">{x.d}</p>
              </div>
            ))}
          </div>
        </div>

        <aside aria-labelledby="specs-heading" className="h-fit rounded-cozy border border-cream-300 bg-cream-100/60 p-5">
          <h2 id="specs-heading" className="font-display text-lg font-semibold text-ink-900">
            Savybės
          </h2>
          <dl className="mt-3 divide-y divide-cream-300 text-sm">
            {product.specs.map((spec) => (
              <div key={spec.label} className="flex justify-between gap-4 py-2.5">
                <dt className="text-ink-400">{spec.label}</dt>
                <dd className="text-right font-semibold text-ink-900">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </section>

      {/* Dažnai perkama kartu */}
      <div className="mt-14">
        <FrequentlyBoughtTogether product={product} />
      </div>

      {/* Susijusios prekės */}
      {related.length > 0 ? (
        <section className="mt-12" aria-labelledby="rel-heading">
          <h2 id="rel-heading" className="mb-6 font-display text-2xl font-semibold text-ink-900">
            Jums taip pat gali patikti
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 lg:gap-x-6">
            {related.map((p) => (
              <ProductCard key={p!.slug} product={p!} />
            ))}
          </div>
        </section>
      ) : null}

      <RecentlyViewed excludeSlug={product.slug} />

      <StickyBuyBar product={product} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            productSchema(product),
            breadcrumbSchema([
              { name: "Pradžia", href: "/" },
              { name: "Dovanos", href: "/dovanos/visos-dovanos" },
              { name: product.name, href: `/produktai/${product.slug}` },
            ]),
          ]),
        }}
      />
      <TrackProductView product={product} />
    </div>
  );
}
