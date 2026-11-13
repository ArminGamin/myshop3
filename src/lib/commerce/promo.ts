// Nuolaidos kodo sąlygos ir skaičiavimas – bendra kliento ir serverio logika,
// kad atsiskaitymo suma visada sutaptų su rodoma. Visų kodų sąrašas – promo-codes.ts (tik serveryje).
export type PromoTerms = {
  code: string;
  percentOff: number;
  minSubtotalCents: number;
  /** Jei nurodyta – nuolaida taikoma tik prekėms, kurių slug prasideda šiuo priešdėliu. */
  slugPrefix?: string;
};

// Viešai reklamuojami kodai (rodomi svetainėje), nuo mažiausios sumos.
export const ADVERTISED_PROMOS: PromoTerms[] = [
  { code: "JAUKU5", percentOff: 5, minSubtotalCents: 0 },
  { code: "KAMPELIS10", percentOff: 10, minSubtotalCents: 3500 },
  { code: "KALEDOS15", percentOff: 15, minSubtotalCents: 5000 },
  { code: "DOVANOS20", percentOff: 20, minSubtotalCents: 8000 },
];

// LEGO kodas – checkout siūlomas, kai krepšelyje yra LEGO rinkinys.
export const LEGO_PROMO: PromoTerms = { code: "LEGO10", percentOff: 10, minSubtotalCents: 0, slugPrefix: "lego-" };

// Prenumeratoriams siunčiamo kodo nuolaida (pats kodas – tik serveryje ir laiške).
export const NEWSLETTER_PERCENT_OFF = 10;

// Prekių suma, kuriai taikomas kodas (LEGO10 – tik LEGO rinkiniai).
export function promoEligibleCents(promo: PromoTerms | null, lines: { slug: string; lineTotalCents: number }[]): number {
  return lines
    .filter((line) => !promo?.slugPrefix || line.slug.startsWith(promo.slugPrefix))
    .reduce((sum, line) => sum + line.lineTotalCents, 0);
}

// Nuolaida taikoma prekių sumai (be pristatymo ir priedų); riboto kodo – tik tinkamoms prekėms.
export function promoDiscountCents(promo: PromoTerms | null, subtotalCents: number, eligibleCents = subtotalCents): number {
  if (!promo || subtotalCents < promo.minSubtotalCents) return 0;
  return Math.round(((promo.slugPrefix ? eligibleCents : subtotalCents) * promo.percentOff) / 100);
}

// Kodas su didžiausia nuolaida eurais: LEGO10 (jei krepšelyje yra LEGO) arba geriausias reklamuojamas.
export function bestPromo(subtotalCents: number, lines: { slug: string; lineTotalCents: number }[]): PromoTerms | null {
  const ladderBest = promoLadder(subtotalCents).best;
  const off = (p: PromoTerms | null) => promoDiscountCents(p, subtotalCents, promoEligibleCents(p, lines));
  return off(LEGO_PROMO) > off(ladderBest) ? LEGO_PROMO : ladderBest;
}

// Geriausias reklamuojamas kodas šiai sumai ir kitas laiptelis, iki kurio dar trūksta.
export function promoLadder(subtotalCents: number) {
  const best = ADVERTISED_PROMOS.filter((p) => subtotalCents >= p.minSubtotalCents).at(-1) ?? null;
  const next = ADVERTISED_PROMOS.find((p) => p.minSubtotalCents > subtotalCents) ?? null;
  return { best, next };
}
