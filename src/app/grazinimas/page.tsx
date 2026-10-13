import type { Metadata } from "next";
import { store } from "@/lib/config/store.config";
import { InfoPage } from "@/components/layout/info-page";

export const metadata: Metadata = {
  title: "Grąžinimas ir keitimas",
  description:
    "Apsigalvojote? Prekę galite grąžinti per 14 dienų nuo gavimo. Pažeistas ar brokuotas prekes pakeičiame arba grąžiname pinigus.",
  alternates: { canonical: "/grazinimas" },
};

export default function ReturnsPage() {
  const email = store.contact.email;
  return (
    <InfoPage
      title="Grąžinimas ir keitimas"
      intro="Norime, kad dovana džiugintų – ir jus, ir tą, kuris ją gaus. Jei kas nors ne taip, parašykite, ir kartu rasime sprendimą."
    >
      <h2>14 dienų apsigalvoti</h2>
      <p>
        Prekę galite grąžinti per 14 dienų nuo jos gavimo, net ir nenurodę priežasties. Ją
        galite išpakuoti ir apžiūrėti taip, kaip apžiūrėtumėte parduotuvėje. Svarbu tik, kad
        prekė būtų nenaudota, švari, nepažeista ir su visais komplekte buvusiais priedais.
        Jei originali pakuotė šiek tiek nukentėjo, nieko tokio, tiesiog parašykite mums.
      </p>
      <p>
        Grąžinti negalėsime prekių, kurios buvo naudotos, pripildytos vandeniu, subraižytos,
        sulaužytos ar suteptos.
      </p>

      <h2>Kaip grąžinti prekę</h2>
      <ul>
        <li>
          Parašykite mums el. paštu <a href={`mailto:${email}`} className="text-burgundy-600 underline underline-offset-2">{email}</a> ir
          nurodykite užsakymo numerį.
        </li>
        <li>Atsiųsime grąžinimo adresą ir trumpą instrukciją.</li>
        <li>Saugiai supakuokite prekę, kad ji nenukentėtų kelyje, ir išsiųskite.</li>
        <li>Gavę ir apžiūrėję prekę, pinigus grąžinsime per 14 dienų tuo pačiu mokėjimo būdu.</li>
      </ul>
      <p>
        Jei grąžinate prekę, nes apsigalvojote, grąžinimo siuntimo išlaidas apmokate jūs.
      </p>

      <h2>Prekė atkeliavo pažeista ar su defektu?</h2>
      <p>
        Atsiprašome, taip neturėtų nutikti. Parašykite mums kuo greičiau ir atsiųskite prekės
        bei pakuotės nuotraukas su užsakymo numeriu. Prekę pakeisime nauja arba grąžinsime
        visus pinigus, o visas siuntimo išlaidas padengsime mes.
      </p>
      <p>
        Patarimas: gavę siuntą, apžiūrėkite ją dar prie kurjerio. Jei pakuotė įlenkta ar
        įplyšusi, nufotografuokite ją ir, jei galite, pažymėkite tai kurjeriui. Taip
        viską sutvarkysime daug greičiau.
      </p>
      <p>
        Jei pažeidimą pastebėjote vėliau, vis tiek parašykite. Kiekvieną atvejį peržiūrime
        individualiai ir stengiamės padėti. Už pažeidimus, atsiradusius jau naudojant prekę,
        pavyzdžiui, ją numetus ar netinkamai surinkus, atsakyti negalime.
      </p>

      <h2>Abejojate prieš pirkdami?</h2>
      <p>
        Prieš užsakydami atidžiai peržiūrėkite prekės aprašymą, nuotraukas, spalvą ir dydį.
        O jei vis dar dvejojate, parašykite mums. Mielai padėsime išsirinkti tinkamą dovaną. 🤝
      </p>
    </InfoPage>
  );
}
