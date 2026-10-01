import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InfoPage } from "@/components/layout/info-page";
import { getArticle, getArticles } from "@/lib/articles";
import { products } from "@/lib/data/products";
import { store } from "@/lib/config/store.config";

export const dynamicParams = false;
export function generateStaticParams() { return getArticles().map(({ slug }) => ({ slug })); }
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getArticle(slug);
  if (!post) notFound();
  return {
    title: post.title,
    description: post.metaDescription,
    alternates: { canonical: `/straipsniai/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.metaDescription, url: `/straipsniai/${post.slug}`, publishedTime: post.published, authors: [store.brand.name] },
  };
}

const allowedLinks = new Set(["/rask-dovana", "/dovanos/visos-dovanos", ...products.map((p) => `/produktai/${p.slug}`)]);
function ArticleText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return <>{parts.map((part, index) => {
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (!link) return part;
    return allowedLinks.has(link[2]) ? <Link className="underline decoration-gold-500 underline-offset-4 hover:decoration-2" key={index} href={link[2]}>{link[1]}</Link> : link[1];
  })}</>;
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = getArticle(slug);
  if (!post) notFound();
  const related = getArticles().filter((p) => p.slug !== slug && post.relatedBlogSlugs?.includes(p.slug)).slice(0, 3);
  const url = `${store.brand.url.replace(/\/$/, "")}/straipsniai/${slug}`;
  const schema = {
    "@context": "https://schema.org", "@type": "BlogPosting", headline: post.h1,
    description: post.metaDescription, datePublished: post.published, dateModified: post.published,
    inLanguage: "lt-LT", mainEntityOfPage: url,
    author: { "@type": "Organization", name: store.brand.name, url: store.brand.url },
    publisher: { "@type": "Organization", name: store.brand.name, url: store.brand.url },
  };
  return <article className="mx-auto max-w-4xl">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <InfoPage title={post.h1}>
      <p className="text-sm text-ink-700"><Link className="underline" href="/straipsniai">Dovanų idėjos</Link> · {store.brand.name} · <time dateTime={post.published}>{new Date(post.published).toLocaleDateString("lt-LT", { timeZone: "Europe/Vilnius" })}</time></p>
      <p className="leading-relaxed"><ArticleText text={post.intro} /></p>
      {post.sections.map((section, index) => <section className="space-y-4 leading-relaxed" key={index}>
        <h2>{section.heading}</h2>
        {section.paragraphs.map((paragraph, i) => <p key={i}><ArticleText text={paragraph} /></p>)}
      </section>)}
      {post.faq.length > 0 && <section className="space-y-4"><h2>Dažniausiai užduodami klausimai</h2>
        {post.faq.map((item, i) => <div key={i}><h3 className="font-bold">{item.q}</h3><p className="mt-2 leading-relaxed"><ArticleText text={item.a} /></p></div>)}
      </section>}
      <aside className="rounded-2xl border border-gold-300/40 bg-cream-50 p-5"><h2>Dar ieškote tinkamos dovanos?</h2><p className="mt-3"><Link className="underline" href="/rask-dovana">Atraskite dovaną pagal žmogų</Link> arba <Link className="underline" href="/dovanos/visos-dovanos">peržiūrėkite visas dovanas</Link>.</p></aside>
      {related.length > 0 && <nav aria-label="Susiję straipsniai"><h2>Daugiau dovanų idėjų</h2><ul>{related.map((p) => <li key={p.slug}><Link className="underline" href={`/straipsniai/${p.slug}`}>{p.h1}</Link></li>)}</ul></nav>}
    </InfoPage>
  </article>;
}
