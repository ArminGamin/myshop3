# Kalėdų Kampelis 🎄

**Premium kalėdinių dovanų parduotuvė** — Next.js 16 + TypeScript + Tailwind v4 + Stripe Checkout.
Visiškai lietuviška, mobiliajai telefonui pritaikyta, paruošta diegti Vercel platformoje.

> ⚠️ **DEMO BŪSENOS ĮSPĖJIMAS:** kataloge (14 prekių), atsiliepimų architektūroje ir
> juridiniuose puslapiuose naudojami aiškiai pažymėti DEMO duomenys. Prieš priimdami
> mokėjimus ir paleisdami reklamą, pakeiskite juos realiais (žr. „Paleidimo sąrašas“).

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
| `STRIPE_SECRET_KEY` | ✅ mokėjimams | `sk_test_…` / `sk_live_…` |
| `STRIPE_WEBHOOK_SECRET` | ✅ užsakymams | `whsec_…` |
| `NEXT_PUBLIC_SITE_URL` | ✅ | `https://jusu-domenas.lt` |
| `NEXT_PUBLIC_GA_ID` | — | GA4 (`G-…`) |
| `NEXT_PUBLIC_CLARITY_ID` | — | Microsoft Clarity |
| `NEXT_PUBLIC_META_PIXEL_ID` / `NEXT_PUBLIC_TIKTOK_PIXEL_ID` | — | pikseliai |
| `KLAVIYO_API_KEY`, `KLAVIYO_LIST_ID` | — | naujienlaiškio sinchronizacija |
| `ORDER_WEBHOOK_URL` | — | užsakymų persiuntimas (Make/Zapier/ERP) |

4. Stripe → Developers → Webhooks → `Add endpoint`:
   `https://jusu-domenas.lt/api/stripe/webhook` → events: `checkout.session.completed`,
   `checkout.session.expired` → nukopijuokite `whsec_…` į Vercel.

Be `STRIPE_SECRET_KEY` parduotuvė veikia pilnai, tik atsiskaitymas grąžina sąžiningą
503 klaidą (niekas nėra imituojama).

---

## Konfigūracija be kodo pakeitimų

Visi verslo parametrai viename faile: **`src/lib/config/store.config.ts`**

- prekės ženklas, kontaktai (dabar DEMO), socialiniai tinklai;
- pristatymo kaina ir nemokamo pristatymo slenkstis;
- `christmasDeadlineISO` — Kalėdų terminas: `null` = modulis paslėptas; praėjęs =
  automatinis „paskutinės minutės“ režimas; likus ≤7 d. = skubos režimas;
- iššokančių langų taisyklės (dažnis, vėsinimas, nuolaidos %);
- kiekio nuolaidos (rinkiniai 2/3);
- kampanijos objektas `campaign` — ta pati parduotuvė per naudojama BF, Vasario 14
  ir kt. (keičiasi antraštė, CTA, juosta).

Funkcijų jungikliai (`flags`): `ENABLE_POPUP`, `ENABLE_EXIT_INTENT`, `ENABLE_WISHLIST`,
`ENABLE_GIFT_FINDER`, `ENABLE_FREE_SHIPPING_BAR`, `ENABLE_AB_HERO`, `ENABLE_REVIEWS`
(ir kt.) — tos pačios bylos apačioje.

---

## Paleidimo sąrašas (go-live)

1. **Produktai** — pakeiskite `src/lib/data/products.ts`: tikros kainos, aprašymai,
   nuotraukos (`images: [url]`; be jų automatiškai generuojami DEMO meniški SVG/PNG).
2. **Atsiliepimai** — `ENABLE_REVIEWS` lieka `false`, kol neturite TIKRų atsiliepimų
   (pvz., Judge.me/Loox eksportas → `rating`, `reviewCount`). Struktūriniai duomenys
   (`AggregateRating`) įjungiami kartu su vėliava — niekada nesukurkite dirbtinių.
3. **Juridika** — `/privatumo-politika`, `/pirkimo-taisykles`, `/grazinimas`:
   patikrinkite su teisininku; įmonės rekvizitai `store.contact`.
4. **Stripe** — test režimu apmokėkite `4242 4242 4242 4242`, patikrinkite webhook
   `[ORDER]` žurnalą, tada perjunkite į live raktus.
5. **Kalėdų terminas** — nustatykite `christmasDeadlineISO` TIK jeigu operatyviai
   spėjate; kitaip palikite `null`.
6. **Analitika** — įdėkite ID; skriptai užsikrauna tik po sutikimo banerio.
7. **Katalogų feed'ai** — `https://domenas.lt/feed.xml` → Google Merchant Center /
   Meta Catalog / TikTok Catalog (iki tol pakeiskite DEMO paveikslėlius realiais).
8. **El. laiškai (Klaviyo)** — sukurti flows pagal žemiau esančius planus.

---

## El. pašto automatizacijų planai (Klaviyo)

**Welcome (5):** ① pasveikinimas + 10 % kodas → ② bestseleriai → ③ dovanų gidai →
④ socialinis įrodymas → ⑤ Kalėdų terminas.

**Abandoned checkout (3):** ① „Jūsų dovana dar laukia 🎁“ (+1 h) → ② nauda +
atsiliepimai (+20 h) → ③ paskutinis priminimas prieš terminą (+44 h).

**Browse abandonment (1):** peržiūrėta prekė + „Dažnai perkama kartu“ (+6 h).

**Post-purchase (7):** ① patvirtinimas → ② išsiuntimas → ③ pristatymas → ④ kaip
naudoti/dovanoti → ⑤ atsiliepimo prašymas (+5 d.) → ⑥ kryžminė prekė (+14 d.) →
⑦ sezoninė kampanija.

Trigeriai jau siunčia įvykius: `view_item`, `add_to_cart`, `begin_checkout`,
`purchase`, `sign_up`, `search`, `quiz_complete`.

---

## Architektūros žemėlapis

```
src/
├─ app/                    maršrutai (App Router):
│  ├─ page.tsx             pradžia (17 sekcijų)
│  ├─ dovanos/[kolekcija]/ kolekcijos + filtras/rikiavimas
│  ├─ produktai/[slug]/    PDP: galerija, variantai, rinkiniai, FBT, sticky CTA
│  ├─ rask-dovana/         dovanų radiklis (4 klausimai)
│  ├─ api/checkout         Stripe sesija (kainos perskaičiuojamos serveryje!)
│  ├─ api/stripe/webhook   parašo patikrinti užsakymai
│  └─ feed.xml, sitemap, robots, opengraph-image, api/art
├─ components/{ui,commerce,layout}
└─ lib/                    config · cart(external store) · consent · analytics
                           behavior(exit-intent, popup prioritetų variklis) · seo
```

Saugumo principai: kliento kainos nepasitikima (serveryje perskaičiuojama iš
katalogo), webhook parašo verifikacija, sutikimo valdomi pikseliai, honeypot
formose, saugumo antraštės `next.config.ts`.

## Veiklos rodmenys (be papildomų app'ų)

GA4 įvykiai dengia visą funnelį; Clarity — rage/dead click analizę. Verslo vertes
(slenkstis, terminai, nuolaidos) keiskite konfigūracijoje, ne kode.
