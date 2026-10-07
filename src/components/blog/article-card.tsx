import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock, Gift } from "lucide-react";
import {
  ARTICLES_PATH,
  articleCategory,
  formatArticleDate,
  plainExcerpt,
  readingMinutes,
  type Article,
} from "@/lib/articles";

// Viršelis: paveikslėlis, o jo nesant – šventinis gradientas su dovanos ženklu.
export function ArticleCover({
  post,
  sizes,
  priority = false,
  className = "",
}: {
  post: Article;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={`blog-cover relative overflow-hidden ${className}`}>
      {post.cover ? (
        <Image
          src={post.cover}
          alt={post.coverAlt ?? post.h1}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        />
      ) : (
        <div className="blog-cover-fallback absolute inset-0 flex items-center justify-center" aria-hidden>
          <span className="blog-cover-seal">
            <Gift className="size-7" strokeWidth={1.4} />
          </span>
        </div>
      )}
    </div>
  );
}

export function ArticleMeta({ post, light = false }: { post: Article; light?: boolean }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.5px] font-semibold ${light ? "text-cream-100/80" : "text-ink-400"}`}>
      <time dateTime={post.published}>{formatArticleDate(post.published)}</time>
      <span aria-hidden className={light ? "text-gold-300" : "text-gold-500"}>✦</span>
      <span className="inline-flex items-center gap-1">
        <Clock className="size-3.5" strokeWidth={2} aria-hidden />
        {readingMinutes(post)} min. skaitymo
      </span>
    </p>
  );
}

export function ArticleCard({ post }: { post: Article }) {
  const href = `${ARTICLES_PATH}/${post.slug}`;
  return (
    <article className="blog-card group relative flex flex-col overflow-hidden rounded-[22px]">
      <ArticleCover post={post} sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 92vw" className="aspect-[16/10]" />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {articleCategory(post) ? <p className="blog-kicker">{articleCategory(post)}</p> : null}
        <h3 className="mt-2 font-display text-[1.45rem] font-bold leading-[1.15] text-ink-900">
          <Link href={href} className="after:absolute after:inset-0 after:content-['']">
            {post.h1}
          </Link>
        </h3>
        <p className="mt-3 line-clamp-3 text-[14.5px] font-medium leading-relaxed text-ink-600">{plainExcerpt(post)}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <ArticleMeta post={post} />
          <span className="blog-card-arrow" aria-hidden>
            <ArrowUpRight className="size-4" strokeWidth={2} />
          </span>
        </div>
      </div>
    </article>
  );
}
