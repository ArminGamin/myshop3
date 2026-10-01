import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { deflateRawSync, inflateRawSync } from "node:zlib";
import { readCookie } from "@/lib/security/csrf";
import type { CartEmailInput } from "./types";

export const EMAIL_CART_COOKIE = "kk-email-cart";
const TOKEN_TTL = 7 * 24 * 60 * 60_000;

function key() {
  const secret = process.env.EMAIL_AUTOMATION_SECRET;
  if (!secret || secret.length < 32) throw new Error("EMAIL_AUTOMATION_SECRET is missing");
  return createHash("sha256").update(secret).digest();
}

export function sealToken(payload: object): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const bytes = deflateRawSync(Buffer.from(JSON.stringify({ ...payload, expiresAt: Date.now() + TOKEN_TTL })));
  const encrypted = Buffer.concat([cipher.update(bytes), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}

export function openToken<T>(token: string): T | null {
  try {
    if (!token || token.length > 12_000) return null;
    const bytes = Buffer.from(token, "base64url");
    const cipher = createDecipheriv("aes-256-gcm", key(), bytes.subarray(0, 12));
    cipher.setAuthTag(bytes.subarray(12, 28));
    const data = JSON.parse(inflateRawSync(Buffer.concat([cipher.update(bytes.subarray(28)), cipher.final()]), { maxOutputLength: 32_000 }).toString("utf8"));
    return data.expiresAt > Date.now() ? data as T : null;
  } catch {
    return null;
  }
}

export type CartSession = { purpose: "session"; runId: string; fingerprint: string };
export type CartRecovery = { purpose: "recover"; runId: string; cart: CartEmailInput };
export type CartUnsubscribe = { purpose: "unsubscribe"; runId: string; fingerprint: string };

export function cartFingerprint(input: Omit<CartEmailInput, "startedAt" | "order">): string {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

export function readCartSession(req: Request): CartSession | null {
  const session = openToken<CartSession>(readCookie(req, EMAIL_CART_COOKIE) ?? "");
  return session?.purpose === "session" ? session : null;
}

export function sessionCookie(session: CartSession) {
  return { name: EMAIL_CART_COOKIE, value: sealToken(session), httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: TOKEN_TTL / 1000 };
}
