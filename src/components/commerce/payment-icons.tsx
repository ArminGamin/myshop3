import Image from "next/image";

// Oficialūs mokėjimo būdų logotipai (public/payments).
const CARDS = [
  { src: "/payments/google-pay.svg", label: "Google Pay", w: 41, h: 16 },
  { src: "/payments/apple-pay.svg", label: "Apple Pay", w: 39, h: 16 },
  { src: "/payments/visa.svg", label: "Visa", w: 37, h: 12 },
  { src: "/payments/mastercard.svg", label: "Mastercard", w: 28, h: 17 },
] as const;

type Mark = (typeof CARDS)[number];

function MarkList({ marks, label, tile }: { marks: readonly Mark[]; label: string; tile: string }) {
  return (
    <ul aria-label={label} className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
      {marks.map((mark) => (
        <li key={mark.src}>
          <span aria-label={mark.label} className={`inline-flex h-7 items-center justify-center rounded-md px-2 ${tile}`}>
            <Image src={mark.src} alt="" width={mark.w} height={mark.h} style={{ height: mark.h }} className="w-auto" unoptimized />
          </span>
        </li>
      ))}
    </ul>
  );
}

export function CheckoutPayMarks() {
  const tile = "border border-cream-400 bg-white";
  return (
    <div className="mt-3 flex flex-col items-center gap-1.5 text-center">
      <MarkList marks={CARDS} label="Apmokėjimo būdai" tile={tile} />
    </div>
  );
}

export function PaymentIcons({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const tile = tone === "light" ? "bg-white" : "border border-cream-300 bg-white";
  return (
    <div className="flex flex-col items-center gap-1.5 sm:items-end">
      <MarkList marks={CARDS} label="Apmokėjimo būdai" tile={tile} />
    </div>
  );
}
