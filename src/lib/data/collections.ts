import { products } from "./products";
import type { Product, RecipientId, PriceRangeId } from "@/types";

export interface CollectionMeta {
  slug: string;
  title: string;
  emoji: string;
  shortTitle: string;
  seoTitle: string;
  description: string;
  intro: string;
  filter: (p: Product) => boolean;
}

const byRecipient = (r: RecipientId) => (p: Product) => p.recipients.includes(r);
const byMaxPrice = (cents: number) => (p: Product) => p.priceCents <= cents;
const inRange = (minCents: number, maxCents: number | null) => (p: Product) =>
  p.priceCents >= minCents && (maxCents === null || p.priceCents <= maxCents);

export const collections: CollectionMeta[] = [
  {
    slug: "visos-dovanos",
    title: "Visos dovanos",
    shortTitle: "Visos dovanos",
    emoji: "gift",
    seoTitle: "Kalėdinės dovanos internetu — pristatymas visoje Lietuvoje | Kalėdų Kampelis",
    description:
      "Atidžiai parinktos kalėdinės dovanos kiekvienam: jai, jam, šeimai ir porai. Nemokamas pristatymas nuo 49 €, grąžinimas per 14 d. d.",
    intro:
      "Visas mūsų kalėdinių dovanų pasirinkimas — nuo mažų malonumų iki premium rinkinių. Kiekviena prekė parinkta pagal tą patį principą: kad dovana būtų tokia, kurią iš tikrųjų norisi dovanoti.",
    filter: () => true,
  },
  {
    slug: "bestselleriai",
    title: "Bestselleriai",
    shortTitle: "Bestselleriai",
    emoji: "star",
    seoTitle: "Kalėdų bestselleriai — populiariausios dovanos 2026 | Kalėdų Kampelis",
    description:
      "Populiariausios kalėdinės dovanos, kurias perka dažniausiai. Patikrintos dešimčių pirkėjų — ideali pradžia ieškant dovanos.",
    intro:
      "Šios prekės išsirinkimo problemą išsprendžia jau tūkstančiams pirkėjų. Jeigu abejojate — pradėkite čia.",
    filter: (p) => p.bestseller,
  },
  {
    slug: "dovanos-jai",
    title: "Dovanos jai",
    shortTitle: "Jai",
    emoji: "heart",
    seoTitle: "Kalėdinės dovanos jai — moteriai, mamai, draugei | Kalėdų Kampelis",
    description:
      "Kalėdinės dovanos moteriai: aromaterapija, šilkas, keramika ir jaukumo detalės. Pristatome per 1–2 d. d., nemokamai nuo 49 €.",
    intro:
      "Dovanos, kurios rodo dėmesį: kvapai, tekstūros ir detalės, kurias ji pastebės. Nuo „saugių“ iki tikrai įspūdingų.",
    filter: byRecipient("jai"),
  },
  {
    slug: "dovanos-jam",
    title: "Dovanos jam",
    shortTitle: "Jam",
    emoji: "user",
    seoTitle: "Kalėdinės dovanos jam — vyrui, tėčiui, draugui | Kalėdų Kampelis",
    description:
      "Praktiškos ir stilingos kalėdinės dovanos vyrui: termosai, degustacijos rinkiniai, pledai. Greitas pristatymas visoje Lietuvoje.",
    intro:
      "„Jam nieko nereikia“ — girdime dažnai. Todėl čia renkamės prekes, kurios veikia: praktiškas, stilingas ir be rizikos nepatikti.",
    filter: byRecipient("jam"),
  },
  {
    slug: "dovanos-seimai",
    title: "Dovanos šeimai",
    shortTitle: "Šeimai",
    emoji: "users",
    seoTitle: "Kalėdinės dovanos šeimai — bendram laikui | Kalėdų Kampelis",
    description:
      "Dovanos, kurios suartina: žaidimų vakarai, advento kalendoriai, namų jaukumo rinkiniai. Pristatymas iki Kalėdų garantuotas.",
    intro:
      "Dovanos ne vienam žmogui, o visiems namams — už bendrą laiką, juoką ir tradicijas.",
    filter: byRecipient("seimai"),
  },
  {
    slug: "dovanos-poroms",
    title: "Dovanos poroms",
    shortTitle: "Poroms",
    emoji: "hearts",
    seoTitle: "Kalėdinės dovanos porai — romantiškos ir jaukios | Kalėdų Kampelis",
    description:
      "Dovanos porai Kalėdoms: užpildomos istorijos knygos, jaukumo rinkiniai, vakaro komplektai. Nemokamas pristatymas nuo 49 €.",
    intro:
      "Kai dovana skirta „jums dviem“ — apie bendrus vakarus, prisiminimus ir planus kartu.",
    filter: byRecipient("porai"),
  },
  {
    slug: "dovanos-iki-20-euru",
    title: "Dovanos iki 20 €",
    shortTitle: "Iki 20 €",
    emoji: "coins",
    seoTitle: "Kalėdinės dovanos iki 20 € — Slaptam Kalėdų Seneliui | Kalėdų Kampelis",
    description:
      "Stilingos kalėdinės dovanos iki 20 eurų: Slaptam Kalėdų Seneliui, kolegoms, draugams. Kokybė be didelio biudžeto.",
    intro:
      "Mažas biudžetas dar nereiškia nuobodi dovana. Čia — prekės, kurios atrodo brangiau, nei kainuoja.",
    filter: byMaxPrice(2000),
  },
  {
    slug: "dovanos-iki-30-euru",
    title: "Dovanos iki 30 €",
    shortTitle: "Iki 30 €",
    emoji: "coins",
    seoTitle: "Kalėdinės dovanos iki 30 € — populiariausias biudžetas | Kalėdų Kampelis",
    description:
      "Kalėdinės dovanos iki 30 eurų — auksinis biudžetas: žvakidės, arbatos rinkiniai, kojinės ir dar daugiau.",
    intro:
      "Populiariausias dovanų biudžetas Lietuvoje — ir mūsų didžiausias pasirinkimas.",
    filter: byMaxPrice(3000),
  },
  {
    slug: "dovanos-iki-50-euru",
    title: "Dovanos iki 50 €",
    shortTitle: "Iki 50 €",
    emoji: "coins",
    seoTitle: "Kalėdinės dovanos iki 50 € — įspūdingos ir praktiškos | Kalėdų Kampelis",
    description:
      "Įspūdingos kalėdinės dovanos iki 50 eurų: vilnos pledai, termosai, degustacijos rinkiniai. Pristatymas per 1–2 d. d.",
    intro:
      "Biudžetas, kuriame jau galima dovanoti tai, kas naudojama kasdien — ir dėl ko tikrai padėkos.",
    filter: byMaxPrice(5000),
  },
  {
    slug: "premium-dovanos",
    title: "Premium dovanos",
    shortTitle: "Premium",
    emoji: "sparkles",
    seoTitle: "Premium kalėdinės dovanos — įspūdžiui, kuris lieka | Kalėdų Kampelis",
    description:
      "Premium kalėdinės dovanos: kuruoti krepšeliai, merinoso vilnos pledai, rankų darbo keramika. Verslo dovanoms — sąskaita su PVN.",
    intro:
      "Kai dovana turi kalbėti pati už save. Mūsų kruopščiausiai parinktos prekės ir rinkiniai.",
    filter: (p) => p.premium || p.priceCents >= 5000,
  },
];

export function getCollection(slug: string): CollectionMeta | undefined {
  return collections.find((c) => c.slug === slug);
}

export function getCollectionProducts(slug: string): Product[] {
  const meta = getCollection(slug);
  if (!meta) return [];
  return products.filter((p) => meta.filter(p) && p.inStock);
}

export const PRICE_RANGES: { id: PriceRangeId; label: string; test: (p: Product) => boolean }[] = [
  { id: "iki-20", label: "Iki 20 €", test: (p) => p.priceCents <= 2000 },
  { id: "iki-30", label: "20–30 €", test: (p) => inRange(2000, 3000)(p) },
  { id: "iki-50", label: "30–50 €", test: inRange(3000, 5000) },
  { id: "50-plus", label: "50 €+", test: (p) => p.priceCents > 5000 },
];
