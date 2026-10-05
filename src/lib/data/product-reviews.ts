export type ProductReview = {
  name: string;
  text: string;
  /** 1–5, jei klientas nurodė. */
  rating?: number;
  city?: string;
};

// Tikri klientų atsiliepimai pagal prekės SKU (pvz. "JK-039").
export const PRODUCT_REVIEWS: Record<string, ProductReview[]> = {
  "JK-001": [
    {
      "name": "Mantas",
      "text": "cinamonas jaučiasi bet man labiau medis užkabino. prie arbatos tinka"
    },
    {
      "name": "Austėja",
      "text": "Imu žvaakes dėl vaizdo daugiausia, o šitą tai ir uždegt norisi 😍😍"
    },
    {
      "name": "Rokas",
      "text": "saldus kvapai greit nusibosta man. cia medis viska atsveria, gan vykes derinys"
    },
    {
      "name": "Lina",
      "text": "Vanilės daugiiau tikėjausi.. bet ok. Skaitau vakare ir uždegu"
    },
    {
      "name": "Ieva",
      "text": "Kallėdom kveepia!! apelsinas su medžiu geriausia, cinamonas neužgožia 🎄"
    },
    {
      "name": "Tomas",
      "text": "Stovi ant žurnalinio staliuko. anksčiau žvakių nenaudojau beveik, o dabar vis prisimenu uždegt, nežinau kas pasidarė"
    },
    {
      "name": "Rūta",
      "text": "Gražiai kvepia"
    }
  ],
  "JK-002": [
    {
      "name": "Gabija",
      "text": "Pledas dabar amžinai ant sofos 😅 kutai gražūs bet katinas juos pastebėjo irgi"
    },
    {
      "name": "Darius",
      "text": "Labai gražus 👍"
    },
    {
      "name": "Monika",
      "text": "žiūrim serrialus po juo, vyras tik vis į savo pusę tempia, kaip taip"
    },
    {
      "name": "Vytautas",
      "text": "Storesnis nei buvo senas. Ant fotelio atrodo normaliai net nesulankstytas. Pirkau po to, kai senasis pledas po penkerių metų pradėjo byrėti. Šitas sunkesnis, bet nekarštas, ir vilna nekutena kaklo, ko bijojau. Skalbiau kartą 30 laipsnių vilnos programa, nesumažėjo. Vienintelis minusas, kad katino plaukai prilimpa, bet tai jau ne pledo kaltė."
    },
    {
      "name": "Agnė",
      "text": "spalva tiko prie sofos nieko nereikėjo derint ❤️ su knyga vakare ir jau"
    },
    {
      "name": "Simas",
      "text": "Kutai nepatiko iš pradžių, dabar jau nebeprimenu kodėl. Laikau prie darbo stalo ant kėdės"
    }
  ],
  "JK-005": [
    {
      "name": "Eglė",
      "text": "Dėl kaukės imiau, audinys švelnus. Gumytės net nesvarsčiau o ji tai pravertė"
    },
    {
      "name": "Simona",
      "text": "vienodos spalvos kaukė ir gumytė, smulkmena bet man patinka ✨"
    },
    {
      "name": "Karolina",
      "text": "kaukės dar nepripratau, niekada neturejau. Gumyte jau nesioju kasdien nors"
    },
    {
      "name": "Diana",
      "text": "Gumytė visur su manim, ir ant riešo, kauke nesinaudoju nei"
    },
    {
      "name": "Paulina",
      "text": "Labai minkšta"
    }
  ],
  "JK-006": [
    {
      "name": "Tadas",
      "text": "Stiklinės sunkios, man jos patiiko labiausiai. Akmenukai dar nenaudoti"
    },
    {
      "name": "Saulius",
      "text": "tėtis susižavėjo žnyplėm, sakė dabar visas baras namie 😄"
    },
    {
      "name": "Justas",
      "text": "Reikėjo poros vienodų stiklų su draugu pasėdėt. Dugnas storas, solidžiai"
    },
    {
      "name": "Marius",
      "text": "geri stiklai"
    },
    {
      "name": "Giedrius",
      "text": "Pastatėm ant baro lentynos abu. Anksčiau ten visokie skirtingi buvo, dabar pagaliau tvarka"
    }
  ],
  "JK-007": [
    {
      "name": "Giedrė",
      "text": "tilpo ant mano siauros palanges!! bazilikas bus 🌿"
    },
    {
      "name": "Dominykas",
      "text": "rozmariną seniai norėjau auginti, vis neprisiruošdavau. kai viskas jau vienam rinkiny tai lengviau pradėt"
    },
    {
      "name": "Viktorija",
      "text": "Gražūs vazonėliai 🌿"
    }
  ],
  "JK-008": [
    {
      "name": "Greta",
      "text": "Po kelis klausimus pildom, kai kurie užstrigdo ilgam. apie pirmą pasimatymą visiškai skirtingai prisimenam 😂"
    },
    {
      "name": "Arnas",
      "text": "maniau bus saldžių frazių krūva, o klausimai paprašo konkrečių dalykų. kai kurie mūsų atsakymai juokingi tikrai"
    },
    {
      "name": "Indrė",
      "text": "Rasom piestuku su pataisymais, raides kreivos. kaip tik man graziau kad musu"
    },
    {
      "name": "Lukas",
      "text": "Apie ateities planus prirasem daugiau nei galvojom, idomu bus paskaityt po kelių metų"
    },
    {
      "name": "Viltė",
      "text": "Užpildėm tik kelis puslapius kitiem vakarams paliekam. Jau radom dalykų apie ką seniai nekalbėjom ❤️"
    },
    {
      "name": "Dovydas",
      "text": "mano raštas baisus, jos gražesnis. nesvarbu, mūsų istorija vistiek"
    }
  ],
  "JK-009": [
    {
      "name": "Rasa",
      "text": "Prieskambary pastaciau. Lazdeles is pradžių maziau idejau nes kitaip per stipru"
    },
    {
      "name": "Mindaugas",
      "text": "žvakes pamirštu uždegt todėl lazdelės geriau. ant komodos tvarkingai"
    },
    {
      "name": "Ugnė",
      "text": "Stiklinis buteliukas patiko, neperrkauna. Vietos dar ieškau, kilnnoju 🙃"
    },
    {
      "name": "Laura",
      "text": "svetainėj per silpnas atrodė, perkėliau į mažą prieškambarį ir ten gerai"
    },
    {
      "name": "Aivaras",
      "text": "Kvapas malonus"
    }
  ],
  "JK-010": [
    {
      "name": "Neringa",
      "text": "Namuose visada storom kojinėm vaikštau. viena spalva jau favoritė tapo 🧦"
    },
    {
      "name": "Lukas",
      "text": "dezute grazi su juostele, bet issitraukiau kojines iskart aisku"
    },
    {
      "name": "Vaida",
      "text": "Minkštos, patinka"
    },
    {
      "name": "Paulius",
      "text": "storesnes nei maniau, i batus nelabai. Po namus tai labai gerai"
    },
    {
      "name": "Justina",
      "text": "Sau vieną porą, likusias dvi pasidalinom. dėžutę pasiliekau smulkmenoms"
    },
    {
      "name": "Arūnas",
      "text": "su šlepetėm dedu, kojinės storos tai šlepetes derniu pagal jas"
    },
    {
      "name": "Evelina",
      "text": "Trys poros!!! Labiausiai tuo apsidžiaugiau haha. viena visada prie sofos lieka ir pamirštu"
    }
  ],
  "JK-011": [
    {
      "name": "Kamilė",
      "text": "Dydis geras, didesnio tampytis nenorėjau. arbatai į darbą užtenka"
    },
    {
      "name": "Martynas",
      "text": "Patogus termosas ☕"
    },
    {
      "name": "Agnė",
      "text": "telpa i kuprine be problemu, nereikia viso turinio perdeliot"
    },
    {
      "name": "Rimantas",
      "text": "Savaitgaliais su arbata pasivaikščioti. Didelis namie likdavo visada, šitas ne"
    },
    {
      "name": "Aušra",
      "text": "mažiau vienkartinių puodelių ant darbo stalo. kavą namie pripildau, pati pasienku kokio skonio"
    },
    {
      "name": "Nedas",
      "text": "planavau kavai o naudoju daugiausia arbaai. neatrodo kaip sportinis inventorius, man tas patinka"
    }
  ],
  "JK-012": [
    {
      "name": "Deividas",
      "text": "kortom pradejom, baigėm klausimais. vienas atsakymas visa vakara uzsitese 😅"
    },
    {
      "name": "Jolanta",
      "text": "Smagu visiems"
    },
    {
      "name": "Vilius",
      "text": "greito mąstymo klausimai daugiausia juoko. žinai atsakymą ir staiga nieko!!"
    },
    {
      "name": "Laimonas",
      "text": "kompanija iššūkius pasirinko, aš būčiau klausimus bet nubalsavo prieš mane"
    },
    {
      "name": "Kotryna",
      "text": "Po vakarienės išsitraukėm ir užsikalbėjom. Visi turi ką atsakyt, tuo ir geras"
    }
  ],
  "JK-013": [
    {
      "name": "Aistė",
      "text": "Pirmą vakarą pusę laiko filmą rinkomės 😂 ant sienos žiūrėt smagu, kambarys kitoks"
    },
    {
      "name": "Gytis",
      "text": "Užtraukiam užuolaidas, užkandžiai, visi ant sofos. Man patinka pats sumanymas"
    },
    {
      "name": "Emilija",
      "text": "Norėjau kad filmas būtų atskiras planas, ir su vaizdu ant sienos atsirado tas jausmas"
    },
    {
      "name": "Edvinas",
      "text": "mazesnis nei nuotraukoj atrode. man plisuas, turiu kur padet po filmo"
    },
    {
      "name": "Kęstutis",
      "text": "Paveikslą nuo sienos nukabint reikėjo. Radom jam kitą vietą 🎬"
    },
    {
      "name": "Goda",
      "text": "vaikams patiko 🎬"
    },
    {
      "name": "Aurimas",
      "text": "savaitgaliais naudoju kai laiko turiu visą filmą. Po to sudedu, nestovi išstatytas"
    }
  ],
  "JK-014": [
    {
      "name": "Daiva",
      "text": "Matinė keramika mano skonio. Arbatinukas ant stalo lieka ir po arbatos 🫖"
    },
    {
      "name": "Jurgis",
      "text": "Gražus rinkinys"
    },
    {
      "name": "Sandra",
      "text": "Paviršius ne visur vienodas, man graži tokia. bambukinė pagalvėlė dera"
    },
    {
      "name": "Raimonda",
      "text": "Birią arbatą geriu, filtras todėl svarbus buvo. puodelio spalva su arbatinuku dera"
    }
  ],
  "JK-015": [
    {
      "name": "Dovilė",
      "text": "Aliejų labiausiai norėjau isbandyt, muilo kvapas irgi geras. vanilė maloni 🥰"
    },
    {
      "name": "Renata",
      "text": "Dovanai tiko puikiai 🎁"
    },
    {
      "name": "Julija",
      "text": "Voniai viska atskirai pirkdavau paprastai. cia kvapai tarpusavy dera, dezute sudeta tvarkingai"
    },
    {
      "name": "Gintarė",
      "text": "Kedras man įdomesnis uz vanilę. Dezutes neismeciau, vonioj laikau ir naudoju po truputį"
    }
  ],
  "JK-016": [
    {
      "name": "Birutė",
      "text": "Vysnine graziai tarp senų auksiniu. kreminiai nuramina eglutę 🎄"
    },
    {
      "name": "Gintarė",
      "text": "Norėjau kelių stiklinių nes plastikinių pilna. kabinsiu aukštai kad vaikai nepasiektų"
    },
    {
      "name": "Algirdas",
      "text": "Gražūs žaisliukai"
    },
    {
      "name": "Danutė",
      "text": "šiemet mažiau spalvų noriu eglutėj, tiko tas derinys. kreminių neturėjau anksčiau"
    },
    {
      "name": "Mantas",
      "text": "Dėžutę pasiliksiu kitom Kalėdom. Stiklinius dedu atsargiau nei visa kita"
    }
  ],
  "JK-017": [
    {
      "name": "Beata",
      "text": "Aukinis kratšelis plonas, labai gražus. Prie baltų lėkštelių tinka"
    },
    {
      "name": "Andrius",
      "text": "Mano mėgstamiausias puodelis"
    },
    {
      "name": "Milda",
      "text": "kreminė spalva geriau už baltą, ir arbatai naudooju nebūtinai kakavai"
    },
    {
      "name": "Rugilė",
      "text": "Kraštelį tik geriau pažiūrėjus pastebėjau.. Patinka kai puodelis ne išmargintas"
    },
    {
      "name": "Donatas",
      "text": "didelių puodelių nemėgstu, šito dydis geras. su arbata prie kompo sėdžiu"
    },
    {
      "name": "Živilė",
      "text": "laikau priekyje kad rytais neieskot. kakava savaitgaliais jau iprotis ☕"
    }
  ],
  "JK-018": [
    {
      "name": "Mantas",
      "text": "Kasdiienes korteles susidejau, senaja pinigine stalciuj palikau. Kisene nestinus"
    },
    {
      "name": "Lukas",
      "text": "Tvarkingas, patinka 👍"
    },
    {
      "name": "Darius",
      "text": "kortelėms gerai, keli grynieji irgi telpa. monetų nešiotis dar neatsisakau nors"
    },
    {
      "name": "Tadas",
      "text": "Pradzioj kišau visas korteles, dabar tik reikalingas ir kasoj nebeknisu ilgai"
    }
  ],
  "JK-019": [
    {
      "name": "Eglė",
      "text": "Šilta šviesa, gražu ✨"
    },
    {
      "name": "Monika",
      "text": "su baterijom tai ir ėmiau. prie lango rozetės nėra, laido per kambarį netampysiu"
    },
    {
      "name": "Rūta",
      "text": "Apie veidrodį apsukau, gražu. Makiažui nelabai užtenka šviesos bet vakarais man gerai"
    },
    {
      "name": "Dovilė",
      "text": "Maniau ant eglutės kabinsiu, liko virtuvės lange. vyras net pastebėjo kad kažkas pasikeitė 😊"
    },
    {
      "name": "Austėja",
      "text": "Aplink mažą eglutę, ilgio užteko. lemputės mažos, tarp šakų nesiamto kol neįjungi"
    },
    {
      "name": "Raimonda",
      "text": "Baterijų dėžžutę už vazono paslėpiau ir matosi tik šviesleės, kaip norėjau"
    },
    {
      "name": "Saulius",
      "text": "po Kalėdų nenukabinom, prie lovos pasiliko 😅 žmona sako be jos per tamsu"
    }
  ],
  "JK-020": [
    {
      "name": "Ieva",
      "text": "Darbo reikalus ranka rassau, telefone vis pamirstu. viršelis malonus, aukso krastai gyvai gražiau"
    },
    {
      "name": "Aistė",
      "text": "receptus pagaliau perrašau iš lapelių. per graži kad tuščią palikčiau 📖"
    },
    {
      "name": "Giedrė",
      "text": "Graži užrašinė"
    },
    {
      "name": "Renata",
      "text": "Pirmo puslapio bijojau, ilgai. dabar pirkiniu sąrašai ir mintys visokios, bent ne tuscia"
    }
  ],
  "JK-021": [
    {
      "name": "Tomas",
      "text": "Ant darbo stalo, telefonas dabar viasda toj pačioj vietoj. Mediena prie stalo dera"
    },
    {
      "name": "Paulius",
      "text": "Telefonas stovi tai matau ekrana nekeldamas. dirbu prie kompo, kol kas ok"
    },
    {
      "name": "Rokas",
      "text": "Išvaizda svarbiausia buvo, nenorėjau dar vieno juodo daikto ant spintelės. kraunu kasdien"
    },
    {
      "name": "Gediminas",
      "text": "Geriau tinka prie medinės spintelės nei senas plastikinis. vakarais kraunu ir viskas"
    },
    {
      "name": "Agnė",
      "text": "Grįžus paddedu telefoną, kitaip pamirštu įkrauti. stovi matomoj vietoj tai primena 😄"
    }
  ],
  "JK-023": [
    {
      "name": "Rasa",
      "text": "dukra eglutes pirma issideliojo atskirai. vakarais kartu pazaidziam 🎄"
    },
    {
      "name": "Evelina",
      "text": "Medinės kortelės smagios, ne kaip popierinės. sūnus dar eilute jas skaičiuoja susidėjęs"
    },
    {
      "name": "Jonas",
      "text": "Vaikams patiko"
    },
    {
      "name": "Dovilė",
      "text": "maniškis tik korteles su dovanom renkasi, eglutes man palieka. paprasti paveiksliukai bet jam istorija"
    }
  ],
  "JK-024": [
    {
      "name": "Greta",
      "text": "Žvakes stikle jau turėjau, dabar su lempa naudoju. aukštį pagal didesnį indelį pasireguliavau"
    },
    {
      "name": "Viktorija",
      "text": "krmeinė ant komodos gražu ir išjungta. pilna šviesa per ryški man, pritemdau"
    },
    {
      "name": "Aušra",
      "text": "Laikmatis patogus kai skaitau. kvapas yra o žiebtuvėlio nebereikia, aš jį visada pametu 🕯️"
    },
    {
      "name": "Justė",
      "text": "Juoda gaubtą emiau. svetainėj sviesu viskas, norėjau bent vieno tamsaus daikto"
    },
    {
      "name": "Indrė",
      "text": "Žvakes laikydavau dėl gražių indelių, o su lempa pradėjau naudot tikrai. viena vis po ja. Pradžioj abejojau, ar lempa tikrai pakeis tikrą liepsną, bet šilta šviesa ir kvapas iš tirpstančio vaško labai panašūs. Plius saugu, nes vaikai ir katė laksto po namus ir man nebereikia nerimauti dėl atviros ugnies. Naudoju beveik kiekvieną vakarą, jau antra žvakė pasibaigė."
    },
    {
      "name": "Lina",
      "text": "iš pradžių vis tikrinau ar vaškas tirpsta.. keista žiūrėt į žvakę be liepsnos, pripratau"
    }
  ],
  "JK-025": [
    {
      "name": "Neringa",
      "text": "kreeminę ėmiau miegamajam ant komodos. vakare įjungus gražiau nei dieną, man bent 🌹"
    },
    {
      "name": "Arnas",
      "text": "Gražiai atrodo"
    },
    {
      "name": "Miglė",
      "text": "Man gėlės numiršta visada, su šita paprasta. nuvalau gaubtą ir tiek, nereikia laistyt"
    },
    {
      "name": "Tomas",
      "text": "vysnine paėmiau, draugei raudona nelabai. ant jos stalo tarp knygu gerai"
    },
    {
      "name": "Rūta",
      "text": "Savaitę kilnojau iš vienos vietos į kitą 😅 prie rėmelio su nuotrauka labiausiai tiko"
    }
  ],
  "JK-026": [
    {
      "name": "Gabija",
      "text": "Dukra vis rodo duobutes mėnulyje, pastatėm ant lentynos. reljefas kai įjungta labai matosi 🌙"
    },
    {
      "name": "Vilius",
      "text": "palietimu valdosi, jungiklio ieškot nereikia. ant naktinio staliuko tinka"
    },
    {
      "name": "Karolina",
      "text": "Silta sviesa turiu. pakrauti nunesu prie kompo, patogu kad ne visada prijungta"
    },
    {
      "name": "Ema",
      "text": "Medinis laikiklis paprastas ir gerai, mėnulis traukia akį. buvo tuščia vieta lentynoj, dabar ne"
    },
    {
      "name": "Nedas",
      "text": "labai gražu"
    },
    {
      "name": "Justina",
      "text": "su pulteliu spalvota. as dazniausiai viena spalva laikau o dukra keičia kas sekundę 😂"
    }
  ],
  "JK-027": [
    {
      "name": "Simona",
      "text": "Filmuoju namie, fonas ant tuščios sienos iškart ne toks nuobodus. tik kampą reikėjo rast 📸"
    },
    {
      "name": "Laura",
      "text": "Pradžiioj šviesos ratas mažas, patraukiau lempą toliau nuo sienos ir ok"
    },
    {
      "name": "Domas",
      "text": "už sofos pastačiau į sieną. išjungus pagrindinę šviesą gražu, dieną mažiau"
    },
    {
      "name": "Kotryna",
      "text": "kampas virš komodos. ant baltos sienos gerai, paveikslą teko nukelt"
    },
    {
      "name": "Ignas",
      "text": "Kartais į kitą kambarį nusinešu, per USB paprastai. nieko į telefoną siųstis nereikėjo"
    }
  ],
  "JK-028": [
    {
      "name": "Justina",
      "text": "Laseliai uzkabino labiausiai. prie stalo ijungiu ir kartais uzsiziuriu i ta debesi ☁️"
    },
    {
      "name": "Birutė",
      "text": "juodas variantas tinka svetainei. rūkas ir lašeliai, įdomiau už senąjį paprastą"
    },
    {
      "name": "Martynas",
      "text": "Šalia darbo vietos laikau, vandens papildau. USB laidas ok, vietos ant stalo teko padaryt"
    },
    {
      "name": "Rasa",
      "text": "balttas debesis juokingai mielas 😄 sveciai klausia kas cia ir po to visi ziuri kaip lasa"
    },
    {
      "name": "Dovydas",
      "text": "Mielas debesis ☁️"
    },
    {
      "name": "Gabrielė",
      "text": "Su savo eteriniu aliejum bandžiau. kvapas ok, bet lietus labiau patinka"
    },
    {
      "name": "Tomas",
      "text": "galvojau bus keista ant darbo stalo.. stovi prie augalo ir normaliai"
    }
  ],
  "JK-029": [
    {
      "name": "Lina",
      "text": "Kojos šąla visada, vakare lovoj pasidedu. užvalkalas minkštas, geirau nei plika guminė 🥰"
    },
    {
      "name": "Vytautas",
      "text": "Šilta, ačiū"
    },
    {
      "name": "Daiva",
      "text": "bordo ėmiau prie pledo tinka. užpildau ir nešu ant sofos, jokio laido"
    },
    {
      "name": "Rima",
      "text": "močiutė panašią turėjo be užvalkalo. sau kreminę paėmiau, vakare prie pledo"
    }
  ],
  "JK-030": [
    {
      "name": "Vaida",
      "text": "Sūnus pirmą vakarą žvaigždes skaičiavo gulėdamas. dabar pats prašo įjungt ⭐"
    },
    {
      "name": "Marius",
      "text": "pultelis geras nereikia nuo sofos keltis. tamsiam kambary ryškiau, su lempom nelabai matosi"
    },
    {
      "name": "Deimantė",
      "text": "Prieš filmą įjungiam, filmo metu išjungiam. vaikai ūko spalvas keičia visą laiką"
    },
    {
      "name": "Kamilė",
      "text": "Vaiku kambariui pirkau bet i svetaine parsinesiau 😅 mums su vyru irgi idomu"
    },
    {
      "name": "Rokas",
      "text": "Geras! ⭐"
    },
    {
      "name": "Ieva",
      "text": "Pultelį ant lenynos laikom nes vaikai nusineša kažkur. projektorius ant komodos"
    },
    {
      "name": "Tadas",
      "text": "draugai pamatę klausė ar tikrai kosmosas ant lubų.. ilgai užsižaidėm su spalvom 😄"
    }
  ],
  "JK-031": [
    {
      "name": "Ernesta",
      "text": "rytais kavai pieną plakuosi. pirmą kartą mažam puodely aptaškiau visą stalą 😬 su aukštesniu gerai"
    },
    {
      "name": "Karolis",
      "text": "patogus plakiklis"
    },
    {
      "name": "Inga",
      "text": "stovelis geras, kiti tokie irankiai stalciuj guledavo. sitas salia puoodeliu visada po ranka"
    },
    {
      "name": "Milda",
      "text": "daugiuasia matchai, kavai reciiau. nedidelis, ant stovelio palieku"
    },
    {
      "name": "Darius",
      "text": "plieninis dera prie virtuvės. žmona juokiasi kad dabar kakavą rimtai darau 😂"
    }
  ],
  "JK-032": [
    {
      "name": "Andrius",
      "text": "telpa į sporto kreppšį ir nepasimeta. rankoj patogus"
    },
    {
      "name": "Laurynas",
      "text": "gerai"
    },
    {
      "name": "Vilma",
      "text": "galvutes keičiu lengvai, dažniausiai apvalia. kraunasi USB-C kaip ir kiti daiktai tai gerai"
    },
    {
      "name": "Mantas",
      "text": "stalčiuj prie kompo laikau. didelis ten netilptų, šito dydis geras"
    },
    {
      "name": "Aistė",
      "text": "bijojau kad viena ranka nepatogu bus, bet rankena tiko mano delnui. paprasciau nei maniau"
    },
    {
      "name": "Domas",
      "text": "greiių pabandžiau kelis, stipriausio beveik nenaudoju. gerai kad galima rinktis"
    }
  ],
  "JK-033": [
    {
      "name": "Gintarė",
      "text": "audinys prie veido labai malnus, pirmą vakkarą pagalvę vis taisiausi. kitoks jausmas nei medvilnės ✨"
    },
    {
      "name": "Aurelija",
      "text": "Švelnus audinys"
    },
    {
      "name": "Daina",
      "text": "50x70 pagalvei tiko. slidesnis nei buvau pratus, pora vakaru priprasti reikejo"
    },
    {
      "name": "Lina",
      "text": "šilkinę kaukę jau turėjau tai ir užvalkalo užsimaniau. abu dabar prie lovos 😊"
    },
    {
      "name": "Rūta",
      "text": "bordo prie pilkos patalynės. iš pradžių keista viena pagalvė kitokia, dabar norisi antros tokios"
    }
  ],
  "JK-034": [
    {
      "name": "Eglė",
      "text": "volą naudoju po serumo vakare. šaltas akmuo ant veido malonu, gua sha dar mokausi 🌸"
    },
    {
      "name": "Simona",
      "text": "Gražus rinkinys 🌸"
    },
    {
      "name": "Lina",
      "text": "Pradžioj tik volą imdavau, dabar jau ir antrą akmenį. toks mažas ritualas prieš miegą"
    },
    {
      "name": "Miglė",
      "text": "nefrito paėmiau. laikau dėžutėj nes lentynėlė maža ir nukristų"
    }
  ],
  "JK-035": [
    {
      "name": "Rasa",
      "text": "prie sofos patiesiau, bordo detalės tiko prie pagalvėlių. raštas kalėdinis bet ne labai margas 🎄"
    },
    {
      "name": "Darius",
      "text": "Tinka svetainei"
    },
    {
      "name": "Jurgita",
      "text": "kreminį po eglute. net nesinori jos nukraustyt, kampas gražiai susidėjo"
    },
    {
      "name": "Monika",
      "text": "Mažai svetainei dydis tinka. bet pasimatuokit prieš perrkant!! nuotaukoj didesnis atrodė"
    },
    {
      "name": "Simona",
      "text": "bordo prie uzuolaidu derinau. eglutes raste matai is arti, is toliau tik spalvos"
    },
    {
      "name": "Algis",
      "text": "pries foteli kur skaitau. pūkas zemas, trupinius susiurbiu paprastai"
    }
  ],
  "JK-036": [
    {
      "name": "Mantas",
      "text": "buto raktus pažymėjau. eglute maza kišenėj netrukdo, nuo darbiniu atskirt lengviau"
    },
    {
      "name": "Karolina",
      "text": "Ruda oda emiau. su auksine eglute grazu, toks paprastas labiau man 🎄"
    },
    {
      "name": "Tadas",
      "text": "Gera kokybė"
    },
    {
      "name": "Austėja",
      "text": "kolegei prie didesnės dovanos įdėjau, matau kad ant raktų nešioja 😊"
    }
  ],
  "JK-037": [
    {
      "name": "Paulius",
      "text": "kuprinėj su laidu. kai po darbo dar kažkur einu o telefonas raudonas"
    },
    {
      "name": "Gabija",
      "text": "Autobusu važiavau į kitą miestą, pasikroviau vietoj nereikėjo rozetės ieškot"
    },
    {
      "name": "Lukas",
      "text": "man tinka"
    },
    {
      "name": "Justė",
      "text": "nešiojuosi beveik visada tik pati kartais jos neįkraunu :D tada nei kam"
    },
    {
      "name": "Edvinas",
      "text": "į striukės kišenę eidamas fotografuot mietso. prireikė, gerai kad ir laidą turėjau"
    },
    {
      "name": "Laimutė",
      "text": "sode naudoju, rozetė namuke o aš kieme. telefonas ant stalo šalia 🌱"
    },
    {
      "name": "Marius",
      "text": "vieną laidą namie, kitą su baterija laikau. prieš kelionę abu sumetu, mažiau netvarkos"
    }
  ],
  "JK-038": [
    {
      "name": "Emilija",
      "text": "tinklalaides einu klausydama i darba. deklas mazas, telpa net i mano maziausia rankine 🎧"
    },
    {
      "name": "Rokas",
      "text": "Geras garsas 🎧"
    },
    {
      "name": "Greta",
      "text": "Kreminės dėl spalvos ėmiau. dėklą prie raktų laikau kad nepamirščiau"
    },
    {
      "name": "Domantas",
      "text": "prie kompiuterio kasdien. tik reikia priprast po to abi į dėklą sudėt"
    },
    {
      "name": "Rugilė",
      "text": "audioknygas vakare, vyras televizorių žiūri. geriau nei dėl garso ginčytis 😄"
    },
    {
      "name": "Dainius",
      "text": "Grafitines paėmiau. dėklas sportiniam krepsy, vaziuodamas į salę išsitrauukiu ir po to atgal"
    }
  ],
  "JK-039": [
    {
      "name": "Viktorija",
      "text": "grįžus iš darbo pirmiausia persiaunu. padas minkštas, atviras kulnas tai greit ☁️"
    },
    {
      "name": "Mindaugas",
      "text": "didesnį dydį ėmiau, koja 42 ir tiko. rytais virtuvėj geriau nei su kojinėm"
    },
    {
      "name": "Laima",
      "text": "Šiltos ir minkštos"
    },
    {
      "name": "Neringa",
      "text": "kremines grazios bet katinas, plauku pilna 😅 slepetes patogios aviu kasdien"
    },
    {
      "name": "Rasa",
      "text": "Patogios"
    },
    {
      "name": "Giedrius",
      "text": "senas gumines visada avėjau. šitos su pamušalu daug maloniau sėdint prie kompo"
    },
    {
      "name": "Milda",
      "text": "kremines nes šviesių norėjau. padas minkštas, į lauką neinu, namams pasilikau"
    }
  ],
  "JK-040": [
    {
      "name": "Ieva",
      "text": "Recepta virtuvėj telefone laikkau. nebereikia ramstyt į cukraus inda 😊"
    },
    {
      "name": "Tomas",
      "text": "Gulsčiai pastatau ir video žiūriu. paprastas daiktas bet dažniau naudoju nei galvojau"
    },
    {
      "name": "Agnė",
      "text": "mamai skambinu su vaizdu ir rankos laisvos. ji irgi užsimanė tokio"
    },
    {
      "name": "Vytautas",
      "text": "Tinka, ačiū"
    },
    {
      "name": "Aurelija",
      "text": "mokausi megzti iš video, telefoną į stovą. dabar abiem rankom virbalus laikau 🧶"
    }
  ],
  "JK-041": [
    {
      "name": "Dovilė",
      "text": "senos kelionės nuotrauka įdėta. šalia knygų gražiau nei tikėjausi, medis šiltas 🥰"
    },
    {
      "name": "Andrius",
      "text": "tamsesni paemiau tevams su anukes nuotrauka. asmeniska dovana ir negalvojau ilgai"
    },
    {
      "name": "Kamilė",
      "text": "10x15 nuotrauka tiko. pastačiau, paskui ant sienos pakabinau, gerai kad abu galima"
    },
    {
      "name": "Eimantas",
      "text": "Gražus rėmelis"
    }
  ],
  "JK-042": [
    {
      "name": "Sandra",
      "text": "ant stalo viską išsidėliojau ir šeimos dovanas supakavau. juostelės su kortelėm kartu, derint nereikėjo 🎁"
    },
    {
      "name": "Giedrė",
      "text": "kraft popierius su aukso lipdukais labai gražus. mano kreivi kampai kažkaip nesimato 😅"
    },
    {
      "name": "Martynas",
      "text": "Labai gražu 🎁"
    }
  ],
  "JK-043": [
    {
      "name": "Jolanta",
      "text": "suris, vynuoges, duona. dviem uztenka vietos ir stalas grazesnis 🧀"
    },
    {
      "name": "Arnas",
      "text": "grazi lenta"
    },
    {
      "name": "Rūta",
      "text": "ir sekmadienio pusryčiams naudoju. rankom plauti reikia, daugiau priežiūros, bet medis mielesnis"
    },
    {
      "name": "Aušra",
      "text": "duoną ant lentos dedu, ne i krepšelį. prie sriubos taip patogiau"
    },
    {
      "name": "Gediminas",
      "text": "kai nenaudoju atremta virtuvėj stovi. savaitgalį alyvuogėm ir sūriui išsitraukiu"
    }
  ],
  "JK-044": [
    {
      "name": "Indrė",
      "text": "Vanilė jaučiasi bet kepinių neprimena. medis patiko labiau nei maniau"
    },
    {
      "name": "Lina",
      "text": "koridoriuj laikau, prieš svečius papurškiu. žvakės uždegt nereikia 👍"
    },
    {
      "name": "Gintarė",
      "text": "Malonus kvapas"
    }
  ],
  "JK-045": [
    {
      "name": "Aurelija",
      "text": "ant virtuves palangės stovejo. ryte prie kavos po langelį, vyras net primindavo jei pamirsdavau"
    },
    {
      "name": "Raimondas",
      "text": "mamai paėmiau, ji tokius rituauls mėgsta. paskui vis paaskodavo ką rado 🎄"
    },
    {
      "name": "Vilma",
      "text": "Gražus kalendorius 🎄"
    },
    {
      "name": "Inga",
      "text": "su dukra pakaiom atidarom. mano diena ji vis tiek salia stovi ir laukkia ❤️"
    },
    {
      "name": "Dovydas",
      "text": "sau pirkau nors kalendoriaus nebuvo nuo mokyklos. ryte arbatos rast smagu, proga papusryciaut ramiai"
    },
    {
      "name": "Eglė",
      "text": "prie lango pastaciau, vakare su girlanda graziai. susilaikyti neatidarius visko pirma dieną sunkiausia 😂"
    }
  ],
  "JK-046": [
    {
      "name": "Kristina",
      "text": "vaikui saldainių ir laiškelį įdėjau. megzta, ne tokia plona kaip sena"
    },
    {
      "name": "Simas",
      "text": "Židinio neturim, prie eglutės pakabinom. kreminė su bordo prie žaisliukų tinka 🎅"
    },
    {
      "name": "Aistė",
      "text": "mažesnė maniau bus, o vietos smulkmenom daug. kasmet išsitrauksim su dekoracijom"
    },
    {
      "name": "Dalia",
      "text": "Mieli kutai"
    }
  ],
  "JK-047": [
    {
      "name": "Miglė",
      "text": "ant darbo stalo. kol kompas uzsikrauna pakratau, namelis labai mielas ❄️"
    },
    {
      "name": "Gintaras",
      "text": "Mielas gaublys ❄️"
    },
    {
      "name": "Daiva",
      "text": "primena vaikystėj pas močiutę gaublį. vis pagaunu save kratant nors seniai ne vaikas 😊"
    },
    {
      "name": "Nojus",
      "text": "Pakratau ir žiūrriu kol sniegas nusileidžia. maža detalė, nuo telefono kartais atitraukia"
    },
    {
      "name": "Kotryna",
      "text": "vietos tarp knygų buvo, ten ir stovi. mediena man labiau nei blizgios dekoracijos"
    }
  ],
  "JK-048": [
    {
      "name": "Alma",
      "text": "be staltiesės ant medinio stalo gražu. per vidurį žvakės ir daugiau nereikia"
    },
    {
      "name": "Renata",
      "text": "raštas ryškus tai indus paprastus baltus dėjau. gražiai, mano stalui ilgesnis tiktų"
    },
    {
      "name": "Saulius",
      "text": "Gražus takelis"
    }
  ],
  "JK-049": [
    {
      "name": "Dovilė",
      "text": "ant komodos prie eglutės. maniau per daug visko bus, bet isipaise"
    },
    {
      "name": "Arūnas",
      "text": "prislopintos spalvos patiko. su senais žaisliukais geriau nei ryškiai raudnoas 👌"
    },
    {
      "name": "Rita",
      "text": "mielas 😄"
    }
  ],
  "JK-050": [
    {
      "name": "Aistė",
      "text": "pagaliau nesimato to bjauraus stovo!! reikėjo pernai pirkt"
    },
    {
      "name": "Giedrė",
      "text": "kreminė prie eglutės tinka. katinas kai įsitaiso tai dovanoms vietos mažiau 😅"
    },
    {
      "name": "Mindaugas",
      "text": "Praktiška"
    },
    {
      "name": "Violeta",
      "text": "stova anksciau maiseliais dengdvau. dabar nebereikia. krasta islygint reikejo nes krievai buvau uzdejus"
    }
  ],
  "JK-051": [
    {
      "name": "Lina",
      "text": "vakare tik namelį su girlianda įjungiu. ant palangės šviečiantys langeliai gražūs ✨"
    },
    {
      "name": "Saulius",
      "text": "nedidelis, vietos neužima. dėl apsnigto stogo ėmiau, gyvai dar mielesnis"
    },
    {
      "name": "Eglė",
      "text": "prie eglutės statyt galvoojau, liko virtuvėj. ryte su kava smagu įjungt"
    },
    {
      "name": "Rimantė",
      "text": "ant siauro prieškambario staliuko padėjau. maniau didesnės dekoracijos reikės, užteko šito 😊"
    },
    {
      "name": "Aidas",
      "text": "Gražus žibintas ✨"
    }
  ],
  "JK-052": [
    {
      "name": "Monika",
      "text": "laisvas tikrai, rankoves atsiraitau. kritimas patinka, su džinsais dažnai"
    },
    {
      "name": "Greta",
      "text": "Patogus"
    },
    {
      "name": "Jurgita",
      "text": "storokas, biure per silta. savaitgaliais namie tiesiog gerai"
    },
    {
      "name": "Simona",
      "text": "platus rankogaliai patiko. nuotraukoj ju nepastebejau, gyvai grazu"
    },
    {
      "name": "Rugilė",
      "text": "su siaurom kelnem gerai. su plaetm per daug, megztinis ir taip laisvas"
    },
    {
      "name": "Edita",
      "text": "rytais į darželį vežu vaiką ir dažnai griebiu šitą. galvot nereikia ką rengtis 😅"
    },
    {
      "name": "Dalia",
      "text": "i kelnes nekemsu, laisvai paliekam. peciai graziai krenta, del to pasilikau"
    }
  ],
  "JK-053": [
    {
      "name": "Tomas",
      "text": "namie nešioju. užtrauktukas patogus kai šilta, anksčiau megztinį per galvą tampydavau 😄"
    },
    {
      "name": "Rūta",
      "text": "Minkštas, patogus"
    },
    {
      "name": "Karolina",
      "text": "kisenej telpa telefonas tik viena puse nusvyra. rytais uzsimetu daznai"
    },
    {
      "name": "Justė",
      "text": "užtrauktuko dėlei ėmiau, gobtuvo beveik nenaudoju. balkone vakare malonu 🥰"
    },
    {
      "name": "Deividas",
      "text": "savaitgaliui isvaziuodamas pasiimu. masinoj prasisegi ir nereikia viso nusivilkt"
    },
    {
      "name": "Gintarė",
      "text": "gobtuvas didokas, nenaudoju. džemperis patinka, ypač vidus minkštas"
    }
  ],
  "JK-054": [
    {
      "name": "Inga",
      "text": "Šiltas"
    },
    {
      "name": "Vilma",
      "text": "ant darbo kėdės laikau, atvėsus užsimetu. ilgis geras, nugara neatsidengia 👍"
    },
    {
      "name": "Gabija",
      "text": "kišenės maloniai nustebino, nuotraukose jų nepastebėjau. plaukų gumytes ten metu"
    },
    {
      "name": "Diana",
      "text": "mamai pirkau. ji susagstomus labiau meggsta tai bent neioja o ne spintoj laiko 😊"
    },
    {
      "name": "Virginija",
      "text": "ilgio ieškojau, trumpo nenorėjau. su paprastais marškinėliais ir tvakingai"
    }
  ],
  "JK-055": [
    {
      "name": "Agnė",
      "text": "bordo apvadas labai patiko. paprasta, bet nesijaučiu kaip su senais išsitampiusiais marškinėliais 😄"
    },
    {
      "name": "Laura",
      "text": "kelnės ilgokos, aš žema. pasilikau, namie netrukdo"
    },
    {
      "name": "Viktorija",
      "text": "Patogi pižama"
    },
    {
      "name": "Renata",
      "text": "ilgų kelnių norėjau nes naktį antklodę nusispardau. šitas tiko"
    },
    {
      "name": "Alina",
      "text": "miegu su marškinėliais paprastai, šitą vakarais namie. apykaklė gražiai kai viršų susisegu ✨"
    },
    {
      "name": "Ernesta",
      "text": "bordo kraštai pagyvina. marškinius kartais su kitom kelnėm vilkiu"
    },
    {
      "name": "Skaistė",
      "text": "viršų prie chalato pakabinau, kelnes į stalčių. pagaliau namie derantis komplektas turiu"
    }
  ],
  "JK-056": [
    {
      "name": "Ieva",
      "text": "Plonas, po svarku audinio kruvos nėra. i darbą geriau uz stora megztinį"
    },
    {
      "name": "Daiva",
      "text": "kaklą kartais atlenkiu, kartais aukštai. spalva prie tamsuas palto 👌"
    },
    {
      "name": "Neringa",
      "text": "golfo be raštų ieskkojau. sitas paprastas ir su visskuo derinasi kas yra"
    },
    {
      "name": "Aušra",
      "text": "paprastas, gerai"
    },
    {
      "name": "Paulina",
      "text": "atlenkta apykaklė patogiau. su sijonu į darbą ir daugiau nieko viršuj nereikia jei kabinetas šiltas"
    }
  ],
  "JK-057": [
    {
      "name": "Ugnė",
      "text": "darbovietės kalėdiniam vakarui paėmiau. elniai ir eglutės iškart į temą, aksesuarų nereikėjo 🎄"
    },
    {
      "name": "Milda",
      "text": "Gražus, šventėms tinka"
    },
    {
      "name": "Vesta",
      "text": "tarp keliu rinkausi, sito zalios detales labiausiai. su juodom kelnem grazu"
    },
    {
      "name": "Julija",
      "text": "eglutes ant rašto man graziausios. rengiausi su paprastu sijonu, megztinis ir taip ryškus 😊"
    }
  ],
  "JK-058": [
    {
      "name": "Kristina",
      "text": "sau ir vaikui derinom. mažajam Kalėdų Senelis svarbiausia, mums kad vienodai 🎅 Dydžių lentelė pasirodė tiksli, vaikui ėmėm viena pusė didesnį, kad užtektų visai žiemai. Po pirmo skalbimo raštas nesusivėlė ir spalvos išliko. Nuotraukai prie eglutės pastatėm telefoną ant knygų krūvos ir ilgai juokėmės bandydami visus sustatyti. Kitais metais greičiausiai vėl vilkėsim, tik gal su kitu raštu."
    },
    {
      "name": "Paulius",
      "text": "žmona šeimos nuotraukai išrinko. nelabai norėjau vienodai rengtis, bet rezultatas patiko"
    },
    {
      "name": "Indrė",
      "text": "raudona su snaigėm prie eglutės gražu. vaikas savo megztinį dar prieš fotosesiją norėjo vilkėt"
    },
    {
      "name": "Evelina",
      "text": "sunus del Kaledu Senelio pasirinko. man ir kitas butu tikes, sikart jis nusprende"
    },
    {
      "name": "Martynas",
      "text": "vienodai rengtis pas mus naujiena. nuotrauką seneliams padarėm, galvojam įrėmint 😂"
    },
    {
      "name": "Aurelija",
      "text": "raštas nuotraukose nesusilieja, snaigės matosi. tamsias paprastas kelnes derinom kad ne per daug"
    }
  ],
  "JK-059": [
    {
      "name": "Mantas",
      "text": "su drauge po megztinį. sniego senis toks juokingas, abu pamatėm ir ėmėm ⛄"
    },
    {
      "name": "Emilija",
      "text": "derančių ieškojom bet ne su širdelėm ar užraašis. sniego senis tiko, spalvos kalėdinės"
    },
    {
      "name": "Lukas",
      "text": "Labai juokingi ⛄"
    },
    {
      "name": "Roberta",
      "text": "draugas pats pasiūlė, netikėta man buvo. dydžius sau išsirinkom, šeimos vakarienėj vilkėsim"
    },
    {
      "name": "Domantas",
      "text": "sniego senis dideis ir matosi iškart. smulkūs raštai ne mano, čia aiškus piešinys"
    }
  ],
  "JK-060": [
    {
      "name": "Jolanta",
      "text": "bendro rašto šeimai norėjom, šitas ramesnis už didelius paveikslėlius. raudona su balta dera ❤️"
    },
    {
      "name": "Andrius",
      "text": "elniu del, vaikui jie labiausiai. namie fotografavomes, kitu sventiniu drabuziu nereikejo"
    },
    {
      "name": "Dainora",
      "text": "snaigės ir elniai per visą megztinį kartojasi. gražiau nei vienas didelis piešinys priekyje"
    },
    {
      "name": "Jūratė",
      "text": "tarp šito ir su Kaledu Seneliu svarstem. elniai laimėjo, tinka visą žiemą 😊"
    },
    {
      "name": "Domas",
      "text": "Gražūs raštai"
    },
    {
      "name": "Kamilė",
      "text": "balti raštai ant raudono labai gražu. prie mūsų egutės su baltais žaisliukais gerai 🎄"
    }
  ]
};

export function getProductReviews(sku: string): ProductReview[] {
  return PRODUCT_REVIEWS[sku] ?? [];
}
