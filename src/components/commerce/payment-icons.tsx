// Apmokėjimo būdų ženkleliai (tik būdai, kuriuos realiai palaiko Stripe).
export function PaymentIcons({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const chip =
    tone === "light"
      ? "bg-cream-100 text-forest-700 border-transparent"
      : "bg-white text-ink-600 border-cream-300";
  const items = ["VISA", "Mastercard", "AMEX", "Apple Pay", "G Pay", "Link"];

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
