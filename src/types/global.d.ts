// Trečiųjų šalių analitikos įrankių langų sąsajos (įkeliami tik gavus sutikimą).
interface Window {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  fbq?: ((...args: unknown[]) => void) & {
    callMethod?: (...args: unknown[]) => void;
    queue?: unknown[];
    push?: unknown;
    loaded?: boolean;
    version?: string;
  };
  ttq?: Array<Record<string, unknown>> & { push?: unknown };
  clarity?: ((...args: unknown[]) => void) & { q?: unknown[] };
}
