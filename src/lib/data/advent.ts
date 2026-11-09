import type { Product, RecipientId } from "@/types";
import { products } from "@/lib/data/products";
import { productRank } from "@/lib/data/product-order";

export const ADVENT_HREF = "/dovanos/advento-kalendoriai";

export const ADVENT_GROUPS: { id: RecipientId; label: string; title: string; text: string; cover: string }[] = [
  {
    id: "jai",
    label: "Jai",
    title: "Kalendoriai jai",
    text: "Grožio ritualai, auksinės smulkmenos ir jaukūs vakarai – po staigmeną kiekvieną gruodžio rytą.",
    cover: "advento-kalendorius-jaukumo-vakarai",
  },
  {
    id: "jam",
    label: "Jam",
    title: "Kalendoriai jam",
    text: "Kava iš viso pasaulio, meistro įrankiai ir linksmos kojinės – laukimas, kuris tikrai praverčia.",
    cover: "advento-kalendorius-kavos-kelione",
  },
  {
    id: "vaikams",
    label: "Vaikams",
    title: "Kalendoriai vaikams",
    text: "Konstravimas, lenktynės, mokslas, slime ir kūryba – kad laukti Kalėdų būtų dar smagiau.",
    cover: "advento-kalendorius-spalvu-pasaka",
  },
];

export function adventProducts(): Product[] {
  return products
    .filter((p) => p.inStock && p.slug.startsWith("advento-kalendorius-"))
    .sort((a, b) => productRank(a.slug) - productRank(b.slug));
}

// Kortelėje rodoma turinio nuotrauka (3-ioji) – ji geriausiai parodo, kas viduje.
export function contentsFirst(product: Product): Product {
  const [front, open, contents, ...rest] = product.images;
  if (!contents) return product;
  return { ...product, images: [contents, front, open, ...rest].filter(Boolean) };
}

// Gyvenimo būdo („aplinka“) nuotrauka, jei tokia yra.
export function lifestyleImage(product: Product): string {
  return product.images.find((src) => src.includes("-aplinka-")) ?? product.images[0];
}

export function calendarWord(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "kalendorius";
  if (mod10 >= 2 && mod10 <= 9 && (mod100 < 11 || mod100 > 19)) return "kalendoriai";
  return "kalendorių";
}
