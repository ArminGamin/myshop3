import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { getCollectionProducts } from "@/lib/data/collections";

export type Article = {
  brand: "kaledukampelis";
  slug: string;
  title: string;
  h1: string;
  metaDescription: string;
  intro: string;
  published: string;
  /** Neprivaloma: paskutinio atnaujinimo data (ISO). */
  updated?: string;
  /** Neprivaloma: kategorija kortelei, pvz. „Dovanų gidas“. */
  category?: string;
  /** Neprivaloma: viršelio paveikslėlis iš public/, pvz. "/straipsniai/mano-gidas.webp". */
  cover?: string;
  coverAlt?: string;
  /** Neprivaloma: prekių slug'ai, rodomi straipsnio pabaigoje. */
  productSlugs?: string[];
  sections: { heading: string; paragraphs: string[] }[];
  faq: { q: string; a: string }[];
  relatedBlogSlugs?: string[];
  /** SEO įrankio laukai. */
  topic?: string;
  keywords?: string[];
  mock?: boolean;
};

export const ARTICLES_PATH = "/straipsniai";

function isValid(post: Article, file: string) {
  return (
    post?.brand === "kaledukampelis" &&
    `${post.slug}.json` === file &&
    Boolean(post.title && post.h1 && post.intro && post.metaDescription) &&
    Array.isArray(post.sections) &&
    Array.isArray(post.faq) &&
    Number.isFinite(Date.parse(post.published)) &&
    (post.cover === undefined || post.cover.startsWith("/"))
  );
}

// Straipsniai gyvena tik content/straipsniai/*.json. Netvarkingas failas
// praleidžiamas (ne nulaužia build'o ar sitemap), kad blogas niekaip
// nepaveiktų likusios parduotuvės.
export const getArticles = cache((): Article[] => {
  const directory = path.join(process.cwd(), "content", "straipsniai");
  if (!fs.existsSync(directory)) return [];
  const posts: Article[] = [];
  for (const file of fs.readdirSync(directory)) {
    if (!/^[a-z0-9-]+\.json$/.test(file)) continue;
    try {
      const post = JSON.parse(fs.readFileSync(path.join(directory, file), "utf8")) as Article;
      if (!isValid(post, file)) {
        console.warn(`[straipsniai] Praleistas netinkamas failas: ${file}`);
        continue;
      }
      if (!post.mock) posts.push(post);
    } catch {
      console.warn(`[straipsniai] Nepavyko perskaityti: ${file}`);
    }
  }
  return posts.sort((a, b) => b.published.localeCompare(a.published));
});

export function getArticle(slug: string) {
  return getArticles().find((post) => post.slug === slug);
}

const stripLinks = (text: string) => text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

export function articleWords(post: Article) {
  const text = [
    post.intro,
    ...post.sections.flatMap((s) => [s.heading, ...s.paragraphs]),
    ...post.faq.flatMap((f) => [f.q, f.a]),
  ]
    .map(stripLinks)
    .join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}

export function readingMinutes(post: Article) {
  return Math.max(1, Math.round(articleWords(post) / 200));
}

export function articleCategory(post: Article) {
  return post.category ?? post.topic;
}

// Prekės, į kurias straipsnis nukreipia, eilės tvarka.
export function linkedProductSlugs(post: Article) {
  const text = JSON.stringify([post.intro, post.sections, post.faq]);
  const found = [...text.matchAll(/\(\/produktai\/([a-z0-9-]+)\)/g)].map((m) => m[1]);
  return [...new Set([...(post.productSlugs ?? []), ...found])];
}

export function plainExcerpt(post: Article) {
  return stripLinks(post.metaDescription);
}

const LT_MAP: Record<string, string> = { ą: "a", č: "c", ę: "e", ė: "e", į: "i", š: "s", ų: "u", ū: "u", ž: "z" };

export function headingId(text: string, index: number) {
  const slug = text
    .toLowerCase()
    .replace(/[ąčęėįšųūž]/g, (c) => LT_MAP[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return slug || `dalis-${index + 1}`;
}

export function formatArticleDate(iso: string) {
  return new Date(iso).toLocaleDateString("lt-LT", {
    timeZone: "Europe/Vilnius",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Kolekcija, į kurią straipsnis nukreipia (ir kurioje rodomas): pagal adresą, o nepavykus – pagal minimas prekes.
const COLLECTION_RULES: [RegExp, string][] = [
  [/iki-20/, "dovanos-iki-20-euru"],
  [/iki-30/, "dovanos-iki-30-euru"],
  [/iki-50/, "dovanos-iki-50-euru"],
  [/mamai|moteriai|draugei|sesei|kolegei|zmonai|merginai|mociutei|-jai\b/, "dovanos-jai"],
  [/teciui|vyrui|vaikinui|draugui|broliui|seneliui|-jam\b/, "dovanos-jam"],
  [/porai|poroms|dviese|romantisk/, "dovanos-poroms"],
  [/seimai|seimos|vaikams|vaikui/, "dovanos-seimai"],
];
const RECIPIENT_COLLECTIONS = ["dovanos-jai", "dovanos-jam", "dovanos-poroms", "dovanos-seimai"];

export function articleCollection(post: Article): string {
  const rule = COLLECTION_RULES.find(([pattern]) => pattern.test(post.slug));
  if (rule) return rule[1];
  const linked = new Set(linkedProductSlugs(post));
  let best = "visos-dovanos";
  let bestScore = 0;
  for (const slug of RECIPIENT_COLLECTIONS) {
    const score = getCollectionProducts(slug).filter((p) => linked.has(p.slug)).length;
    if (score > bestScore) [best, bestScore] = [slug, score];
  }
  return best;
}
