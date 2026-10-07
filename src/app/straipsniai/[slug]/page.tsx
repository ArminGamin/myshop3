import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight, Plus } from "lucide-react";
import { Container } from "@/components/ui/primitives";
import { JsonLd } from "@/components/seo/json-ld";
import { ProductCard } from "@/components/commerce/product-card";
import { ArticleCard, ArticleCover, ArticleMeta } from "@/components/blog/article-card";
import {
  ARTICLES_PATH,
  articleCategory,
  getArticle,
  getArticles,
  headingId,
  linkedProductSlugs,
  type Article,
} from "@/lib/articles";
import { getProducts, products } from "@/lib/data/products";
import { breadcrumbSchema, faqSchema } from "@/lib/seo/schema";
import { store } from "@/lib/config/store.config";

export const dynamicParams = false;
export function generateStaticParams() {
  return getArticles().map(({ slug }) => ({ slug }));
}
type Props = { params: Promise<{ slug: string }> };

const base = store.brand.url.replace(/\/$/, "");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getArticle(slug);
  if (!post) notFound();
  const url = `${ARTICLES_PATH}/${post.slug}`;
  const images = post.cover ? [{ url: post.cover, alt: post.coverAlt ?? post.h1 }] : undefined;
  return {
    title: post.title,
    description: post.metaDescription,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.metaDescription,
      url,
      publishedTime: post.published,
      modifiedTime: post.updated ?? post.published,
      authors: [store.brand.name],
      ...(images ? { images } : {}),
    },
    twitter: { card: images ? "summary_large_image" : "summary", title: post.title, description: post.metaDescription },
  };
}

// Straipsnio tekste leidžiamos tik vidinės nuorodos į esamus puslapius.
const allowedLinks = new Set([
  "/rask-dovana",
  "/dovanos/visos-dovanos",
  ...products.map((p) => `/produktai/${p.slug}`),
]);
function isAllowed(href: string) {
  return allowedLinks.has(href) || /^\/straipsniai\/[a-z0-9-]+$/.test(href) || /^\/dovanos\/[a-z0-9-]+$/.test(href);
}

function ArticleText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((part, index) => {
        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
        if (!link) return part;
        return isAllowed(link[2]) ? (
          <Link key={index} href={link[2]} className="blog-link">
            {link[1]}
          </Link>
        ) : (
          link[1]
        );
      })}
    </>
  );
}

const stripMd = (text: string) => text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

