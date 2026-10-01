"use client";

/**
 * Checkout decoration: garland, step baubles, ornament divider, ribbon bow,
 * edge branches and the free-delivery sleigh.
 *
 * - Same exports and props as before, so the checkout page needs no changes.
 * - All styling lives in ./checkout-decor.css (plain CSS, `cd-` prefix). Keep
 *   the two files side by side. There are no Tailwind classes in this file.
 * - <SummaryRibbon /> is absolutely positioned: its parent card needs
 *   `position: relative` and must not clip overflow.
 * - <CheckoutGarland /> fills its parent's width, so put it in a full-width
 *   wrapper if you want it edge to edge.
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { store } from "@/lib/config/store.config";
import { formatPrice } from "@/lib/format";
import "./checkout-decor.css";

/* ------------------------------------------------------------------------ */
/* Deterministic geometry helpers (pure, so server and client output match)  */
/* ------------------------------------------------------------------------ */

type Pt = readonly [number, number];

const f1 = (n: number) => n.toFixed(1);
const f2 = (n: number) => n.toFixed(2);

/** Small seeded PRNG (mulberry32): same numbers on server and client. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Point and unit tangent on a cubic Bézier. */
function bez(p: readonly Pt[], t: number) {
  const u = 1 - t;
  const x = u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0];
  const y = u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1];
  const dx = 3 * u * u * (p[1][0] - p[0][0]) + 6 * u * t * (p[2][0] - p[1][0]) + 3 * t * t * (p[3][0] - p[2][0]);
  const dy = 3 * u * u * (p[1][1] - p[0][1]) + 6 * u * t * (p[2][1] - p[1][1]) + 3 * t * t * (p[3][1] - p[2][1]);
  const len = Math.hypot(dx, dy) || 1;
  return { x, y, tx: dx / len, ty: dy / len };
}

/** Unit direction = tangent rotated by `a` radians. */
function rot(tx: number, ty: number, a: number) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { dx: tx * c - ty * s, dy: tx * s + ty * c };
}

/* ------------------------------------------------------------------------ */
/* Garland                                                                   */
/* ------------------------------------------------------------------------ */

const TILE_W = 360;
const TILE_H = 56;
const TILE_COUNT = 12; // 12 * 360px = 4320px: covers 4K screens

/** Two swags per tile, pinned at x = 0, 180 (and 360 = next tile's 0). */
const SWAGS: readonly (readonly Pt[])[] = [
  [[0, 8], [40, 52], [140, 52], [180, 8]],
  [[180, 8], [220, 52], [320, 52], [360, 8]],
];

const LIGHT_T = [0.2, 0.35, 0.65, 0.8];
const PHASES = ["a", "b", "c"] as const;

function buildGarland() {
  const rand = rng(7);
  let rope = "";
  let dark = "";
  let light = "";
  let wires = "";
  let berries = "";
  const lights: { x: number; y: number; phase: (typeof PHASES)[number] }[] = [];

  SWAGS.forEach((s) => {
    rope += `M${s[0][0]} ${s[0][1]}C${s[1][0]} ${s[1][1]} ${s[2][0]} ${s[2][1]} ${s[3][0]} ${s[3][1]}`;

    // Pine needles fanned along the rope. + side hangs down, - side points up.
    const N = 22;
    for (let i = 0; i < N; i++) {
      const p = bez(s, (i + 0.5) / N);
      for (const side of [1, -1]) {
        for (let k = 0; k < 2; k++) {
          const a = side * (0.8 + rand() * 0.6);
          const { dx, dy } = rot(p.tx, p.ty, a);
          const len = (side > 0 ? 7.5 : 5.2) + rand() * 4;
          dark += `M${f1(p.x)} ${f1(p.y)}l${f1(dx * len)} ${f1(dy * len + (side > 0 ? 1.2 : 0))}`;
        }
        const a2 = side * (0.35 + rand() * 0.3);
        const q = bez(s, Math.min(0.99, (i + 0.15 + rand() * 0.7) / N));
        const { dx: ex, dy: ey } = rot(q.tx, q.ty, a2);
        const l2 = (side > 0 ? 6 : 4.4) + rand() * 3;
        light += `M${f1(q.x)} ${f1(q.y)}l${f1(ex * l2)} ${f1(ey * l2 + (side > 0 ? 0.8 : 0))}`;
      }
    }

    // Fairy lights sit ON the rope and hang from a short wire.
    LIGHT_T.forEach((t, i) => {
      const p = bez(s, t);
      wires += `M${f1(p.x)} ${f1(p.y)}v3.4`;
      lights.push({ x: p.x, y: p.y + 6, phase: PHASES[(i + lights.length) % 3] });
    });

    // Berry cluster at the lowest point of the swag.
    const low = bez(s, 0.5);
    for (const [ox, oy] of [[-3.4, 2.6], [3.4, 2.6], [0, 5.2]] as const) {
      const cx = low.x + ox;
      const cy = low.y + oy;
      berries += `M${f1(cx - 1.8)} ${f1(cy)}a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0-3.6 0`;
    }
  });

  return {
    rope,
    dark,
    light,
    wires,
    berries,
    lightGroups: PHASES.map((phase) => ({ phase, items: lights.filter((l) => l.phase === phase) })),
  };
}

