import Image from "next/image";
import { HeartHandshake, PackageCheck, ShieldCheck } from "lucide-react";
import { HomeHeading } from "@/components/home/home-heading";

const REASONS = [
  {
    icon: HeartHandshake,
    title: "Kruopšti atranka",
    text: "Kiekviena prekė patenka į katalogą tik po to, kai ją išbandome ir įvertiname patys. Jokių atsitiktinių daiktų.",
  },
  {
    icon: PackageCheck,
    title: "Paruošta dovanoti",
    text: "Dauguma prekių atkeliauja gražioje pakuotėje. Belieka pridėti žinutę. Papildomo pakavimo nereikia.",
  },
  {
    icon: ShieldCheck,
    title: "Aukšta kokybė",
    text: "Renkame tik tas prekes, kurias patys norėtume gauti. Kiekviena dovana turi būti verta dovanoti.",
  },
];

export function WhyUs() {
  return (
    <section className="home-why cv-auto border-y border-cream-300" aria-labelledby="why-heading">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20 lg:px-8 lg:py-20">
        <div className="home-why-visual">
          <div aria-hidden className="home-arch-frame" />
          <div className="home-arch">
            <Image
              src="/products/pledas-jaukumas-q2-dcfafd9148.webp"
              alt="Vilnonis pledas, sulankstytas prie auksinio veidrodžio rėmo"
              fill
              quality={80}
              sizes="(min-width: 1024px) 26rem, 70vw"
              className="object-cover"
            />
          </div>
          <div className="home-why-inset">
            <Image
              src="/products/zvakide-sventinis-vakaras-q2-98b41e146c.webp"
              alt="Aromaterapijos žvakė su cinamono lazdelėmis"
              fill
              quality={75}
              sizes="10rem"
              className="object-cover"
            />
          </div>
        </div>

        <div>
          <HomeHeading
            id="why-heading"
            title={
              <>
                Dovanos, kurias renkame taip, kaip rinktumėmės <em>savo šeimai</em>
              </>
            }
          />
          <ul className="mt-8 sm:mt-10">
            {REASONS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="home-why-row">
                <span className="home-why-icon">
                  <Icon className="size-6" strokeWidth={1.5} />
                </span>
                <div>
                  <h3 className="font-display text-[1.45rem] font-bold leading-tight text-ink-900">{title}</h3>
                  <p className="mt-1.5 max-w-md text-[14.5px] font-medium leading-relaxed text-ink-600">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
