import Image from "next/image";

const MARKS = [
  { src: "/payments/visa.svg", label: "Visa", w: 40 },
  { src: "/payments/mastercard.svg", label: "Mastercard", w: 28 },
  { src: "/payments/amex.svg", label: "American Express", w: 36 },
  { src: "/payments/apple-pay.svg", label: "Apple Pay", w: 44 },
  { src: "/payments/google-pay.svg", label: "Google Pay", w: 44 },
  { src: "/payments/stripe.svg", label: "Stripe", w: 38 },
] as const;

export function CheckoutPayMarks() {
  return (
    <div className="mt-3 text-center">
      <ul aria-label="Apmokėjimo būdai" className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
        {MARKS.map((mark) => (
          <li key={mark.src}>
            <span
              aria-label={mark.label}
              className="inline-flex h-6 items-center rounded-md border border-cream-400 bg-white px-1.5 sm:h-7 sm:px-2"
            >
              <Image
                src={mark.src}
                alt=""
                width={mark.w}
                height={16}
                className="h-3.5 w-auto max-w-[2.5rem] object-contain object-center sm:h-4 sm:max-w-[2.75rem]"
                unoptimized
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PaymentIcons({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const chip =
    tone === "light"
      ? "bg-cream-100 text-forest-700 border-transparent"
      : "bg-white text-ink-600 border-cream-300";
  const items = ["VISA", "Mastercard", "AMEX", "Apple Pay", "G Pay"];

  return (
    <ul aria-label="Apmokėjimo būdai" className="flex flex-wrap items-center gap-1.5">
      {items.map((label) => (
        <li
          key={label}
          className={`flex h-7 items-center rounded-md border px-2 text-[10px] font-bold tracking-wide ${chip}`}
        >
          {label === "Mastercard" ? (
            <span className="flex items-center gap-1">
              <span className="inline-block size-3 rounded-full bg-[#EB001B]" />
              <span className="-ml-2 inline-block size-3 rounded-full bg-[#F79E1B] opacity-90" />
              MC
            </span>
          ) : (
            label
          )}
        </li>
      ))}
    </ul>
  );
}
