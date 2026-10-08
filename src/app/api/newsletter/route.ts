import { NextResponse } from "next/server";
import { notifyDiscordNewsletter } from "@/lib/newsletter/discord-webhook";
import { denyPost } from "@/lib/security/guard";
import { isAllowedEmail, normalizeEmail } from "@/lib/security/email";
import { sendEmail } from "@/lib/email/resend";
import { NEWSLETTER_UNSUBSCRIBE, renderNewsletterWelcome } from "@/lib/email/templates";
import { store } from "@/lib/config/store.config";

// Pasisveikinimo laiškas naujam prenumeratoriui. Klaida nesugadina prenumeratos.
async function sendWelcome(email: string) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) return;
  try {
    const html = await renderNewsletterWelcome(store.brand.url);
    await sendEmail({
      to: email,
      subject: "🎄 Sveiki atvykę į Kalėdų Kampelį!",
      html,
      idempotencyKey: `newsletter-welcome/${email}`,
      unsubscribeUrl: NEWSLETTER_UNSUBSCRIBE,
    });
  } catch (e) {
    console.error("Naujienlaiškio pasisveikinimo laiško klaida:", e);
  }
}

export const runtime = "nodejs";

export async function POST(req: Request) {
  const blocked = denyPost(req, "newsletter");
  if (blocked) return blocked;

  let body: { email?: string; consent?: boolean; source?: string; honey?: string };
  try {
    body = await req.json();
    if (!body || typeof body !== "object") throw new Error("Invalid payload");
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (body.honey) {
    return NextResponse.json({ ok: true, mode: "ignored" });
  }

  const email = normalizeEmail(typeof body.email === "string" ? body.email : "");
  if (!isAllowedEmail(email) || body.consent !== true) {
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
      const response = await fetch("https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/", {
        method: "POST",
        headers: {
          Authorization: `Klaviyo-API-Key ${klaviyoKey}`,
          "Content-Type": "application/json",
          revision: "2025-07-15",
        },
        body: JSON.stringify({
          data: {
            type: "profile-subscription-bulk-create-job",
            attributes: {
              profiles: { data: [{ type: "profile", attributes: {
                email,
                subscriptions: { email: { marketing: { consent: "SUBSCRIBED" } } },
              } }] },
            },
            relationships: { list: { data: { type: "list", id: klaviyoList } } },
          },
        }),
      });
      if (!response.ok) return NextResponse.json({ ok: false, error: "provider" }, { status: 502 });
      await notifyDiscordNewsletter({ email, source: typeof body.source === "string" ? body.source : "unknown" });
      await sendWelcome(email);
      return NextResponse.json({ ok: true, mode: "klaviyo" });
    } catch (e) {
      console.error("Klaviyo klaida:", e);
      return NextResponse.json({ ok: false, error: "provider" }, { status: 502 });
    }
  }

  const captured = await notifyDiscordNewsletter({ email, source: typeof body.source === "string" ? body.source : "unknown" });
  if (captured) await sendWelcome(email);
  return captured
    ? NextResponse.json({ ok: true, mode: "captured" })
    : NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 });
}
