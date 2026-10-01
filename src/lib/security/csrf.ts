import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { CSRF_COOKIE, CSRF_HEADER } from "./csrf-names";

export { CSRF_COOKIE, CSRF_HEADER };

export function createCsrfToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString("base64url");
}

export function readCookie(req: Request, name: string): string | null {
  const raw = req.headers.get("cookie");
  if (!raw) return null;
  for (const part of raw.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) {
      try {
        return decodeURIComponent(rest.join("="));
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function attachCsrfCookie(response: NextResponse, token: string) {
  response.cookies.set(CSRF_COOKIE, token, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export function csrfMatches(req: Request): boolean {
  const cookie = readCookie(req, CSRF_COOKIE);
  const header = req.headers.get(CSRF_HEADER);
  if (!cookie || !header || cookie.length !== header.length) return false;
  try {
    const a = Buffer.from(cookie, "utf8");
    const b = Buffer.from(header, "utf8");
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
