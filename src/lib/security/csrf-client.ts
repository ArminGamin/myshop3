"use client";

import { CSRF_COOKIE, CSRF_HEADER } from "./csrf-names";

function readCsrf(): string | null {
  if (typeof document === "undefined") return null;
  const row = document.cookie.split("; ").find((part) => part.startsWith(`${CSRF_COOKIE}=`));
  if (!row) return null;
  return decodeURIComponent(row.slice(CSRF_COOKIE.length + 1));
}

export function apiHeaders(): HeadersInit {
  const token = readCsrf();
  return {
    "Content-Type": "application/json",
    ...(token ? { [CSRF_HEADER]: token } : {}),
  };
}
