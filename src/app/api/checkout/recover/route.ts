import { NextResponse } from "next/server";
import { openToken, cartFingerprint, sessionCookie, type CartRecovery } from "@/lib/email/tokens";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const data = openToken<CartRecovery>(token);
  if (!data || data.purpose !== "recover") return new Response("Krepšelio nuoroda nebegalioja.", { status: 400 });
  const response = NextResponse.redirect(new URL(`/checkout/recover?token=${encodeURIComponent(token)}`, req.url));
  response.headers.set("Cache-Control", "no-store");
  const fingerprint = cartFingerprint({ email: data.cart.email, lines: data.cart.lines, addons: data.cart.addons, mysteryGift: data.cart.mysteryGift });
  response.cookies.set(sessionCookie({ purpose: "session", runId: data.runId, fingerprint }));
  return response;
}
