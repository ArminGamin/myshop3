import { NextResponse } from "next/server";

export const revalidate = 86400;

type OmnivaLocation = { NAME: string; TYPE: string; A0_NAME: string; A2_NAME: string; A3_NAME: string; A5_NAME: string; A7_NAME: string };
type DpdLocation = { countryCode: string; companyName: string; street: string; houseNo: string; city: string };

// Vieši operatorių paštomatų sąrašai, atnaujinami kartą per parą.
const SOURCES = {
  omniva: "https://www.omniva.ee/locations.json",
  lpexpress: "https://www.post.lt/sites/default/files/Pa%C5%A1tomatai/Visi%20pa%C5%A1tomatai.csv",
  dpd: "https://dpdbaltics.com/PickupParcelShopData.json",
};

function titleCase(value: string) {
  return value.toLocaleLowerCase("lt").replace(/(^|[\s-])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toLocaleUpperCase("lt"));
}

async function load(url: string) {
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res;
}

async function omniva() {
  const all: OmnivaLocation[] = await (await load(SOURCES.omniva)).json();
  return all
    .filter((l) => l.A0_NAME === "LT" && l.TYPE === "0")
    .map((l) => `${l.NAME} – ${[l.A5_NAME, l.A7_NAME].filter(Boolean).join(" ")}, ${l.A3_NAME || l.A2_NAME}`);
}

async function lpexpress() {
  const rows = (await (await load(SOURCES.lpexpress)).text()).replace(/^﻿/, "").split(/\r?\n/);
  const header = rows.findIndex((row) => row.startsWith("Miestas;"));
  return rows
    .slice(header + 1)
    .map((row) => row.split(";").map((cell) => cell.trim()))
    .filter(([city, , name, address]) => city && name && address)
    .map(([city, , name, address]) => `${name} – ${address}, ${city}`);
}

async function dpd() {
  const all: DpdLocation[] = await (await load(SOURCES.dpd)).json();
  return all
    .filter((l) => l.countryCode === "LT")
    .map((l) => `${l.companyName.trim()} – ${[l.street, l.houseNo].filter(Boolean).join(" ")}, ${titleCase(l.city)}`);
}

export async function GET() {
  const [o, lp, d] = await Promise.allSettled([omniva(), lpexpress(), dpd()]);
  const list = (result: PromiseSettledResult<string[]>) =>
    result.status === "fulfilled" ? [...new Set(result.value)].sort((a, b) => a.localeCompare(b, "lt")) : [];
  return NextResponse.json({ omniva: list(o), lpexpress: list(lp), dpd: list(d) });
}
