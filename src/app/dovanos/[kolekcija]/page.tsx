import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { collections, getCollection, getCollectionProducts } from "@/lib/data/collections";
import { collectionContent } from "@/lib/data/collection-content";
import { breadcrumbSchema, faqSchema } from "@/lib/seo/schema";
import { articleCollection, getArticles, linkedProductSlugs } from "@/lib/articles";
import { ArticleCard } from "@/components/blog/article-card";
import { FAQAccordion } from "@/components/commerce/faq-accordion";
import { JsonLd } from "@/components/seo/json-ld";
import { CollectionBrowser } from "@/components/commerce/collection-browser";
import { TrustStrip } from "@/components/commerce/trust-strip";

interface Props {
  params: Promise<{ kolekcija: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return collections.map((c) => ({ kolekcija: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kolekcija } = await params;
  const meta = getCollection(kolekcija);
  if (!meta) notFound();
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
  const content = collectionContent[meta.slug];
  // Šios kolekcijos gidai; jų trūkstant – straipsniai, minintys kolekcijos prekes, tada naujausi.
  const itemSlugs = new Set(items.map((p) => p.slug));
  const allArticles = getArticles();
  const overlap = (post: (typeof allArticles)[number]) => linkedProductSlugs(post).filter((s) => itemSlugs.has(s)).length;
  const articles = [
    ...allArticles.filter((post) => articleCollection(post) === meta.slug),
    ...[...allArticles].sort((a, b) => overlap(b) - overlap(a)),
  ]
    .filter((post, i, list) => list.indexOf(post) === i)
    .slice(0, 3);

  return (
    <>
      <div className="texture-knit glow-candle border-b border-cream-300/70">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center sm:px-6 sm:py-5 lg:px-8 lg:py-7">
          <nav aria-label="Naršymo takelis" className="mb-4 flex items-center justify-center gap-1 text-[13px] text-ink-400">
            <Link href="/" className="hover:text-burgundy-600">Pradžia</Link>
            <ChevronRight className="size-3.5" aria-hidden />
            <span className="font-medium text-ink-600">{meta.shortTitle}</span>
          </nav>
          <h1 className="font-display text-[1.55rem] font-semibold leading-tight text-ink-900 sm:text-4xl lg:text-5xl">
            {content?.h1 ?? meta.title}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[14px] leading-relaxed text-ink-600 sm:mt-4 sm:text-[15px]">
            {meta.intro}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-8 pt-2 sm:px-6 sm:py-8 lg:px-8">
        <CollectionBrowser products={items} />
      </div>

      {content ? (
        <section aria-labelledby="gidas" className="mx-auto max-w-3xl px-4 pb-4 pt-6 sm:px-6 lg:pt-10">
          <h2 id="gidas" className="font-display text-[1.7rem] font-bold leading-tight text-ink-900 sm:text-[2.2rem]">
            {content.guide.heading}
          </h2>
          <div className="mt-4 space-y-4 text-[15.5px] leading-relaxed text-ink-600">
            {content.guide.paragraphs.map((para) => (
              <p key={para.slice(0, 24)}>{para}</p>
            ))}
          </div>
        </section>
      ) : null}

      {articles.length > 0 ? (
        <section aria-labelledby="kolekcijos-gidai" className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
          <h2 id="kolekcijos-gidai" className="home-h2 mb-7 font-display text-[2rem] font-bold leading-[1.06] text-ink-900 sm:text-[2.5rem]">
            Patarimai <em>ir idėjos</em>
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {articles.map((post) => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      ) : null}

      {content ? (
        <section aria-labelledby="kolekcijos-duk" className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
          <h2 id="kolekcijos-duk" className="mb-5 font-display text-[1.7rem] font-bold leading-tight text-ink-900 sm:text-[2.2rem]">
            Dažni klausimai
          </h2>
          <FAQAccordion items={content.faq} showContact={false} />
        </section>
      ) : null}

      <TrustStrip />

      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Pradžia", href: "/" },
            { name: "Dovanos", href: "/dovanos/visos-dovanos" },
            { name: meta.shortTitle, href: `/dovanos/${meta.slug}` },
          ]),
          ...(content ? [faqSchema(content.faq)] : []),
        ]}
      />
    </>
  );
}
