import type { CSSProperties } from "react";

const SWAGS = 5;
const BULBS_PER_SWAG = 6;
const TOP = 0.6;
const SAG = 7.6;

// Lemputės ant parabolės: y = 4 · sag · t(1 − t). Kvadratinė Bezier kreivė su
// valdymo tašku 2 · sag tiksliai sutampa su ta pačia parabole.
const bulbs = Array.from({ length: SWAGS }, (_, swag) =>
  Array.from({ length: BULBS_PER_SWAG }, (_, j) => {
    const t = (j + 1) / (BULBS_PER_SWAG + 1);
    return {
      x: ((swag + t) / SWAGS) * 100,
      y: ((TOP + 4 * SAG * t * (1 - t)) / 10) * 100,
      delay: ((swag * 7 + j * 5) % 11) * 0.37,
    };
  })
).flat();

const wire = Array.from({ length: SWAGS }, (_, swag) => {
  const x0 = (swag / SWAGS) * 100;
  const x1 = ((swag + 1) / SWAGS) * 100;
  return `M${x0} ${TOP}Q${(x0 + x1) / 2} ${TOP + 2 * SAG} ${x1} ${TOP}`;
}).join("");

// Šiltų lempučių girlianda, kabanti nuo hero viršaus.
export function HeroGarland() {
  return (
    <div aria-hidden className="hero-garland">
      <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="hero-garland-wire">
        <path d={wire} vectorEffect="non-scaling-stroke" />
      </svg>
      {bulbs.map((b, i) => (
        <span
          key={i}
          className="hero-bulb"
          style={{ left: `${b.x}%`, top: `${b.y}%`, "--d": `${b.delay}s` } as CSSProperties}
        />
      ))}
    </div>
  );
}
