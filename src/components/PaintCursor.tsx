import { useEffect, useRef } from "react";

/**
 * Fluid paint cursor. Paints large, soft, saturated blooms that follow
 * the mouse, blend into each other, and slowly fade — a marbled/watercolor
 * effect similar to fluid-paint art. Pointer events pass through.
 */
export function PaintCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: false });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    // pointer state
    let lastX = width / 2;
    let lastY = height / 2;
    let curX = lastX;
    let curY = lastY;
    let hasMoved = false;
    let hue = Math.random() * 360;

    const onMove = (e: MouseEvent) => {
      curX = e.clientX;
      curY = e.clientY;
      if (!hasMoved) {
        lastX = curX;
        lastY = curY;
        hasMoved = true;
      }
    };
    window.addEventListener("mousemove", onMove);

    // Ambient wandering point so the page has paint before the user moves.
    let ambientT = 0;

    /**
     * Paint one bloom: a big soft radial-gradient circle in a rotating hue.
     * We stamp several offset blooms along the movement path so fast
     * movement still lays continuous paint.
     */
    const stamp = (x: number, y: number, radius: number, h: number, alpha: number) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
      g.addColorStop(0, `hsla(${h}, 95%, 70%, ${alpha})`);
      g.addColorStop(0.35, `hsla(${(h + 25) % 360}, 95%, 68%, ${alpha * 0.55})`);
      g.addColorStop(1, `hsla(${h}, 95%, 70%, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    let raf = 0;
    const loop = () => {
      // Very slow fade so paint pools and marbles.
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.012)";
      ctx.fillRect(0, 0, width, height);

      // Additive-ish blending for luminous, blending paint.
      ctx.globalCompositeOperation = "lighter";

      // If the user hasn't moved yet, drift an ambient point across the screen
      // so the paint effect is visible on load.
      if (!hasMoved) {
        ambientT += 0.004;
        curX = width * (0.5 + 0.35 * Math.sin(ambientT * 1.3));
        curY = height * (0.5 + 0.3 * Math.cos(ambientT * 0.9));
      }

      // Ease toward pointer for smooth, brush-like motion.
      const easedX = lastX + (curX - lastX) * 0.18;
      const easedY = lastY + (curY - lastY) * 0.18;
      const dx = easedX - lastX;
      const dy = easedY - lastY;
      const dist = Math.hypot(dx, dy);
      const steps = Math.max(1, Math.floor(dist / 4));

      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const x = lastX + dx * t;
        const y = lastY + dy * t;

        hue = (hue + 0.9) % 360;

        // main fat bloom
        const r = 55 + Math.sin((hue + i) * 0.05) * 12;
        stamp(x, y, r, hue, 0.09);

        // secondary offset blooms for marbled feel
        const swirl = (i + performance.now() * 0.002) * 0.6;
        stamp(
          x + Math.cos(swirl) * 18,
          y + Math.sin(swirl) * 18,
          r * 0.7,
          (hue + 60) % 360,
          0.07,
        );
        stamp(
          x + Math.cos(swirl + 2) * 26,
          y + Math.sin(swirl + 2) * 26,
          r * 0.55,
          (hue + 180) % 360,
          0.06,
        );

        // tiny bright core
        stamp(x, y, 10, (hue + 30) % 360, 0.18);
      }

      lastX = easedX;
      lastY = easedY;

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        // Soft blur turns the discrete circles into a smooth fluid film.
        filter: "blur(18px) saturate(1.4) contrast(1.05)",
        mixBlendMode: "multiply",
      }}
    />
  );
}