const GARLAND = buildGarland();

const ORNAMENTS = [
  { x: 0, tone: "gold" },
  { x: 180, tone: "burgundy" },
] as const;

const TILES = Array.from({ length: TILE_COUNT }, (_, i) => i);

const ART_ID = "cd-garland-art";

/**
 * The static artwork (rope, needles, berries, wires, ornaments) is defined once
 * and stamped into every tile with <use>. That keeps the HTML about 12x smaller
 * than repeating the paths. The twinkling lights stay real elements per tile,
 * so their CSS animation is reliable in every browser.
 */
function GarlandArt() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} focusable="false" aria-hidden="true">
      <defs>
        <g id={ART_ID}>
          <path className="cd-rope" d={GARLAND.rope} />
          <path className="cd-needles cd-needles--dark" d={GARLAND.dark} />
          <path className="cd-needles cd-needles--light" d={GARLAND.light} />
          <path className="cd-berries" d={GARLAND.berries} />
          <path className="cd-wire" d={GARLAND.wires} />
          {ORNAMENTS.map((o) => (
            <g key={o.x} className={`cd-orn cd-orn--${o.tone}`}>
              <path className="cd-orn-wire" d={`M${o.x} 8v7`} fill="none" />
              <rect className="cd-orn-cap" x={o.x - 2.3} y="14.4" width="4.6" height="3.2" rx="1" />
              <circle className="cd-orn-body" cx={o.x} cy="22.6" r="5.8" />
              <ellipse
                className="cd-orn-shine"
                cx={o.x - 2}
                cy="20.4"
                rx="1.7"
                ry="1"
                transform={`rotate(-35 ${o.x - 2} 20.4)`}
              />
            </g>
          ))}
        </g>
      </defs>
    </svg>
  );
}

function GarlandTile() {
  return (
    <svg
      className="cd-garland__tile"
      viewBox={`0 0 ${TILE_W} ${TILE_H}`}
      preserveAspectRatio="xMinYMid meet"
      focusable="false"
      aria-hidden="true"
    >
      <use href={`#${ART_ID}`} />
      {GARLAND.lightGroups.map((g) => (
        <g key={g.phase} className={`cd-light cd-light--${g.phase}`}>
          {g.items.map((l) => (
            <circle key={`${f1(l.x)}-${f1(l.y)}`} className="cd-bulb" cx={f1(l.x)} cy={f1(l.y)} r="2.7" />
          ))}
        </g>
      ))}
    </svg>
  );
}

