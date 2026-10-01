import { NextResponse } from "next/server";
import { start } from "workflow/api";
import { buildOrder, parseLines } from "@/lib/cart/server-order";
import { denyPost } from "@/lib/security/guard";
import { isAllowedEmail, normalizeEmail } from "@/lib/security/email";
import { orderSnapshot } from "@/lib/email/templates";
import { cancelCartReminders } from "@/lib/email/automation";
import { emailConfigured } from "@/lib/email/resend";
import { cartFingerprint, EMAIL_CART_COOKIE, readCartSession, sessionCookie } from "@/lib/email/tokens";
import { cartReminderWorkflow } from "@/workflows/customer-emails";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const blocked = denyPost(req, "cartCapture");
  if (blocked) return blocked;
  if (!emailConfigured()) return NextResponse.json({ enabled: false }, { status: 503 });
  let body: { email?: unknown; lines?: unknown; addons?: unknown; mysteryGift?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid" }, { status: 400 }); }
  const current = readCartSession(req);
  const email = normalizeEmail(typeof body.email === "string" ? body.email : "");
  const lines = parseLines(body.lines);
  if (!isAllowedEmail(email) || lines.length === 0) {
    if (current) await cancelCartReminders(current.runId);
    const response = NextResponse.json({ saved: false });
    response.cookies.delete(EMAIL_CART_COOKIE);
    return response;
  }
  const order = buildOrder(lines, body.addons, body.mysteryGift);
  if ("error" in order) return NextResponse.json({ error: "invalid_cart" }, { status: 400 });
  const details = { email, lines: order.rawLines, addons: order.addons, mysteryGift: order.mysteryGift };
  const fingerprint = cartFingerprint(details);
  if (current?.fingerprint === fingerprint) return NextResponse.json({ saved: true });
  if (current) await cancelCartReminders(current.runId);
  const run = await start(cartReminderWorkflow, [{ ...details, order: orderSnapshot(order), startedAt: Date.now() }]);
  const response = NextResponse.json({ saved: true });
  response.cookies.set(sessionCookie({ purpose: "session", runId: run.runId, fingerprint }));
  return response;
}
