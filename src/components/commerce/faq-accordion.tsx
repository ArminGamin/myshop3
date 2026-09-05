"use client";

import { useState } from "react";
import { Mail, Plus } from "lucide-react";
import type { FaqItem } from "@/lib/data/faq";
import { store } from "@/lib/config/store.config";

function FaqAnswer({ text }: { text: string }) {
  const lines = text.split("\n").filter((line) => line.length > 0);
  return (
    <div className="space-y-3">
      {lines.map((line) => {
        const bullet = line.match(/^[🔹•\-]\s*(.+)/);
        if (bullet) {
          return (
            <p key={line} className="flex gap-2.5 text-[15px] font-normal leading-[1.6] text-ink-600">
              <span className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-gold-500" aria-hidden />
              <span>{bullet[1]}</span>
            </p>
          );
        }
        return (
          <p key={line} className="text-[15px] font-normal leading-[1.6] text-ink-600">
            {line}
          </p>
        );
      })}
    </div>
  );
}

export function FAQAccordion({
  items,
  showContact = true,
}: {
  items: FaqItem[];
  showContact?: boolean;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12 lg:gap-8 xl:gap-10">
      {showContact ? (
        <div className="flex max-w-lg flex-col text-left lg:col-span-5 xl:col-span-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-burgundy-600">
            Pagalba
          </p>
          <h2 id="faq-heading" className="mb-3 font-display text-[1.45rem] font-extrabold leading-snug text-ink-900 sm:text-3xl xl:text-[2rem]">
            Dažniausiai užduodami klausimai
          </h2>
          <p className="mb-5 text-base font-semibold leading-relaxed text-ink-600 md:mb-6">
            Neradote atsakymo? Susisiekite ir atsakysime greitai!
          </p>
          <a
            href={`mailto:${store.contact.email}`}
            className="group flex gap-3 rounded-cozy border border-gold-400 bg-white p-3 shadow-card transition-shadow hover:shadow-lift md:p-4"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-cozy bg-gold-200 text-burgundy-700">
              <Mail className="size-5" strokeWidth={1.75} aria-hidden />
            </span>
            <span className="flex min-w-0 flex-col justify-center gap-0.5 text-left">
              <span className="text-sm font-extrabold text-ink-900">Rašykite mums</span>
              <span className="break-all text-sm font-bold text-burgundy-600">{store.contact.email}</span>
            </span>
          </a>
        </div>
      ) : null}

      <div className={`space-y-3 md:space-y-4 ${showContact ? "lg:col-span-7 xl:col-span-8" : "lg:col-span-12"}`}>
        {items.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={faq.q}
              className={`rounded-2xl border transition-[border-color,background-color,box-shadow] duration-500 ${
                isOpen
                  ? "border-burgundy-500 bg-burgundy-100/30 shadow-[0_8px_24px_rgb(42_33_24/0.08),0_2px_8px_rgb(42_33_24/0.04)]"
                  : "border-cream-300 bg-white shadow-[0_4px_16px_rgb(42_33_24/0.08),0_1px_4px_rgb(42_33_24/0.05)]"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className={`flex min-h-[56px] w-full items-center justify-between gap-4 px-4 py-4 text-left text-[15px] font-semibold leading-snug text-ink-900 md:px-6 ${
                  isOpen ? "hover:bg-burgundy-100/40" : "hover:bg-cream-100"
                }`}
                aria-expanded={isOpen}
              >
                {faq.q}
                <span
                  className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full shadow-[inset_0_1px_0_rgb(255_255_255/0.5)] ${
                    isOpen
                      ? "bg-burgundy-300/50 text-burgundy-700"
                      : "bg-burgundy-100 text-burgundy-600"
                  }`}
                  aria-hidden
                >
                  <Plus
                    className={`block size-4 shrink-0 origin-center transition-transform duration-500 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                    strokeWidth={2.25}
                  />
                </span>
              </button>
              <div className={`faq-panel ${isOpen ? "is-open" : ""}`} aria-hidden={!isOpen} inert={!isOpen}>
                <div className="faq-panel-inner">
                  <div className="mx-4 h-px shrink-0 bg-cream-300 md:mx-6" aria-hidden />
                  <div className="px-5 pb-5 pt-4 md:px-6 md:pb-6 md:pt-5">
                    <div className="border-l-[3px] border-gold-500 pl-5 pr-1 md:pl-6">
                      <FaqAnswer text={faq.a} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
