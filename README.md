# Kalėdų Kampelis 🎄

**Premium kalėdinių dovanų parduotuvė** — Next.js 16 + TypeScript + Tailwind v4 + Stripe Checkout.
Visiškai lietuviška, mobiliajai telefonui pritaikyta, paruošta diegti Vercel platformoje.

Kataloge **37 prekės**. Kainos, aprašymai ir nuotraukos galutiniai.

---

## Greita pradžia

```bash
npm install
cp .env.example .env.local   # užpildykite raktus (gali veikti ir tuščias)
npm run dev                  # http://localhost:3000
```

Komandos: `npm run build` · `npm run lint` · `npx tsc --noEmit`

---

## Diegimas į Vercel

1. Įkelkite projektą į GitHub (`git init && git add . && git commit && git push`).
2. [vercel.com/new](https://vercel.com/new) → importuokite repo (framework’as atpažįstamas automatiškai).
3. Aplinkos kintamieji (Production + Preview):

| Kintamasis | Būtinas | Aprašymas |
|---|---|---|
| `STRIPE_SECRET_KEY` | ✅ mokėjimams | `sk_live_…` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ kortelės laukui | `pk_live_…` |
| `STRIPE_WEBHOOK_SECRET` | ✅ užsakymams | `whsec_…` |
| `NEXT_PUBLIC_SITE_URL` | ✅ | `https://www.kaledukampelis.com` |
| `ORDER_WEBHOOK_URL` | — | Discord webhook — embed po mokėjimo |
| `NEWSLETTER_WEBHOOK_URL` | — | Discord webhook — naujas prenumeratorius |

4. Stripe → Developers → Webhooks → `Add endpoint`:
   `https://www.kaledukampelis.com/api/stripe/webhook` → events: `checkout.session.completed`,
   `checkout.session.expired`, `payment_intent.succeeded` → nukopijuokite `whsec_…` į Vercel.

Be `STRIPE_SECRET_KEY` parduotuvė veikia pilnai, tik atsiskaitymas grąžina sąžiningą
503 klaidą (niekas nėra imituojama).

---

## Konfigūracija be kodo pakeitimų

Visi verslo parametrai viename faile: **`src/lib/config/store.config.ts`**

- prekės ženklas, kontaktai, socialiniai tinklai;
- pristatymo kaina ir nemokamo pristatymo slenkstis;
- `christmasDeadlineISO` — Kalėdų terminas (`2026-12-26`); `null` = modulis paslėptas;
- iššokančių langų taisyklės;
- kiekio nuolaidos (rinkiniai 2/3);
- kampanijos objektas `campaign`.

Dovanų pakavimas (`giftWrapping` / `ENABLE_GIFT_WRAPPING`) išjungtas.

---

## Paleidimo sąrašas (go-live)

1. **Deploy** — commit + push, Vercel Production env, domenas `www.kaledukampelis.com`, Stripe webhook ant to URL, live testinis pirkimas.
2. **Stripe** — patikrinti live webhook eventus, Stripe kvitą (`receipt_email`), grąžinimų procesą (rankinis).

---

## Architektūros žemėlapis

```
src/
├─ app/                    maršrutai (App Router):
│  ├─ page.tsx             pradžia
│  ├─ dovanos/[kolekcija]/ kolekcijos + filtras/rikiavimas
│  ├─ produktai/[slug]/    PDP: galerija, variantai, rinkiniai, FBT, sticky CTA
│  ├─ rask-dovana/         dovanų radiklis (4 klausimai)
│  ├─ api/checkout         Stripe sesija (kainos perskaičiuojamos serveryje)
│  ├─ api/stripe/webhook   parašo patikrinti užsakymai
│  └─ feed.xml, sitemap, robots, opengraph-image, api/art
├─ components/{ui,commerce,layout}
└─ lib/                    config · cart · consent · analytics
                           behavior · seo
```

Saugumo principai: kliento kainos nepasitikima (serveryje perskaičiuojama iš
katalogo), webhook parašo verifikacija, honeypot formose, saugumo antraštės
`next.config.ts`.
