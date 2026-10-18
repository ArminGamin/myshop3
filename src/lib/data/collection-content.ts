import type { FaqItem } from "./faq";

// Kolekcijų SEO turinys: H1, trumpas gidas ir DUK (rodomi po prekėmis).
export interface CollectionContent {
  h1: string;
  guide: { heading: string; paragraphs: string[] };
  faq: FaqItem[];
}

const shippingFaq: FaqItem = {
  q: "Per kiek laiko atkeliaus dovana?",
  a: "Užsakymus pristatome per 3–4 dienas visoje Lietuvoje. Pristatymas kainuoja 2,99 €, o užsakymams nuo 80 € – nemokamas.",
};

const returnsFaq: FaqItem = {
  q: "Ką daryti, jei dovana netiks?",
  a: "Nenaudotą prekę galite grąžinti per 14 dienų nuo gavimo. Plačiau – grąžinimo skiltyje.",
};

export const collectionContent: Record<string, CollectionContent> = {
  "visos-dovanos": {
    h1: "Visos kalėdinės dovanos",
    guide: {
      heading: "Kaip greitai rasti tinkamą kalėdinę dovaną",
      paragraphs: [
        "Pradėkite nuo žmogaus, o ne nuo prekės. Pagalvokite, kaip jis leidžia laisvus vakarus: ar mėgsta jaukumą namuose, ar daug keliauja, ar vertina praktiškus daiktus kasdienai. Tada išsirinkite biudžetą – mūsų kataloge rasite dovanų nuo kelių eurų iki įspūdingų rinkinių.",
        "Jei vis dar dvejojate, naudokite filtrus pagal gavėją ir kainą arba atsakykite į kelis klausimus dovanų paieškoje. Perkant kelias prekes, automatiškai taikoma kiekio nuolaida: 10 % dviem prekėms ir 15 % trims. Taip vienu užsakymu galite pasirūpinti dovanomis visai šeimai.",
      ],
    },
    faq: [
      shippingFaq,
      {
        q: "Ar galiu vienu užsakymu nupirkti dovanų keliems žmonėms?",
        a: "Taip. Perkant dvi prekes taikoma 10 %, o tris ir daugiau – 15 % kiekio nuolaida.",
      },
      {
        q: "Kaip galiu sumokėti?",
        a: "Atsiskaityti galite banko kortele, Apple Pay arba Google Pay. Mokėjimai vyksta saugiu ryšiu.",
      },
      returnsFaq,
    ],
  },
  bestselleriai: {
    h1: "Populiariausios kalėdinės dovanos",
    guide: {
      heading: "Kodėl verta rinktis bestsellerį",
      paragraphs: [
        "Bestselleriai – tai dovanos, kurias pirkėjai renkasi dažniausiai. Jos tinka platesniam ratui žmonių, todėl tai saugus pasirinkimas, kai gerai nežinote gavėjo skonio arba dovanojate kolegai, kaimynui ar tolimesniam giminaičiui.",
        "Prieš pirkdami pažiūrėkite atsiliepimus prekės puslapyje: juose pirkėjai pasakoja, kam dovanojo ir kaip dovana patiko. Populiarias prekes verta užsisakyti anksčiau, nes artėjant Kalėdoms jos išperkamos greičiausiai.",
      ],
    },
    faq: [
      {
        q: "Kokia dovana tinka, kai nežinau žmogaus skonio?",
        a: "Rinkitės tai, ką naudoja beveik visi: šiltus pledus ir kojines, jaukias žvakes, puodelius ar praktiškus kasdienos daiktus. Būtent tokios prekės dažniausiai tampa bestselleriais.",
      },
      shippingFaq,
      returnsFaq,
    ],
  },
  "dovanos-jai": {
    h1: "Kalėdinės dovanos jai",
    guide: {
      heading: "Kaip išsirinkti dovaną moteriai",
      paragraphs: [
        "Geriausios dovanos moteriai dažniausiai susijusios su poilsiu ir savimi pasirūpinimu. Mamai ar močiutei tinka šiluma ir jaukumas: pledas, žvakė ar arbatos rinkinys vakarams. Draugei ar sesei – grožio rituali dovana, pavyzdžiui, gua sha rinkinys ar šilkinis pagalvės užvalkalas. Mylimai moteriai rinkitės kažką asmeniškesnio, kas primins bendrą laiką.",
        "Jei nežinote jos skonio, rinkitės neutralias spalvas ir universalius dydžius. Kvapai ir aromaterapija patinka daugumai, o praktiškos, bet gražios detalės – puodelis, termosas ar nuotraukų rėmelis – pravers kasdien.",
      ],
    },
    faq: [
      {
        q: "Ką padovanoti mamai Kalėdoms?",
        a: "Mamos dažniausiai vertina jaukumą ir poilsį: vilnonį pledą, aromaterapijos žvakę, arbatos rinkinį ar šildyklę vakarams.",
      },
      {
        q: "Kokia dovana tinka draugei iki 20 €?",
        a: "Iki 20 € puikiai tinka gua sha rinkinys, kvapų purškiklis, vonios rinkinys ar jaukus puodelis.",
      },
      shippingFaq,
      returnsFaq,
    ],
  },
  "dovanos-jam": {
    h1: "Kalėdinės dovanos jam",
    guide: {
      heading: "Kaip išsirinkti dovaną vyrui",
      paragraphs: [
        "Vyrai dažniausiai vertina praktiškas dovanas, kurias naudos kasdien. Tėčiui, kuris sako, kad jam nieko nereikia, tinka kokybiški kasdienos daiktai: termosas, šilti drabužiai ar odinis kortelių dėklas. Vaikinui ar draugui – technologijos ir pramogos: ausinės, išorinė baterija ar namų kino projektorius.",
        "Pagalvokite apie jo įpročius: ar jis daug keliauja, dirba prie kompiuterio, ar mėgsta vakarus su draugais. Viskio rinkinys ar serviravimo lenta tinka tiems, kas mėgsta svečius, o masažuoklis – sportuojantiems ir daug sėdintiems.",
      ],
    },
    faq: [
      {
        q: "Ką padovanoti tėčiui, kuriam nieko nereikia?",
        a: "Rinkitės kokybišką kasdienos daiktą, kurį jis naudos dažnai: termosą, šiltą megztinį, viskio rinkinį ar odinį kortelių dėklą.",
      },
      {
        q: "Kokia technologijų dovana tinka vaikinui?",
        a: "Populiarios belaidės ausinės, išorinė baterija, belaidis įkroviklis ir namų kino projektorius.",
      },
      shippingFaq,
      returnsFaq,
    ],
  },
  "dovanos-seimai": {
    h1: "Kalėdinės dovanos šeimai",
    guide: {
      heading: "Dovanos, kurios suburia visą šeimą",
      paragraphs: [
        "Šeimai geriausiai tinka dovanos, kuriomis galima džiaugtis kartu: stalo žaidimai, galaktikos projektorius vaikų kambariui, šventinis stalo takelis ar derantys kalėdiniai megztiniai bendroms nuotraukoms.",
        "Jei šeimoje yra vaikų, rinkitės dovaną, kuri įtrauktų visus, o ne tik vieną narį. Eglutės dekorai, advento kalendorius ar žaidimų vakaro rinkinys sukuria tradiciją, kuri kartojasi kiekvienais metais.",
      ],
    },
    faq: [
      {
        q: "Ką padovanoti šeimai su vaikais?",
        a: "Tinka bendro laiko dovanos: stalo žaidimai, advento kalendorius, galaktikos projektorius ar derantys šeimos megztiniai.",
      },
      {
        q: "Ar yra derančių megztinių visai šeimai?",
        a: "Taip, turime šeimos kalėdinių megztinių su skirtingais dydžiais suaugusiems ir vaikams.",
      },
      shippingFaq,
    ],
  },
  "dovanos-poroms": {
    h1: "Kalėdinės dovanos porai",
    guide: {
      heading: "Kaip išsirinkti dovaną porai",
      paragraphs: [
        "Porai tinka dovanos, kurios skatina leisti laiką kartu: užpildoma poros knyga, vakarienės serviravimo lenta, žaidimų rinkinys ar derantys kalėdiniai megztiniai. Tokios dovanos tinka ir draugų porai, ir jūsų antrajai pusei.",
        "Jei dovanojate savo mylimam žmogui, pagalvokite apie bendrus prisiminimus ir ritualus: jaukų vakarą su žvakėmis, filmų vakarą su projektoriumi ar rytinę kavą su putomis. Asmeniškas prisilietimas dažnai reikšmingesnis už kainą.",
      ],
    },
    faq: [
      {
        q: "Ką padovanoti porai Kalėdoms?",
        a: "Populiariausios porų dovanos: poros knyga „Mūsų akimirkos“, derantys megztiniai, serviravimo lenta vakarienei ir namų kino projektorius.",
      },
      {
        q: "Ar tinka šios dovanos draugų porai?",
        a: "Taip, dauguma dovanų skirtos bendram laikui, todėl tinka bet kuriai porai.",
      },
      shippingFaq,
    ],
  },
  "dovanos-iki-20-euru": {
    h1: "Kalėdinės dovanos iki 20 €",
    guide: {
      heading: "Kaip išsirinkti gerą dovaną iki 20 eurų",
      paragraphs: [
        "Su 20 eurų biudžetu verta rinktis vieną kokybišką, gražiai atrodančią prekę, o ne kelis smulkius daiktus. Puodelis, šiltos šlepetės, sniego gaublys ar gua sha rinkinys atrodo kaip tikra dovana, o ne kaip formalumas.",
        "Tokios dovanos ypač tinka Slaptajam Kalėdų Seneliui, kolegoms ir klasės draugams. Jei perkate kelias dovanas iš karto, kiekio nuolaida padeda dar labiau sutaupyti.",
      ],
    },
    faq: [
      {
        q: "Kokia dovana tinka Slaptajam Kalėdų Seneliui?",
        a: "Universalios dovanos iki 20 €: raktų pakabukas, kalėdinis puodelis, šiltos šlepetės, sniego gaublys ar išorinė baterija.",
      },
      {
        q: "Ar galima gauti nuolaidą perkant kelias dovanas?",
        a: "Taip. Dviem prekėms taikoma 10 %, o trims ir daugiau – 15 % nuolaida.",
      },
      shippingFaq,
    ],
  },
  "dovanos-iki-30-euru": {
    h1: "Kalėdinės dovanos iki 30 €",
    guide: {
      heading: "Ką galima padovanoti už 30 eurų",
      paragraphs: [
        "30 eurų – populiariausias kalėdinės dovanos biudžetas. Už jį galite išsirinkti tikrai jaukią arba praktišką dovaną: aromaterapijos žvakę, belaides ausines, kvapų difuzorių, šilkinį miego rinkinį ar mini masažuoklį.",
        "Šis biudžetas tinka draugams, broliams ir sesėms, kolegoms ir uošviams. Rinkitės pagal tai, kaip žmogus ilsisi: jaukumo mėgėjams – žvakės ir kvapai, aktyviems – technologijos ir kelionių reikmenys.",
      ],
    },
    faq: [
      {
        q: "Kokios dovanos populiariausios iki 30 €?",
        a: "Dažniausiai perkamos aromaterapijos žvakės, LED girliandos, belaidės ausinės, vilnonės kojinės ir kvapų difuzoriai.",
      },
      shippingFaq,
      returnsFaq,
    ],
  },
  "dovanos-iki-50-euru": {
    h1: "Kalėdinės dovanos iki 50 €",
    guide: {
      heading: "Įspūdinga dovana iki 50 eurų",
      paragraphs: [
        "Su 50 eurų biudžetu galite padovanoti daiktą, kuris tarnaus ilgai: vilnonį pledą, kardiganą, termosą, viskio rinkinį ar keramikos arbatos rinkinį. Tai tinkamas biudžetas artimiausiems žmonėms – partneriui, tėvams ar geriausiam draugui.",
        "Rinkdamiesi brangesnę dovaną, atkreipkite dėmesį į medžiagas ir dydį – šią informaciją rasite kiekvienos prekės savybėse. Jei abejojate dėl dydžio, prekę galite grąžinti per 14 dienų.",
      ],
    },
    faq: [
      {
        q: "Kokia dovana tinka tėvams iki 50 €?",
        a: "Tėvams dažnai renkamasi vilnonis pledas, keramikos arbatos rinkinys, termosas ar šiltas megztinis.",
      },
      shippingFaq,
      returnsFaq,
    ],
  },
  "premium-dovanos": {
    h1: "Premium kalėdinės dovanos",
    guide: {
      heading: "Kada verta rinktis premium dovaną",
      paragraphs: [
        "Premium dovana tinka, kai norite parodyti ypatingą dėmesį: artimiausiam žmogui, verslo partneriui ar komandai. Rinkitės daiktus iš kokybiškų medžiagų – merino vilnos, šilko, keramikos ar odos – kurie tarnaus ilgus metus.",
        "Verslo dovanoms galime išrašyti sąskaitą su PVN. Jei perkate dovanas komandai, parašykite mums – padėsime suderinti užsakymą.",
      ],
    },
    faq: [
      {
        q: "Ar galima gauti sąskaitą įmonei?",
        a: "Taip, verslo dovanoms išrašome sąskaitą su PVN. Parašykite mums po užsakymo.",
      },
      shippingFaq,
      returnsFaq,
    ],
  },
};
