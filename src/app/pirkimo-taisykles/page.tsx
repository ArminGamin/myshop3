import type { Metadata } from "next";
import Link from "next/link";
import { store } from "@/lib/config/store.config";
import { InfoPage } from "@/components/layout/info-page";

export const metadata: Metadata = {
  title: "Pirkimo taisyklės",
  description:
    "Pirkimo taisyklės: užsakymo sudarymas, kainos, mokėjimas, pristatymas ir grąžinimas.",
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
        </Link>
        ,{" "}
        <Link href="/grazinimas" className="font-semibold text-burgundy-600 underline underline-offset-2">
          grąžinimų politika
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

      <h2>6. Grąžinimas</h2>
      <p>
        Kokybiškos, nenaudotos prekės grąžinamos per 14 dienų nuo gavimo. Grąžinant dėl
        pirkėjo apsisprendimo, siuntimo išlaidas apmoka pirkėjas. Pinigai grąžinami po
        prekės būklės patikrinimo. Išsami tvarka —{" "}
        <Link href="/grazinimas" className="font-semibold text-burgundy-600 underline underline-offset-2">
          grąžinimų puslapyje
        </Link>
        .
      </p>

      <h2>7. Ginčai</h2>
      <p>
        Visi ginčai sprendžiami derybomis; nepavykus — Lietuvos Respublikos įstatymų
        nustatyta tvarka. Vartotojai gali kreiptis į Valstybinę vartotojų teisių
        apsaugos tarnybą.
      </p>
    </InfoPage>
  );
}
