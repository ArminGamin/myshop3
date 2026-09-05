import { NextResponse } from "next/server";
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
    if (key === name) return decodeURIComponent(rest.join("="));
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
  return Boolean(cookie && header && cookie === header);
}
