"use client";

import { useEffect, useId, useRef, useState, type ComponentType } from "react";
import { Check, Heart, Info, Shield, Sparkles } from "lucide-react";
import { store } from "@/lib/config/store.config";
import { formatPrice } from "@/lib/format";
import {
  donationBaseCents,
  donationCents,
  donationTargetCents,
  type CartAddonId,
  type CartAddonSelection,
} from "@/lib/cart/addons";

export function CartAddonRows({
  subtotalCents,
  selected,
  onChange,
}: {
  subtotalCents: number;
  selected: CartAddonSelection;
  onChange: (next: CartAddonSelection) => void;
}) {
  const beforeDonation = donationBaseCents(subtotalCents, selected);
  const donation = donationCents(beforeDonation);
  const target = donationTargetCents(beforeDonation);

  return (
    <div className="rounded-cozy border border-gold-300/50 bg-gradient-to-br from-cream-50 to-cream-100/80 p-3">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-gold-600">
        Papildomai
      </p>
      <div className="space-y-1.5">
        <AddonRow
          checked={selected.protection}
          onChange={(protection) => onChange({ ...selected, protection })}
          icon={Shield}
          title="Apsauga nuo pažeidimo"
          price={`+${formatPrice(store.addons.protection.priceCents)}`}
          tip="Nedidelis mokestis, kad pamestą ar pažeistą siuntą galėtume pakeisti be papildomo laukimo."
        />
        {donation > 0 ? (
          <AddonRow
            checked={selected.donation}
            onChange={(on) => onChange({ ...selected, donation: on })}
            icon={Heart}
            title={`Suapvalinkite iki ${formatPrice(target)}`}
            price={`+${formatPrice(donation)}`}
            tip={`Skirtumas ${formatPrice(donation)} keliaus ${store.addons.donation.cause}. Parama savanoriška.`}
          />
        ) : null}
        <AddonRow
          checked={selected.priority}
          onChange={(priority) => onChange({ ...selected, priority })}
          icon={Sparkles}
          title="Užsakymo prioritetas"
          price={`+${formatPrice(store.addons.priority.priceCents)}`}
          tip="Sandėlis paruoš šį užsakymą pirmiau už eilėje laukiančius."
        />
      </div>
    </div>
  );
}

function AddonRow({
  checked,
  onChange,
  icon: Icon,
  title,
  price,
  tip,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  price: string;
  tip: string;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-center gap-2.5 rounded-[12px] border px-2.5 py-2 transition ${
        checked
          ? "border-gold-400 bg-cream-50 shadow-card"
          : "border-transparent bg-white/50 hover:border-cream-300 hover:bg-white"
      }`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden
        className={`flex size-5 shrink-0 items-center justify-center rounded-[6px] border transition ${
          checked
            ? "border-burgundy-600 bg-burgundy-600 text-cream-50"
            : "border-cream-400 bg-white text-transparent"
        }`}
      >
        <Check className="size-3" strokeWidth={3} />
      </span>
      <span
        aria-hidden
        className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
          checked ? "bg-gold-200 text-burgundy-600" : "bg-cream-200 text-ink-400"
        }`}
      >
        <Icon className="size-3.5" strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1 text-[13px] font-semibold leading-snug text-ink-900">
        {title}
      </span>
      <span className="shrink-0 text-[12px] font-bold text-burgundy-600">{price}</span>
      <AddonTip text={tip} />
    </label>
  );
}

function AddonTip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <span ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-label="Daugiau informacijos"
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex size-8 items-center justify-center rounded-full text-ink-400 transition hover:bg-cream-200 hover:text-burgundy-600"
      >
        <Info className="size-3.5" strokeWidth={2} />
      </button>
      {open ? (
        <span
          role="tooltip"
          className="absolute bottom-full right-0 z-20 mb-1 w-52 rounded-[10px] border border-cream-300 bg-cream-50 px-3 py-2 text-left text-[12px] font-medium leading-snug text-ink-600 shadow-card"
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}

export function addonLineLabel(id: CartAddonId): string {
  if (id === "protection") return "Apsauga nuo pažeidimo";
  if (id === "donation") return store.addons.donation.lineLabel;
  return "Užsakymo prioritetas";
}
