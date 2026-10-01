"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import Link from "next/link";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe, type StripeElements, type StripeError } from "@stripe/stripe-js";
import { Clock, CreditCard, Info, Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { resolveItems, subtotalOf, useCart } from "@/lib/cart/context";
import { addonAmounts } from "@/lib/cart/addons";
import { MYSTERY_GIFT } from "@/lib/cart/mystery-gift";
import {
  digitsOnly,
  formatPhone,
  lettersOnly,
  validateCustomer,
  type CheckoutCustomer,
} from "@/lib/checkout/customer";
import {
  patchCustomerDraft,
  updateCheckoutAddons,
  updateMysterySelection,
  useCheckoutAddons,
  useCustomerDraft,
  useMysterySelection,
} from "@/lib/checkout/draft-store";
import type { CartAddonSelection } from "@/lib/cart/addons";
import { CHECKOUT_BEGIN_KEY, CHECKOUT_ENTRY_KEY, CHECKOUT_PAYINFO_KEY } from "@/lib/checkout/analytics-keys";
import { formatMmSs, useCheckoutReserve } from "@/lib/checkout/reserve";
import { christmasDeliveryPromise } from "@/lib/config/deadline";
import { store } from "@/lib/config/store.config";
import { formatPrice } from "@/lib/format";
import { track } from "@/lib/analytics";
import { apiHeaders } from "@/lib/security/csrf-client";
import { useCartReminders } from "@/lib/email/use-cart-reminders";
import { Button } from "@/components/ui/button";
import { ProductImage } from "./product-art";
import { addonLineLabel } from "./cart-addons";
import { MysteryGiftCard } from "./mystery-gift-card";
import { CheckoutReviews } from "./reviews-marquee";
import { CheckoutPayMarks } from "./payment-icons";
import { CheckoutLeave } from "./checkout-leave";
import {
  CheckoutGarland,
  CheckoutSteps,
  EdgePines,
  FreeDeliverySleigh,
  OrnamentDivider,
  SummaryRibbon,
  useCheckoutStep,
} from "./checkout-decor";

const STRIPE_PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
const FORM_ID = "checkout-form";

const STRIPE_APPEARANCE = {
  theme: "stripe" as const,
  variables: {
    colorPrimary: "#5c1a1b",
    colorBackground: "#ffffff",
    colorText: "#12100e",
    colorDanger: "#5c1a1b",
    borderRadius: "12px",
    fontFamily: "system-ui, sans-serif",
    colorTextPlaceholder: "#8a8176",
  },
  rules: {
    ".Input": {
      border: "1.5px solid #a98534",
      backgroundColor: "#ffffff",
      boxShadow: "none",
    },
    ".Input:focus": {
      border: "2px solid #5c1a1b",
      boxShadow: "0 0 0 3px #f0e3bd",
    },
    ".Label": {
      color: "#2a2420",
    },
    ".Tab": {
      border: "1.5px solid #a98534",
      boxShadow: "none",
    },
    ".Tab--selected": {
      border: "2px solid #5c1a1b",
      backgroundColor: "#ffffff",
    },
    ".TabIcon": {
      color: "#5c1a1b",
    },
  },
};

const FIELD_ORDER: (keyof CheckoutCustomer)[] = [
  "email",
  "name",
  "surname",
  "address",
  "city",
  "postalCode",
  "phone",
];

type Model = {
  items: ReturnType<typeof resolveItems>;
  form: CheckoutCustomer;
  errors: Partial<Record<keyof CheckoutCustomer, string>>;
  banner: string | null;
  mystery: boolean;
  addons: CartAddonSelection;
  subtotal: number;
  mysteryCents: number;
  extras: ReturnType<typeof addonAmounts>;
  shippingCents: number;
  totalCents: number;
  stripeEnabled: boolean;
  step: 1 | 2;
  seconds: number | null;
  expired: boolean;
  refreshReserve: () => void;
  deliveryPromise: string | null;
  keyboard: boolean;
  patch: (key: keyof CheckoutCustomer, value: string) => void;
  blurField: (key: keyof CheckoutCustomer) => void;
  captureEmail: () => Promise<boolean>;
  toggleMystery: (next: boolean) => void;
  updateAddons: (next: CartAddonSelection) => void;
  setBanner: Dispatch<SetStateAction<string | null | undefined>>;
  setErrors: Dispatch<SetStateAction<Partial<Record<keyof CheckoutCustomer, string>>>>;
  markPaid: () => void;
};

const CheckoutModelContext = createContext<Model | null>(null);

function useModel() {
  const value = useContext(CheckoutModelContext);
  if (!value) throw new Error("Checkout modelis neprieinamas");
  return value;
}

function klaidaMessage(code: string | null) {
  if (code === "sesija") return "Mokėjimo sesija baigėsi. Bandykite dar kartą.";
  if (code === "tinklas") return "Nepavyko prisijungti. Patikrinkite internetą ir bandykite dar kartą.";
  if (code === "mokejimas") return "Mokėjimas nepavyko. Patikrinkite duomenis ir bandykite dar kartą.";
  return null;
}

function stripeBanner(error: StripeError): string {
  if (error.type === "api_connection_error") {
    return "Nepavyko prisijungti. Patikrinkite internetą ir bandykite dar kartą.";
  }
  if (error.code === "payment_intent_unexpected_state" || error.code === "payment_intent_authentication_failure") {
    return "Mokėjimo sesija baigėsi. Bandykite dar kartą.";
  }
  if (error.code === "card_declined" || error.type === "card_error") {
    return error.message ?? "Kortelė atmesta. Patikrinkite duomenis arba pasirinkite kitą mokėjimo būdą.";
  }
  return error.message ?? "Mokėjimas nepavyko. Bandykite dar kartą.";
}

function FadingPrice({
  cents,
  className = "",
  live = false,
}: {
  cents: number;
  className?: string;
  live?: boolean;
}) {
  return (
    <span
      key={cents}
      aria-live={live ? "polite" : undefined}
      className={`checkout-price-pop inline-block ${className}`}
    >
      {formatPrice(cents)}
    </span>
  );
}

export function CheckoutExperience() {
  const cart = useCart();
  const router = useRouter();
  const search = useSearchParams();
  const reserve = useCheckoutReserve();
  const paidRef = useRef(false);
  const beginTracked = useRef(false);
  const form = useCustomerDraft();
  const mystery = useMysterySelection();
  const addons = useCheckoutAddons();
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutCustomer, string>>>({});
  const [banner, setBanner] = useState<string | null | undefined>(undefined);
  const [keyboard, setKeyboard] = useState(false);
  const deliveryPromise = christmasDeliveryPromise();
  const queryBanner = klaidaMessage(search.get("klaida"));
  const visibleBanner = banner === undefined ? queryBanner : banner;

  const items = resolveItems(cart.lines).filter((item) => item.slug !== MYSTERY_GIFT.slug);
  const subtotal = subtotalOf(items);
  const mysteryCents = mystery ? MYSTERY_GIFT.priceCents : 0;
  const extras = addonAmounts(subtotal + mysteryCents, addons);
  const shippingCents =
    mystery || subtotal >= store.shipping.freeThresholdCents ? 0 : store.shipping.flatRateCents;
  const totalCents = subtotal + mysteryCents + extras.total + shippingCents;
  const stripeEnabled = Boolean(STRIPE_PK);
  const formValid = Object.keys(validateCustomer(form).errors).length === 0;
  const captureEmail = useCartReminders(form.email, cart.lines, addons, mystery, paidRef);
  const step: 1 | 2 = formValid ? 2 : 1;

  useEffect(() => {
    if (!cart.hydrated || paidRef.current) return;
    if (items.length === 0) router.replace("/krepselis?tuscias=1");
  }, [cart.hydrated, items.length, router]);

  useEffect(() => {
    if (!cart.hydrated || items.length === 0 || beginTracked.current) return;
    beginTracked.current = true;
    let entry = sessionStorage.getItem(CHECKOUT_ENTRY_KEY);
    if (!entry) {
      entry = "direct";
      sessionStorage.setItem(CHECKOUT_ENTRY_KEY, entry);
    }
    if (sessionStorage.getItem(CHECKOUT_BEGIN_KEY) === entry) return;
    sessionStorage.setItem(CHECKOUT_BEGIN_KEY, entry);
    track("begin_checkout", { value: totalCents / 100 });
  }, [cart.hydrated, items.length, totalCents]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const onResize = () => setKeyboard(window.innerHeight - viewport.height > 120);
    viewport.addEventListener("resize", onResize);
    return () => viewport.removeEventListener("resize", onResize);
  }, []);

  function patch(key: keyof CheckoutCustomer, value: string) {
    patchCustomerDraft(key, value);
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function blurField(key: keyof CheckoutCustomer) {
    const { errors: next } = validateCustomer(form);
    setErrors((prev) => {
      const copy = { ...prev };
      if (next[key]) copy[key] = next[key];
      else delete copy[key];
      return copy;
    });
  }

  function toggleMystery(next: boolean) {
    updateMysterySelection(next);
    track(next ? "upsell_add" : "upsell_remove", {
      item_id: MYSTERY_GIFT.slug,
      item_name: MYSTERY_GIFT.name,
      value: MYSTERY_GIFT.priceCents / 100,
    });
  }

  function updateAddons(next: CartAddonSelection) {
    updateCheckoutAddons(next);
  }

  function markPaid() {
    paidRef.current = true;
  }

  const stripePromise = useMemo(() => (stripeEnabled ? loadStripe(STRIPE_PK) : null), [stripeEnabled]);
  const elementsOptions = useMemo(
    () => ({
      mode: "payment" as const,
      amount: Math.max(totalCents, 50),
      currency: "eur",
      locale: "lt" as const,
      appearance: STRIPE_APPEARANCE,
    }),
    [totalCents]
  );

  const model: Model = {
    items,
    form,
    errors,
    banner: visibleBanner,
    mystery,
    addons,
    subtotal,
    mysteryCents,
    extras,
    shippingCents,
    totalCents,
    stripeEnabled,
    step,
    seconds: reserve.seconds,
    expired: reserve.expired,
    refreshReserve: reserve.refresh,
    deliveryPromise,
    keyboard,
    patch,
    blurField,
    captureEmail,
    toggleMystery,
    updateAddons,
    setBanner,
    setErrors,
    markPaid,
  };

  if (!cart.hydrated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="h-48 rounded-cozy skeleton" />
      </div>
    );
  }

  if (items.length === 0) return null;

  const body = <CheckoutBody />;

  return (
    <CheckoutModelContext.Provider value={model}>
      {stripePromise ? (
        <Elements stripe={stripePromise} options={elementsOptions}>
          {body}
        </Elements>
      ) : (
        body
      )}
    </CheckoutModelContext.Provider>
  );
}

