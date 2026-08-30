import type { Metadata } from "next";
import { Mail, MapPin, Clock } from "lucide-react";
import { store } from "@/lib/config/store.config";
import { InfoPage } from "@/components/layout/info-page";

export const metadata: Metadata = {
  title: "Kontaktai",
  description:
    "Susisiekite su mumis el. paštu — atsakome per 24 valandas. Visi klausimai apie dovanas, pristatymą ir grąžinimą.",
  alternates: { canonical: "/kontaktai" },
};

export default function ContactPage() {
  return (
    <InfoPage
      title="Susisiekite su mumis"
      intro="Klausimas apie dovaną, užsakymą ar grąžinimą? Padėsime."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <a
          href={`mailto:${store.contact.email}`}
          className="group rounded-cozy border border-cream-300 bg-white/70 p-5 text-center transition hover:border-gold-400 hover:shadow-card"
        >
          <Mail className="mx-auto size-6 text-burgundy-600" strokeWidth={1.7} />
          <p className="mt-3 font-display text-lg font-semibold text-ink-900">El. paštas</p>
          <p className="mt-1 break-all text-[13px] font-medium text-burgundy-600">
            {store.contact.email}
          </p>
        </a>
        <div className="rounded-cozy border border-cream-300 bg-white/70 p-5 text-center">
          <Clock className="mx-auto size-6 text-burgundy-600" strokeWidth={1.7} />
          <p className="mt-3 font-display text-lg font-semibold text-ink-900">Atsakymo laikas</p>
          <p className="mt-1 text-[13px] text-ink-600">{store.contact.responseTime}</p>
        </div>
        <div className="rounded-cozy border border-cream-300 bg-white/70 p-5 text-center">
          <MapPin className="mx-auto size-6 text-burgundy-600" strokeWidth={1.7} />
          <p className="mt-3 font-display text-lg font-semibold text-ink-900">Būstinė</p>
          <p className="mt-1 text-[13px] text-ink-600">Dirbame tik internetu</p>
        </div>
      </div>

      <h2>Dažniausios situacijos</h2>
      <ul>
        <li>
          <strong>Užsakymo keitimas / atšaukimas</strong> — parašykite kuo greičiau su
          užsakymo numeriu.
        </li>
        <li>
          <strong>Siuntos sekimas</strong> — patikrinsime būseną ir atsakysime tą pačią
          dieną.
        </li>
        <li>
          <strong>Verslo dovanoms</strong> — išrašome sąskaitas su PVN, konsultuojame dėl
          kiekių.
        </li>
      </ul>
    </InfoPage>
  );
}
