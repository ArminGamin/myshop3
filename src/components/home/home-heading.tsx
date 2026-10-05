import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Pagrindinio puslapio sekcijų antraštė: kairėje lygiuota, su kursyvo
// išryškinimu (<em>) ir neprivaloma nuoroda dešinėje.
export function HomeHeading({
  id,
  title,
  sub,
  action,
}: {
  id?: string;
  title: ReactNode;
  sub?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
      <div className="max-w-2xl">
        <h2
          id={id}
          className="home-h2 font-display text-[2rem] font-bold leading-[1.06] tracking-[-0.01em] text-ink-900 sm:text-[2.6rem] lg:text-[3rem]"
        >
          {title}
        </h2>
        {sub ? (
          <p className="mt-3 max-w-xl text-[15px] font-medium leading-relaxed text-ink-600 sm:mt-4 sm:text-base">
            {sub}
          </p>
        ) : null}
      </div>
      {action ? (
        <Link href={action.href} className="home-more group hidden shrink-0 sm:inline-flex">
          {action.label}
          <span className="home-more-icon">
            <ArrowRight className="size-4" strokeWidth={2} />
          </span>
        </Link>
      ) : null}
    </div>
  );
}

// Tas pats veiksmas mobiliajame, po turiniu.
export function HomeMoreMobile({ href, label }: { href: string; label: string }) {
  return (
    <div className="mt-7 flex justify-center sm:hidden">
      <Link href={href} className="home-more group">
        {label}
        <span className="home-more-icon">
          <ArrowRight className="size-4" strokeWidth={2} />
        </span>
      </Link>
    </div>
  );
}
