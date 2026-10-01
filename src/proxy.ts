import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { attachCsrfCookie, createCsrfToken, CSRF_COOKIE, readCookie } from "@/lib/security/csrf";
import { canViewProduct, getProduct } from "@/lib/data/products";
import { getCollection } from "@/lib/data/collections";
import { getArticle } from "@/lib/articles";

function csp(nonce: string): string {
  const isDev = process.env.NODE_ENV !== "production";
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  const posthogAssetsHost = posthogHost?.replace(".i.", "-assets.i.");

  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://js.stripe.com https://www.googletagmanager.com https://www.clarity.ms https://connect.facebook.net https://analytics.tiktok.com${posthogAssetsHost ? ` ${posthogAssetsHost}` : ""}${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    `connect-src 'self' https:${posthogHost ? ` ${posthogHost}` : ""}${isDev ? " ws: wss:" : ""}`,
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

  const catalogPath = /^\/(produktai|dovanos|straipsniai)\/([^/]+)\/?$/.exec(request.nextUrl.pathname);
  let missing = false;
  if (catalogPath) {
    try {
      const slug = decodeURIComponent(catalogPath[2]);
      missing = catalogPath[1] === "produktai"
        ? !canViewProduct(getProduct(slug))
        : catalogPath[1] === "dovanos" ? !getCollection(slug) : !getArticle(slug);
    } catch {
      missing = true;
    }
  }
  const response = missing
    ? NextResponse.rewrite(new URL("/404", request.url), { status: 404, request: { headers: requestHeaders } })
    : NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp(nonce));

  if (!readCookie(request, CSRF_COOKIE)) {
    attachCsrfCookie(response, createCsrfToken());
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|products/|.well-known/workflow/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)"],
};
