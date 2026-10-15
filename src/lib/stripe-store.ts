import type Stripe from "stripe";

// Viena Stripe paskyra aptarnauja Kalėdų Kampelį ir Tavo knygą; kiekvienas mokėjimas pažymimas parduotuve.
export const STRIPE_STORE = "kaledukampelis";

// Tik mūsų užsakymai: pažymėti „kaledukampelis“ arba seni (be žymos) su krepšelio metadata.
export function isOurPayment(metadata: Stripe.Metadata | null | undefined): boolean {
  if (metadata?.store) return metadata.store === STRIPE_STORE;
  return Boolean(metadata?.cart);
}
