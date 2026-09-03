import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { collections, getCollection, getCollectionProducts } from "@/lib/data/collections";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { CollectionBrowser } from "@/components/commerce/collection-browser";
import { TrustStrip } from "@/components/commerce/trust-strip";

interface Props {
  params: Promise<{ kolekcija: string }>;
}

export function generateStaticParams() {
  return collections.map((c) => ({ kolekcija: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kolekcija } = await params;
  const meta = getCollection(kolekcija);
  if (!meta) return {};
  return {
    title: meta.seoTitle,
    description: meta.description,
    alternates: { canonical: `/dovanos/${meta.slug}` },
  };
}

export default async function CollectionPage({ params }: Props) {
  const { kolekcija } = await params;
  const meta = getCollection(kolekcija);
  if (!meta) notFound();
  const items = getCollectionProducts(kolekcija);

  return (
    <>
      <div className="texture-knit glow-candle border-b border-cream-300/70">
        <div className="mx-auto max-w-7xl px-4 py-5 text-center sm:px-6 lg:px-8 lg:py-7">
          <nav aria-label="Naršymo takelis" className="mb-4 flex items-center justify-center gap-1 text-[13px] text-ink-400">
            <Link href="/" className="hover:text-burgundy-600">Pradžia</Link>
            <ChevronRight className="size-3.5" aria-hidden />
            <span className="font-medium text-ink-600">{meta.shortTitle}</span>
          </nav>
          <h1 className="font-display text-[1.75rem] font-semibold text-ink-900 sm:text-4xl lg:text-5xl">
            {meta.title}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[14px] leading-relaxed text-ink-600 sm:mt-4 sm:text-[15px]">
            {meta.intro}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <CollectionBrowser products={items} />
      </div>

      <TrustStrip />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Pradžia", href: "/" },
              { name: "Dovanos", href: "/dovanos/visos-dovanos" },
              { name: meta.shortTitle, href: `/dovanos/${meta.slug}` },
            ])
          ),
        }}
      />
    </>
  );
}
