import type { Metadata } from "next";
import Link from "next/link";
import { CartRecovery } from "@/components/commerce/cart-recovery";
import { openToken, type CartRecovery as RecoveryToken } from "@/lib/email/tokens";

export const metadata: Metadata = { title: "Grįžti į krepšelį", robots: { index: false, follow: false } };

export default async function RecoverPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const data = openToken<RecoveryToken>(token ?? "");
  if (!data || data.purpose !== "recover") {
    return <div className="mx-auto max-w-6xl px-4 py-16"><p>Krepšelio nuoroda nebegalioja.</p><Link href="/dovanos/visos-dovanos">Rinktis dovanas</Link></div>;
  }
  return <CartRecovery lines={data.cart.lines} email={data.cart.email} addons={data.cart.addons} mysteryGift={data.cart.mysteryGift} />;
}
