import { ADVERTISED_PROMOS, NEWSLETTER_PERCENT_OFF, type PromoTerms } from "./promo";

// Prenumeratorių kodas siunčiamas tik pasisveikinimo laiške, todėl jo nėra naršyklės kode.
export const NEWSLETTER_PROMO: PromoTerms = { code: "SVENTES10", percentOff: NEWSLETTER_PERCENT_OFF, minSubtotalCents: 0 };

// Visi aktyvūs kodai. Importuoti tik serveryje.
// percentOff – nuolaida procentais; minSubtotalCents – mažiausia prekių suma (0 = bet kokiam užsakymui).
// Vienam užsakymui galima pritaikyti tik vieną kodą (krepšelis ir serveris priima vieną).
export const PROMO_CODES: PromoTerms[] = [...ADVERTISED_PROMOS, NEWSLETTER_PROMO];

export function findPromo(raw: unknown): PromoTerms | null {
  if (typeof raw !== "string") return null;
  const code = raw.trim().toUpperCase();
  if (!code) return null;
  return PROMO_CODES.find((p) => p.code === code) ?? null;
}
