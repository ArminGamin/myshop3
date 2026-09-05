export function isSameOrigin(req: Request): boolean {
  const host = req.headers.get("host");
  if (!host) return false;

  const origin = req.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }

  const referer = req.headers.get("referer");
  if (!referer) return false;
  try {
    return new URL(referer).host === host;
  } catch {
    return false;
  }
}
