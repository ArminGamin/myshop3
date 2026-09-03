"use client";

import { useEffect, useRef } from "react";

type Flake = {
  x: number;
  y: number;
  r: number;
  speed: number;
  sway: number;
  phase: number;
  alpha: number;
};

export function Snowfall() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = ref.current;
    if (!canvasEl) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) return;

    const context = canvasEl.getContext("2d", { alpha: true, desynchronized: true });
    if (!context) return;

    const canvas = canvasEl;
    const ctx = context;
    const lowPower = (navigator.hardwareConcurrency ?? 8) <= 4;

    let width = 0;
    let height = 0;
    let flakes: Flake[] = [];
    let frame = 0;
    let raf = 0;
    let active = false;
    let fade = 0;

    function countForWidth(w: number) {
      if (w < 640) return lowPower ? 12 : 16;
      if (w < 1024) return lowPower ? 22 : 28;
      return lowPower ? 32 : 40;
    }

    function seed(w: number, h: number) {
      const n = countForWidth(w);
      flakes = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.8,
        speed: 0.18 + Math.random() * 0.55,
        sway: 8 + Math.random() * 16,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.12 + Math.random() * 0.13,
      }));
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1 : 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed(width, height);
    }

    function shouldRun() {
      return (
        document.documentElement.dataset.motionReady === "1" &&
        !document.documentElement.dataset.intro &&
        !document.documentElement.dataset.veil &&
        document.visibilityState === "visible"
      );
    }

    function draw() {
      const running = shouldRun();
      if (running) {
        active = true;
        fade = Math.min(1, fade + 0.02);
      } else if (active) {
        fade = Math.max(0, fade - 0.04);
        if (fade <= 0) active = false;
      }

      if (active) {
        frame += 1;
        ctx.clearRect(0, 0, width, height);

        for (const flake of flakes) {
          if (running) {
            flake.y += flake.speed;
            flake.x += Math.sin(frame * 0.008 + flake.phase) * (flake.sway * 0.012);
            if (flake.y > height + 8) {
              flake.y = -8;
              flake.x = Math.random() * width;
            }
            if (flake.x < -10) flake.x = width + 10;
            if (flake.x > width + 10) flake.x = -10;
          }

          const depth = 0.55 + 0.45 * (1 - flake.y / height);
          ctx.fillStyle = `rgba(255, 252, 246, ${flake.alpha * depth * fade})`;
          if (flake.r < 1.15) {
            ctx.fillRect(flake.x, flake.y, flake.r * 2, flake.r * 2);
          } else {
            ctx.beginPath();
            ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        raf = window.requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      raf = 0;
    }

    function ensureLoop() {
      if (!raf) raf = window.requestAnimationFrame(draw);
    }

    resize();
    ensureLoop();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("motion-ready", ensureLoop);
    document.addEventListener("visibilitychange", ensureLoop);

    const veilObserver = new MutationObserver(ensureLoop);
    veilObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-veil", "data-intro", "data-motion-ready"],
    });

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("motion-ready", ensureLoop);
      document.removeEventListener("visibilitychange", ensureLoop);
      veilObserver.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="snowfall" aria-hidden />;
}
