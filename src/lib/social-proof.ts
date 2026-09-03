const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export function getVilniusHour(now = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Vilnius",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);
  const h = parts.find((p) => p.type === "hour")?.value;
  const n = parseInt(h ?? "12", 10);
  return Number.isFinite(n) ? Math.min(23, Math.max(0, n)) : 12;
}

function lithuanijaItinTyla(now = new Date()) {
  const h = getVilniusHour(now);
  return h >= 3 && h < 8;
}

function lithuanijaDiena(now = new Date()) {
  const h = getVilniusHour(now);
  return h >= 8 && h < 22;
}

export function randViewersLt(now = new Date()) {
  if (lithuanijaItinTyla(now)) return rand(1, 5);
  if (lithuanijaDiena(now)) return rand(14, 40);
  return rand(2, 12);
}

const CITIES_WEIGHTED: { label: string; w: number }[] = [
  { label: "Vilniaus", w: 5 },
  { label: "Kauno", w: 4 },
  { label: "Klaipėdos", w: 3 },
  { label: "Šiaulių", w: 2 },
  { label: "Panevėžio", w: 2 },
  { label: "Alytaus", w: 2 },
  { label: "Marijampolės", w: 2 },
  { label: "Mažeikių", w: 2 },
  { label: "Utenos", w: 2 },
  { label: "Telšių", w: 1 },
  { label: "Ukmergės", w: 1 },
  { label: "Kretingos", w: 1 },
  { label: "Palangos", w: 1 },
  { label: "Radviliškio", w: 1 },
  { label: "Tauragės", w: 1 },
];

export function pickCity(): string {
  const total = CITIES_WEIGHTED.reduce((s, c) => s + c.w, 0);
  let r = Math.random() * total;
  for (const row of CITIES_WEIGHTED) {
    r -= row.w;
    if (r <= 0) return row.label;
  }
  return CITIES_WEIGHTED[CITIES_WEIGHTED.length - 1]!.label;
}

export function lt(n: number, form1: string, form2: string, form3: string): string {
  const mod100 = n % 100;
  const mod10 = n % 10;
  if (mod100 >= 10 && mod100 <= 20) return form3;
  if (mod10 === 1) return form1;
  if (mod10 >= 2 && mod10 <= 9) return form2;
  return form3;
}

export type ToastSlice =
  | { kind: "buyers"; icon: string; buyers: number }
  | { kind: "viewers"; icon: string }
  | { kind: "package"; icon: string; mins: number; city: string };

const DYNAMIC_KINDS = ["buyers", "viewers", "package"] as const;

let lastDynamicIndex = -1;

export function rollPinnedNums(now = new Date()) {
  let buyers: number;
  if (lithuanijaItinTyla(now)) buyers = rand(1, 2);
  else if (lithuanijaDiena(now)) buyers = rand(5, 11);
  else buyers = rand(2, 5);
  return {
    buyers,
    packageMins: rand(2, 19),
    packageCity: pickCity(),
  };
}

function buildDynamicToast(pinned: ReturnType<typeof rollPinnedNums>): ToastSlice {
  const n = DYNAMIC_KINDS.length;
  let idx: number;
  let guard = 0;
  do {
    idx = Math.floor(Math.random() * n);
    guard += 1;
  } while (idx === lastDynamicIndex && n > 1 && guard < 48);
  lastDynamicIndex = idx;
  const dk = DYNAMIC_KINDS[idx]!;
  if (dk === "buyers") return { kind: "buyers", icon: "🔥", buyers: pinned.buyers };
  if (dk === "viewers") return { kind: "viewers", icon: "👁️" };
  return {
    kind: "package",
    icon: "📦",
    mins: pinned.packageMins,
    city: pinned.packageCity,
  };
}

export function pickNextToast(
  pinned: ReturnType<typeof rollPinnedNums>,
  lastKind: ToastSlice["kind"] | null
): ToastSlice {
  const forbid = lastKind;
  let guard = 0;
  while (guard < 40) {
    guard += 1;
    const candidate = buildDynamicToast(pinned);
    if (forbid === null || candidate.kind !== forbid) return candidate;
  }
  return buildDynamicToast(pinned);
}

export function sliceLine(slice: ToastSlice, viewersNow: number): string {
  if (slice.kind === "buyers") {
    return `${slice.icon} ${slice.buyers} ${lt(slice.buyers, "žmogus", "žmonės", "žmonių")} pirko per pastarąją valandą`;
  }
  if (slice.kind === "viewers") {
    return `${slice.icon} ${viewersNow} ${lt(viewersNow, "žmogus", "žmonės", "žmonių")} šiuo metu žiūri`;
  }
  return `${slice.icon} Pirkta prieš ${slice.mins} min iš ${slice.city}`;
}

export function progressKey(slice: ToastSlice | null, displayMs: number): string {
  if (!slice) return "";
  if (slice.kind === "buyers") return `buyers-${slice.buyers}-${displayMs}`;
  if (slice.kind === "package") return `package-${slice.mins}-${slice.city}-${displayMs}`;
  return `viewers-${displayMs}`;
}

export { rand };
