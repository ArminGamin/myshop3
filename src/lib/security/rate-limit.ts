type Bucket = { count: number; resetAt: number };

const hits = new Map<string, Bucket>();

const LIMITS = {
  checkout: { limit: 8, windowMs: 15 * 60_000 },
  newsletter: { limit: 5, windowMs: 15 * 60_000 },
  checkoutHour: { limit: 24, windowMs: 60 * 60_000 },
  newsletterHour: { limit: 20, windowMs: 8 * 60 * 60_000 },
} as const;

export type RateBucket = keyof typeof LIMITS;

function prune(now: number) {
  if (hits.size < 400) return;
  for (const [key, bucket] of hits) {
    if (bucket.resetAt <= now) hits.delete(key);
  }
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}

export function takeToken(ip: string, bucket: RateBucket): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  prune(now);
  const spec = LIMITS[bucket];
  const key = `${bucket}:${ip}`;
  const current = hits.get(key);
  if (!current || current.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + spec.windowMs });
    return { ok: true };
  }
  if (current.count >= spec.limit) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
  }
  current.count += 1;
  return { ok: true };
}
