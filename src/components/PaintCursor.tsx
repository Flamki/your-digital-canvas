import { useEffect, useRef } from "react";

/**
 * Paint-stroke cursor trail. A canvas overlays the page and paints
 * soft, fading brush strokes that follow the mouse. Pointer events pass through.
 */
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
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    let lastX = width / 2;
    let lastY = height / 2;
    let hue = 260; // start violet-ish
    let hasMoved = false;

    const onMove = (e: MouseEvent) => {
      if (!hasMoved) {
        lastX = e.clientX;
        lastY = e.clientY;
        hasMoved = true;
      }
      const x = e.clientX;
      const y = e.clientY;
      const dx = x - lastX;
      const dy = y - lastY;
      const dist = Math.hypot(dx, dy);

      hue = (hue + 1.2) % 360;

      // main stroke
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = `hsla(${hue}, 90%, 65%, 0.55)`;
      ctx.lineWidth = Math.max(2, 14 - dist * 0.25);
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();

      // glow layer
      ctx.strokeStyle = `hsla(${(hue + 40) % 360}, 100%, 75%, 0.18)`;
      ctx.lineWidth = Math.max(6, 22 - dist * 0.3);
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();

      lastX = x;
      lastY = y;
    };

    // Fade the canvas each frame → paint slowly dissolves
    let raf = 0;
    const fade = () => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.045)";
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(fade);
    };
    raf = requestAnimationFrame(fade);

    window.addEventListener("mousemove", onMove);
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
      className="pointer-events-none fixed inset-0 z-[60] mix-blend-screen"
    />
  );
}
