import type { Metadata } from "next";
import Link from "next/link";
import { store } from "@/lib/config/store.config";
import { InfoPage } from "@/components/layout/info-page";

export const metadata: Metadata = {
  title: "Privatumo politika",
  description: "Privatumo politika: kokie duomenys renkami, kaip naudojami, jūsų teisės ir slapukai.",
  alternates: { canonical: "/privatumo-politika" },
};

export default function PrivacyPage() {
  return (
    <InfoPage title="Privatumo politika">
      <p>
        Mes gerbiame jūsų privatumą ir įsipareigojame saugoti jūsų asmens duomenis. Šioje
        privatumo politikoje paaiškinama, kokius duomenis renkame, kokiais tikslais juos
        naudojame, kam galime juos perduoti ir kokias teises turite.
      </p>

      <h2>Renkama informacija</h2>
      <p>
        Mes galime rinkti šią informaciją, kai atliekate pirkimą, susisiekiate su mumis
        arba užsiprenumeruojate naujienlaiškį:
      </p>
      <ul>
        <li>vardą ir pavardę;</li>
        <li>el. pašto adresą;</li>
        <li>telefono numerį;</li>
        <li>pristatymo adresą;</li>
        <li>užsakymo informaciją;</li>
        <li>mokėjimo būseną ir su mokėjimu susijusią informaciją;</li>
        <li>susirašinėjimo su klientų aptarnavimu informaciją;</li>
        <li>informaciją apie jūsų pasirinktus ar įsigytus produktus.</li>
      </ul>
      <p>
        Atkreipiame dėmesį, kad pilnų banko kortelės duomenų mes nesaugome. Mokėjimai
        atliekami per saugius mokėjimo paslaugų teikėjus.
      </p>

      <h2>Informacijos naudojimas</h2>
      <p>Surinktą informaciją naudojame šiais tikslais:</p>
      <ul>
        <li>užsakymų priėmimui, apdorojimui ir vykdymui;</li>
        <li>prekių pristatymui;</li>
        <li>mokėjimų administravimui;</li>
        <li>klientų aptarnavimui;</li>
        <li>grąžinimų, garantinių ar kitų su užsakymu susijusių klausimų sprendimui;</li>
        <li>apsipirkimo patirties gerinimui;</li>
        <li>teisinių ir apskaitos pareigų vykdymui;</li>
        <li>naujienlaiškių, pasiūlymų ar akcijų siuntimui, jeigu tam davėte sutikimą.</li>
      </ul>
      <p>
        Naujienlaiškių galite bet kada atsisakyti paspaudę atsisakymo nuorodą gautame
        laiške arba susisiekę su mumis.
      </p>

      <h2>Informacijos bendrinimas</h2>
      <p>Jūsų asmens duomenų neparduodame ir nenuomojame tretiesiems asmenims.</p>
      <p>
        Tam tikrais atvejais jūsų duomenys gali būti perduodami tik tiek, kiek būtina
        užsakymui įvykdyti arba paslaugoms suteikti, pavyzdžiui:
      </p>
      <ul>
        <li>pristatymo / kurjerių paslaugų teikėjams;</li>
        <li>mokėjimo paslaugų teikėjams;</li>
        <li>el. parduotuvės platformos, IT ir svetainės administravimo paslaugų teikėjams;</li>
        <li>buhalterinės apskaitos paslaugų teikėjams;</li>
        <li>naujienlaiškių siuntimo paslaugų teikėjams, jeigu esate užsiprenumeravę naujienlaiškį;</li>
        <li>valstybės institucijoms, kai to reikalauja teisės aktai.</li>
      </ul>
      <p>Duomenys perduodami tik tokia apimtimi, kiek tai būtina konkrečiam tikslui pasiekti.</p>

      <h2>Saugumas</h2>
      <p>
        Mes taikome tinkamas technines ir organizacines priemones, siekdami apsaugoti jūsų
        asmens duomenis nuo neteisėtos prieigos, praradimo, pakeitimo ar paviešinimo.
      </p>
      <p>
        Mokėjimai atliekami per saugius mokėjimo paslaugų teikėjus, o klientų duomenys
        saugomi tik tiek, kiek būtina užsakymams vykdyti, klientų aptarnavimui užtikrinti
        ir teisės aktuose numatytoms pareigoms įgyvendinti.
      </p>

      <h2>Duomenų saugojimas</h2>
      <p>Asmens duomenys saugomi ne ilgiau, nei būtina tikslams, dėl kurių jie buvo surinkti.</p>
      <p>
        Užsakymų, pristatymo ir klientų aptarnavimo duomenys gali būti saugomi iki 24
        mėnesių nuo paskutinio susisiekimo ar užsakymo įvykdymo dienos, nebent teisės
        aktai numato ilgesnį saugojimo terminą.
      </p>
      <p>
        Duomenys, susiję su apskaita, mokėjimais ir finansinėmis operacijomis, saugomi
        teisės aktuose nustatytais terminais.
      </p>

      <h2>Jūsų teisės</h2>
      <p>Jūs turite teisę:</p>
      <ul>
        <li>susipažinti su savo asmens duomenimis;</li>
        <li>prašyti ištaisyti netikslius duomenis;</li>
        <li>prašyti ištrinti savo duomenis, kai tam yra teisinis pagrindas;</li>
        <li>prašyti apriboti duomenų tvarkymą;</li>
        <li>nesutikti su duomenų tvarkymu;</li>
        <li>atšaukti duotą sutikimą, kai duomenys tvarkomi sutikimo pagrindu;</li>
        <li>prašyti perkelti jūsų duomenis kitam duomenų valdytojui, kai tai taikoma;</li>
        <li>
          pateikti skundą Valstybinei duomenų apsaugos inspekcijai, jeigu manote, kad jūsų
          duomenys tvarkomi netinkamai.
        </li>
      </ul>
      <p>
        Norėdami pasinaudoti savo teisėmis, susisiekite su mumis{" "}
        <Link href="/kontaktai" className="font-semibold text-burgundy-600 underline underline-offset-2">
          kontaktų skiltyje
        </Link>{" "}
        nurodytais kontaktais ({store.contact.email}).
      </p>

      <h2>Slapukai</h2>
      <p>
        Mūsų svetainėje gali būti naudojami slapukai, reikalingi svetainės veikimui,
        užsakymo pateikimui, krepšelio funkcionalumui, analitikai ar rinkodarai.
      </p>
      <p>
        Būtinieji slapukai naudojami tam, kad svetainė galėtų tinkamai veikti. Analitiniai
        ar rinkodaros slapukai naudojami tik gavus jūsų sutikimą, jeigu toks sutikimas
        pagal teisės aktus yra reikalingas.
      </p>
      <p>
        Savo slapukų pasirinkimus galite bet kada pakeisti naršyklės nustatymuose arba
        svetainėje pateiktuose slapukų nustatymuose, jeigu tokia galimybė yra suteikiama.
      </p>

      <h2>Privatumo politikos pakeitimai</h2>
      <p>
        Ši privatumo politika gali būti atnaujinama. Naujausia privatumo politikos versija
        visada pateikiama šioje svetainėje ir įsigalioja nuo jos paskelbimo momento.
      </p>
      <p>
        Esant esminiams pakeitimams, galime apie juos papildomai informuoti svetainėje
        arba kitais tinkamais būdais.
      </p>

      <h2>Kontaktai</h2>
      <p>
        Kilus klausimams dėl šios privatumo politikos ar jūsų asmens duomenų tvarkymo,
        susisiekite su mumis el. paštu arba per socialinius tinklus. Kontaktus rasite{" "}
        <Link href="/kontaktai" className="font-semibold text-burgundy-600 underline underline-offset-2">
          kontaktų skiltyje
        </Link>
        .
      </p>
    </InfoPage>
  );
}
