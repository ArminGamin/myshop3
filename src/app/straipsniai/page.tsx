import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/layout/info-page";
import { getArticles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Dovanų idėjos ir patarimai",
  description: "Kalėdinių dovanų idėjos, pasirinkimo patarimai ir praktiški gidai. Atraskite, ką padovanoti artimiesiems su Kalėdų Kampeliu.",
  alternates: { canonical: "/straipsniai" },
};

export default function ArticlesPage() {
  const posts = getArticles();
  return (
    <InfoPage title="Dovanų idėjos ir patarimai" intro="Dovana prasideda nuo dėmesio žmogui. Čia rasite idėjų, kurios padės išsirinkti.">
      {posts.length ? <div className="grid gap-5 sm:grid-cols-2">
        {posts.map((post) => <article key={post.slug} className="rounded-2xl border border-gold-300/40 bg-cream-50 p-5">
          <time className="text-sm text-ink-700" dateTime={post.published}>{new Date(post.published).toLocaleDateString("lt-LT", { timeZone: "Europe/Vilnius" })}</time>
          <h2><Link className="hover:underline" href={`/straipsniai/${post.slug}`}>{post.h1}</Link></h2>
          <p className="mt-3 text-sm leading-relaxed">{post.metaDescription}</p>
          <Link className="mt-4 inline-block underline underline-offset-4" href={`/straipsniai/${post.slug}`}>Skaityti patarimus →</Link>
        </article>)}
      </div> : <p>Pirmieji dovanų gidai jau ruošiami. Kol kas kviečiame <Link className="underline" href="/rask-dovana">rasti dovaną pagal žmogų</Link>.</p>}
    </InfoPage>
  );
}
