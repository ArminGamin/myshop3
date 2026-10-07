import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/primitives";
import { JsonLd } from "@/components/seo/json-ld";
import { ArticleCard, ArticleCover, ArticleMeta } from "@/components/blog/article-card";
import { ARTICLES_PATH, articleCategory, getArticles, plainExcerpt } from "@/lib/articles";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { store } from "@/lib/config/store.config";

const TITLE = "Dovanų idėjos ir patarimai";
const DESCRIPTION =
  "Kalėdinių dovanų idėjos, pasirinkimo patarimai ir praktiški gidai. Atraskite, ką padovanoti artimiesiems su Kalėdų Kampeliu.";

export function generateMetadata(): Metadata {
  const hasPosts = getArticles().length > 0;
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: ARTICLES_PATH },
    openGraph: { type: "website", title: TITLE, description: DESCRIPTION, url: ARTICLES_PATH },
    // Tuščias puslapis neindeksuojamas, kad Google nematytų „ploni turinio“ puslapio.
    robots: hasPosts ? undefined : { index: false, follow: true },
  };
}

export default function ArticlesPage() {
  const posts = getArticles();
  const [featured, ...rest] = posts;
  const base = store.brand.url.replace(/\/$/, "");

  return (
    <div className="blog-shell">
      <Container className="pb-16 pt-4 sm:pb-24 sm:pt-6">
        <nav aria-label="Naršymo takelis" className="flex flex-wrap items-center gap-1 text-[13px] text-ink-400">
          <Link href="/" className="inline-flex min-h-9 items-center hover:text-burgundy-600">Pradžia</Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <span className="font-medium text-ink-600">Dovanų idėjos</span>
        </nav>

        <header className="mx-auto mt-6 max-w-2xl text-center sm:mt-10">
          <p className="blog-eyebrow">
            <Sparkles className="size-3.5" strokeWidth={2} aria-hidden />
            Dovanų žurnalas
          </p>
          <h1 className="mt-4 font-display text-[2.5rem] font-bold leading-[1.02] tracking-[-0.01em] text-ink-900 sm:text-[3.6rem]">
            Dovanų idėjos <em className="font-display-italic text-burgundy-600">ir patarimai</em>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15.5px] font-medium leading-relaxed text-ink-600 sm:text-[17px]">
            Dovana prasideda nuo dėmesio žmogui. Čia rasite idėjų ir gidų, kurie padės išsirinkti.
          </p>
        </header>

        {featured ? (
          <article className="blog-feature group relative mt-10 grid overflow-hidden rounded-[28px] sm:mt-14 lg:grid-cols-[1.15fr_1fr]">
            <ArticleCover
              post={featured}
              priority
              sizes="(min-width: 1024px) 680px, 100vw"
              className="aspect-[16/10] lg:aspect-auto lg:min-h-[26rem]"
            />
            <div className="flex flex-col justify-center p-6 sm:p-10">
              <p className="blog-kicker blog-kicker-light">{articleCategory(featured) ?? "Naujausias gidas"}</p>
              <h2 className="mt-3 font-display text-[1.9rem] font-bold leading-[1.08] text-cream-50 sm:text-[2.5rem]">
                <Link
                  href={`${ARTICLES_PATH}/${featured.slug}`}
                  className="after:absolute after:inset-0 after:content-['']"
                >
                  {featured.h1}
                </Link>
              </h2>
              <p className="mt-4 line-clamp-4 text-[15px] font-medium leading-relaxed text-cream-100/85">
                {plainExcerpt(featured)}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <ArticleMeta post={featured} light />
                <span className="blog-feature-cta" aria-hidden>
                  Skaityti
                  <ArrowRight className="size-4" strokeWidth={2} />
                </span>
              </div>
            </div>
          </article>
        ) : (
          <div className="blog-empty mx-auto mt-12 max-w-xl rounded-[24px] p-8 text-center sm:p-10">
            <p className="font-display text-2xl font-bold text-ink-900">Pirmieji dovanų gidai jau ruošiami</p>
            <p className="mt-3 text-[15px] font-medium leading-relaxed text-ink-600">
              Kol kas kviečiame atrasti dovaną pagal žmogų.
            </p>
            <Link href="/rask-dovana" className="home-more group mt-6 inline-flex">
              Rasti dovaną
              <span className="home-more-icon">
                <ArrowRight className="size-4" strokeWidth={2} />
              </span>
            </Link>
          </div>
        )}

        {rest.length > 0 ? (
          <section aria-labelledby="visi-straipsniai" className="mt-14 sm:mt-20">
            <h2 id="visi-straipsniai" className="font-display text-[1.9rem] font-bold text-ink-900 sm:text-[2.3rem]">
              Visi <em className="font-display-italic text-burgundy-600">gidai</em>
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {rest.map((post) => (
                <ArticleCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        ) : null}
      </Container>

      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Pradžia", href: "/" },
            { name: "Dovanų idėjos", href: ARTICLES_PATH },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            name: `${TITLE} | ${store.brand.name}`,
            description: DESCRIPTION,
            url: `${base}${ARTICLES_PATH}`,
            inLanguage: "lt-LT",
            publisher: { "@type": "Organization", name: store.brand.name, url: store.brand.url },
            blogPost: posts.map((post) => ({
              "@type": "BlogPosting",
              headline: post.h1,
              url: `${base}${ARTICLES_PATH}/${post.slug}`,
              datePublished: post.published,
              ...(post.cover ? { image: `${base}${post.cover}` } : {}),
            })),
          },
        ]}
      />
    </div>
  );
}
