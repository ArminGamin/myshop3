import fs from "node:fs";
import path from "node:path";

export type Article = {
  brand: "kaledukampelis";
  slug: string;
  title: string;
  h1: string;
  metaDescription: string;
  intro: string;
  published: string;
  sections: { heading: string; paragraphs: string[] }[];
  faq: { q: string; a: string }[];
  relatedBlogSlugs?: string[];
  mock?: boolean;
};

export function getArticles(): Article[] {
  const directory = path.join(process.cwd(), "content", "straipsniai");
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory)
    .filter((file) => /^[a-z0-9-]+\.json$/.test(file))
    .map((file) => {
      const post = JSON.parse(fs.readFileSync(path.join(directory, file), "utf8")) as Article;
      if (post.brand !== "kaledukampelis" || `${post.slug}.json` !== file || !post.title || !post.h1 || !post.intro || !post.metaDescription || !Array.isArray(post.sections) || !Array.isArray(post.faq) || !Number.isFinite(Date.parse(post.published))) {
        throw new Error(`Invalid article: ${file}`);
      }
      return post;
    })
    .filter((post) => !post.mock)
    .sort((a, b) => b.published.localeCompare(a.published));
}

export function getArticle(slug: string) {
  return getArticles().find((post) => post.slug === slug);
}