export function CheckoutGarland() {
  return (
    <div className="cd-garland" aria-hidden="true">
      <GarlandArt />
      <div className="cd-garland__track">
        {TILES.map((i) => (
          <GarlandTile key={i} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Steps (bauble ornaments on a gold thread)                                  */
/* ------------------------------------------------------------------------ */

const STEPS = [
  { n: 1 as const, label: "Duomenys" },
  { n: 2 as const, label: "Mokėjimas" },
  { n: 3 as const, label: "Patvirtinimas" },
];

function Bauble({ n, done, active }: { n: number; done: boolean; active: boolean }) {
  return (
    <span className={`cd-bauble${done ? " is-done" : ""}${active ? " is-current" : ""}`} aria-hidden="true">
      <svg className="cd-bauble__svg" viewBox="0 -3 32 41" focusable="false">
        <path className="cd-b-hook" d="M13.6 1.2C13.6-1.6 18.4-1.6 18.4 1.2" />
        <rect className="cd-b-cap" x="12" y="0.6" width="8" height="5.2" rx="1.6" />
        <circle className="cd-b-body" cx="16" cy="22" r="14.2" />
        <ellipse className="cd-b-shine" cx="10.5" cy="15.5" rx="4.2" ry="2.6" transform="rotate(-32 10.5 15.5)" />
      </svg>
      {done ? (
        <svg className="cd-bauble__check" viewBox="0 0 16 16" focusable="false">
          <path d="M3 8.5l3.4 3.3L13 4.8" />
        </svg>
      ) : (
        <span className="cd-bauble__num cd-num">{n}</span>
      )}
    </span>
  );
}

export function CheckoutSteps({
  current,
  onPick,
}: {
  current: 1 | 2 | 3;
  onPick?: (step: 1 | 2) => void;
}) {
  return (
    <ol className="cd-steps" aria-label="Apmokėjimo eiga">
      {STEPS.map((step, index) => {
        const done = step.n < current;
        const active = step.n === current;
        const inner = (
          <>
            <Bauble n={step.n} done={done} active={active} />
            <span className="cd-step__label">
              <span className="cd-sr-only">{active ? "Dabartinis žingsnis: " : done ? "Atlikta: " : ""}</span>
              {step.label}
            </span>
          </>
        );
        return (
          <li
            key={step.n}
            className={`cd-step${active ? " is-active" : ""}${done ? " is-done" : ""}`}
            aria-current={active ? "step" : undefined}
          >
            {index > 0 ? <span className={`cd-thread${step.n <= current ? " is-done" : ""}`} aria-hidden="true" /> : null}
            {onPick && step.n < 3 ? (
              <button type="button" className="cd-step__btn" onClick={() => onPick(step.n as 1 | 2)}>
                {inner}
              </button>
            ) : (
              <span className="cd-step__static">{inner}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Scroll-spy for the stepper. <CheckoutSteps> only *displays* the `current`
 * value it is given, so if the page always passes 1 it stays on step 1 forever.
 * Use this hook to drive it:
 *
 *   const { current, goTo } = useCheckoutStep();
 *   <CheckoutSteps current={current} onPick={goTo} />
 *
 * The page needs two elements with these ids (or pass your own ids):
 *   <section id="checkout-details"> contact + address </section>
 *   <section id="checkout-payment"> payment </section>
 *
 * Step 2 becomes active once the payment section's top edge climbs above
 * `trigger` (fraction of the viewport height), or when the user reaches the
 * bottom of a scrollable page. Clicking a step scrolls there (below a sticky
 * header, thanks to `offset`) and locks the highlight so it doesn't flicker
 * while the smooth scroll is running.
 */
export function useCheckoutStep({
  detailsId = "checkout-details",
  paymentId = "checkout-payment",
  offset = 96,
  trigger = 0.55,
}: { detailsId?: string; paymentId?: string; offset?: number; trigger?: number } = {}) {
  const [current, setCurrent] = useState<1 | 2>(1);
  const lockUntil = useRef(0);

  useEffect(() => {
    let raf = 0;
    const compute = () => {
      raf = 0;
      if (performance.now() < lockUntil.current) return;
      const pay = document.getElementById(paymentId);
      if (!pay) return;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight > window.innerHeight + 8;
      const atBottom = scrollable && window.innerHeight + window.scrollY >= doc.scrollHeight - 4;
      const passed = pay.getBoundingClientRect().top <= window.innerHeight * trigger;
      setCurrent(passed || atBottom ? 2 : 1);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [paymentId, trigger]);

  const goTo = useCallback(
    (step: 1 | 2) => {
      const el = document.getElementById(step === 1 ? detailsId : paymentId);
      if (!el) return;
      lockUntil.current = performance.now() + 900;
      setCurrent(step);
      const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - offset);
      const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top, behavior: calm ? "auto" : "smooth" });
      // Once the lock expires, re-sync with wherever the scroll ended up.
      window.setTimeout(() => window.dispatchEvent(new Event("scroll")), 950);
    },
    [detailsId, paymentId, offset],
  );

  return { current, goTo };
}

/* ------------------------------------------------------------------------ */
/* Ornament divider (six-point snowflake between two fading hairlines)        */
/* ------------------------------------------------------------------------ */

function snowflakePath() {
  let d = "";
  for (let k = 0; k < 6; k++) {
    const a = ((-90 + k * 60) * Math.PI) / 180;
    const ux = Math.cos(a);
    const uy = Math.sin(a);
    d += `M8 8L${f2(8 + ux * 6.6)} ${f2(8 + uy * 6.6)}`;
    const bx = 8 + ux * 4.2;
    const by = 8 + uy * 4.2;
    for (const s of [-1, 1]) {
      const b = a + s * 0.87; // ~50deg either side of the arm
      d += `M${f2(bx)} ${f2(by)}L${f2(bx + Math.cos(b) * 2.4)} ${f2(by + Math.sin(b) * 2.4)}`;
    }
  }
  return d;
}

const SNOWFLAKE_D = snowflakePath();

export function OrnamentDivider() {
  return (
    <div className="cd-divider" aria-hidden="true">
      <span className="cd-divider__line cd-divider__line--l" />
      <svg className="cd-divider__flake" viewBox="0 0 16 16" focusable="false">
        <path d={SNOWFLAKE_D} fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        <circle cx="8" cy="8" r="1" fill="currentColor" />
      </svg>
      <span className="cd-divider__line cd-divider__line--r" />
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Ribbon bow for the corner of the order-summary card                        */
/* ------------------------------------------------------------------------ */

const BOW_LOOP = "M34 25C30 10 16 3 8 8C1 13 6 26 34 27Z";
const BOW_LOOP_IN = "M34 25.4C27 15 18 11.5 12.5 14C9.5 16.5 14 24 34 26.6Z";
const BOW_EDGE = "M33 24C29 12 17 5.5 9.5 9.6";
const BOW_TAIL = "M32.6 26.5C30.5 36 25 46 17.5 55L23.6 52.4L26.6 58C31 48 36 38 37.6 28Z";

export function SummaryRibbon() {
  return (
    <svg className="cd-bow" viewBox="0 0 72 60" focusable="false" aria-hidden="true">
      <g className="cd-bow-tails">
        <path className="cd-bow-tail" d={BOW_TAIL} />
        <path className="cd-bow-tail" d={BOW_TAIL} transform="translate(72 0) scale(-1 1)" />
      </g>
      <g>
        <path className="cd-bow-loop" d={BOW_LOOP} />
        <path className="cd-bow-loop-in" d={BOW_LOOP_IN} />
        <path className="cd-bow-edge" d={BOW_EDGE} />
      </g>
      <g transform="translate(72 0) scale(-1 1)">
        <path className="cd-bow-loop" d={BOW_LOOP} />
        <path className="cd-bow-loop-in" d={BOW_LOOP_IN} />
        <path className="cd-bow-edge" d={BOW_EDGE} />
      </g>
      <rect className="cd-bow-knot" x="30" y="20" width="12" height="12" rx="4" />
      <ellipse className="cd-bow-shine" cx="34" cy="23.6" rx="2.4" ry="1.4" />
    </svg>
  );
}

/* ------------------------------------------------------------------------ */
/* Edge branches + soft lights (viewport edges, wide screens only)            */
/* ------------------------------------------------------------------------ */

function buildBranch() {
  const rand = rng(21);
  const stem: readonly Pt[] = [[14, 0], [34, 58], [50, 132], [74, 226]];
  let needles = "";
  const N = 22;
  for (let i = 0; i < N; i++) {
    const t = 0.05 + (i / (N - 1)) * 0.92;
    const p = bez(stem, t);
    const base = 24 * (1 - t) + 8 * t;
    for (const side of [1, -1]) {
      const a = side * (0.9 + rand() * 0.35);
      const { dx, dy } = rot(p.tx, p.ty, a);
      const len = base + rand() * 4;
      needles += `M${f1(p.x)} ${f1(p.y)}l${f1(dx * len)} ${f1(dy * len + len * 0.3)}`;
      const a2 = side * (0.4 + rand() * 0.25);
      const { dx: ex, dy: ey } = rot(p.tx, p.ty, a2);
      const l2 = len * 0.6;
      needles += `M${f1(p.x)} ${f1(p.y)}l${f1(ex * l2)} ${f1(ey * l2 + l2 * 0.25)}`;
    }
  }
  return { stemD: `M14 0C34 58 50 132 74 226`, needles };
}

const BRANCH = buildBranch();

function Branch({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 120 232" focusable="false">
      <path d={BRANCH.stemD} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d={BRANCH.needles} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function EdgePines() {
  return (
    <div className="cd-edge" aria-hidden="true">
      <Branch className="cd-edge__branch cd-edge__branch--l" />
      <Branch className="cd-edge__branch cd-edge__branch--r" />
      <span className="cd-edge__glow cd-edge__glow--1" />
      <span className="cd-edge__glow cd-edge__glow--2" />
      <span className="cd-edge__glow cd-edge__glow--3" />
      <span className="cd-edge__glow cd-edge__glow--4" />
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Free-delivery progress (sleigh rides along a gold rail)                    */
/* ------------------------------------------------------------------------ */

export function FreeDeliverySleigh({
  subtotalCents,
  shippingFree,
  giftUnlocksShipping,
}: {
  subtotalCents: number;
  shippingFree: boolean;
  giftUnlocksShipping: boolean;
}) {
  const threshold = store.shipping.freeThresholdCents;
  // Nothing sensible to show without a positive threshold (avoids NaN widths).
  if (!(threshold > 0)) return null;
  if (!shippingFree && giftUnlocksShipping) return null;

  const reached = shippingFree || subtotalCents >= threshold;
  const progress = reached ? 1 : Math.min(1, Math.max(0, subtotalCents / threshold));
  const left = Math.max(0, threshold - subtotalCents);
  const label = reached
    ? "Nemokamas pristatymas atrakintas"
    : `Iki nemokamo pristatymo liko ${formatPrice(left)}`;

  return (
    <div className={`cd-sleigh${reached ? " is-reached" : ""}`}>
      <p className="cd-sleigh__label">
        {reached ? (
          <>
            <svg className="cd-sleigh__check" viewBox="0 0 16 16" focusable="false" aria-hidden="true">
              <path
                d="M3 8.5l3.4 3.3L13 4.8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {label}
          </>
        ) : (
          <span>
            Iki nemokamo pristatymo liko <strong className="cd-num">{formatPrice(left)}</strong>
          </span>
        )}
      </p>
      <div
        className="cd-sleigh__track"
        style={{ "--cd-p": progress.toFixed(4) } as CSSProperties}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={threshold}
        aria-valuenow={Math.min(subtotalCents, threshold)}
        aria-valuetext={label}
      >
        <span className="cd-sleigh__rail" />
        <span className="cd-sleigh__fill" />
        <svg className="cd-sleigh__icon" viewBox="0 0 44 26" focusable="false" aria-hidden="true">
          <path className="cd-sl-runner" d="M4 23H32C37.5 23 41 20.5 41.5 15.5" />
          <path className="cd-sl-post" d="M12 22.5V16.6M29 22.5V16.6" />
          <path
            className="cd-sl-body"
            d="M5 5C5.5 10 7.5 16.5 14 16.5H32C37 16.5 40 12.5 41.5 7.5C39 9 37 10 33.5 10H15C11 10 9 8.5 5 5Z"
          />
          <path className="cd-sl-trim" d="M10.5 13.6C11.8 14.6 13 14.8 14.5 14.8H31.5" />
          <rect className="cd-sl-gift" x="18" y="4.2" width="7.2" height="5.8" rx="0.9" />
          <path className="cd-sl-ribbon" d="M21.6 4.2V10M18 7.1H25.2" />
          <path className="cd-sl-trim" d="M21.6 4.2C20.2 1.8 18.6 2.8 19.4 4.2M21.6 4.2C23 1.8 24.6 2.8 23.8 4.2" />
        </svg>
      </div>
    </div>
  );
}
