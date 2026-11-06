import { NextResponse } from "next/server";

export const revalidate = 86400;

type OmnivaLocation = { NAME: string; TYPE: string; A0_NAME: string; A2_NAME: string; A3_NAME: string; A5_NAME: string; A7_NAME: string };

// Omniva viešas paštomatų sąrašas, atnaujinamas kartą per parą.
export async function GET() {
  const res = await fetch("https://www.omniva.ee/locations.json", { next: { revalidate } });
  if (!res.ok) return NextResponse.json({ error: "Nepavyko gauti paštomatų." }, { status: 502 });
  const all: OmnivaLocation[] = await res.json();
  const lockers = all
    .filter((l) => l.A0_NAME === "LT" && l.TYPE === "0")
    .map((l) => `${l.NAME} – ${[l.A5_NAME, l.A7_NAME].filter(Boolean).join(" ")}, ${l.A3_NAME || l.A2_NAME}`)
    .sort((a, b) => a.localeCompare(b, "lt"));
  return NextResponse.json(lockers);
}
