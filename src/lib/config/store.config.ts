export const store = {
  brand: {
    name: "Kalėdų Kampelis",
    handle: "kaledukampelis",
    tagline: "Premium kalėdinės dovanos",
    description:
      "Atidžiai parinktos kalėdinės dovanos, kurios sukuria jaukumą. Pristatome visoje Lietuvoje.",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  },
  // DEMO DATA — replace with real company details before launch.
  contact: {
    email: "kaleddovanos@gmail.com",
    phone: "",
    responseTime: "Atsakome per 24 valandas",
    legalName: "Kalėdų Kampelis",
    address: "",
    companyCode: "",
  },
  shipping: {
    flatRateCents: 299,
    freeThresholdCents: 8000,
    estimate: "4–6 d.",
    carriers: [
      { id: "pastomatai", name: "LP Express paštomatas", days: "4–6 d." },
      { id: "kurjeris", name: "LP Express kurjeris", days: "4–6 d." },
      { id: "pastas", name: "Lietuvos paštas", days: "4–6 d." },
    ],
    // Kalėdų pristatymo terminas. Nustatykite tik tada, kai tai operatyviai
    // garantuota. Nulįdžius terminui, modulis automatiškai pereina į
    // „paskutinės minutės“ režimą; jeigu data null – modulis nerodomas.
    christmasDeadlineISO: "2026-12-21T23:59:00+02:00" as string | null,
    lastMinuteHint: "/rask-dovana",
  },
  payments: {
    provider: "Stripe",
    methods: ["Visa", "Mastercard", "American Express", "Apple Pay", "Google Pay", "Link"],
  },
  social: {
    instagram: "https://instagram.com/kaledukampelis",
    facebook: "https://www.facebook.com/people/Kal%C4%97d%C5%B3-Kampelis/61583105739917/",
    tiktok: "https://tiktok.com/@kaledukampelis",
  },
  search: {
    popularQueries: ["žvakė", "pledas", "advento kalendorius", "dovana mamai", "dovana vaikinui", "kojinės"],
  },
  popups: {
    enabled: true,
    emailCaptureEnabled: true,
    exitIntentEnabled: true,
    timerSeconds: 45,
    scrollPercent: 55,
    cooldownHours: 24,
    maxPerSession: 1,
    discountPercentFirstOrder: 10,
  },
  giftWrapping: {
    enabled: false,
    priceCents: 250,
    note: "Įjunkite, kai sandėlis realiai gali paketuoti dovanas.",
  },
  addons: {
    protection: { priceCents: 150 },
    donation: { stepCents: 500, cause: "Maisto banką", lineLabel: "Parama Maisto bankui" },
    priority: { priceCents: 250 },
  },
  // Kiekio („rinkinio") nuolaidos — taikomos automatiškai, rodomos aiškiai.
  bundles: {
    enabled: true,
    tiers: [
      { qty: 2, discountPct: 10, label: "Populiariausias" },
      { qty: 3, discountPct: 15, label: "Didžiausia vertė" },
    ],
  },
};

export const flags = {
  ENABLE_POPUP: true,
  ENABLE_EXIT_INTENT: true,
  ENABLE_CART_UPSELL: true,
  ENABLE_POST_PURCHASE_RECOMMENDATIONS: true,
  ENABLE_WISHLIST: true,
  ENABLE_GIFT_FINDER: true,
  ENABLE_REVIEWS: false, // Įjunkite tik turėdami TIKRUS atsiliepimus (pvz., Judge.me eksportą).
  ENABLE_FREE_SHIPPING_BAR: true,
  ENABLE_COUNTDOWN: true,
  ENABLE_GIFT_WRAPPING: false,
  ENABLE_EMAIL_CAPTURE: true,
  ENABLE_RECOMMENDATIONS: true,
  ENABLE_AB_HERO: true,
} as const;

export type CampaignTheme = {
  name: string;
  heroEyebrow: string;
  heroHeadlineA: string;
  heroHeadlineB: string;
  heroSubtext: string;
  primaryCTA: string;
  secondaryCTA: string;
  bannerText: string;
  announcementText: string | null;
  discountCode: string | null;
  theme: "christmas";
};

// Sezoninė kampanijos konfigūracija — ta pati parduotuvė veikia ir su kitomis
// kampanijomis (BF, Valentino diena ir kt.), pakeitus šį objektą.
export const campaign: CampaignTheme = {
  name: "Kaledos 2026",
  heroEyebrow: "Kalėdos 2026",
  heroHeadlineA: "Kalėdinės dovanos, kurias iš tikrųjų norisi dovanoti 🎁",
  heroHeadlineB: "Dovanos, po kurių žmonės apkabina stipriau",
  heroSubtext:
    "Raskite išskirtinę dovaną šeimai, draugams ir artimiausiems — be valandų praleistų ieškant.",
  primaryCTA: "Rasti dovaną →",
  secondaryCTA: "Peržiūrėti bestsellerius",
  bannerText: "Nemokamas pristatymas nuo 80 € · Grąžinimas per 14 d.",
  announcementText: "🎄 Kalėdinis pristatymas visoje Lietuvoje",
  discountCode: null,
  theme: "christmas",
};
