export type AnalyticsEvent =
  | "view_item"
  | "add_to_cart"
  | "view_cart"
  | "begin_checkout"
  | "purchase"
  | "search"
  | "sign_up"
  | "quiz_complete"
  | "quiz_start"
  | "popup_view"
  | "popup_convert"
  | "ab_view";

interface TrackParams {
  item_id?: string;
  item_name?: string;
  value?: number;
  quantity?: number;
  search_term?: string;
  currency?: string;
  variant?: string;
  popup_type?: string;
  [key: string]: unknown;
}

type Consent = { analytics: boolean; marketing: boolean } | null;

function getConsent(): Consent {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("jaukumas.consent.v1");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function track(event: AnalyticsEvent, params: TrackParams = {}) {
  if (typeof window === "undefined") return;
  const consent = getConsent();
  const payload = { ...params, currency: params.currency ?? "EUR" };

  // GA4 (analytics sutikimas)
  if (consent?.analytics && typeof window.gtag === "function") {
    window.gtag("event", event, payload);
  }
  const dataLayer = (window.dataLayer ??= []);
  dataLayer.push({ event, ...payload });

  // Meta Pixel + TikTok (marketing sutikimas)
  if (consent?.marketing) {
    const metaMap: Partial<Record<AnalyticsEvent, string>> = {
      view_item: "ViewContent",
      add_to_cart: "AddToCart",
      begin_checkout: "InitiateCheckout",
      purchase: "Purchase",
      search: "Search",
      sign_up: "Lead",
    };
    const ttqMap: Partial<Record<AnalyticsEvent, string>> = {
      view_item: "ViewContent",
      add_to_cart: "AddToCart",
      begin_checkout: "InitiateCheckout",
      purchase: "CompletePayment",
    };
    const metaEvent = metaMap[event];
    if (metaEvent && typeof window.fbq === "function") {
      window.fbq("track", metaEvent, payload);
    }
    const ttqEvent = ttqMap[event];
    if (ttqEvent) {
      window.ttq = window.ttq ?? [];
      window.ttq.push({ event: ttqEvent, properties: payload });
    }
  }
}

const injected = new Set<string>();

function injectScript(id: string, src: string, attrs: Record<string, string> = {}) {
  if (typeof document === "undefined" || injected.has(id)) return;
  injected.add(id);
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
  document.head.appendChild(s);
}

// Įkelia trečiųjų šalių skriptus TIK gavus atitinkamą sutikimą.
export function loadTrackers(consent: { analytics: boolean; marketing: boolean }) {
  if (typeof window === "undefined") return;

  if (consent.analytics) {
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    if (gaId && !injected.has("ga4")) {
      injected.add("ga4");
      injectScript("gtag-src", `https://www.googletagmanager.com/gtag/js?id=${gaId}`);
      const dataLayer = (window.dataLayer ??= []);
      const gtag: NonNullable<Window["gtag"]> = function (...args: unknown[]) {
        dataLayer.push(args);
      };
      window.gtag = gtag;
      gtag("js", new Date());
      gtag("config", gaId);
    }
    const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;
    if (clarityId) {
      window.clarity =
        window.clarity ??
        function (...args: unknown[]) {
          (window.clarity as unknown as { q: unknown[] }).q =
            (window.clarity as unknown as { q: unknown[] }).q ?? [];
          (window.clarity as unknown as { q: unknown[] }).q.push(args);
        };
      injectScript("clarity", `https://www.clarity.ms/tag/${clarityId}`);
    }
  }

  if (consent.marketing) {
    const metaId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
    if (metaId && !window.fbq) {
      const fbq: NonNullable<Window["fbq"]> = function (...args: unknown[]) {
        const fn = fbq as NonNullable<Window["fbq"]> & { queue: unknown[][] };
        if (fbq.callMethod) {
          fbq.callMethod(...args);
        } else {
          fn.queue.push(args);
        }
      };
      fbq.queue = [];
      fbq.loaded = true;
      fbq.version = "2.0";
      window.fbq = fbq;
      injectScript("meta-pixel", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq("init", metaId);
    }
    const tiktokId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
    if (tiktokId && !injected.has("tiktok")) {
      injected.add("tiktok");
      window.ttq = window.ttq ?? [];
      injectScript(
        "tiktok-pixel",
        "https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=" + tiktokId
      );
    }
  }
}
