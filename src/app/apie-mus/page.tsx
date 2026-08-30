import type { Metadata } from "next";
import { store } from "@/lib/config/store.config";
import { faqCategories } from "@/lib/data/faq";
import { InfoPage } from "@/components/layout/info-page";
import { FAQAccordion } from "@/components/commerce/faq-accordion";

export const metadata: Metadata = {
  title: "Apie mus",
  description:
    "Kalėdų Kampelis — kalėdinių dovanų parduotuvė. Nemokamas pristatymas nuo 80 €. Pristatome per 4–6 dienas.",
  alternates: { canonical: "/apie-mus" },
};

const aboutFaqs = faqCategories.flatMap((c) => c.items).slice(0, 5);

export default function AboutPage() {
  return (
    <InfoPage title="Apie mus">
      <p>
        „{store.brand.name}“ gimė iš paprastos idėjos — šventės turi jaustis jaukiai.
        Norime, kad dovanos vėl reikštų dėmesį, o ne paskutinės minutės kompromisą.
      </p>
      <p>
        Atrenkame dovanas, kurios yra kokybiškos, paruoštos dovanoti ir tikrai vertos
        savo kainos. Testuojame, lyginame ir siūlome tik tai, kuo patys pasitikėtume.
      </p>
      <ul>
        <li>✔ Nemokamas pristatymas nuo 80 €</li>
        <li>✔ Užtikrinta kokybė</li>
        <li>✔ Greitas ir saugus atsiskaitymas</li>
      </ul>
      <p>
        Jei kyla klausimų — parašykite mums. Mielai padėsime išsirinkti tinkamiausią
        dovaną.
      </p>

      <h2>DUK — Dažniausiai užduodami klausimai</h2>
      <div className="not-prose mt-4">
        <FAQAccordion items={aboutFaqs} showContact={false} />
      </div>
    </InfoPage>
  );
}
