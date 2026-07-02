import { useEffect, useRef } from "react";

type PaintMark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  maxLife: number;
  color: string;
  alpha: number;
  rotation: number;
  stretch: number;
  shape: number[];
  kind: "blob" | "drop" | "streak" | "ring";
};

type Pointer = {
  x: number;
  y: number;
};

const PALETTE = [
  "245 79% 60%",
  "198 92% 52%",
  "151 78% 44%",
  "36 95% 55%",
  "338 82% 58%",
];

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

const makeShape = (points = 18) =>
  Array.from({ length: points }, (_, i) => {
    const wave = Math.sin(i * 1.7 + Math.random() * 0.8) * 0.14;
    return randomBetween(0.76, 1.24) + wave;
  });

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const drawIrregularBlob = (ctx: CanvasRenderingContext2D, mark: PaintMark, progress: number) => {
  const radius = mark.radius * (1 + easeOut(progress) * 0.48);
  const alpha = mark.alpha * Math.pow(1 - progress, 1.25);
  if (alpha <= 0.01) return;

  ctx.save();
  ctx.translate(mark.x, mark.y);
  ctx.rotate(mark.rotation);
  ctx.scale(mark.stretch, 1);
  ctx.beginPath();

  mark.shape.forEach((multiplier, index) => {
    const angle = (Math.PI * 2 * index) / mark.shape.length;
    const r = radius * multiplier;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (index === 0) ctx.moveTo(x, y);
    else {
      const prevAngle = (Math.PI * 2 * (index - 0.5)) / mark.shape.length;
      const cpRadius = radius * 1.04;
      ctx.quadraticCurveTo(Math.cos(prevAngle) * cpRadius, Math.sin(prevAngle) * cpRadius, x, y);
    }
  });

  ctx.closePath();
  ctx.fillStyle = `hsl(${mark.color} / ${alpha})`;
  ctx.fill();
  ctx.lineWidth = Math.max(0.7, radius * 0.045);
  ctx.strokeStyle = `hsl(${mark.color} / ${alpha * 0.45})`;
  ctx.stroke();
  ctx.restore();
};

