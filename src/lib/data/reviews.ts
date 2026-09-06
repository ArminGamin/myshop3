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
    bought: "Aromaterapijos žvakė „Žvakių vakaras“",
    text: "Draugė rekomendavo, tai nusprendėm išbandyti. Nenusivylėm. Žvakė dega jau trečią vakarą - kvapas vis dar toks jaukus 😊",
    image: "/reviews/giedre.png",
  },
  {
    id: "tomas",
    name: "Tomas V.",
    city: "Alytus",
    rating: 5,
    bought: "Vilnonis pledas „Žiemos šiluma“",
    text: "Pirkau mamai pledą, bet pirma pats pažiūrėjau. Pakuotė graži, atrodo brangiau nei kainavo. Kol kas jokių nusiskundimų.",
    image: "/reviews/tomas.png",
  },
  {
    id: "ruta",
    name: "Rūta L.",
    city: "Klaipėda",
    rating: 5,
    bought: "Namų kino projektorius „Kino vakaras“",
    text: "Realiai nesitikėjau, kad veiks taip gerai. Su sese įsijungėm filmą ant sienos ir abi likom sužavėtos.",
    image: "/reviews/ruta.png",
  },
  {
    id: "mantas",
    name: "Mantas K.",
    city: "Kaunas",
    rating: 5,
    bought: "Vilnonis pledas „Žiemos šiluma“",
    text: "Pledas šiltas, atėjo greičiau nei rašė. Kalėdoms tinka 100%. Visai bomba.",
    image: "/reviews/mantas.png",
  },
  {
    id: "laura",
    name: "Laura M.",
    city: "Kaunas",
    rating: 5,
    bought: "Vaikų žaidimas „Šventės paslaptis“",
    text: "Nupirkau sūnėnui žaidimą — jo reakcija buvo geriausia dalis. Dabar klausia, kada vėl žaisim 😄",
    image: "/reviews/laura.png",
  },
  {
    id: "jonas",
    name: "Jonas P.",
    city: "Šiauliai",
    rating: 5,
    bought: "Vilnonės kojinės „Šilta žiema“",
    text: "Viskas tvarkoj su kojinėm, tik pristatymas galėjo būti dieną anksčiau. Prekė kaip nuotraukoj, kokybė gera.",
    image: "/reviews/jonas.png",
  },
  {
    id: "ieva",
    name: "Ieva S.",
    city: "Vilnius",
    rating: 5,
    bought: "Aromaterapijos žvakė „Žvakių vakaras“",
    text: "Nupirkome pradžiai vieną žvakę, bet greitai teko užsakyti dar. Anyta irgi norėjo tokios pačios.",
    image: "/reviews/ieva.png",
  },
  {
    id: "andrius",
    name: "Andrius R.",
    city: "Panevėžys",
    rating: 5,
    bought: "Aromaterapijos žvakė „Žvakių vakaras“",
    text: "Pirkau žmonai, bet pats pirmas pauosčiau žvakę. Kvepia namie kaip per Kūčias. Rekomenduoju.",
    image: "/reviews/andrius.png",
  },
  {
    id: "monika",
    name: "Monika T.",
    city: "Marijampolė",
    rating: 5,
    bought: "Kilimas „Žiemos jaukumas“",
    text: "Kilimas atėjo susuktas, bet po dienos jau išsilygino. Raštas kalėdinis, bet ne per daug, tai manau ir po švenčių tiks 😊",
    image: "/reviews/monika.png",
  },
  {
    id: "darius",
    name: "Darius N.",
    city: "Utena",
    rating: 5,
    bought: "Viskio rinkinys „Vakaro ritualas“",
    text: "Dovanojau tėvui gimtadieniui. Stiklinės solidžios, akmenys irgi atrodo rimtai, ne kaip iš kiosko. Labai patiko.",
    image: "/reviews/darius.png",
  },
  {
    id: "emilija",
    name: "Emilija B.",
    city: "Telšiai",
    rating: 5,
    bought: "Puodelis „Karšta kakava“",
    text: "Mažytis mielas puodelis, kakava ilgiau šilta. Dabar dar vieno sau noriu, nes dukra šitą pasiėmė 🍫",
    image: "/reviews/emilija.png",
  },
  {
    id: "karolis",
    name: "Karolis A.",
    city: "Vilnius",
    rating: 5,
    bought: "Raktų pakabukas „Mažoji eglutė“",
    text: "Smulkmena, bet visai faina dovana kolegei prieš Kalėdas. Pakuotė tvarkinga, atrodo tikrai ne pigiai.",
    image: "/reviews/karolis.png",
  },
  {
    id: "aiste",
    name: "Aistė K.",
    city: "Druskininkai",
    rating: 5,
    bought: "LED girlianda „Šilta šviesa“",
    text: "Užkabinau ant palangės ir kaimynai jau klausia kur pirkau 😄 Šviesa šilta, ne tokia blaškanti kaip būna su kai kuriom LED girliandom.",
    image: "/reviews/aiste.png",
  },
];

export const REVIEW_SUMMARY = {
  rating: 4.9,
  count: 664,
} as const;

export function lithuanianReviewWord(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "atsiliepimas";
  if (mod10 >= 2 && mod10 <= 9 && (mod100 < 11 || mod100 > 19)) return "atsiliepimai";
  return "atsiliepimų";
}
