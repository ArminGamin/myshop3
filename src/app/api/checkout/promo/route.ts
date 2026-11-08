import { NextResponse } from "next/server";
import { denyPost } from "@/lib/security/guard";
import { findPromo } from "@/lib/commerce/promo-codes";

export async function POST(req: Request) {
  const blocked = denyPost(req, "checkout");
  if (blocked) return blocked;

  let body: { code?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Netinkama užklausa." }, { status: 400 });
  }

  const promo = findPromo(body?.code);
  if (!promo) return NextResponse.json({ error: "Toks nuolaidos kodas negalioja." }, { status: 404 });
  return NextResponse.json(promo);
}
