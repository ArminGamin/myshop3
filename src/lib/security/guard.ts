import { NextResponse } from "next/server";
import { csrfMatches } from "./csrf";
import { isSameOrigin } from "./origin";
import { clientIp, takeToken, type RateBucket } from "./rate-limit";

export function denyPost(req: Request, bucket: RateBucket): NextResponse | null {
  if (!isSameOrigin(req) || !csrfMatches(req)) {
    return NextResponse.json({ error: "Užklausa atmesta." }, { status: 403 });
  }

  const ip = clientIp(req);
  const short = takeToken(ip, bucket);
  if (!short.ok) {
    return NextResponse.json(
      { error: "Per daug bandymų. Palaukite ir bandykite dar kartą." },
      { status: 429, headers: { "Retry-After": String(short.retryAfterSec) } }
    );
  }

  const hourly = takeToken(ip, bucket === "checkout" ? "checkoutHour" : "newsletterHour");
  if (!hourly.ok) {
    return NextResponse.json(
      { error: "Per daug bandymų. Palaukite ir bandykite dar kartą." },
      { status: 429, headers: { "Retry-After": String(hourly.retryAfterSec) } }
    );
  }

  return null;
}
