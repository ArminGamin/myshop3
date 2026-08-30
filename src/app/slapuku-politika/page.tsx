import type { Metadata } from "next";
import Link from "next/link";
import { store } from "@/lib/config/store.config";
import { InfoPage } from "@/components/layout/info-page";

export const metadata: Metadata = {
  title: "Slapukų politika",
  description:
    "Kaip Kalėdų Kampelis naudoja slapukus ir panašias technologijas. Būtinieji, funkciniai, analitikos ir reklamos slapukai.",
  alternates: { canonical: "/slapuku-politika" },
};

export default function CookiePolicyPage() {
  return (
    <InfoPage title="Slapukų politika">
      <p>
        Ši slapukų politika paaiškina, kaip {store.brand.name} naudoja slapukus ir
        panašias technologijas mūsų svetainėje. Naudodamiesi mūsų svetaine, sutinkate su
        šia politika.
      </p>

      <h2>Kas yra slapukai?</h2>
      <p>
        Slapukai – tai maži tekstiniai failai, kurie išsaugomi jūsų įrenginyje
        (kompiuteryje, planšetėje ar išmaniajame telefone), kai lankotės mūsų svetainėje.
        Jie padeda svetainei prisiminti jūsų nustatymus, pagerinti naršymo patirtį ir
        surinkti anoniminę statistiką apie lankytojų elgesį.
      </p>

      <h2>Kokius slapukus naudojame</h2>
      <p>
        <strong>Būtini slapukai</strong> – būtini svetainės veikimui. Jie užtikrina
        pagrindines funkcijas: pirkinių krepšelį, saugų prisijungimą, mokėjimų
        apdorojimą. Šių slapukų negalima išjungti.
      </p>
      <p>
        <strong>Funkciniai slapukai</strong> – prisimena jūsų pasirinkimus (pvz., kalbą,
        regioną) ir padeda personalizuoti turinį bei pasiūlymus.
      </p>
      <p>
        <strong>Analitikos slapukai</strong> – padeda suprasti, kaip lankytojai naudoja
        svetainę (pvz., per „Google Analytics“). Informacija renkama anonimiškai ir
        naudojama svetainės tobulinimui.
      </p>
      <p>
        <strong>Reklamos slapukai</strong> – gali būti naudojami rodant jums aktualias
        reklamas pagal jūsų interesus. Šiuos slapukus galite valdyti per savo naršyklės
        nustatymus.
      </p>

      <h2>Kaip valdyti slapukus</h2>
      <p>
        Galite bet kada keisti savo slapukų nustatymus per naršyklės parametrus arba
        naudodami mūsų slapukų sutikimo skydelį, kuris rodomas pirmą kartą apsilankius
        svetainėje. Atmesti neesminius slapukus gali paveikti kai kurias svetainės
        funkcijas ir personalizaciją.
      </p>

      <h2>Trečiųjų šalių slapukai</h2>
      <p>
        Mūsų svetainėje gali būti naudojamos trečiųjų šalių paslaugos (pvz., mokėjimų
        apdorojimas per Stripe, socialinių tinklų integracijos), kurios gali nustatyti
        savo slapukus. Šių paslaugų privatumo politikas rekomenduojame peržiūrėti
        atitinkamose jų svetainėse.
      </p>

      <h2>Politikos atnaujinimai</h2>
      <p>
        Ši slapukų politika gali būti atnaujinama. Pakeitimai bus paskelbti šioje
        svetainėje su atnaujinta data. Tęsdami naudotis svetaine po pakeitimų, sutinkate
        su atnaujinta politika.
      </p>

      <h2>Kontaktai</h2>
      <p>
        Klausimams ar pastaboms dėl slapukų politikos susisiekite su mumis el. paštu ar
        per socialinius tinklus – kontaktus rasite{" "}
        <Link href="/kontaktai" className="font-semibold text-burgundy-600 underline underline-offset-2">
          kontaktų skiltyje
        </Link>
        . Daugiau informacijos apie asmens duomenų tvarkymą rasite mūsų{" "}
        <Link href="/privatumo-politika" className="font-semibold text-burgundy-600 underline underline-offset-2">
          privatumo politikoje
        </Link>
        .
      </p>
    </InfoPage>
  );
}
