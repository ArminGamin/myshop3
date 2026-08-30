import { NextResponse } from "next/server";
import { store } from "@/lib/config/store.config";

export const runtime = "nodejs";

// Naujienlaiškio užfiksavimas su GDPR sutikimu. Be teikėjo rakto —
// įrašome į serverio žurnalą; integracija su Klaviyo/Brevo per env.
export async function POST(req: Request) {
  let body: { email?: string; consent?: boolean; source?: string; honey?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Honeypot — botai užpildo, žmonės ne.
  if (body.honey) {
    return NextResponse.json({ ok: true, mode: "ignored" });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  if (!valid || !body.consent) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  console.log("[NEWSLETTER]", JSON.stringify({
    email,
    source: body.source ?? "unknown",
    consent: true,
    ts: new Date().toISOString(),
  }));

  // Integracijos sąsaja: Klaviyo ar Brevo API per env raktus.
  // Pavyzdys (Klaviyo): POST /client/subscriptions su list_id iš KLAVIYO_LIST_ID.
  const klaviyoKey = process.env.KLAVIYO_API_KEY;
  const klaviyoList = process.env.KLAVIYO_LIST_ID;
  if (klaviyoKey && klaviyoList) {
    try {
      await fetch("https://a.klaviyo.com/client/subscriptions/?company_id=" + klaviyoKey.split("_").pop(), {
        method: "POST",
        headers: {
          Authorization: `Klaviyo-API-Key ${klaviyoKey}`,
          "Content-Type": "application/json",
          revision: "2024-10-15",
        },
        body: JSON.stringify({
          data: {
            type: "subscription",
            attributes: {
              profile: { data: { type: "profile", attributes: { email } } },
            },
            relationships: { list: { data: { type: "list", id: klaviyoList } } },
          },
        }),
      });
      return NextResponse.json({ ok: true, mode: "klaviyo" });
    } catch (e) {
      console.error("Klaviyo klaida:", e);
    }
  }

  void store;
  return NextResponse.json({ ok: true, mode: "logged" });
}
