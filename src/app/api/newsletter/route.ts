import { NextResponse } from "next/server";
import { store } from "@/lib/config/store.config";
import { denyPost } from "@/lib/security/guard";
import { isAllowedEmail, normalizeEmail } from "@/lib/security/email";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const blocked = denyPost(req, "newsletter");
  if (blocked) return blocked;

  let body: { email?: string; consent?: boolean; source?: string; honey?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (body.honey) {
    return NextResponse.json({ ok: true, mode: "ignored" });
  }

  const email = normalizeEmail(body.email ?? "");
  if (!isAllowedEmail(email) || !body.consent) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  console.log(
    "[NEWSLETTER]",
    JSON.stringify({
      email,
      source: body.source ?? "unknown",
      consent: true,
      ts: new Date().toISOString(),
    })
  );

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
