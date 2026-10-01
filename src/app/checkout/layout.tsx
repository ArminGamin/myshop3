import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CheckoutFlag } from "@/components/commerce/checkout-flag";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <CheckoutFlag />
      {children}
    </>
  );
}