function relatedFor(post: Article) {
  const all = getArticles().filter((p) => p.slug !== post.slug);
  const picked = all.filter((p) => post.relatedBlogSlugs?.includes(p.slug));
  return [...picked, ...all.filter((p) => !picked.includes(p))].slice(0, 3);
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = getArticle(slug);
  if (!post) notFound();

  const toc = post.sections.map((section, i) => ({ id: headingId(section.heading, i), heading: section.heading }));
  const picks = getProducts(linkedProductSlugs(post)).filter((p) => p.inStock).slice(0, 4);
  const related = relatedFor(post);
  const url = `${base}${ARTICLES_PATH}/${post.slug}`;
  const category = articleCategory(post);

  return (
    <div className="blog-shell">
      <Container className="pb-16 pt-4 sm:pb-24 sm:pt-6">
        <nav aria-label="Naršymo takelis" className="flex flex-wrap items-center gap-1 text-[13px] text-ink-400">
          <Link href="/" className="inline-flex min-h-9 items-center hover:text-burgundy-600">Pradžia</Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <Link href={ARTICLES_PATH} className="inline-flex min-h-9 items-center hover:text-burgundy-600">Dovanų idėjos</Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <span className="max-w-[46vw] truncate font-medium text-ink-600">{post.h1}</span>
        </nav>

        <article>
          <header className="mx-auto mt-5 max-w-3xl text-center sm:mt-9">
            {category ? <p className="blog-kicker">{category}</p> : null}
            <h1 className="mt-3 font-display text-[2.2rem] font-bold leading-[1.05] tracking-[-0.01em] text-ink-900 sm:text-[3.3rem]">
              {post.h1}
            </h1>
            <div className="mt-4 flex justify-center">
              <ArticleMeta post={post} />
            </div>
          </header>

          {post.cover ? (
            <ArticleCover
              post={post}
              priority
              sizes="(min-width: 1280px) 1100px, 100vw"
              className="mx-auto mt-8 aspect-[16/9] max-w-5xl rounded-[26px] sm:mt-10"
            />
          ) : (
            <div className="blog-rule mx-auto mt-8 max-w-5xl sm:mt-10" aria-hidden />
          )}

          <div className="mx-auto mt-8 grid max-w-5xl gap-10 sm:mt-12 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-14">
            <div className="min-w-0">
              {toc.length > 1 ? (
                <details className="blog-toc-mobile mb-8 lg:hidden">
                  <summary>
                    Šiame gide
                    <Plus className="size-4" strokeWidth={2} aria-hidden />
                  </summary>
                  <ol>
                    {toc.map((item) => (
                      <li key={item.id}>
                        <a href={`#${item.id}`}>{item.heading}</a>
                      </li>
                    ))}
                  </ol>
                </details>
              ) : null}

              <div className="blog-prose">
                <p className="blog-lead">
                  <ArticleText text={post.intro} />
                </p>
                {post.sections.map((section, i) => (
                  <section key={toc[i].id} aria-labelledby={toc[i].id}>
                    <h2 id={toc[i].id}>{section.heading}</h2>
                    {section.paragraphs.map((paragraph, j) => (
                      <p key={j}>
                        <ArticleText text={paragraph} />
                      </p>
                    ))}
                  </section>
                ))}
              </div>

              {post.faq.length > 0 ? (
                <section aria-labelledby="duk" className="mt-12">
                  <h2 id="duk" className="font-display text-[1.75rem] font-bold text-ink-900 sm:text-[2rem]">
                    Dažniausiai užduodami <em>klausimai</em>
                  </h2>
                  <div className="mt-5 space-y-3">
                    {post.faq.map((item, i) => (
                      <details key={i} className="blog-faq" open={i === 0}>
                        <summary>
                          <span>{item.q}</span>
                          <Plus className="blog-faq-icon size-4 shrink-0" strokeWidth={2} aria-hidden />
                        </summary>
                        <p>
                          <ArticleText text={item.a} />
                        </p>
                      </details>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-28 space-y-6">
                {toc.length > 1 ? (
                  <nav aria-label="Straipsnio turinys" className="blog-toc">
                    <p className="blog-toc-title">Šiame gide</p>
                    <ol>
                      {toc.map((item) => (
                        <li key={item.id}>
                          <a href={`#${item.id}`}>{item.heading}</a>
                        </li>
                      ))}
                    </ol>
                  </nav>
                ) : null}
                <div className="blog-aside-cta">
                  <p className="font-display text-[1.35rem] font-bold leading-tight text-cream-50">
                    Ieškote dovanos <em>konkrečiam žmogui?</em>
                  </p>
                  <Link href="/rask-dovana" className="blog-aside-btn">
                    Rasti dovaną
                    <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </article>

        {picks.length > 0 ? (
          <section aria-labelledby="gido-dovanos" className="mx-auto mt-16 max-w-5xl sm:mt-20">
            <h2 id="gido-dovanos" className="font-display text-[1.9rem] font-bold text-ink-900 sm:text-[2.3rem]">
              Šiame gide <em>minimos dovanos</em>
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {picks.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="blog-band mx-auto mt-16 max-w-5xl rounded-[26px] p-7 text-center sm:mt-20 sm:p-12">
          <p className="font-display text-[1.8rem] font-bold leading-tight text-cream-50 sm:text-[2.4rem]">
            Dar ieškote <em>tinkamos dovanos?</em>
          </p>
          <p className="mx-auto mt-3 max-w-md text-[15px] font-medium text-cream-100/80">
            Atraskite dovaną pagal žmogų arba peržiūrėkite visą kolekciją.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/rask-dovana" className="blog-aside-btn">
              Rasti dovaną
              <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
            </Link>
            <Link href="/dovanos/visos-dovanos" className="blog-ghost-btn">
              Visos dovanos
            </Link>
          </div>
        </section>

        {related.length > 0 ? (
          <section aria-labelledby="daugiau-idreju" className="mx-auto mt-16 max-w-6xl sm:mt-20">
            <div className="flex items-end justify-between gap-4">
              <h2 id="daugiau-idreju" className="font-display text-[1.9rem] font-bold text-ink-900 sm:text-[2.3rem]">
                Daugiau <em>dovanų idėjų</em>
              </h2>
              <Link href={ARTICLES_PATH} className="home-more group hidden sm:inline-flex">
                Visi gidai
                <span className="home-more-icon">
                  <ArrowRight className="size-4" strokeWidth={2} />
                </span>
              </Link>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {related.map((p) => (
                <ArticleCard key={p.slug} post={p} />
              ))}
            </div>
          </section>
        ) : null}
      </Container>

      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.h1,
            description: post.metaDescription,
            datePublished: post.published,
            dateModified: post.updated ?? post.published,
            inLanguage: "lt-LT",
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            url,
            ...(post.cover ? { image: `${base}${post.cover}` } : {}),
            ...(post.keywords?.length ? { keywords: post.keywords.join(", ") } : {}),
            articleSection: category,
            author: { "@type": "Organization", name: store.brand.name, url: store.brand.url },
            publisher: { "@type": "Organization", name: store.brand.name, url: store.brand.url },
          },
          breadcrumbSchema([
            { name: "Pradžia", href: "/" },
            { name: "Dovanų idėjos", href: ARTICLES_PATH },
            { name: post.h1, href: `${ARTICLES_PATH}/${post.slug}` },
          ]),
          ...(post.faq.length ? [faqSchema(post.faq.map((f) => ({ q: stripMd(f.q), a: stripMd(f.a) })))] : []),
        ]}
      />
    </div>
  );
}