function CheckoutBody() {
  const { stripeEnabled } = useModel();
  if (!stripeEnabled) return <CheckoutInner stripe={null} elements={null} />;
  return <CheckoutStripeBridge />;
}

function CheckoutStripeBridge() {
  const stripe = useStripe();
  const elements = useElements();
  return <CheckoutInner stripe={stripe} elements={elements} />;
}

function CheckoutInner({
  stripe,
  elements,
}: {
  stripe: Stripe | null;
  elements: StripeElements | null;
}) {
  const model = useModel();
  const cart = useCart();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const latestTotal = useRef(model.totalCents);
  const { current, goTo } = useCheckoutStep();
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [paymentLoaded, setPaymentLoaded] = useState(false);
  const [paymentLoadError, setPaymentLoadError] = useState(false);
  const elementsReady = Boolean(stripe && elements);
  const paymentReady = elementsReady && paymentLoaded && !paymentLoadError;

  useEffect(() => {
    latestTotal.current = model.totalCents;
  }, [model.totalCents]);

  const requestLeave = useCallback(() => {
    if (busy) return;
    setLeaveOpen(true);
  }, [busy]);

  const handleStay = useCallback(() => {
    setLeaveOpen(false);
  }, []);

  const handleLeave = useCallback(() => {
    setLeaveOpen(false);
    router.push("/");
  }, [router]);
  const payInfoTracked = useRef(false);

  useEffect(() => {
    if (!paymentReady || payInfoTracked.current) return;
    payInfoTracked.current = true;
    const entry = sessionStorage.getItem(CHECKOUT_ENTRY_KEY) || "direct";
    if (sessionStorage.getItem(CHECKOUT_PAYINFO_KEY) === entry) return;
    sessionStorage.setItem(CHECKOUT_PAYINFO_KEY, entry);
    track("add_payment_info", { value: model.totalCents / 100 });
  }, [paymentReady, model.totalCents]);

  useEffect(() => {
    if (model.items.length === 0) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [model.items.length]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting.current) return;
    const { errors: nextErrors, value } = validateCustomer(model.form);
    if (Object.keys(nextErrors).length > 0) {
      model.setErrors(nextErrors);
      model.setBanner("Prašome taisyklingai užpildyti visus privalomus laukus.");
      const first = FIELD_ORDER.find((key) => nextErrors[key]);
      if (first) document.getElementById(`checkout-${first}`)?.focus();
      return;
    }

    if (!model.stripeEnabled) {
      model.setBanner("Mokėjimas dar nesukonfigūruotas. Pridėkite Stripe raktus.");
      return;
    }
    if (!paymentReady || !stripe || !elements) {
      model.setBanner("Mokėjimo sistema dar kraunasi. Palaukite sekundę ir bandykite dar kartą.");
      return;
    }

    const expectedTotalCents = model.totalCents;
    const payload = {
      lines: cart.lines.map((line) => ({ ...line })),
      addons: { ...model.addons },
      mysteryGift: model.mystery,
      customer: value,
      expectedTotalCents,
    };
    submitting.current = true;
    setBusy(true);
    model.setBanner(null);
    let done = false;

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        model.setBanner(stripeBanner(submitError));
        return;
      }

      const res = await fetch("/api/checkout/intent", {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify(payload),
      });
      const data: { clientSecret?: string; totalCents?: number; error?: string; errors?: typeof nextErrors } = await res.json();
      if (res.status === 400 && data.errors) {
        model.setErrors(data.errors);
        model.setBanner(data.error ?? "Patikrinkite formos laukus.");
        const first = FIELD_ORDER.find((key) => data.errors?.[key]);
        if (first) document.getElementById(`checkout-${first}`)?.focus();
        return;
      }
      if (!res.ok || !data.clientSecret) {
        model.setBanner(data.error ?? "Nepavyko pradėti mokėjimo.");
        return;
      }

      if (data.totalCents !== expectedTotalCents || latestTotal.current !== expectedTotalCents) {
        model.setBanner("Krepšelio suma pasikeitė. Patikrinkite ją ir bandykite dar kartą.");
        return;
      }

      const confirmation = await stripe.confirmPayment({
        elements,
        clientSecret: data.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: "if_required",
      });

      if (confirmation.error) {
        model.setBanner(stripeBanner(confirmation.error));
        return;
      }

      const status = confirmation.paymentIntent?.status;
      if (status === "succeeded" || status === "processing") {
        done = true;
        model.markPaid();
        if (status === "succeeded") cart.clearCart();
        router.push(`/checkout/success?payment_intent=${confirmation.paymentIntent?.id ?? ""}`);
      }
    } catch {
      model.setBanner("Nepavyko prisijungti. Patikrinkite internetą ir bandykite dar kartą.");
    } finally {
      if (!done) {
        submitting.current = false;
        setBusy(false);
      }
    }
  }

  return (
    <div className="checkout-page relative">
      <EdgePines />
      <header className="checkout-sticky border-b border-cream-300 bg-cream-50">
        <div className="relative mx-auto flex h-[var(--checkout-header-h)] max-w-6xl items-center justify-between px-4 sm:px-6">
          <button
            type="button"
            onClick={requestLeave}
            className="inline-flex min-h-11 shrink-0 items-center whitespace-nowrap text-[15px] font-semibold text-ink-600 underline-offset-4 hover:text-burgundy-700 hover:underline"
          >
            <span className="max-[479px]:hidden">← Grįžti į parduotuvę</span>
            <span className="min-[480px]:hidden">← Atgal</span>
          </button>
          <Link href="/" className="inline-flex min-w-0 items-center gap-1 font-display text-lg font-bold leading-none text-burgundy-600 sm:absolute sm:left-1/2 sm:-translate-x-1/2 sm:text-[1.75rem]">
            <svg viewBox="0 0 16 16" className="size-3.5 shrink-0 text-gold-500 sm:size-4" aria-hidden="true">
              <path fill="currentColor" d="M8 0 L9.2 6 L16 8 L9.2 10 L8 16 L6.8 10 L0 8 L6.8 6 Z" />
            </svg>
            <span className="truncate">{store.brand.name}</span>
          </Link>
          <p>
            <span className="inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-gold-400 px-3 text-sm font-semibold text-ink-900">
              <Lock className="size-3.5 text-forest-500" strokeWidth={2.2} />
              <span className="max-[479px]:sr-only">Saugus mokėjimas</span>
              <span className="min-[480px]:hidden" aria-hidden="true">Saugus</span>
            </span>
          </p>
        </div>
      </header>
      <div className="w-full">
        <CheckoutGarland />
      </div>

      <form id={FORM_ID} onSubmit={onSubmit} noValidate inert={leaveOpen} className="mx-auto max-w-6xl px-4 pb-8 pt-4 sm:px-6">
        <fieldset disabled={busy} className="min-w-0">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="font-display text-[2rem] font-bold leading-none text-ink-900 sm:text-[2.5rem]">Apmokėjimas</h1>
          <CheckoutSteps current={current} onPick={goTo} />
        </div>
        <div className="checkout-timer mb-5" aria-live="polite">
          <p className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-ink-900">
            <Clock className="size-4 shrink-0 text-burgundy-600" strokeWidth={2.2} />
            Krepšelis rezervuotas
            <span className="num text-base font-bold tracking-wide">
              {model.seconds == null ? "…" : formatMmSs(model.seconds)}
            </span>
          </p>
          {model.expired ? (
            <p className="mt-1 text-sm font-semibold text-burgundy-700">
              Rezervacija baigėsi.{" "}
              <button type="button" onClick={model.refreshReserve} className="min-h-11 underline underline-offset-4">
                Atnaujinti rezervaciją
              </button>
            </p>
          ) : null}
        </div>

        {model.banner ? (
          <p role="alert" className="mb-4 rounded-cozy border border-burgundy-300 bg-burgundy-100 px-4 py-3 text-sm font-semibold text-burgundy-700">
            {model.banner}
          </p>
        ) : null}

        <div className="lg:hidden">
          <OrderSummary variant="mobile" paymentReady={paymentReady} busy={busy} />
        </div>

        <div className="mt-4 grid grid-cols-1 items-start gap-8 lg:mt-0 lg:grid-cols-[minmax(0,1.16fr)_minmax(0,0.84fr)]">
          <div className="space-y-8">
            <section id="checkout-details" className="scroll-mt-36 space-y-4">
              <p className="text-[13px] font-medium text-ink-600">
                <span className="checkout-req" aria-hidden="true">*</span> - privaloma
              </p>
              <h2 className="font-display text-[1.375rem] font-semibold text-ink-900">Kontaktinė informacija</h2>
              <Field
                id="checkout-email"
                label="El. paštas"
                required
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="pvz., vardas@gmail.com"
                value={model.form.email}
                error={model.errors.email}
                onBlur={() => { model.blurField("email"); void model.captureEmail(); }}
                onChange={(value) => model.patch("email", value)}
              />
              <OrnamentDivider />
              <h2 className="font-display text-[1.375rem] font-semibold text-ink-900">Pristatymo adresas</h2>
              <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2">
                <Field
                  id="checkout-name"
                  label="Vardas"
                  required
                  autoComplete="given-name"
                  placeholder=""
                  value={model.form.name}
                  error={model.errors.name}
                  onBlur={() => model.blurField("name")}
                  onChange={(value) => model.patch("name", lettersOnly(value))}
                />
                <Field
                  id="checkout-surname"
                  label="Pavardė"
                  required
                  autoComplete="family-name"
                  placeholder=""
                  value={model.form.surname}
                  error={model.errors.surname}
                  onBlur={() => model.blurField("surname")}
                  onChange={(value) => model.patch("surname", lettersOnly(value))}
                />
              </div>
              <Field
                id="checkout-address"
                label="Adresas (gatvė, namo nr., buto nr.)"
                required
                autoComplete="street-address"
                placeholder=""
                value={model.form.address}
                error={model.errors.address}
                onBlur={() => model.blurField("address")}
                onChange={(value) => model.patch("address", value)}
              />
              <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2">
                <Field
                  id="checkout-city"
                  label="Miestas"
                  required
                  autoComplete="address-level2"
                  placeholder=""
                  value={model.form.city}
                  error={model.errors.city}
                  onBlur={() => model.blurField("city")}
                  onChange={(value) => model.patch("city", lettersOnly(value))}
                />
                <Field
                  id="checkout-region"
                  label="Rajonas (neprivaloma)"
                  autoComplete="address-level1"
                  placeholder=""
                  value={model.form.region}
                  onChange={(value) => model.patch("region", value)}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2">
                <Field
                  id="checkout-postalCode"
                  label="Pašto kodas"
                  required
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="5 skaitmenys"
                  value={model.form.postalCode}
                  error={model.errors.postalCode}
                  onBlur={() => model.blurField("postalCode")}
                  onChange={(value) => model.patch("postalCode", digitsOnly(value, 5))}
                />
                <Field
                  id="checkout-phone"
                  label="Telefonas"
                  required
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="pvz., +37060000000"
                  value={model.form.phone}
                  error={model.errors.phone}
                  onBlur={() => model.blurField("phone")}
                  onChange={(value) => model.patch("phone", formatPhone(value))}
                />
              </div>
            </section>

            <section id="checkout-payment" className="scroll-mt-36">
              <div className="mb-4 flex items-center gap-2">
                <CreditCard className="size-4 text-burgundy-600" strokeWidth={1.8} />
                <h2 className="font-display text-[1.375rem] font-semibold text-ink-900">Mokėjimo informacija</h2>
              </div>
              {current === 2 ? (
                <div className="mb-4 lg:hidden">
                  <CheckoutShippingUpsells />
                </div>
              ) : null}
              {model.stripeEnabled ? (
                <div className="space-y-3">
                  <div className="rounded-[12px] border border-gold-600 bg-white p-3.5 shadow-card">
                    {!paymentLoaded && !paymentLoadError ? (
                      <p role="status" className="py-2 text-sm text-ink-600">Kraunama mokėjimo forma…</p>
                    ) : null}
                    {paymentLoadError ? (
                      <p role="alert" className="py-2 text-sm text-burgundy-700">Nepavyko įkelti mokėjimo formos. Atnaujinkite puslapį ir bandykite dar kartą.</p>
                    ) : null}
                    {elementsReady ? (
                      <PaymentElement
                        onReady={() => {
                          setPaymentLoaded(true);
                          setPaymentLoadError(false);
                        }}
                        onLoadError={() => setPaymentLoadError(true)}
                        options={{
                          layout: { type: "tabs", defaultCollapsed: false },
                          paymentMethodOrder: ["card", "revolut_pay", "bancontact", "eps"],
                        }}
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-1 rounded-[12px] border border-gold-600 bg-white p-3 text-sm text-ink-600 sm:flex-row sm:items-center sm:gap-2">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-ink-900">
                      <Lock className="size-3.5 text-forest-500" strokeWidth={2} />
                      256-bit SSL saugus atsiskaitymas
                    </span>
                    <span>Jūsų mokėjimo informacija yra visiškai saugi</span>
                  </div>
                </div>
              ) : (
                <p className="rounded-cozy border border-cream-300 bg-cream-100 px-4 py-3 text-sm text-ink-600">
                  Mokėjimas dar nesukonfigūruotas.
                </p>
              )}
            </section>

            <div className="lg:hidden">
              {model.deliveryPromise ? (
                <p className="mb-3 text-sm font-semibold text-forest-500">{model.deliveryPromise}</p>
              ) : null}
              <CheckoutReviews />
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="checkout-summary-sticky">
              <OrderSummary variant="desktop" paymentReady={paymentReady} busy={busy} />
            </div>
          </div>
        </div>
        </fieldset>
      </form>

      <div className={`checkout-paybar lg:hidden ${model.keyboard ? "hidden" : ""}`}>
        <Button
          type="submit"
          form={FORM_ID}
          size="lg"
          disabled={busy || model.items.length === 0 || (model.stripeEnabled && !paymentReady)}
          className="checkout-pay w-full"
        >
          <PayLabel busy={busy} cents={model.totalCents} />
        </Button>
      </div>

      <footer className="border-t border-cream-300 bg-cream-100/80 pb-28 lg:pb-0">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6">
          <nav aria-label="Teisinė informacija" className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
            <Link href="/privatumo-politika" className="inline-flex min-h-12 items-center text-ink-600 hover:text-burgundy-700">
              Privatumo politika
            </Link>
            <Link href="/pirkimo-taisykles" className="inline-flex min-h-12 items-center text-ink-600 hover:text-burgundy-700">
              Pirkimo sąlygos
            </Link>
            <Link href="/kontaktai" className="inline-flex min-h-12 items-center text-ink-600 hover:text-burgundy-700">
              Kontaktai
            </Link>
          </nav>
          <p className="text-xs leading-relaxed text-ink-400">
            {store.contact.legalName}
            {store.contact.companyCode ? ` · Įmonės kodas ${store.contact.companyCode}` : ""}
            {store.contact.address ? ` · ${store.contact.address}` : ""}
            {store.contact.email ? ` · ${store.contact.email}` : ""}
          </p>
        </div>
      </footer>
      <CheckoutLeave open={leaveOpen} onStay={handleStay} onLeave={handleLeave} />
    </div>
  );
}

function CheckoutShippingUpsells() {
  const model = useModel();
  return (
    <>
      <MysteryGiftCard
        selected={model.mystery}
        shippingUnlock={model.subtotal < store.shipping.freeThresholdCents}
        onToggle={model.toggleMystery}
      />
      <FreeDeliverySleigh
        subtotalCents={model.subtotal}
        shippingFree={model.shippingCents === 0}
        giftUnlocksShipping={model.subtotal < store.shipping.freeThresholdCents}
      />
    </>
  );
}

function OrderSummary({
  variant,
  paymentReady,
  busy,
}: {
  variant: "mobile" | "desktop";
  paymentReady: boolean;
  busy: boolean;
}) {
  const model = useModel();
  const body = (
    <>
      <SummaryRibbon />
      {variant === "desktop" ? (
        <h2 className="mb-4 pr-16 font-display text-[1.375rem] font-semibold text-ink-900">Užsakymo santrauka</h2>
      ) : null}
      {variant === "desktop" ? (
        <div className="mb-4">
          <CheckoutShippingUpsells />
        </div>
      ) : null}
      <ul className="space-y-4">
        {model.items.map((item) => (
          <li
            key={`${item.slug}-${item.variantId}`}
            className="flex items-center gap-4 rounded-[12px] border border-cream-300 bg-white p-4 shadow-card"
          >
            <ProductImage
              images={item.variant.images?.length ? item.variant.images : item.product.images}
              seed={item.product.artSeed}
              alt=""
              size="thumb"
              className="size-[4.5rem] shrink-0 rounded-[12px] object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-base font-semibold leading-snug text-ink-900">{item.product.name}</p>
              <p className="text-sm font-medium text-ink-600">Kiekis: {item.qty}</p>
              {item.variant.name !== "Standartinis rinkinys" && item.variant.name !== "Vienetas" ? (
                <p className="truncate text-sm text-ink-400">{item.variant.name}</p>
              ) : null}
              <p className="num text-base font-semibold text-burgundy-700">{formatPrice(item.lineTotalCents)}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 space-y-3 text-[15px] font-medium leading-snug text-ink-600">
        <div className="flex items-center justify-between gap-3">
          <span>Tarpinė suma</span>
          <span className="num">{formatPrice(model.subtotal)}</span>
        </div>
        {model.mysteryCents ? (
          <div className="flex items-center justify-between gap-3">
            <span>{MYSTERY_GIFT.name}</span>
            <span className="num">{formatPrice(model.mysteryCents)}</span>
          </div>
        ) : null}
        {model.extras.protection ? (
          <div className="relative flex items-center justify-between gap-3">
            <span className="inline-flex min-w-0 items-center gap-0.5">
              {addonLineLabel("protection")}
              <span className="group shrink-0">
                <button
                  type="button"
                  aria-label="Apie apsaugą nuo pažeidimo"
                  className="inline-flex size-6 items-center justify-center rounded-full text-ink-400 hover:text-ink-600"
                >
                  <Info className="size-3.5" />
                </button>
                <span role="tooltip" className="pointer-events-none absolute bottom-full left-0 z-10 mb-1 hidden w-full max-w-56 rounded-md border border-cream-300 bg-cream-50 p-2 text-left text-sm text-ink-600 shadow-card group-focus-within:block group-hover:block">
                  Nedidelis mokestis, kad pamestą ar pažeistą siuntą galėtume pakeisti be papildomo laukimo.
                </span>
              </span>
            </span>
            <span className="num shrink-0">{formatPrice(model.extras.protection)}</span>
          </div>
        ) : null}
        {model.extras.donation ? (
          <div className="flex items-center justify-between gap-3">
            <span>{addonLineLabel("donation")}</span>
            <span className="num">{formatPrice(model.extras.donation)}</span>
          </div>
        ) : null}
        {model.extras.priority ? (
          <div className="flex items-center justify-between gap-3">
            <span>{addonLineLabel("priority")}</span>
            <span className="num">{formatPrice(model.extras.priority)}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-3">
          <span>Pristatymas</span>
          {model.shippingCents === 0 ? (
            <span className="inline-flex items-baseline gap-2">
              <s className="num text-ink-400">{formatPrice(store.shipping.flatRateCents)}</s>
              <span className="font-semibold text-forest-500">Nemokamai</span>
            </span>
          ) : (
            <span className="num">{formatPrice(model.shippingCents)}</span>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between border-t border-cream-300 pt-3">
        <span className="text-sm font-medium text-ink-600">Iš viso</span>
        <FadingPrice
          cents={model.totalCents}
          live={variant === "desktop"}
          className="num text-3xl font-extrabold text-burgundy-700"
        />
      </div>
      {variant === "desktop" ? (
        <>
          {model.deliveryPromise ? (
            <p className="mt-3 text-sm font-semibold text-forest-500">{model.deliveryPromise}</p>
          ) : null}
          <Button
            type="submit"
            size="lg"
            disabled={busy || model.items.length === 0 || (model.stripeEnabled && !paymentReady)}
            className="checkout-pay mt-5 w-full"
          >
            <PayLabel busy={busy} cents={model.totalCents} />
          </Button>
          <CheckoutPayMarks />
          <CheckoutReviews />
        </>
      ) : null}
    </>
  );

  if (variant === "mobile") {
    return (
      <details className="group relative overflow-hidden rounded-cozy border border-cream-300 bg-cream-100/80">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-semibold text-ink-900 [&::-webkit-details-marker]:hidden">
          <span>Užsakymo santrauka</span>
          <span className="inline-flex items-center gap-2 text-burgundy-700">
            <FadingPrice cents={model.totalCents} className="num text-lg font-extrabold" />
            <span aria-hidden="true" className="text-ink-400 transition group-open:rotate-180">
              ▾
            </span>
          </span>
        </summary>
        <div className="relative border-t border-cream-300 px-4 py-4">{body}</div>
      </details>
    );
  }

  return (
    <aside className="checkout-summary relative overflow-visible rounded-cozy border border-cream-300 bg-cream-100/80 p-5">
      {body}
    </aside>
  );
}

function PayLabel({ busy, cents }: { busy: boolean; cents: number }) {
  if (busy) return "Apmokama…";
  return (
    <span className="inline-flex items-center justify-center gap-2">
      <Lock className="size-4" strokeWidth={2.2} />
      Pateikti užsakymą · <span className="num">{formatPrice(cents)}</span>
    </span>
  );
}

function Field({
  id,
  label,
  required = false,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  type = "text",
  inputMode,
  autoComplete,
}: {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder: string;
  type?: string;
  inputMode?: "email" | "numeric" | "tel" | "text";
  autoComplete?: string;
}) {
  const errorId = `${id}-error`;
  const [touched, setTouched] = useState(false);
  const valid = touched && !error && value.length > 0;
  return (
    <div className={`checkout-field ${error ? "is-error" : ""} ${valid ? "is-valid" : ""}`}>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        placeholder={placeholder || " "}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        aria-required={required || undefined}
        onBlur={() => {
          setTouched(true);
          onBlur?.();
        }}
        onChange={(e) => onChange(e.target.value)}
        className="num"
      />
      <label htmlFor={id}>
        {label}
        {required ? (
          <span className="checkout-req" aria-hidden="true">
            *
          </span>
        ) : null}
        {required ? <span className="sr-only">, privaloma</span> : null}
      </label>
      {valid ? (
        <span className="checkout-check" aria-hidden="true">
          ✓
        </span>
      ) : null}
      {error ? (
        <p id={errorId} className="checkout-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
