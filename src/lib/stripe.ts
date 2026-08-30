import "server-only";
import Stripe from "stripe";

let cached: Stripe | null = null;

// Stripe klientas. Be rakto grąžina null — UI tada aiškiai praneša apie
// nesukonfigūruotą atsiskaitymą (nieko nesimuliuojame).
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!cached) {
    cached = new Stripe(key, { typescript: true });
  }
  return cached;
}
