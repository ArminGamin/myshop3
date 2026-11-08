"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";

// Advento kalendorių skirtukai: visi skydeliai sugeneruoti serveryje (matomi paieškai),
// čia tik perjungiamas matomas.
export function AdventTabs({
  tabs,
  panels,
}: {
  tabs: { id: string; label: string; count: number }[];
  panels: ReactNode[];
}) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (active + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    setActive(next);
    refs.current[next]?.focus();
  }

  return (
    <div>
      <div role="tablist" aria-label="Advento kalendoriai pagal gavėją" className="advent-tabs" onKeyDown={onKey}>
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`advent-tab-${tab.id}`}
            aria-selected={i === active}
            aria-controls={`advent-panel-${tab.id}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className="advent-tab"
          >
            {tab.label}
            <span className="advent-tab-count">{tab.count}</span>
          </button>
        ))}
      </div>
      {panels.map((panel, i) => (
        <div
          key={tabs[i].id}
          role="tabpanel"
          id={`advent-panel-${tabs[i].id}`}
          aria-labelledby={`advent-tab-${tabs[i].id}`}
          hidden={i !== active}
          className="advent-panel-wrap"
        >
          {panel}
        </div>
      ))}
    </div>
  );
}
