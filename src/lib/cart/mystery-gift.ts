import { store } from "@/lib/config/store.config";

export const MYSTERY_GIFT = store.mysteryGift;

const STORAGE_KEY = "jaukumas.mystery-gift.v1";

export function parseMysteryGift(value: unknown): boolean {
  return value === true || value === 1 || value === "1";
}

export function readMysteryGift(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeMysteryGift(on: boolean) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, on ? "1" : "0");
  } catch {
    /* neprieinama */
  }
}
