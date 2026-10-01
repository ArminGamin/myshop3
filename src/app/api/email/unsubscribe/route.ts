import { NextResponse } from "next/server";
import { cancelCartReminders } from "@/lib/email/automation";
import { openToken, sessionCookie, type CartUnsubscribe } from "@/lib/email/tokens";

export const runtime = "nodejs";

async function unsubscribe(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const data = openToken<CartUnsubscribe>(token);
  if (!data || data.purpose !== "unsubscribe") return new Response("Nuoroda nebegalioja.", { status: 400 });
  await cancelCartReminders(data.runId);
  const response = new NextResponse("Krepšelio priminimų atsisakyta. Daugiau šio krepšelio priminimų nesiųsime.", {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
  response.cookies.set(sessionCookie({ purpose: "session", runId: data.runId, fingerprint: data.fingerprint }));
  return response;
}

export const GET = unsubscribe;
export const POST = unsubscribe;
