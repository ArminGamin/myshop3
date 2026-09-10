import { emailError, normalizeEmail } from "@/lib/security/email";

export type CheckoutCustomer = {
  email: string;
  name: string;
  surname: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
  phone: string;
};

export const EMPTY_CUSTOMER: CheckoutCustomer = {
  email: "",
  name: "",
  surname: "",
  address: "",
  city: "",
  region: "",
  postalCode: "",
  phone: "",
};

const LT_NAME = /^[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s-]{2,40}$/;

export function sanitizeText(value: string, maxLength: number): string {
  return value
    .replace(/[\x00-\x1F\x7F]/g, "")
    .trim()
    .slice(0, maxLength);
}

export function lettersOnly(value: string): string {
  return sanitizeText(value, 40).replace(/[^a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s-]/g, "");
}

export function digitsOnly(value: string, max: number): string {
  return value.replace(/\D/g, "").slice(0, max);
}

export function formatPhone(value: string): string {
  const raw = value.replace(/[^\d+]/g, "").slice(0, 16);
  if (raw.startsWith("+")) return `+${raw.slice(1).replace(/\D/g, "").slice(0, 14)}`;
  return raw.replace(/\D/g, "").slice(0, 15);
}

export function validateCustomer(input: Partial<CheckoutCustomer>): {
  errors: Partial<Record<keyof CheckoutCustomer, string>>;
  value: CheckoutCustomer;
} {
  const value: CheckoutCustomer = {
    email: normalizeEmail(sanitizeText(input.email ?? "", 80)),
    name: sanitizeText(input.name ?? "", 40),
    surname: sanitizeText(input.surname ?? "", 40),
    address: sanitizeText(input.address ?? "", 120),
    city: sanitizeText(input.city ?? "", 40),
    region: sanitizeText(input.region ?? "", 60),
    postalCode: digitsOnly(input.postalCode ?? "", 5),
    phone: formatPhone(input.phone ?? ""),
  };

  const errors: Partial<Record<keyof CheckoutCustomer, string>> = {};
  const mail = emailError(value.email);
  if (mail) errors.email = mail;
  if (!LT_NAME.test(value.name)) errors.name = "Įveskite vardą raidėmis.";
  if (!LT_NAME.test(value.surname)) errors.surname = "Įveskite pavardę raidėmis.";
  if (value.address.length < 5 || value.address.length > 120) errors.address = "Įveskite gatvę ir namo numerį.";
  if (!LT_NAME.test(value.city)) errors.city = "Įveskite miestą raidėmis.";
  if (!/^\d{5}$/.test(value.postalCode)) errors.postalCode = "Pašto kodas — 5 skaitmenys.";
  if (!/^\+?\d{8,15}$/.test(value.phone)) errors.phone = "Įveskite telefono numerį, pvz. +37060000000.";

  return { errors, value };
}
