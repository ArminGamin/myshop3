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

    const context = canvasEl.getContext("2d", { alpha: true });
    if (!context) return;

    const canvas = canvasEl;
    const ctx = context;

    let width = 0;
    let height = 0;
    let flakes: Flake[] = [];
    let frame = 0;
    let raf = 0;

    function countForWidth(w: number) {
      if (w < 640) return 36;
      if (w < 1024) return 64;
      return 96;
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
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed(width, height);
    }

    function draw() {
      frame += 1;
      ctx.clearRect(0, 0, width, height);

      for (const flake of flakes) {
        flake.y += flake.speed;
        flake.x += Math.sin(frame * 0.008 + flake.phase) * (flake.sway * 0.012);
        if (flake.y > height + 8) {
          flake.y = -8;
          flake.x = Math.random() * width;
        }
        if (flake.x < -10) flake.x = width + 10;
        if (flake.x > width + 10) flake.x = -10;

        const fade = 0.55 + 0.45 * (1 - flake.y / height);
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 252, 246, ${flake.alpha * fade})`;
        ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = window.requestAnimationFrame(draw);
    }

    resize();
    raf = window.requestAnimationFrame(draw);
    window.addEventListener("resize", resize, { passive: true });
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="snowfall" aria-hidden />;
}
