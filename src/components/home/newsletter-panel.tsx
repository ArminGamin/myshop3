import { NewsletterForm } from "@/components/commerce/newsletter-form";
import { HeroGarland } from "@/components/layout/hero-garland";
import { NEWSLETTER_PERCENT_OFF } from "@/lib/commerce/promo";

export function NewsletterPanel() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16" aria-labelledby="nl-heading">
      <div className="home-letter relative overflow-hidden rounded-[1.5rem] border border-gold-400/45 px-5 pb-9 pt-16 text-center shadow-lift sm:px-10 sm:pb-12 sm:pt-20">
        <HeroGarland />
        <div aria-hidden className="home-letter-glow" />
        <div className="relative">
          <h2
            id="nl-heading"
            className="home-h2 font-display text-[2rem] font-bold leading-[1.06] text-ink-900 sm:text-[2.6rem]"
          >
            Gaukite <em>−{NEWSLETTER_PERCENT_OFF} %</em> savo užsakymui
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] font-medium leading-relaxed text-ink-600">
            Prenumeruokite naujienlaiškį – nuolaidos kodą visoms prekėms atsiųsime el. paštu iš karto. Be minimalios sumos.
          </p>
          <div className="mt-7">
            <NewsletterForm source="homepage" />
          </div>
        </div>
      </div>
    </section>
  );
}
