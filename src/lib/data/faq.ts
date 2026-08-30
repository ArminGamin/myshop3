export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqCategory {
  id: string;
  title: string;
  items: FaqItem[];
}

export const faqCategories: FaqCategory[] = [
  {
    id: "pristatymas",
    title: "Pristatymas",
    items: [
      {
        q: "Ar pristatote į visą Lietuvą?",
        a: "Taip, užsakymus pristatome į visus Lietuvos miestus. Užsakymams virš 80 € pristatymas yra nemokamas.",
      },
      {
        q: "Kiek laiko trunka pristatymas?",
        a: "Įprastai užsakymus pristatome per 4–6 dienas, priklausomai nuo užsakymo kiekio, prekės tiekėjo sandėlio lokacijos ir pristatymo vietos.\n\nDalis prekių gali būti siunčiama iš užsienio sandėlių, todėl pristatymas tam tikrais atvejais gali užtrukti ilgiau. Didesnio užimtumo laikotarpiais pristatymas gali užtrukti iki 16 dienų.\n\nUžsakymams nuo 80 € – nemokamas pristatymas.",
      },
      {
        q: "Ar turite fizinę parduotuvę?",
        a: "Šiuo metu dirbame tik internetu, tačiau siūlome pristatymą visoje Lietuvoje ir saugų pirkimą internetu.",
      },
    ],
  },
  {
    id: "produktai",
    title: "Prekės",
    items: [
      {
        q: "Kaip sužinoti, ar prekė yra sandėlyje?",
        a: "Produktų puslapiuose nurodoma atsargų būsena. Jei matote, kad prekę galima dėti į krepšelį, ją galite užsisakyti iš karto.",
      },
      {
        q: "Ar prekės atrodo taip, kaip nuotraukose?",
        a: "Prieš pateikiant užsakymą rekomenduojame atidžiai peržiūrėti prekės aprašymą, nuotraukas, spalvą, tipą ir kitą pateiktą informaciją. Fotografuojame realias prekes.",
      },
    ],
  },
  {
    id: "mokejimas",
    title: "Mokėjimas",
    items: [
      {
        q: "Kokie mokėjimo būdai?",
        a: "Galite atsiskaityti Visa ir Mastercard kortelėmis, taip pat Apple Pay ir Google Pay. Visi mokėjimai yra saugūs ir užšifruoti — juos apdoroja Stripe.",
      },
      {
        q: "Ar mokėjimas saugus?",
        a: "Taip. Pilnų banko kortelės duomenų mes nesaugome. Mokėjimai atliekami per saugius mokėjimo paslaugų teikėjus.",
      },
    ],
  },
  {
    id: "grazinimai",
    title: "Grąžinimai",
    items: [
      {
        q: "Koks grąžinimo terminas?",
        a: "Kokybiškos prekės gali būti grąžinamos per 14 dienų nuo prekės gavimo dienos, jeigu prekė nebuvo naudota, nėra sugadinta, nepraradusi prekinės išvaizdos, yra švari, su originalia pakuote bei visais komplekte buvusiais priedais.",
      },
      {
        q: "Kas apmoka grąžinimą?",
        a: "Jeigu prekė grąžinama dėl pirkėjo apsisprendimo, grąžinimo siuntimo išlaidas apmoka pirkėjas. Pinigai grąžinami po to, kai prekė grąžinama ir patikrinama jos būklė.",
      },
    ],
  },
  {
    id: "kontaktai",
    title: "Kontaktai",
    items: [
      {
        q: "Kaip susisiekti, jei turiu klausimų?",
        a: "Galite rašyti mums el. paštu arba per kontaktų puslapį. Atsakome per 24 valandas.",
      },
    ],
  },
];

export const homeFaqs: FaqItem[] = [
  {
    q: "Kiek laiko trunka pristatymas?",
    a: "Įprastai užsakymus pristatome per 4–6 dienas, priklausomai nuo užsakymo kiekio, tiekėjo sandėlio ir pristatymo vietos.\n\n- Dalis prekių gali būti siunčiama iš užsienio sandėlių.\n- Didesnio užimtumo metu pristatymas gali užtrukti iki 16 dienų.\n- Užsakymams nuo 80 € – nemokamas pristatymas.",
  },
  {
    q: "Kokie mokėjimo būdai?",
    a: "Galite atsiskaityti Visa ir Mastercard kortelėmis.\nVisi mokėjimai yra saugūs ir užšifruoti, todėl galite atsiskaityti saugiai ir patogiai.",
  },
  {
    q: "Ar turite fizinę parduotuvę?",
    a: "Šiuo metu dirbame tik internetu, tačiau siūlome pristatymą visoje Lietuvoje ir saugų pirkimą internetu.",
  },
  {
    q: "Kaip sužinoti, ar prekė yra sandėlyje?",
    a: "Produktų puslapiuose nurodoma atsargų būsena. Jei prekę galima dėti į krepšelį, ją galite užsisakyti iš karto.",
  },
];
