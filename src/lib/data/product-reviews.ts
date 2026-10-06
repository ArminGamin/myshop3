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
      "text": "cinamonas jauciasi bet man labiau medis uzkabino. prie arbatos gerai"
    },
    {
      "name": "Austėja",
      "text": "Imu žvakes daugiausia del vaizdo, sita tai dar ir uzdegt norisi 😍"
    },
    {
      "name": "Rokas",
      "text": "saldus kvapai greit atsibosta man. cia medis viska atsveria, visai vykes"
    },
    {
      "name": "Lina",
      "text": "Vaniles daugiau tikejausi.. bet nieko, skaitau vakare ir uzdegu"
    },
    {
      "name": "Ieva",
      "text": "Kaledom kvepia kazkaip 😄 apelsinas su medziu geriausia, cinamonas neuzgozia"
    },
    {
      "name": "Tomas",
      "text": "Stovi ant zurnalinio staliuko. anksciau zvakiu beveik nenaudojau o dabar vis prisimenu uzdegt"
    },
    {
      "name": "Rūta",
      "text": "Gražiai kvepia, ne per stipriai"
    }
  ],
  "JK-002": [
    {
      "name": "Gabija",
      "text": "Pledas dabar amzinai ant sofos 😅 kutai grazus bet katinas juos irgi atrado"
    },
    {
      "name": "Darius",
      "text": "Labai grazus, spalva gyvai patiko"
    },
    {
      "name": "Monika",
      "text": "ziurim serialus po juo, vyras tik vis i savo puse tempia. nezinau kaip taip"
    },
    {
      "name": "Vytautas",
      "text": "Storesnis nei mano senas buvo. ant fotelio atrodo gerai net nesulankstytas. sunkesnis bet ne per karstas, vilna kaklo nekutena kaip bijojau. skalbiau viena karta 30 laipsniu vilnos programa, nesusitrauke. katino plaukai limpa, bet cia jau katinas"
    },
    {
      "name": "Agnė",
      "text": "spalva tiko prie sofos, nieko papildomai derint nereikejo. su knyga vakare gerai"
    },
    {
      "name": "Simas",
      "text": "Kutai nepatiko is pradziu, dabar jau nebezinau ko nervinausi del ju. laikau prie darbo stalo ant kedes"
    }
  ],
  "JK-005": [
    {
      "name": "Eglė",
      "text": "Del kaukes emiau, audinys svelnus. gumytes net negalvojau naudot bet pravercia"
    },
    {
      "name": "Simona",
      "text": "vienodos spalvos kauke ir gumyte, maza smulkmena bet patinka"
    },
    {
      "name": "Karolina",
      "text": "kaukes dar nepripratau, niekada neturejau. gumyte jau nesioju beveik kasdien"
    },
    {
      "name": "Diana",
      "text": "Gumyte visur su manim, ant rieso buna. kaukes beveik nenaudoju"
    },
    {
      "name": "Paulina",
      "text": "Labai minkšta, maloni medziaga"
    }
  ],
  "JK-006": [
    {
      "name": "Tadas",
      "text": "Stiklines sunkios, man jos labiausiai patiko. akmenuku dar nenaudojau"
    },
    {
      "name": "Saulius",
      "text": "tetis labiausiai susizavejo znyplem, dabar sako visas baras namie 😄"
    },
    {
      "name": "Justas",
      "text": "Reikejo poros vienodu stiklu su draugu. dugnas storas, rankoj jauciasi"
    },
    {
      "name": "Marius",
      "text": "geri stiklai, nieko daugiau ir nereikia"
    },
    {
      "name": "Giedrius",
      "text": "Pastatem ant baro lentynos abu. anksciau ten visokiu skirtingu buvo, dabar bent tvarka"
    }
  ],
  "JK-007": [
    {
      "name": "Giedrė",
      "text": "tilpo ant mano siauros palanges, sitas svarbiausia. bazilikas jau laukia"
    },
    {
      "name": "Dominykas",
      "text": "rozmarina seniai norejau augint bet vis neprisiruosdavau. kai viskas vienam rinkiny lengviau pradet"
    },
    {
      "name": "Viktorija",
      "text": "Gražūs vazonėliai, mazi bet kaip tik vietai"
    }
  ],
  "JK-008": [
    {
      "name": "Greta",
      "text": "Po kelis klausimus pildom, kai kurie uzstrigdo ilgam. apie pirma pasimatyma visiskai skirtingai prisimenam 😂"
    },
    {
      "name": "Arnas",
      "text": "maniau bus saldziu fraziu kruva, bet klausimai visai konkretus. kai kurie atsakymai juokingi gavosi"
    },
    {
      "name": "Indrė",
      "text": "Rasom piestuku su pataisymais, raides kreivos. kaip tik del to man graziau"
    },
    {
      "name": "Lukas",
      "text": "Apie ateities planus prirasem daugiau nei galvojom. bus idomu paskaityt po keliu metu"
    },
    {
      "name": "Viltė",
      "text": "Uzpildem tik kelis puslapius, kitus vakarams palikom. jau radom apie ka seniai nekalbejom ❤️"
    },
    {
      "name": "Dovydas",
      "text": "mano rastas baisus, jos grazesnis. nieko tokio, musu istorija vistiek"
    }
  ],
  "JK-009": [
    {
      "name": "Rasa",
      "text": "Prieskambary pastaciau. lazdelu is pradziu maziau idejau nes kitaip per stipru"
    },
    {
      "name": "Mindaugas",
      "text": "zvakes uzdegt vis pamirstu tai sitas geriau. ant komodos tvarkingai stovi"
    },
    {
      "name": "Ugnė",
      "text": "Stiklinis buteliukas patiko, neperkrautas. vietos dar ieskau, kilnoju is vienos vietos i kita 🙃"
    },
    {
      "name": "Laura",
      "text": "svetainej per silpnas atrode, perkeliau i maza prieskambari ir ten pats tas"
    },
    {
      "name": "Aivaras",
      "text": "Kvapas malonus, neuzknisa po keliu valandu"
    }
  ],
  "JK-010": [
    {
      "name": "Neringa",
      "text": "namuose visada storom kojinem vaikstau. viena spalva jau favoritė"
    },
    {
      "name": "Lukas",
      "text": "dezute grazi su juostele, bet kojines issitraukiau iskart aisku 😄"
    },
    {
      "name": "Vaida",
      "text": "Minkstos, patinka"
    },
    {
      "name": "Paulius",
      "text": "storesnes nei maniau, i batus nelabai lenda. po namus labai gerai"
    },
    {
      "name": "Justina",
      "text": "Sau viena pora, kitas dvi pasidalinom. dezute pasilikau smulkmenom"
    },
    {
      "name": "Arūnas",
      "text": "su slepetem dedu, kojines storos tai slepetes prie ju jau derinu"
    },
    {
      "name": "Evelina",
      "text": "Trys poros!!! sito nesitikejau labiausiai. viena prie sofos visada lieka ir aisku pamirstu"
    }
  ],
  "JK-011": [
    {
      "name": "Kamilė",
      "text": "dydis geras, didesnio tampytis nenorejau. arbatai i darba uztenka"
    },
    {
      "name": "Martynas",
      "text": "Patogus termosas, kolkas nieko blogo"
    },
    {
      "name": "Agnė",
      "text": "telpa i kuprine be problemu, nereikia visko is jos isimt"
    },
    {
      "name": "Rimantas",
      "text": "Savaitgaliais su arbata einu pasivaiksciot. didelis namie visada likdavo"
    },
    {
      "name": "Aušra",
      "text": "maziau vienkartiniu puodeliu ant darbo stalo. namie prisipilu ir pasiimu"
    },
    {
      "name": "Nedas",
      "text": "planavau kavai bet daugiausia arbatai naudoju. neatrodo kaip sportinis inventorius, tas patinka"
    }
  ],
  "JK-012": [
    {
      "name": "Deividas",
      "text": "kortom pradejom, baigem klausimais. vienas atsakymas visa vakara uzsitese 😅"
    },
    {
      "name": "Jolanta",
      "text": "Smagu visiems, ne tik vaikams"
    },
    {
      "name": "Vilius",
      "text": "greito mastymo klausimai daugiausia juoko. zinai atsakyma ir staiga nieko galvoj"
    },
    {
      "name": "Laimonas",
      "text": "kompanija issukimus pasirinko, as buciau klausimus bet nubalsavo pries mane"
    },
    {
      "name": "Kotryna",
      "text": "Po vakarienes issitraukem ir uzsikalbejom. visi turi ka atsakyt, tuo ir geras"
    }
  ],
  "JK-013": [
    {
      "name": "Aistė",
      "text": "Pirma vakara puse laiko filma rinkomes 😂 ant sienos ziuret visai kitas jausmas"
    },
    {
      "name": "Gytis",
      "text": "uztraukiam uzuolaidas, uzkandziai, visi ant sofos. man patinka pats sumanymas"
    },
    {
      "name": "Emilija",
      "text": "norejau kad filmas butu atskiras planas, su vaizdu ant sienos tas ir gavosi"
    },
    {
      "name": "Edvinas",
      "text": "mazesnis nei nuotraukoj atrode. man net geriau, turiu kur pasidet po filmo"
    },
    {
      "name": "Kęstutis",
      "text": "paveiksla nuo sienos teko nukabint. radom jam kita vieta"
    },
    {
      "name": "Goda",
      "text": "vaikams patiko, mums irgi visai"
    },
    {
      "name": "Aurimas",
      "text": "savaitgaliais naudoju kai yra laiko visam filmui. po to sudedu, nestovi isstatytas"
    }
  ],
  "JK-014": [
    {
      "name": "Daiva",
      "text": "Matine keramika mano skonio. arbatinukas ant stalo lieka ir po arbatos"
    },
    {
      "name": "Jurgis",
      "text": "Gražus rinkinys, paprastas"
    },
    {
      "name": "Sandra",
      "text": "pavirsius ne visur vienodas, man kaip tik grazu. bambukine pagalvele dera"
    },
    {
      "name": "Raimonda",
      "text": "biri arbata geriama pas mane tai filtras buvo svarbus. puodelio spalva su arbatinuku sueina"
    }
  ],
  "JK-015": [
    {
      "name": "Dovilė",
      "text": "Alieju labiausiai norejau isbandyt, muilo kvapas irgi geras. vanile maloni 🥰"
    },
    {
      "name": "Renata",
      "text": "Dovanai tiko, dezute jau pati graziai atrodo"
    },
    {
      "name": "Julija",
      "text": "Voniai viska atskirai pirkdavau. cia kvapai tarpusavy normaliai dera"
    },
    {
      "name": "Gintarė",
      "text": "kedras man idomesnis uz vanile. dezutes neismeciau, vonioj laikau daiktus"
    }
  ],
  "JK-016": [
    {
      "name": "Birutė",
      "text": "vysnine graziai tarp senu auksiniu atrodo. kreminiai kazkaip nuramina visa eglute"
    },
    {
      "name": "Gintarė",
      "text": "norejau keliu stikliniu nes plastikiniu jau pilna. kabinsiu auksciau del vaiku"
    },
    {
      "name": "Algirdas",
      "text": "Gražūs žaisliukai"
    },
    {
      "name": "Danutė",
      "text": "siemet maziau spalvu noriu. tas derinys tiko, kreminiu anksciau neturejau"
    },
    {
      "name": "Mantas",
      "text": "Dezute pasiliksiu kitom Kaledom. stiklinius dedu atsargiau nei kitus"
    }
  ],
  "JK-017": [
    {
      "name": "Beata",
      "text": "Auksinis krastelis plonas, gyvai labai grazus. prie baltu leksteliu tinka"
    },
    {
      "name": "Andrius",
      "text": "Mano megstamiausias puodelis dabar"
    },
    {
      "name": "Milda",
      "text": "kremine spalva geriau uz balta man. arbatai naudoju irgi, ne tik kakavai"
    },
    {
      "name": "Rugilė",
      "text": "Krasteli tik geriau paziurejus pastebejau. patinka kad visas neismargintas"
    },
    {
      "name": "Donatas",
      "text": "dideliu puodeliu nemegstu, sito dydis geras. su arbata prie kompo sedziu"
    },
    {
      "name": "Živilė",
      "text": "laikau priekyje kad rytais neieskot. kakava savaitgaliais jau tapo iprociu"
    }
  ],
  "JK-018": [
    {
      "name": "Mantas",
      "text": "Kasdienes korteles susidejau, sena pinigine stalciuj dabar. kisenej nestinus"
    },
    {
      "name": "Lukas",
      "text": "Tvarkingas, patinka"
    },
    {
      "name": "Darius",
      "text": "kortelem gerai, keli grynieji irgi telpa. monetu dar nesu atsisakes"
    },
    {
      "name": "Tadas",
      "text": "pradzioj kisau visas korteles, dabar tik reikalingas. kasoj nebekrapstaus taip ilgai"
    }
  ],
  "JK-019": [
    {
      "name": "Eglė",
      "text": "Silta sviesa, grazu"
    },
    {
      "name": "Monika",
      "text": "su baterijom del to ir emiau. prie lango rozetes nera, laido per kambari netampysiu"
    },
    {
      "name": "Rūta",
      "text": "aplink veidrodi apsukau, vakarais graziai atrodo. makiažui sviesos neuztenka"
    },
    {
      "name": "Dovilė",
      "text": "maniau ant eglutes kabinsiu, liko virtuves lange. vyras net pastebejo kad kazkas pasikeite 😊"
    },
    {
      "name": "Austėja",
      "text": "aplink maza eglute, ilgio uzteko. lemputes tarp saku beveik nesimato kol neijungi"
    },
    {
      "name": "Raimonda",
      "text": "bateriju dezute uz vazono paslepiau, matosi tik svieseles. taip ir norejau"
    },
    {
      "name": "Saulius",
      "text": "po Kaledu nenukabinom, prie lovos pasiliko. dabar zmona sako kad be jos per tamsu"
    }
  ],
  "JK-020": [
    {
      "name": "Ieva",
      "text": "darbo reikalus ranka rasau, telefone vis pamirstu. virselis malonus, auksiniai krastai gyvai geriau"
    },
    {
      "name": "Aistė",
      "text": "receptus pagaliau persirasau is lapeliu. per grazi kad tuscia stovetu"
    },
    {
      "name": "Giedrė",
      "text": "Graži uzrašinė, lapai normalus"
    },
    {
      "name": "Renata",
      "text": "Pirmo puslapio bijojau kazkaip 😂 dabar pirkiniu sarasai ir mintys visokios"
    }
  ],
  "JK-021": [
    {
      "name": "Tomas",
      "text": "Ant darbo stalo, telefonas dabar visada toj pacioj vietoj. mediena prie stalo dera"
    },
    {
      "name": "Paulius",
      "text": "Telefonas stovi tai matau ekrana nepakeldamas. dirbu prie kompo, kolkas patogu"
    },
    {
      "name": "Rokas",
      "text": "isvaizda svarbiausia buvo, nenorejau dar vieno juodo daikto ant spintele. kraunu kasdien"
    },
    {
      "name": "Gediminas",
      "text": "geriau tinka prie medines spintele nei senas plastikinis. vakare padedu ir tiek"
    },
    {
      "name": "Agnė",
      "text": "Grizus padedu telefona iskart, kitaip pamirstu pakraut. dabar stovi matomoj vietoj tai primena"
    }
  ],
  "JK-023": [
    {
      "name": "Rasa",
      "text": "dukra eglutes pirma issideliojo atskirai. vakarais kartu pazaidziam"
    },
    {
      "name": "Evelina",
      "text": "Medines korteles smagios, ne kaip popierines. sunus dar eilute jas susideda"
    },
    {
      "name": "Jonas",
      "text": "Vaikams patiko"
    },
    {
      "name": "Dovilė",
      "text": "maniskis tik korteles su dovanom renkasi, eglutes man palieka. paprasti paveiksliukai bet jam jau istorija gaunasi"
    }
  ],
  "JK-024": [
    {
      "name": "Greta",
      "text": "Zvake stikle jau turejau, dabar po lempa naudoju. auksti pagal didesni indeli pasireguliavau"
    },
    {
      "name": "Viktorija",
      "text": "kremine ant komodos grazu ir isjungta. pilna sviesa per ryski man tai pritemdau"
    },
    {
      "name": "Aušra",
      "text": "Laikmatis patogus kai skaitau. kvapas yra o ziebtuvelio nereikia, as ji vis pametu"
    },
    {
      "name": "Justė",
      "text": "juoda gaubta emiau. svetainej daug sviesiu daiktu tai norejau bent vieno tamsaus"
    },
    {
      "name": "Indrė",
      "text": "Zvakes anksciau laikydavau del graziu indeliu, su lempa pradejau naudot is tikro. viena vis po ja. pradzioj abejojau ar vaškas taip tirps be liepsnos, bet pripratau. silta sviesa ir kvapas nuo tirpstancio vaško labai panasus. dar gerai kad saugiau, nes vaikai ir katė po namus laksto. naudoju beveik kas vakara, jau antra zvake baigesi"
    },
    {
      "name": "Lina",
      "text": "is pradziu vis tikrinau ar vaskas tirpsta.. keista ziuret i zvake be liepsnos bet pripratau"
    }
  ],
  "JK-025": [
    {
      "name": "Neringa",
      "text": "kremine emiau miegamajam ant komodos. vakare ijungus graziau nei diena man"
    },
    {
      "name": "Arnas",
      "text": "Gražiai atrodo, nedaug vietos uzima"
    },
    {
      "name": "Miglė",
      "text": "man gėlės numirsta visada tai sita pats tas. nuvalau gaubta ir viskas"
    },
    {
      "name": "Tomas",
      "text": "vysnine paemiau, draugei raudona nelabai. ant jos stalo tarp knygu gerai atrodo"
    },
    {
      "name": "Rūta",
      "text": "savaite kilnojau is vienos vietos i kita 😅 prie remelio su nuotrauka galiausiai tiko geriausiai"
    }
  ],
  "JK-026": [
    {
      "name": "Gabija",
      "text": "dukra vis rodo duobutes menulyje. pastatem ant lentynos, ijungus reljefas gerai matosi"
    },
    {
      "name": "Vilius",
      "text": "palietimu valdosi, nereikia jungiklio ieskot tamsoj. ant naktinio staliuko tinka"
    },
    {
      "name": "Karolina",
      "text": "silta sviesa turiu. pakraut nunesu prie kompo, patogu kad ne visada laidas"
    },
    {
      "name": "Ema",
      "text": "medinis laikiklis paprastas ir gerai. menulis traukia aki, anksciau ta vieta lentynoj buvo tuscia"
    },
    {
      "name": "Nedas",
      "text": "labai gražu"
    },
    {
      "name": "Justina",
      "text": "su pulteliu spalvota. as viena spalva laikau, dukra pakeicia kas sekunde 😂"
    }
  ],
  "JK-027": [
    {
      "name": "Simona",
      "text": "filmuojant namie fonas ant tuscios sienos iskart idomesnis. tik kampo reikejo paieskot"
    },
    {
      "name": "Laura",
      "text": "pradzioj sviesos ratas mazas, patraukiau lempa toliau nuo sienos ir gerai"
    },
    {
      "name": "Domas",
      "text": "uz sofos pastačiau i siena. isjungus pagrindine sviesa labai jauku"
    },
    {
      "name": "Kotryna",
      "text": "kampas virs komodos. ant baltos sienos geriausiai, paveiksla teko nukelt"
    },
    {
      "name": "Ignas",
      "text": "kartais i kita kambari nusinesu, per usb paprastai. nieko i telefona siust nereikejo"
    }
  ],
  "JK-028": [
    {
      "name": "Justina",
      "text": "Laseliai labiausiai uzkabino. prie stalo ijungiu ir kartais tiesiog ziuriu i ta debesi"
    },
    {
      "name": "Birutė",
      "text": "juodas variantas svetainei gerai. rūkas ir laseliai idomiau uz mano sena paprasta drekintuva"
    },
    {
      "name": "Martynas",
      "text": "salia darbo vietos laikau. vandens papildyt reikia gan daznai, bet cia turbut normalu"
    },
    {
      "name": "Rasa",
      "text": "baltas debesis juokingai mielas 😄 sveciai vis klausia kas cia"
    },
    {
      "name": "Dovydas",
      "text": "Mielas debesis, daugiau kaip dekoracija pas mane"
    },
    {
      "name": "Gabrielė",
      "text": "su savo eteriniu aliejum bandziau. kvapas ok, bet man paciam lietus labiau patinka"
    },
    {
      "name": "Tomas",
      "text": "galvojau bus keista ant darbo stalo, bet prie augalo visai normaliai atrodo"
    }
  ],
  "JK-029": [
    {
      "name": "Lina",
      "text": "kojos salta visada, vakare lovoj pasidedu. uzvalkalas minkstas, geriau nei plika gumine"
    },
    {
      "name": "Vytautas",
      "text": "Šilta, ačiū"
    },
    {
      "name": "Daiva",
      "text": "bordo emiau prie pledo. uzpildau ir nesuosi ant sofos, jokio laido nereikia"
    },
    {
      "name": "Rima",
      "text": "mociute panasiai turejo tik be uzvalkalo. sau kremine paemiau, prie pledo gerai"
    }
  ],
  "JK-030": [
    {
      "name": "Vaida",
      "text": "sunus pirma vakara zvaigzdes skaiciavo gulėdamas. dabar pats primena ijungt"
    },
    {
      "name": "Marius",
      "text": "pultelis geras, nereikia nuo sofos keltis. tamsiam kambary daug geriau matosi"
    },
    {
      "name": "Deimantė",
      "text": "Pries filma ijungiam, filmo metu isjungiam. vaikai spalvas pakeicia visas"
    },
    {
      "name": "Kamilė",
      "text": "vaikų kambariui pirkau bet i svetaine parsinesem 😅 mums su vyru irgi idomu"
    },
    {
      "name": "Rokas",
      "text": "Geras daiktas, ypac tamsoj"
    },
    {
      "name": "Ieva",
      "text": "pulteli laikom ant lentynos nes vaikai vis nusinesa kazkur. pats projektorius ant komodos"
    },
    {
      "name": "Tadas",
      "text": "draugai pamate klause ar tikrai kosmosas ant lubu. su spalvom ilgai zaidem 😄"
    }
  ],
  "JK-031": [
    {
      "name": "Ernesta",
      "text": "rytais kavai piena plakuosi. pirma karta mazam puodely aptaskiau visa stala 😬 su aukstesniu daug geriau"
    },
    {
      "name": "Karolis",
      "text": "patogus plakiklis, greitai padaro"
    },
    {
      "name": "Inga",
      "text": "stovelis geras, kiti tokie irankiai stalciuj guledavo. sitas salia puodeliu visada po ranka"
    },
    {
      "name": "Milda",
      "text": "daugiausia matchai, kavai reciau. nedidelis tai vietos neuzima"
    },
    {
      "name": "Darius",
      "text": "plieninis dera prie virtuves. zmona juokiasi kad dabar kakava rimtai darau"
    }
  ],
  "JK-032": [
    {
      "name": "Andrius",
      "text": "telpa i sporto krepsi ir nepasimeta. rankoj patogus"
    },
    {
      "name": "Laurynas",
      "text": "gerai, veikia kaip reikia"
    },
    {
      "name": "Vilma",
      "text": "galvutes keiciasi lengvai, dazniausiai apvalia naudoju. usb-c tai nereikia dar vieno keisto laido"
    },
    {
      "name": "Mantas",
      "text": "stalciuj prie kompo laikau. didelis ten netilptu, sito dydis kaip tik"
    },
    {
      "name": "Aistė",
      "text": "bijojau kad viena ranka nepatogu bus, bet rankena tiko mano delnui. paprasciau nei galvojau"
    },
    {
      "name": "Domas",
      "text": "greicius pabandziau kelis, stipriausio beveik nenaudoju. gerai kad galima pasirinkti"
    }
  ],
  "JK-033": [
    {
      "name": "Gintarė",
      "text": "audinys prie veido labai malonus. pirma vakara pagalve vis taisiausi nes kitaip jauciasi"
    },
    {
      "name": "Aurelija",
      "text": "Svelnus audinys, daugiau nieko ir nereikia"
    },
    {
      "name": "Daina",
      "text": "50x70 pagalvei tiko. slidesnis nei iprasta, pora vakaru priprast reikejo"
    },
    {
      "name": "Lina",
      "text": "silkinę kauke jau turejau tai ir uzvalkalo uzsimaniau. abu dabar prie lovos"
    },
    {
      "name": "Rūta",
      "text": "bordo prie pilkos patalynes gerai. is pradziu keista buvo viena pagalve kitokia, dabar antros tokios norisi"
    }
  ],
  "JK-034": [
    {
      "name": "Eglė",
      "text": "volą naudoju po serumo vakare. saltas akmuo ant veido malonus, gua sha dar mokausi"
    },
    {
      "name": "Simona",
      "text": "Gražus rinkinys, dezute irgi nebloga"
    },
    {
      "name": "Lina",
      "text": "pradzioj tik vola imdavau, dabar jau ir antra akmeni. toks mazas ritualas pries miega"
    },
    {
      "name": "Miglė",
      "text": "nefrito paemiau. laikau dezutej nes lentynele maza ir bijau numest"
    }
  ],
  "JK-035": [
    {
      "name": "Rasa",
      "text": "prie sofos patiesiau, bordo detales tiko prie pagalveliu. kaledinis bet ne per margas"
    },
    {
      "name": "Darius",
      "text": "Tinka svetainei, dydis pas mane geras"
    },
    {
      "name": "Jurgita",
      "text": "kremini po eglute dejau. net nesinori jos nukraustyt dabar"
    },
    {
      "name": "Monika",
      "text": "mazai svetainei dydis tiko. bet pasimatuokit pries perkant!! nuotraukoj man irgi didesnis atrode"
    },
    {
      "name": "Simona",
      "text": "bordo prie uzuolaidu derinau. eglutes raste is arti matosi, is toliau tik spalvos"
    },
    {
      "name": "Algis",
      "text": "pries foteli kur skaitau. puko nedaug, trupinius lengvai susiurbiu"
    }
  ],
  "JK-036": [
    {
      "name": "Mantas",
      "text": "buto raktus pazimejau. eglute maza, kisenej netrukdo. nuo darbiniu atskirt lengviau"
    },
    {
      "name": "Karolina",
      "text": "ruda oda emiau. su auksine eglute graziai, paprastas toks"
    },
    {
      "name": "Tadas",
      "text": "gera kokybe, atrodo kad laikys"
    },
    {
      "name": "Austėja",
      "text": "kolegei prie didesnes dovanos idejau. matau kad ant raktu vis dar nesioja"
    }
  ],
  "JK-037": [
    {
      "name": "Paulius",
      "text": "kuprinej su laidu. kai po darbo dar kazkur einu ir telefonas raudonas praverčia"
    },
    {
      "name": "Gabija",
      "text": "autobusu vaziavau i kita miesta, pasikroviau vietoj. nereikejo rozetes ieskot"
    },
    {
      "name": "Lukas",
      "text": "man tinka, dydis normalus"
    },
    {
      "name": "Justė",
      "text": "nesiojuos beveik visada tik pati kartais pamirstu ja ikraut :D tada nei kam"
    },
    {
      "name": "Edvinas",
      "text": "i striukes kisene eidamas fotografuot miesto isidejau. prireike, gerai kad laida turejau"
    },
    {
      "name": "Laimutė",
      "text": "sode naudoju, rozetė namuke o as kieme. telefonas salia ant stalo"
    },
    {
      "name": "Marius",
      "text": "viena laida namie, kita su baterija laikau. pries kelione abu sumetu ir maziau galvoju"
    }
  ],
  "JK-038": [
    {
      "name": "Emilija",
      "text": "tinklalaides einu klausydama i darba. deklas mazas, telpa net i maziausia rankine"
    },
    {
      "name": "Rokas",
      "text": "Geras garsas, uz tokias visai"
    },
    {
      "name": "Greta",
      "text": "kremine del spalvos emiau. deklą prie raktu laikau kad nepamirsciau"
    },
    {
      "name": "Domantas",
      "text": "prie kompiuterio kasdien. tik reikia priprast abi po to i deklą sudet"
    },
    {
      "name": "Rugilė",
      "text": "audioknygas vakare, vyras televizoriu ziuri. maziau ginču del garso 😄"
    },
    {
      "name": "Dainius",
      "text": "grafitines paemiau. deklas sportiniam krepsy, vaziuojant i sale issitraukiu"
    }
  ],
  "JK-039": [
    {
      "name": "Viktorija",
      "text": "grizus is darbo pirmiausia persiaunu. padas minkstas, atviras kulnas tai greit uzsideda"
    },
    {
      "name": "Mindaugas",
      "text": "didesni dydi emiau, koja 42 ir tiko. rytais virtuvej geriau nei su kojinem"
    },
    {
      "name": "Laima",
      "text": "Siltos ir minkstos"
    },
    {
      "name": "Neringa",
      "text": "kremines grazios bet katinas, plauku pilna 😅 pacios slepetes patogios, aviu kasdien"
    },
    {
      "name": "Rasa",
      "text": "Patogios, namams kaip tik"
    },
    {
      "name": "Giedrius",
      "text": "senas gumines visada avėjau. sitos su pamušalu daug maloniau sedint prie kompo"
    },
    {
      "name": "Milda",
      "text": "kremines nes sviesiu norejau. i lauka neinu su jom, tik namams"
    }
  ],
  "JK-040": [
    {
      "name": "Ieva",
      "text": "Recepta virtuvej telefone laikau. nebereikia ramstyt i cukraus inda 😊"
    },
    {
      "name": "Tomas",
      "text": "gulsčiai pastatau ir video ziuriu. paprastas daiktas bet naudoju daugiau nei galvojau"
    },
    {
      "name": "Agnė",
      "text": "mamai skambinu su vaizdu ir rankos laisvos. ji irgi uzsimane tokio"
    },
    {
      "name": "Vytautas",
      "text": "Tinka, ačiū"
    },
    {
      "name": "Aurelija",
      "text": "mokausi megzti is video, telefona i stova ir abi rankos laisvos"
    }
  ],
  "JK-041": [
    {
      "name": "Dovilė",
      "text": "sena keliones nuotrauka idejau. salia knygu graziau nei tikejausi, medis silta toki vaizda duoda"
    },
    {
      "name": "Andrius",
      "text": "tamsesni paemiau tevams su anukes nuotrauka. asmeniska dovana, nereikejo daug galvot"
    },
    {
      "name": "Kamilė",
      "text": "10x15 tiko. pirma pastačiau paskui ant sienos pakabinau, gerai kad abu galima"
    },
    {
      "name": "Eimantas",
      "text": "Gražus rėmelis, paprastas"
    }
  ],
  "JK-042": [
    {
      "name": "Sandra",
      "text": "ant stalo viska issideliojau ir seimos dovanas supakavau. juosteles su kortelem kartu, derint nereikejo"
    },
    {
      "name": "Giedrė",
      "text": "kraft popierius su aukso lipdukais labai gerai atrodo. mano kreivi kampai kazkaip maziau matosi 😅"
    },
    {
      "name": "Martynas",
      "text": "Labai gražu, ypac kai viskas vienoj dezutej"
    }
  ],
  "JK-043": [
    {
      "name": "Jolanta",
      "text": "suris, vynuoges, duona. dviem uztenka vietos ir stalas iskart graziau atrodo"
    },
    {
      "name": "Arnas",
      "text": "grazi lenta, spalva gera"
    },
    {
      "name": "Rūta",
      "text": "ir sekmadienio pusryciam naudoju. rankom plauti reikia, daugiau prieziuros bet medis man mielesnis"
    },
    {
      "name": "Aušra",
      "text": "duona ant lentos dedu, ne i krepseli. prie sriubos irgi kazkaip patogiau"
    },
    {
      "name": "Gediminas",
      "text": "kai nenaudoju atremta virtuvej stovi. savaitgali alyvuogem ir suriui issitraukiu"
    }
  ],
  "JK-044": [
    {
      "name": "Indrė",
      "text": "vanile jauciasi bet kepiniu tikrai neprimena. medis patiko labiau nei galvojau"
    },
    {
      "name": "Lina",
      "text": "koridoriuj laikau, pries svecius papurskiu. zvakes uzdegt nereikia"
    },
    {
      "name": "Gintarė",
      "text": "Malonus kvapas, ne per saldus"
    }
  ],
  "JK-045": [
    {
      "name": "Aurelija",
      "text": "ant virtuves palanges stovejo. ryte prie kavos po langeli, vyras net primindavo jei pamirsdavau"
    },
    {
      "name": "Raimondas",
      "text": "mamai paemiau, ji tokius ritualus megsta. paskui vis pasakodavo ka rado"
    },
    {
      "name": "Vilma",
      "text": "Gražus kalendorius"
    },
    {
      "name": "Inga",
      "text": "su dukra pakaitom atidarom. mano diena ji vis tiek salia stovi ir laukia ❤️"
    },
    {
      "name": "Dovydas",
      "text": "sau pirkau nors kalendoriaus neturejau nuo mokyklos. ryte arbatos rast smagu"
    },
    {
      "name": "Eglė",
      "text": "prie lango pastaciau, vakare su girlianda graziai. sunkiausia pirma diena visko neatidaryt iskart 😂"
    }
  ],
  "JK-046": [
    {
      "name": "Kristina",
      "text": "vaikui saldainiu ir laiskeli idejau. megzta, ne tokia plona kaip sena"
    },
    {
      "name": "Simas",
      "text": "zidinio neturim tai prie eglutes pakabinom. kremine su bordo prie zaisliuku tinka"
    },
    {
      "name": "Aistė",
      "text": "mazesne maniau bus, bet smulkmenom vietos tikrai daug. kasmet su dekoracijom issitrauksim"
    },
    {
      "name": "Dalia",
      "text": "Mieli kutai, vaikui labiausiai patiko jie"
    }
  ],
  "JK-047": [
    {
      "name": "Miglė",
      "text": "ant darbo stalo. kol kompas uzsikrauna pakratau, namelis labai mielas"
    },
    {
      "name": "Gintaras",
      "text": "Mielas gaublys, nedidelis"
    },
    {
      "name": "Daiva",
      "text": "primena vaikystej pas mociute buvusi gaubli. vis pagaunu save kratant nors seniai ne vaikas 😊"
    },
    {
      "name": "Nojus",
      "text": "pakratau ir ziuriu kol sniegas nusileidzia. maza detale, nuo telefono kartais atitraukia"
    },
    {
      "name": "Kotryna",
      "text": "vietos tarp knygu buvo tai ten ir stovi. mediena labiau patinka nei blizgios dekoracijos"
    }
  ],
  "JK-048": [
    {
      "name": "Alma",
      "text": "be staltieses ant medinio stalo grazu. per viduri zvakes ir daugiau nieko nereikia"
    },
    {
      "name": "Renata",
      "text": "rastas gana ryskus tai indus paprastus baltus dejau. graziai gavosi, mano stalui galetu but ilgesnis"
    },
    {
      "name": "Saulius",
      "text": "Gražus takelis, lengvai derinasi"
    }
  ],
  "JK-049": [
    {
      "name": "Dovilė",
      "text": "ant komodos prie eglutes. maniau bus per daug visko bet kazkaip isipaise"
    },
    {
      "name": "Arūnas",
      "text": "prislopintos spalvos patiko. su senais zaisliukais geriau nei ryskiai raudonas"
    },
    {
      "name": "Rita",
      "text": "mielas 😄"
    }
  ],
  "JK-050": [
    {
      "name": "Aistė",
      "text": "pagaliau nesimato to bjauraus stovo. reikejo pernai pirkt"
    },
    {
      "name": "Giedrė",
      "text": "kremine prie eglutes tinka. katinas kai isitaiso tai dovanom vietos maziau 😅"
    },
    {
      "name": "Mindaugas",
      "text": "Praktiška, savo darba daro"
    },
    {
      "name": "Violeta",
      "text": "stova anksciau maiseliais dengdavau. dabar nebereikia. krasta tik islygint reikejo nes kreivai buvau uzdejus"
    }
  ],
  "JK-051": [
    {
      "name": "Lina",
      "text": "vakare tik nameli su girlianda ijungiu. ant palanges svieciantys langeliai gerai atrodo"
    },
    {
      "name": "Saulius",
      "text": "nedidelis, vietos neuzima. del apsnigto stogo emiau, gyvai dar mielesnis"
    },
    {
      "name": "Eglė",
      "text": "prie eglutes statyt galvojau, liko virtuvej. ryte su kava smagu ijungt"
    },
    {
      "name": "Rimantė",
      "text": "ant siauro prieskambario staliuko padejau. maniau didesnes dekoracijos reikes bet uzteko sito"
    },
    {
      "name": "Aidas",
      "text": "Gražus žibintas"
    }
  ],
  "JK-052": [
    {
      "name": "Monika",
      "text": "laisvas tikrai, rankoves atsiraitau. kritimas patinka, su dzinsais daznai"
    },
    {
      "name": "Greta",
      "text": "Patogus, nespaudzia"
    },
    {
      "name": "Jurgita",
      "text": "storokas, biure per silta. savaitgaliais namie kaip tik"
    },
    {
      "name": "Simona",
      "text": "platūs rankogaliai patiko. nuotraukoj ju net nepastebejau, gyvai graziau"
    },
    {
      "name": "Rugilė",
      "text": "su siaurom kelnem gerai. su placiom jau per daug, megztinis ir taip laisvas"
    },
    {
      "name": "Edita",
      "text": "rytais i darzeli vezu vaika ir daznai griebiu sita. galvot ka rengtis nereikia 😅"
    },
    {
      "name": "Dalia",
      "text": "i kelnes nekemsu, laisvai palieku. peciai graziai krenta, del to ir pasilikau"
    }
  ],
  "JK-053": [
    {
      "name": "Tomas",
      "text": "namie nesioju. uztrauktukas patogus kai silta, anksciau megztini per galva tampydavau 😄"
    },
    {
      "name": "Rūta",
      "text": "Minkštas, patogus"
    },
    {
      "name": "Karolina",
      "text": "kisenej telpa telefonas bet viena puse tada nusvyra. rytais uzsimetu daznai"
    },
    {
      "name": "Justė",
      "text": "uztrauktuko del emiau, gobtuvo beveik nenaudoju. balkone vakare malonu"
    },
    {
      "name": "Deividas",
      "text": "savaitgaliui isvaziuodamas pasiimu. masinoj prasisegi ir nereikia viso nusivilkt"
    },
    {
      "name": "Gintarė",
      "text": "gobtuvas didokas, nenaudoju. pats dzemperis patinka, ypac vidus minkstas"
    }
  ],
  "JK-054": [
    {
      "name": "Inga",
      "text": "Šiltas"
    },
    {
      "name": "Vilma",
      "text": "ant darbo kedes laikau, atvesus uzsimetu. ilgis geras, nugara neatsidengia"
    },
    {
      "name": "Gabija",
      "text": "kisenes maloniai nustebino, nuotraukose ju nepastebejau. plauku gumytes ten metu"
    },
    {
      "name": "Diana",
      "text": "mamai pirkau. ji susagstomus labiau megsta tai bent nesimeto spintoj"
    },
    {
      "name": "Virginija",
      "text": "ilgio ieskojau, trumpo nenorejau. su paprastais marskineliais tvarkingai atrodo"
    }
  ],
  "JK-055": [
    {
      "name": "Agnė",
      "text": "bordo apvadas labai patiko. paprasta bet nesijauciu kaip su senais issitampiusiais marskineliais 😄"
    },
    {
      "name": "Laura",
      "text": "kelnes ilgokos, as zema. pasilikau, namie netrukdo"
    },
    {
      "name": "Viktorija",
      "text": "Patogi pižama"
    },
    {
      "name": "Renata",
      "text": "ilgu kelniu norejau nes nakti antklode nusispardau. sita tiko"
    },
    {
      "name": "Alina",
      "text": "miegu su marskineliais paprastai, sita vakarais namie. apykakle graziai atrodo kai virsu susisegu"
    },
    {
      "name": "Ernesta",
      "text": "bordo krastai pagyvina. marskinius kartais su kitom kelnem nesioju"
    },
    {
      "name": "Skaistė",
      "text": "virsu prie chalato pakabinau, kelnes i stalciu. pagaliau namie deranti komplekta turiu"
    }
  ],
  "JK-056": [
    {
      "name": "Ieva",
      "text": "Plonas, po svarku audinio kruvos nera. i darba geriau nei stora megztini"
    },
    {
      "name": "Daiva",
      "text": "kakla kartais atlenkiu, kartais aukstai. spalva prie tamsaus palto gerai"
    },
    {
      "name": "Neringa",
      "text": "golfo be rastu ieskojau. sitas paprastas ir su daug kuo derinasi"
    },
    {
      "name": "Aušra",
      "text": "paprastas, gerai"
    },
    {
      "name": "Paulina",
      "text": "atlenkta apykakle patogiau. su sijonu i darba ir daugiau nieko virsuj nereikia jei kabinete silta"
    }
  ],
  "JK-057": [
    {
      "name": "Ugnė",
      "text": "darbovietes kalediniam vakarui paemiau. elniai ir eglutes iskart i tema, aksesuaru nereikejo"
    },
    {
      "name": "Milda",
      "text": "Gražus, sventem tinka"
    },
    {
      "name": "Vesta",
      "text": "tarp keliu rinkausi, sito zalios detales labiausiai patiko. su juodom kelnem gerai"
    },
    {
      "name": "Julija",
      "text": "eglutes ant rasto man graziausios. rengiausi su paprastu sijonu, megztinis ir taip ryskus"
    }
  ],
  "JK-058": [
    {
      "name": "Kristina",
      "text": "sau ir vaikui derinom. mazajam Kaledu Senelis svarbiausia, mums kad vienodai 🎅 dydziu lentele pasirode tiksli, vaikui emem viena puse didesni kad uztektu visai ziemai. po pirmo skalbimo rastas nesusivėle ir spalvos liko. nuotraukai prie eglutes telefona ant knygu krūvos pastatem ir ilgai juokemes kol visus sustatem. kitais metais turbut vel vilkesim, tik gal kita rasta"
    },
    {
      "name": "Paulius",
      "text": "zmona seimos nuotraukai isrinko. nelabai norejau vienodai rengtis bet rezultatas visai patiko"
    },
    {
      "name": "Indrė",
      "text": "raudona su snaigem prie eglutes gerai atrodo. vaikas savo megztini dar pries fotosesija norejo vilket"
    },
    {
      "name": "Evelina",
      "text": "sunus del Kaledu Senelio pasirinko. man ir kitas butu tikes, si karta jis nusprende"
    },
    {
      "name": "Martynas",
      "text": "vienodai rengtis pas mus naujiena. nuotrauka seneliams padarem, galvojam iremint 😂"
    },
    {
      "name": "Aurelija",
      "text": "rastas nuotraukose nesusilieja, snaiges matosi. tamsias paprastas kelnes derinom kad nebutu per daug"
    }
  ],
  "JK-059": [
    {
      "name": "Mantas",
      "text": "su drauge po megztini. sniego senis toks juokingas, abu pamatem ir emem"
    },
    {
      "name": "Emilija",
      "text": "deranciu ieskojom bet ne su sirdutem ar uzrasais. sniego senis tiko, spalvos kaledines"
    },
    {
      "name": "Lukas",
      "text": "Labai juokingi 😄"
    },
    {
      "name": "Roberta",
      "text": "draugas pats pasiule, netiketa buvo. dydzius sau issirinkom, per seimos vakariene vilkesim"
    },
    {
      "name": "Domantas",
      "text": "sniego senis didelis ir matosi iskart. smulkus rastai ne mano, cia aiskus piesinys"
    }
  ],
  "JK-060": [
    {
      "name": "Jolanta",
      "text": "bendro rasto seimai norejom, sitas ramesnis uz didelius paveiksliukus. raudona su balta gerai dera"
    },
    {
      "name": "Andrius",
      "text": "del elniu emem, vaikui jie labiausiai patiko. namie fotografavomes, kitu svenciu drabuziu net nereikejo"
    },
    {
      "name": "Dainora",
      "text": "snaiges ir elniai per visa megztini kartojasi. man graziau nei vienas didelis piesinys prieky"
    },
    {
      "name": "Jūratė",
      "text": "tarp sito ir su Kaledu Seneliu svarstem. elniai laimejo, tinka visa ziema"
    },
    {
      "name": "Domas",
      "text": "Gražūs raštai"
    },
    {
      "name": "Kamilė",
      "text": "balti rastai ant raudono labai graziai. prie musu eglutes su baltais zaisliukais sueina"
    }
  ]
};

export function getProductReviews(sku: string): ProductReview[] {
  return PRODUCT_REVIEWS[sku] ?? [];
}
