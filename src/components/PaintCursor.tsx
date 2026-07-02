import { useEffect, useRef } from "react";

/**
 * Marbled paint cursor. Emits a swarm of colored particles from the pointer
 * that flow through a curl-noise-like velocity field, leaving thin swirling
 * streaks. Heavy canvas blur + saturate turns the streaks into a smooth
 * fluid-paint film that spreads and marbles like the reference image.
 */
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  hue: number;
  size: number;
};

export function PaintCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
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

    // Pointer state
    let mx = width / 2;
    let my = height / 2;
    let pmx = mx;
    let pmy = my;
    let hasMoved = false;
    let ambientT = Math.random() * 1000;
    let hueBase = Math.random() * 360;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      hasMoved = true;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener(
      "touchmove",
      (e) => {
        const t = e.touches[0];
        if (!t) return;
        mx = t.clientX;
        my = t.clientY;
        hasMoved = true;
      },
      { passive: true },
    );

    const particles: Particle[] = [];
    const MAX = 900;

    // Pseudo curl-noise field: gives smooth swirling flow directions.
    const flow = (x: number, y: number, t: number) => {
      const s = 0.0025;
      const a =
        Math.sin(x * s + t * 0.6) +
        Math.cos(y * s * 1.3 - t * 0.4) +
        Math.sin((x + y) * s * 0.7 + t * 0.2);
      return a * Math.PI; // angle
    };

    const spawn = (x: number, y: number, dirX: number, dirY: number, speed: number) => {
      const count = 3 + Math.min(8, Math.floor(speed * 0.4));
      for (let i = 0; i < count; i++) {
        const spread = (Math.random() - 0.5) * 1.2;
        const ang = Math.atan2(dirY, dirX) + spread;
        const sp = 0.6 + Math.random() * (1.4 + speed * 0.15);
        particles.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          life: 0,
          maxLife: 180 + Math.random() * 180,
          hue: (hueBase + Math.random() * 80 - 40 + 360) % 360,
          size: 1.2 + Math.random() * 2.4,
        });
        if (particles.length > MAX) particles.shift();
      }
    };

    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(40, now - last);
      last = now;
      const t = now * 0.001;

      // Very slow fade so paint pools and swirls remain visible.
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.018)";
      ctx.fillRect(0, 0, width, height);

      // Additive blending → luminous marbled paint.
      ctx.globalCompositeOperation = "lighter";

      // Ambient pointer drift so paint exists before user moves.
      let tx = mx;
      let ty = my;
      if (!hasMoved) {
        ambientT += 0.006;
        tx = width * (0.5 + 0.32 * Math.sin(ambientT * 1.1));
        ty = height * (0.5 + 0.28 * Math.cos(ambientT * 0.8));
      }

      const dx = tx - pmx;
      const dy = ty - pmy;
      const speed = Math.hypot(dx, dy);
      pmx += dx * 0.25;
      pmy += dy * 0.25;

      hueBase = (hueBase + 0.4 + speed * 0.05) % 360;

      // Emit particles along the pointer path.
      const emitSteps = Math.max(1, Math.floor(speed / 8));
      for (let i = 0; i < emitSteps; i++) {
        const k = i / emitSteps;
        spawn(pmx - dx * k * 0.5, pmy - dy * k * 0.5, dx || 0.001, dy || 0.001, speed);
      }
      // Always drip a little even when idle.
      if (speed < 1 && Math.random() < 0.6) {
        spawn(pmx, pmy, Math.cos(t), Math.sin(t), 1);
      }

      // Advance and draw particles.
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += dt;
        if (p.life > p.maxLife) {
          particles.splice(i, 1);
          continue;
        }
        const lifeK = p.life / p.maxLife;

        // Steer velocity by flow field → swirling tendrils.
        const ang = flow(p.x, p.y, t);
        p.vx += Math.cos(ang) * 0.14;
        p.vy += Math.sin(ang) * 0.14;
        // Mild damping to keep speeds bounded.
        p.vx *= 0.985;
        p.vy *= 0.985;

        const nx = p.x + p.vx;
        const ny = p.y + p.vy;

        const alpha = (1 - lifeK) * 0.55;
        const size = p.size * (1 + lifeK * 1.6);

        // Draw a short streak from previous → new position.
        const grad = ctx.createLinearGradient(p.x, p.y, nx, ny);
        grad.addColorStop(0, `hsla(${p.hue}, 95%, 65%, ${alpha})`);
        grad.addColorStop(1, `hsla(${(p.hue + 40) % 360}, 95%, 68%, 0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = size;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(nx, ny);
        ctx.stroke();

        p.x = nx;
        p.y = ny;
      }

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
        // Heavy blur + saturation turns particle streaks into a fluid,
        // marbled paint film that spreads and splashes.
        filter: "blur(14px) saturate(1.6) contrast(1.05)",
        mixBlendMode: "multiply",
      }}
    />
  );
}
