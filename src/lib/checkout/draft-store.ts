"use client";

import { useSyncExternalStore } from "react";
import {
  EMPTY_CUSTOMER,
  readCustomerDraft,
  writeCustomerDraft,
  type CheckoutCustomer,
} from "@/lib/checkout/customer";
import { readMysteryGift, writeMysteryGift } from "@/lib/cart/mystery-gift";
import {
  CART_ADDON_DEFAULTS,
  readCartAddons,
  writeCartAddons,
  type CartAddonSelection,
} from "@/lib/cart/addons";

const customerListeners = new Set<() => void>();
let customerCache: CheckoutCustomer = EMPTY_CUSTOMER;

function sameCustomer(a: CheckoutCustomer, b: CheckoutCustomer) {
  return (
    a.email === b.email &&
    a.name === b.name &&
    a.surname === b.surname &&
    a.address === b.address &&
    a.city === b.city &&
    a.region === b.region &&
    a.postalCode === b.postalCode &&
    a.phone === b.phone
  );
}

function getCustomer() {
  const next = readCustomerDraft();
  if (!sameCustomer(customerCache, next)) customerCache = next;
  return customerCache;
}

export function useCustomerDraft() {
  return useSyncExternalStore(
    (listener) => {
      customerListeners.add(listener);
      return () => customerListeners.delete(listener);
    },
    getCustomer,
    () => EMPTY_CUSTOMER
  );
}

export function patchCustomerDraft(key: keyof CheckoutCustomer, value: string) {
  customerCache = { ...customerCache, [key]: value };
  writeCustomerDraft(customerCache);
  customerListeners.forEach((listener) => listener());
}

let mysteryCache = false;

function getMystery() {
  mysteryCache = readMysteryGift();
  return mysteryCache;
}

const mysteryListeners = new Set<() => void>();

export function useMysterySelection() {
  return useSyncExternalStore(
    (listener) => {
      mysteryListeners.add(listener);
      return () => mysteryListeners.delete(listener);
    },
    getMystery,
    () => false
  );
}

export function updateMysterySelection(next: boolean) {
  mysteryCache = next;
  writeMysteryGift(next);
  mysteryListeners.forEach((listener) => listener());
}

let addonCache: CartAddonSelection = CART_ADDON_DEFAULTS;

function sameAddons(a: CartAddonSelection, b: CartAddonSelection) {
  return a.protection === b.protection && a.donation === b.donation && a.priority === b.priority;
}

function getAddons() {
  const next = readCartAddons();
  if (!sameAddons(addonCache, next)) addonCache = next;
  return addonCache;
}

const addonListeners = new Set<() => void>();

export function useCheckoutAddons() {
  return useSyncExternalStore(
    (listener) => {
      addonListeners.add(listener);
      return () => addonListeners.delete(listener);
    },
    getAddons,
    () => CART_ADDON_DEFAULTS
  );
}

export function updateCheckoutAddons(next: CartAddonSelection) {
  addonCache = next;
  writeCartAddons(next);
  addonListeners.forEach((listener) => listener());
}
