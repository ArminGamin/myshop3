import type { Metadata } from "next";
import { faqCategories, homeFaqs } from "@/lib/data/faq";
import { faqSchema } from "@/lib/seo/schema";
import { JsonLd } from "@/components/seo/json-ld";
import { FAQAccordion } from "@/components/commerce/faq-accordion";

export const metadata: Metadata = {
  title: "Dažniausiai užduodami klausimai (DUK)",
  description:
    "Atsakymai apie pristatymą, mokėjimą, grąžinimą ir prekes. Įprastai pristatome per 4–6 dienas, nemokamai nuo 80 €.",
  alternates: { canonical: "/duk" },
};

const allItems = faqCategories.flatMap((c) => c.items);

export default function FaqPage() {
  return (
    <div className="texture-knit">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <FAQAccordion items={allItems.length ? allItems : homeFaqs} />
      </div>
      <JsonLd data={faqSchema(allItems)} />
    </div>
  );
}
