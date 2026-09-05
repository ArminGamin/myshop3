export type StorefrontReview = {
  id: string;
  name: string;
  city: string;
  rating: number;
  text: string;
  bought: string;
  image: string;
};

export const STOREFRONT_REVIEWS: StorefrontReview[] = [
  {
    id: "giedre",
    name: "Giedrė J.",
    city: "Vilnius",
    rating: 5,
    bought: "Aromaterapijos žvakidė „Šventinis vakaras“",
    text: "Draugė rekomendavo, tai nusprendėm išbandyti. Nenusivylėm. Žvakė dega jau trečią vakarą - kvapas vis dar toks jaukus 😊",
    image: "/reviews/giedre.png",
  },
  {
    id: "tomas",
    name: "Tomas V.",
    city: "Alytus",
    rating: 5,
    bought: "Vilnonis pledas „Kalėdų Kampelis“",
    text: "Pirkau mamai pledą, bet pirma pats pažiūrėjau 😂 Pakuotė graži, atrodo brangiau nei kainavo. Kol kas jokių nusiskundimų.",
    image: "/reviews/tomas.png",
  },
  {
    id: "ruta",
    name: "Rūta L.",
    city: "Klaipėda",
    rating: 5,
    bought: "Šventinis dovanų krepšelis „Jaukiausios Kalėdos“",
    text: "Realiai nesitikėjau, kad dėžutė bus tokia jauki 😍 Su sese atidarėm ir abi likom sužavėtos!",
    image: "/reviews/ruta.png",
  },
  {
    id: "mantas",
    name: "Mantas K.",
    city: "Kaunas",
    rating: 5,
    bought: "Vilnonis pledas „Kalėdų Kampelis“",
    text: "Visai bomba 🔥 pledas šiltas, atėjo greičiau nei rašė. Kalėdoms tinka 100%",
    image: "/reviews/mantas.png",
  },
  {
    id: "laura",
    name: "Laura M.",
    city: "Kaunas",
    rating: 5,
    bought: "Vaikų žaidimas „Eglutės atmintis“",
    text: "Nupirkau sūnėnui žaidimą jo reakcija buvo geriausia dalis 😄 Dabar klausia kada vėl žaisim.",
    image: "/reviews/laura.png",
  },
  {
    id: "jonas",
    name: "Jonas P.",
    city: "Šiauliai",
    rating: 5,
    bought: "Vilnonės kojinės „Žiemos jaukumas“ (3 poros)",
    text: "Viskas tvarkoj su kojinėm, tik pristatymas galėjo būti dieną anksčiau. Prekė kaip nuotraukoj, kokybė gera.",
    image: "/reviews/jonas.png",
  },
  {
    id: "ieva",
    name: "Ieva S.",
    city: "Vilnius",
    rating: 5,
    bought: "Aromaterapijos žvakidė „Šventinis vakaras“",
    text: "Nupirkome pradžiai vieną žvakę, bet greitai teko užsakyti dar 😉 Anyta irgi norėjo tokios pačios",
    image: "/reviews/ieva.png",
  },
  {
    id: "andrius",
    name: "Andrius R.",
    city: "Panevėžys",
    rating: 5,
    bought: "Aromaterapijos žvakidė „Šventinis vakaras“",
    text: "Pirkau žmonai, bet pats pirmas pauosčiau žvakę 😂 Kvepia namie kaip per Kūčias. Rekomenduoju.",
    image: "/reviews/andrius.png",
  },
];

export const REVIEW_SUMMARY = {
  rating: 4.9,
  count: 127,
} as const;
