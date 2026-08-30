import type { ReactNode } from "react";
import { Container } from "@/components/ui/primitives";

export function InfoPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="texture-knit">
      <Container className="max-w-3xl py-6 lg:py-8">
        <h1 className="font-display text-[1.75rem] font-extrabold text-ink-900 sm:text-4xl">{title}</h1>
        {intro ? <p className="mt-3 text-[16px] font-semibold leading-snug text-ink-900">{intro}</p> : null}
        <div className="prose-cozy mt-5 space-y-4 text-[16px] font-semibold leading-snug text-ink-900 [&_h2]:mt-7 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-ink-900 [&_li]:ml-5 [&_li]:list-disc [&_li]:marker:text-gold-500 [&_strong]:text-ink-900">
          {children}
        </div>
      </Container>
    </div>
  );
}
