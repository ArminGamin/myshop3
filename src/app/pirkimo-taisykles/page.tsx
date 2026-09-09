import type { Metadata } from "next";
import Link from "next/link";
import { store } from "@/lib/config/store.config";
import { productPhotoDisclaimer } from "@/lib/copy/product-disclaimer";
import { InfoPage } from "@/components/layout/info-page";

export const metadata: Metadata = {
  title: "Pirkimo taisyklės",
  description:
    "Pirkimo taisyklės: užsakymo sudarymas, kainos, mokėjimas ir pristatymas.",
  alternates: { canonical: "/pirkimo-taisykles" },
};

export default function TermsPage() {
  const free = store.shipping.freeThresholdCents / 100;
  const rate = (store.shipping.flatRateCents / 100).toFixed(2).replace(".", ",");

  return (
    <InfoPage title="Pirkimo taisyklės">
      <h2>1. Paslaugos teikėjas</h2>
      <p>
        {store.contact.legalName}. El. paštas: {store.contact.email}. Dirbame tik
        internetu, pristatome visoje Lietuvoje.
      </p>

      <h2>2. Užsakymo sudarymas</h2>
      <p>
        Krepšelį suformuojate, atsiskaityme patvirtinate užsakymą, o sutartis galioja nuo
        mokėjimo gavimo. Patvirtinimą atsiunčiame el. paštu. Pateikdamas užsakymą
        klientas patvirtina, kad susipažino su{" "}
        <Link href="/pristatymas" className="font-semibold text-burgundy-600 underline underline-offset-2">
          pristatymo informacija
        </Link>{" "}
        ir šiomis taisyklėmis.
      </p>

      <h2>3. Kainos</h2>
      <p>
        Visos kainos eurais, su PVM. Pristatymo kaina matoma prieš atsiskaitymą.
        Užsakymams virš {free} € taikomas nemokamas pristatymas. Užsakymams iki {free} €
        pristatymo kaina — {rate} €.
      </p>

      <h2>4. Mokėjimas</h2>
      <p>
        Galite atsiskaityti Visa ir Mastercard kortelėmis, Apple Pay ir Google Pay.
        Mokėjimai atliekami per saugius mokėjimo paslaugų teikėjus. Pilnų banko kortelės
        duomenų mes nesaugome.
      </p>

      <h2>5. Pristatymas</h2>
      <p>
        Įprastai užsakymus pristatome per 4–6 dienas. Dalis prekių gali būti siunčiama iš
        užsienio sandėlių. Didesnio užimtumo laikotarpiais pristatymas gali užtrukti iki
        16 dienų.
      </p>

      <h2>6. {productPhotoDisclaimer.termsTitle}</h2>
      <p>{productPhotoDisclaimer.terms}</p>

      <h2>7. Pagalba dėl užsakymo</h2>
      <p>
        Jei turite klausimų dėl užsakymo ar pristatymo, parašykite mums el. paštu ir
        nurodykite užsakymo numerį. Atsakome per 24 valandas.
      </p>

      <h2>8. Ginčai</h2>
      <p>
        Visi ginčai sprendžiami derybomis; nepavykus — Lietuvos Respublikos įstatymų
        nustatyta tvarka. Vartotojai gali kreiptis į Valstybinę vartotojų teisių
        apsaugos tarnybą.
      </p>
    </InfoPage>
  );
}
