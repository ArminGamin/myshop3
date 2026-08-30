import { products } from "@/lib/data/products";
import type { Product } from "@/types";

// Paprastas atsparus rašybos klaidoms paieškos įvertinimas — pakankamas
// katalogui iki ~200 prekių. Augant katalogui rekomenduojama išorinė
// paieška (pvz., Algolia) per šio modulio sąsają.

interface Scored {
  product: Product;
  score: number;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[ąčęėįšųūž]/g, (c) => "aceeiisuuz".charAt("ąčęėįšųūž".indexOf(c)))
    .trim();
}

function bigrams(s: string): Set<string> {
  const set = new Set<string>();
  for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2));
  return set;
}

function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const A = bigrams(a);
  const B = bigrams(b);
  let inter = 0;
  for (const g of A) if (B.has(g)) inter++;
  return (2 * inter) / (A.size + B.size || 1);
}

const KEYWORD_MAP: Record<string, string[]> = {
  mama: ["jai", "tevams", "zvakide", "arbata", "pledas"],
  tevas: ["jam", "tevams", "viskis", "termosas"],
  vaikinas: ["jam", "termosas", "viskis", "kojines"],
  mergina: ["jai", "silkas", "zvakide"],
  draugas: ["draugui", "zaidimai", "kojines"],
  kolega: ["kolegai", "sokoladas", "adventas"],
  senelis: ["slaptas-senelis", "sokoladas", "sodas", "kojines"],
  jauku: ["pledas", "kojines", "zvakide", "sokoladas"],
  kvapas: ["zvakide", "difuzorius"],
};

export function searchProducts(query: string): Product[] {
  const q = normalize(query);
  if (q.length < 2) return [];

  const keywords = KEYWORD_MAP[q] ?? [];
  const scored: Scored[] = [];

  for (const product of products) {
    if (!product.inStock) continue;
    const name = normalize(product.name);
    const tagline = normalize(product.tagline);
    const haystack = `${name} ${tagline} ${product.recipients.join(" ")} ${product.vibes.join(" ")}`;

    let score = 0;
    if (normalize(product.slug).includes(q)) score += 6;
    if (name.includes(q)) score += 5;
    else {
      const sim = similarity(q, name.split(" ")[0] ?? "");
      if (sim > 0.55) score += 3 * sim; // rašybos klaidų tolerancija
    }
    if (haystack.includes(q)) score += 2;
    for (const kw of keywords) {
      if (
        product.recipients.includes(kw as never) ||
        product.occasions.includes(kw as never) ||
        name.includes(normalize(kw)) ||
        product.slug.includes(kw)
      ) {
        score += 1.5;
      }
    }

    if (score > 0) scored.push({ product, score });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((s) => s.product);
}
