import { Suspense } from "react";
import type { Metadata } from "next";
import { CheckoutExperience } from "@/components/commerce/checkout-experience";

export const metadata: Metadata = {
  title: "Apmokėjimas",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="h-48 rounded-cozy skeleton" />
        </div>
      }
    >
      <CheckoutExperience />
    </Suspense>
  );
}
