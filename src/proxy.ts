import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { attachCsrfCookie, createCsrfToken, CSRF_COOKIE, readCookie } from "@/lib/security/csrf";

function csp(nonce: string): string {
  const isDev = process.env.NODE_ENV !== "production";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://js.stripe.com https://www.googletagmanager.com https://www.clarity.ms https://connect.facebook.net https://analytics.tiktok.com${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    `connect-src 'self' https:${isDev ? " ws: wss:" : ""}`,
    "frame-src https://js.stripe.com https://hooks.stripe.com https://*.stripe.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp(nonce));

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp(nonce));

  if (!readCookie(request, CSRF_COOKIE)) {
    attachCsrfCookie(response, createCsrfToken());
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|products/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)"],
};
