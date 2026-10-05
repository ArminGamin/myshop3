import type { CSSProperties } from "react";
import { Gift } from "lucide-react";
import { campaign, store } from "@/lib/config/store.config";

const RING_TEXT = `${store.brand.name} ✦ ${campaign.heroEyebrow} ✦ `;
const FLAKES = 36;

// Deterministinis „atsitiktinumas", kad serverio ir naršyklės HTML sutaptų.
function rand(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const flakes = Array.from({ length: FLAKES }, (_, i) => {
  const near = rand(i + 7) > 0.78;
  return {
    "--x": `${(rand(i + 1) * 100).toFixed(2)}%`,
    "--s": `${(near ? 4 + rand(i + 3) * 3 : 1.5 + rand(i + 3) * 2.2).toFixed(2)}px`,
    "--o": (near ? 0.55 + rand(i + 5) * 0.3 : 0.25 + rand(i + 5) * 0.4).toFixed(2),
    "--d": `${(near ? 5 + rand(i + 9) * 3 : 8 + rand(i + 9) * 6).toFixed(2)}s`,
    "--delay": `${(-rand(i + 11) * 12).toFixed(2)}s`,
    "--drift": `${((rand(i + 13) - 0.5) * 90).toFixed(1)}px`,
  } as CSSProperties;
});

// Įėjimo užuolaida kaip supakuota dovana: snaigės, auksiniai kaspinai ir
// raidė po raidės išnyrantis pavadinimas. Kaspinai perskiriami su panelėmis.
export function IntroStatic() {
  const letters = Array.from(store.brand.name);

  return (
    <div id="intro-static" className="intro-curtain intro-curtain-static" aria-hidden suppressHydrationWarning>
      <div className="intro-panel intro-panel-top" />
      <div className="intro-panel intro-panel-bottom" />
      <div className="intro-center">
        <div className="intro-snow">
          {flakes.map((style, i) => (
            <span key={i} style={style} />
          ))}
        </div>
        <div className="intro-vignette" />
        <div className="intro-glow" />
        <div className="intro-seal">
          <svg viewBox="0 0 120 120" className="intro-seal-ring">
            <defs>
              <path id="intro-ring-path" d="M60 60m-49 0a49 49 0 1 1 98 0a49 49 0 1 1-98 0" />
            </defs>
            <text>
              <textPath href="#intro-ring-path" textLength={306} lengthAdjust="spacing">
                {RING_TEXT.toUpperCase()}
              </textPath>
            </text>
          </svg>
          <span className="intro-seal-core">
            <Gift className="size-8" strokeWidth={1.4} />
          </span>
        </div>
        <div className="intro-tag">
          <p className="intro-mark intro-mark-static">
            {letters.map((letter, i) => (
              <span key={i} className="intro-letter" style={{ "--i": i } as CSSProperties}>
                {letter === " " ? " " : letter}
              </span>
            ))}
          </p>
          <p className="intro-tagline">{store.brand.tagline}</p>
          <span className="intro-progress">
            <span />
          </span>
        </div>
      </div>
    </div>
  );
}