const drawRing = (ctx: CanvasRenderingContext2D, mark: PaintMark, progress: number) => {
  const radius = mark.radius * (0.45 + progress * 2.1);
  const alpha = mark.alpha * Math.pow(1 - progress, 1.8);
  if (alpha <= 0.01) return;
  ctx.beginPath();
  ctx.arc(mark.x, mark.y, radius, 0, Math.PI * 2);
  ctx.lineWidth = Math.max(1, mark.radius * (0.18 - progress * 0.08));
  ctx.strokeStyle = `hsl(${mark.color} / ${alpha})`;
  ctx.stroke();
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

    const marks: PaintMark[] = [];
    const MAX_MARKS = 340;
    let pointer: Pointer = { x: width / 2, y: height / 2 };
    let lastPointer: Pointer = { ...pointer };
    let lastMove = performance.now();

    const pushMark = (mark: PaintMark) => {
      marks.push(mark);
      while (marks.length > MAX_MARKS) marks.shift();
    };

    const spawnPaint = (x: number, y: number, dx: number, dy: number, speed: number) => {
      const direction = Math.atan2(dy || 0.01, dx || 0.01);
      const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      const force = Math.min(1, speed / 42);

      pushMark({
        x: x + randomBetween(-2, 2),
        y: y + randomBetween(-2, 2),
        vx: dx * 0.008,
        vy: dy * 0.008,
        radius: randomBetween(12, 24) + force * 13,
        life: 0,
        maxLife: randomBetween(850, 1450),
        color,
        alpha: 0.34,
        rotation: direction + randomBetween(-0.5, 0.5),
        stretch: randomBetween(0.82, 1.2) + force * 0.45,
        shape: makeShape(20),
        kind: "blob",
      });

      if (Math.random() < 0.34 + force * 0.5) {
        pushMark({
          x,
          y,
          vx: 0,
          vy: 0,
          radius: randomBetween(18, 34) + force * 20,
          life: 0,
          maxLife: randomBetween(360, 620),
          color,
          alpha: 0.22,
          rotation: 0,
          stretch: 1,
          shape: makeShape(14),
          kind: "ring",
        });
      }

      const drops = 7 + Math.floor(force * 24);
      for (let i = 0; i < drops; i++) {
        const mostlyBackward = direction + Math.PI + randomBetween(-1.2, 1.2);
        const wild = randomBetween(0, Math.PI * 2);
        const angle = Math.random() < 0.72 ? mostlyBackward : wild;
        const distance = randomBetween(5, 20 + force * 58);
        const size = randomBetween(2.4, 8.5) * (1 + force * 0.55);
        const velocity = randomBetween(0.12, 1.35 + force * 1.8);

        pushMark({
          x: x + Math.cos(angle) * distance + randomBetween(-4, 4),
          y: y + Math.sin(angle) * distance + randomBetween(-4, 4),
          vx: Math.cos(angle) * velocity + dx * 0.01,
          vy: Math.sin(angle) * velocity + dy * 0.01,
          radius: size,
          life: 0,
          maxLife: randomBetween(620, 1200),
          color: Math.random() < 0.7 ? color : PALETTE[Math.floor(Math.random() * PALETTE.length)],
          alpha: randomBetween(0.28, 0.5),
          rotation: angle,
          stretch: randomBetween(0.75, 1.45),
          shape: makeShape(12),
          kind: Math.random() < 0.18 ? "streak" : "drop",
        });
      }

      if (speed > 8) {
        for (let i = 0; i < 3; i++) {
          pushMark({
            x: x - dx * randomBetween(0.05, 0.38) + randomBetween(-7, 7),
            y: y - dy * randomBetween(0.05, 0.38) + randomBetween(-7, 7),
            vx: dx * 0.012,
            vy: dy * 0.012,
            radius: randomBetween(7, 16) + force * 8,
            life: 0,
            maxLife: randomBetween(560, 980),
            color,
            alpha: 0.3,
            rotation: direction,
            stretch: randomBetween(1.9, 3.7),
            shape: makeShape(16),
            kind: "streak",
          });
        }
      }
    };

    const handlePoint = (x: number, y: number) => {
      const now = performance.now();
      const dx = x - lastPointer.x;
      const dy = y - lastPointer.y;
      const distance = Math.hypot(dx, dy);
      const speed = distance / Math.max(12, now - lastMove) * 16.67;
      const steps = Math.max(1, Math.ceil(distance / 18));

      for (let i = 1; i <= steps; i++) {
        const k = i / steps;
        spawnPaint(lastPointer.x + dx * k, lastPointer.y + dy * k, dx, dy, speed);
      }

      pointer = { x, y };
      lastPointer = { x, y };
      lastMove = now;
    };

    const onMove = (event: MouseEvent) => handlePoint(event.clientX, event.clientY);
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) handlePoint(touch.clientX, touch.clientY);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(40, now - last);
      last = now;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";

      if (now - lastMove > 260 && Math.random() < 0.035) {
        spawnPaint(pointer.x + randomBetween(-5, 5), pointer.y + randomBetween(-5, 5), randomBetween(-1, 1), randomBetween(-1, 1), 2);
      }

      for (let i = marks.length - 1; i >= 0; i--) {
        const mark = marks[i];
        mark.life += dt;
        if (mark.life > mark.maxLife) {
          marks.splice(i, 1);
          continue;
        }

        const progress = mark.life / mark.maxLife;
        mark.x += mark.vx * (dt / 16.67);
        mark.y += mark.vy * (dt / 16.67);
        mark.vx *= 0.982;
        mark.vy = mark.vy * 0.982 + (mark.kind === "drop" ? 0.018 : 0.006);

        if (mark.kind === "ring") drawRing(ctx, mark, progress);
        else drawIrregularBlob(ctx, mark, progress);
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouchMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30"
      style={{
        filter: "saturate(1.18) contrast(1.05)",
        mixBlendMode: "multiply",
      }}
    />
  );
}
