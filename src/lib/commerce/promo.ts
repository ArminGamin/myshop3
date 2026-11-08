// Nuolaidos kodo sąlygos ir skaičiavimas – bendra kliento ir serverio logika,
// kad atsiskaitymo suma visada sutaptų su rodoma. Visų kodų sąrašas – promo-codes.ts (tik serveryje).
export type PromoTerms = {
  code: string;
  percentOff: number;
  minSubtotalCents: number;
};

// Viešai reklamuojami kodai (rodomi svetainėje), nuo mažiausios sumos.
export const ADVERTISED_PROMOS: PromoTerms[] = [
  { code: "JAUKU5", percentOff: 5, minSubtotalCents: 0 },
  { code: "KAMPELIS10", percentOff: 10, minSubtotalCents: 3500 },
  { code: "KALEDOS15", percentOff: 15, minSubtotalCents: 5000 },
  { code: "DOVANOS20", percentOff: 20, minSubtotalCents: 8000 },
];

// Prenumeratoriams siunčiamo kodo nuolaida (pats kodas – tik serveryje ir laiške).
export const NEWSLETTER_PERCENT_OFF = 10;

// Nuolaida taikoma prekių sumai (be pristatymo ir priedų).
export function promoDiscountCents(promo: PromoTerms | null, subtotalCents: number): number {
  if (!promo || subtotalCents < promo.minSubtotalCents) return 0;
  return Math.round((subtotalCents * promo.percentOff) / 100);
}

// Geriausias reklamuojamas kodas šiai sumai ir kitas laiptelis, iki kurio dar trūksta.
export function promoLadder(subtotalCents: number) {
  const best = ADVERTISED_PROMOS.filter((p) => subtotalCents >= p.minSubtotalCents).at(-1) ?? null;
  const next = ADVERTISED_PROMOS.find((p) => p.minSubtotalCents > subtotalCents) ?? null;
  return { best, next };
}
