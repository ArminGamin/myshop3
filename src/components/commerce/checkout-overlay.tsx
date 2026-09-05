"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type MutableRefObject } from "react";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe, type StripeElements } from "@stripe/stripe-js";
import { CreditCard, Lock, ShieldCheck, Clock, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { resolveItems, subtotalOf, useCart } from "@/lib/cart/context";
import { startCheckout } from "@/lib/cart/checkout-client";
import { addonAmounts, readCartAddons } from "@/lib/cart/addons";
import { MYSTERY_GIFT, readMysteryGift, writeMysteryGift } from "@/lib/cart/mystery-gift";
import {
  EMPTY_CUSTOMER,
  digitsOnly,
  formatPhone,
  lettersOnly,
  validateCustomer,
  type CheckoutCustomer,
} from "@/lib/checkout/customer";
import { store } from "@/lib/config/store.config";
import { formatPrice } from "@/lib/format";
import { apiHeaders } from "@/lib/security/csrf-client";
import { MOTION, usePresence } from "@/lib/motion";
import { useIsMobile, useMobileChromeFlag } from "@/lib/mobile-chrome";
import { Button } from "@/components/ui/button";
import { Overlay } from "@/components/ui/overlay";
import { ProductImage } from "./product-art";
import { addonLineLabel } from "./cart-addons";
import { CheckoutLeave, formatMmSs, useCheckoutReserve } from "./checkout-leave";
import { MysteryGiftCard } from "./mystery-gift-card";
import { CheckoutReviews } from "./reviews-marquee";

const STRIPE_PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

const CARD_OPTIONS = {
  hidePostalCode: true,
  style: {
    base: {
      fontSize: "16px",
      color: "#12100e",
      fontFamily: "system-ui, sans-serif",
      "::placeholder": { color: "#8a8176" },
    },
    invalid: { color: "#5c1a1b" },
  },
};

export function CheckoutOverlay() {
  const cart = useCart();
  const isMobile = useIsMobile();
  const { mounted } = usePresence(cart.checkoutOpen, MOTION.overlayExit);
  const closeRef = useRef(cart.closeCheckout);
  useMobileChromeFlag("checkoutOpen", cart.checkoutOpen);

  if (!mounted) return null;

  return (
    <Overlay
      open={cart.checkoutOpen}
      onClose={() => closeRef.current()}
      label="Apmokėjimas"
      side={isMobile ? "bottom" : "center"}
      widthClass={isMobile ? "max-w-none" : "max-w-6xl"}
      zClass="z-[82]"
    >
      {STRIPE_PK ? (
        <StripeCheckout closeRef={closeRef} />
      ) : (
        <CheckoutView closeRef={closeRef} stripe={null} elements={null} cardEnabled={false} />
      )}
    </Overlay>
  );
}

function StripeCheckout({ closeRef }: { closeRef: MutableRefObject<() => void> }) {
  const promise = useMemo(() => loadStripe(STRIPE_PK), []);
  return (
    <Elements stripe={promise} options={{ locale: "lt", appearance: { theme: "stripe" } }}>
      <BoundCheckout closeRef={closeRef} />
    </Elements>
  );
}

function BoundCheckout({ closeRef }: { closeRef: MutableRefObject<() => void> }) {
  const stripe = useStripe();
  const elements = useElements();
  return <CheckoutView closeRef={closeRef} stripe={stripe} elements={elements} cardEnabled />;
}

function CheckoutView({
  closeRef,
  stripe,
  elements,
  cardEnabled,
}: {
  closeRef: MutableRefObject<() => void>;
  stripe: Stripe | null;
  elements: StripeElements | null;
  cardEnabled: boolean;
}) {
  const cart = useCart();
  const router = useRouter();
  const items = resolveItems(cart.lines).filter((i) => i.slug !== MYSTERY_GIFT.slug);
  const subtotal = subtotalOf(items);
  const addons = readCartAddons();
  const [mystery, setMystery] = useState(readMysteryGift);
  const [form, setForm] = useState<CheckoutCustomer>(EMPTY_CUSTOMER);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutCustomer, string>>>({});
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const reserve = useCheckoutReserve(cart.checkoutOpen);

  const mysteryCents = mystery ? MYSTERY_GIFT.priceCents : 0;
  const extras = addonAmounts(subtotal + mysteryCents, addons);
  const shippingCents =
    mystery || subtotal >= store.shipping.freeThresholdCents ? 0 : store.shipping.flatRateCents;
  const totalCents = subtotal + mysteryCents + extras.total + shippingCents;

  const requestClose = useCallback(() => {
    if (busy) return;
    setLeaveOpen(true);
  }, [busy]);

  useEffect(() => {
    if (!cart.checkoutOpen) setLeaveOpen(false);
  }, [cart.checkoutOpen]);

  useEffect(() => {
    closeRef.current = requestClose;
  }, [closeRef, requestClose]);

  function patch<K extends keyof CheckoutCustomer>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const { errors: nextErrors, value } = validateCustomer(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setBanner("Prašome taisyklingai užpildyti visus privalomus laukus.");
      return;
    }

    setBusy(true);
    setBanner(null);

    try {
      const card = cardEnabled ? elements?.getElement(CardElement) : null;
      if (stripe && card) {
        const res = await fetch("/api/checkout/intent", {
          method: "POST",
          headers: apiHeaders(),
          body: JSON.stringify({ lines: cart.lines, addons, mysteryGift: mystery, customer: value }),
        });
        const data: { clientSecret?: string; error?: string; errors?: typeof nextErrors } = await res.json();
        if (res.status === 400 && data.errors) {
          setErrors(data.errors);
          setBanner(data.error ?? "Patikrinkite formos laukus.");
          return;
        }
        if (res.ok && data.clientSecret) {
          const confirmation = await stripe.confirmCardPayment(data.clientSecret, {
            payment_method: {
              card,
              billing_details: {
                name: `${value.name} ${value.surname}`,
                email: value.email,
                phone: value.phone,
              },
            },
          });
          if (confirmation.error) {
            if (
              confirmation.error.type === "card_error" ||
              confirmation.error.type === "validation_error"
            ) {
              setBanner(confirmation.error.message ?? "Mokėjimas nepavyko.");
              return;
            }
          } else if (confirmation.paymentIntent?.status === "succeeded") {
            cart.clearCart();
            cart.closeCheckout();
            router.push(`/dekojame?payment_intent=${confirmation.paymentIntent.id}`);
            return;
          }
        } else if (res.status !== 503) {
          setBanner(data.error ?? "Nepavyko pradėti mokėjimo.");
          return;
        }
      }

      const ok = await startCheckout(cart.lines, value);
      if (!ok) setBanner("Nepavyko pradėti mokėjimo. Bandykite dar kartą.");
    } catch {
      setBanner("Įvyko klaida. Bandykite dar kartą.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
    <form onSubmit={onSubmit} inert={leaveOpen} className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-start justify-between gap-2 border-b border-cream-300/70 px-4 py-3 sm:items-center sm:px-5 sm:py-4">
        <div className="min-w-0">
          <p className="mb-1 flex flex-wrap items-center gap-1.5 text-sm font-extrabold text-ink-900 sm:text-base">
            <Clock className="size-4 shrink-0 text-burgundy-600" strokeWidth={2.4} />
            Krepšelis rezervuotas
            <span className="reserve-flash font-mono text-base font-extrabold tracking-wide sm:text-lg">{formatMmSs(reserve)}</span>
          </p>
          <h2 className="font-display text-xl font-bold text-ink-900 sm:text-2xl">Apmokėjimas</h2>
        </div>
        <button
          type="button"
          onClick={requestClose}
          aria-label="Uždaryti apmokėjimą"
          className="inline-flex size-11 items-center justify-center rounded-full transition hover:bg-cream-200"
        >
          <X className="block size-5 shrink-0" strokeWidth={1.8} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 sm:px-5 sm:py-5">
        {banner ? (
          <p
            role="alert"
            className="mb-4 rounded-cozy border border-burgundy-300 bg-burgundy-100 px-4 py-3 text-sm font-semibold text-burgundy-700"
          >
            {banner}
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <section>
              <h3 className="mb-2 text-[15px] font-semibold text-ink-900">Kontaktinė informacija</h3>
              <Field
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="El. paštas (pvz., vardas@gmail.com)"
                value={form.email}
                error={errors.email}
                onChange={(v) => patch("email", v)}
              />
            </section>

            <section>
              <h3 className="mb-2 text-[15px] font-semibold text-ink-900">Pristatymo adresas</h3>
              <div className="space-y-3">
                <Field
                  autoComplete="given-name"
                  placeholder="Vardas"
                  value={form.name}
                  error={errors.name}
                  onChange={(v) => patch("name", lettersOnly(v))}
                />
                <Field
                  autoComplete="family-name"
                  placeholder="Pavardė"
                  value={form.surname}
                  error={errors.surname}
                  onChange={(v) => patch("surname", lettersOnly(v))}
                />
                <Field
                  autoComplete="street-address"
                  placeholder="Adresas (gatvė, namo nr., buto nr.)"
                  value={form.address}
                  error={errors.address}
                  onChange={(v) => patch("address", v)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    autoComplete="address-level2"
                    placeholder="Miestas"
                    value={form.city}
                    error={errors.city}
                    onChange={(v) => patch("city", lettersOnly(v))}
                  />
                  <Field
                    autoComplete="address-level1"
                    placeholder="Rajonas (neprivaloma)"
                    value={form.region}
                    onChange={(v) => patch("region", v)}
                  />
                </div>
                <Field
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="Pašto kodas (5 skaitmenys)"
                  value={form.postalCode}
                  error={errors.postalCode}
                  onChange={(v) => patch("postalCode", digitsOnly(v, 5))}
                />
                <Field
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="Telefonas (pvz., +37060000000)"
                  value={form.phone}
                  error={errors.phone}
                  onChange={(v) => patch("phone", formatPhone(v))}
                />
              </div>
            </section>

            <section>
              <div className="mb-2 flex items-center gap-2">
                <CreditCard className="size-4 text-burgundy-600" strokeWidth={1.8} />
                <h3 className="text-[15px] font-semibold text-ink-900">Mokėjimo informacija</h3>
              </div>
              {cardEnabled ? (
                <div className="space-y-3">
                  <div className="rounded-[12px] border border-cream-400 bg-white p-3.5 shadow-card">
                    <CardElement options={CARD_OPTIONS} />
                  </div>
                  <div className="flex flex-col gap-1 rounded-[12px] border border-cream-400 bg-white p-3 text-xs text-ink-600 sm:flex-row sm:items-center sm:gap-2">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-ink-900">
                      <Lock className="size-3.5 text-forest-500" strokeWidth={2} />
                      256-bit SSL saugus atsiskaitymas
                    </span>
                    <span>Jūsų mokėjimo informacija yra visiškai saugi</span>
                  </div>
                </div>
              ) : (
                <p className="rounded-cozy border border-cream-300 bg-cream-100 px-4 py-3 text-sm text-ink-600">
                  Kortelės laukas bus parodytas Stripe lange kitame žingsnyje.
                </p>
              )}
            </section>
          </div>

          <aside className="h-fit rounded-cozy border border-cream-300 bg-cream-100/80 p-4 sm:p-5">
            <h3 className="mb-4 font-display text-lg font-semibold text-ink-900">Užsakymo santrauka</h3>
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={`${item.slug}-${item.variantId}`}
                  className="flex items-center gap-3 rounded-[12px] border border-cream-300 bg-white p-3 shadow-card"
                >
                  <ProductImage
                    images={item.product.images}
                    seed={item.product.artSeed}
                    alt=""
                    size="thumb"
                    className="size-12 shrink-0 object-cover sm:size-14"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-semibold text-ink-900">{item.product.name}</p>
                    <p className="text-xs font-medium text-ink-600">Kiekis: {item.qty}</p>
                    {item.variant.name !== "Standartinis rinkinys" && item.variant.name !== "Vienetas" ? (
                      <p className="truncate text-xs text-ink-400">{item.variant.name}</p>
                    ) : null}
                    <p className="text-sm font-bold text-burgundy-600">{formatPrice(item.lineTotalCents)}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-3">
              <MysteryGiftCard
                selected={mystery}
                onToggle={(next) => {
                  setMystery(next);
                  writeMysteryGift(next);
                }}
              />
            </div>

            <div className="mt-4 space-y-2 text-sm font-medium text-ink-600">
              <div className="flex justify-between">
                <span>Tarpinė suma</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {mysteryCents ? (
                <div className="flex justify-between">
                  <span>{MYSTERY_GIFT.name}</span>
                  <span>{formatPrice(mysteryCents)}</span>
                </div>
              ) : null}
              {extras.protection ? (
                <div className="flex justify-between">
                  <span>{addonLineLabel("protection")}</span>
                  <span>{formatPrice(extras.protection)}</span>
                </div>
              ) : null}
              {extras.donation ? (
                <div className="flex justify-between">
                  <span>{addonLineLabel("donation")}</span>
                  <span>{formatPrice(extras.donation)}</span>
                </div>
              ) : null}
              {extras.priority ? (
                <div className="flex justify-between">
                  <span>{addonLineLabel("priority")}</span>
                  <span>{formatPrice(extras.priority)}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span>Pristatymas</span>
                <span className={shippingCents === 0 ? "font-semibold text-forest-500" : undefined}>
                  {shippingCents === 0 ? "Nemokamas" : formatPrice(shippingCents)}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between border-t border-cream-300 pt-3">
              <span className="text-sm font-medium text-ink-600">Iš viso</span>
              <span className="text-3xl font-extrabold tracking-tight text-burgundy-600">
                {formatPrice(totalCents)}
              </span>
            </div>

            <Button type="submit" size="lg" disabled={busy || items.length === 0} className="mt-5 w-full">
              {busy ? "Apdorojama…" : "Pateikti užsakymą"}
            </Button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-ink-400">
              <ShieldCheck className="size-3.5" /> {store.payments.methods.join(" · ")}
            </p>

            <CheckoutReviews />
          </aside>
        </div>
      </div>
    </form>
    <CheckoutLeave
      open={leaveOpen}
      onStay={() => setLeaveOpen(false)}
      onLeave={() => {
        setLeaveOpen(false);
        cart.closeCheckout();
      }}
    />
    </>
  );
}

function Field({
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  inputMode,
  autoComplete,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder: string;
  type?: string;
  inputMode?: "email" | "numeric" | "tel" | "text";
  autoComplete?: string;
}) {
  return (
    <div>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        className={`min-h-12 w-full rounded-[12px] border bg-white px-4 text-base text-ink-900 outline-none transition placeholder:text-ink-400 ${
          error ? "border-burgundy-500" : "border-cream-400 focus:border-gold-500"
        }`}
      />
      {error ? <p className="mt-1 text-xs font-semibold text-burgundy-600">{error}</p> : null}
    </div>
  );
}
