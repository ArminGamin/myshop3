const EMAIL_RE =
  /^[a-z0-9](?:[a-z0-9._%+-]{0,62}[a-z0-9])?@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isAllowedEmail(value: string): boolean {
  const email = normalizeEmail(value);
  if (email.length > 80 || email.includes("..")) return false;
  if (!EMAIL_RE.test(email)) return false;
  return true;
}

export function emailError(value: string): string | null {
  if (!isAllowedEmail(value)) {
    return "Įveskite galiojantį el. pašto adresą.";
  }
  return null;
}
