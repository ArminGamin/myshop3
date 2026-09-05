const EMAIL_RE =
  /^[a-z0-9](?:[a-z0-9._%+-]{0,62}[a-z0-9])?@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z]{2,24})+$/;

const ALLOWED_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "hotmail.com",
  "hotmail.co.uk",
  "outlook.com",
  "outlook.co.uk",
  "live.com",
  "icloud.com",
  "me.com",
  "proton.me",
  "protonmail.com",
  "inbox.lt",
  "zebra.lt",
  "one.lt",
  "takas.lt",
]);

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isAllowedEmail(value: string): boolean {
  const email = normalizeEmail(value);
  if (email.length > 80 || email.includes("..")) return false;
  if (!EMAIL_RE.test(email)) return false;
  const domain = email.split("@")[1];
  return ALLOWED_DOMAINS.has(domain);
}

export function emailError(value: string): string | null {
  if (!isAllowedEmail(value)) {
    return "Įveskite galiojantį el. paštą (gmail.com, yahoo.com, hotmail.com, outlook.com, icloud.com, inbox.lt).";
  }
  return null;
}
