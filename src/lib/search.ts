import { products } from "@/lib/data/products";
import type { Product } from "@/types";

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
  mama: ["jai", "tevams", "zvakide", "arbata", "pledas", "vonia", "sildykle", "roze"],
  mamai: ["jai", "tevams", "zvakide", "arbata", "pledas", "vonia", "sildykle", "roze"],
  anyta: ["jai", "tevams", "zvakide"],
  tevas: ["jam", "tevams", "viskis", "termosas"],
  tecio: ["jam", "tevams", "viskis", "termosas"],
  teciai: ["jam", "tevams", "viskis"],
  vaikinas: ["jam", "termosas", "viskis", "kojines", "deklas", "ikroviklis", "masazas"],
  vaikinui: ["jam", "termosas", "viskis", "kojines", "deklas", "ikroviklis", "masazas"],
  mergina: ["jai", "silkas", "zvakide", "vonia", "roze"],
  merginai: ["jai", "silkas", "zvakide", "vonia", "roze"],
  draugas: ["draugui", "zaidimai", "kojines"],
  draugei: ["jai", "silkas", "zvakide"],
  kolega: ["kolegai", "uzrasine", "deklas"],
  kolegei: ["kolegai", "uzrasine", "arbata", "zvakide"],
  mokytoja: ["kolegai", "uzrasine", "arbata"],
  mokytojai: ["kolegai", "uzrasine", "arbata"],
  senelis: ["slaptas-senelis", "sodas", "kojines"],
  vaikas: ["seimai", "zaidimas", "puodelis"],
  vaikams: ["seimai", "zaidimas", "zaisliukai", "galaktika", "menulis"],
  jauku: ["pledas", "kojines", "zvakide"],
  kvapas: ["zvakide", "difuzorius", "vonia"],
  zvak: ["zvakide"],
  zvake: ["zvakide"],
  pledas: ["pledas"],
  kojines: ["kojines"],
  arbata: ["arbata"],
  girlianda: ["girlianda"],
  puodelis: ["puodelis"],
  vonia: ["vonia"],
  muilas: ["vonia"],
  ikroviklis: ["ikroviklis"],
  deklas: ["deklas"],
  uzrasine: ["uzrasine"],
  zaisliukai: ["zaisliukai", "egle"],
  eglute: ["zaisliukai", "egle"],
  lempa: ["sildymo-lempa", "menulis", "saulelydis"],
  roze: ["roze"],
  menulis: ["menulis"],
  saulelydis: ["saulelydis"],
  drekinuvas: ["lietus", "difuzorius"],
  sildykle: ["sildykle", "pledas"],
  projektorius: ["galaktika", "saulelydis"],
  plakiklis: ["plakiklis", "puodelis"],
  masazas: ["masazas"],
  pagalve: ["uzvalkalas", "silkas"],
  gua: ["guasha", "vonia"],
};

export function searchProducts(query: string): Product[] {
  const q = normalize(query);
  if (q.length < 2) return [];

  const words = q.split(/\s+/).filter((w) => w.length >= 3);
  const scored: Scored[] = [];

  for (const product of products) {
    if (!product.inStock) continue;
    const name = normalize(product.name);
    const tagline = normalize(product.tagline);
    const extra = normalize(
      `${product.recipients.join(" ")} ${product.vibes.join(" ")} ${product.occasions.join(" ")} ${product.benefits.join(" ")} ${product.artSeed}`,
    );
    const haystack = `${name} ${tagline} ${extra} ${normalize(product.slug)}`;

    let score = 0;
    if (normalize(product.slug).includes(q)) score += 6;
    if (name.includes(q)) score += 5;
    else {
      const sim = similarity(q, name.split(" ")[0] ?? "");
      if (sim > 0.55) score += 3 * sim;
    }
    if (haystack.includes(q)) score += 2;

    for (const word of words) {
      if (haystack.includes(word)) score += 2;
      const mapped = KEYWORD_MAP[word] ?? [];
      for (const kw of mapped) {
        if (
          product.recipients.includes(kw as never) ||
          product.occasions.includes(kw as never) ||
          name.includes(normalize(kw)) ||
          product.slug.includes(kw) ||
          product.artSeed.includes(kw)
        ) {
          score += 1.5;
        }
      }
    }

    if (score > 0) scored.push({ product, score });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((s) => s.product);
}
