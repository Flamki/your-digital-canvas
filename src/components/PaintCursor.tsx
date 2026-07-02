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
  kind: "blob" | "drop" | "streak" | "ring" | "star" | "square";
};

type Pointer = { x: number; y: number };

type Mode = {
  name: string;
  palette: string[];
  blend: GlobalCompositeOperation;
  mix: string;
  filter: string;
  bgFade: number; // 0 = clear, >0 = trail
  spawnRate: number;
  sizeMul: number;
  ringChance: number;
  streakChance: number;
  gravity: number;
  kinds: PaintMark["kind"][];
  shapePoints: number;
  wobble: number;
};

const MODES: Mode[] = [
  {
    name: "splatter",
    palette: ["245 79% 60%", "198 92% 52%", "151 78% 44%", "36 95% 55%", "338 82% 58%"],
    blend: "source-over",
    mix: "multiply",
    filter: "saturate(1.2) contrast(1.05)",
    bgFade: 0,
    spawnRate: 1,
    sizeMul: 1,
    ringChance: 0.34,
    streakChance: 0.18,
    gravity: 0.018,
    kinds: ["blob", "drop", "streak", "ring"],
    shapePoints: 20,
    wobble: 0.14,
  },
  {
    name: "neon-trail",
    palette: ["300 100% 65%", "180 100% 55%", "60 100% 60%", "270 100% 68%"],
    blend: "lighter",
    mix: "screen",
    filter: "blur(1px) saturate(1.6) brightness(1.15)",
    bgFade: 0.06,
    spawnRate: 1.4,
    sizeMul: 0.7,
    ringChance: 0.55,
    streakChance: 0.6,
    gravity: 0,
    kinds: ["blob", "ring", "streak"],
    shapePoints: 24,
    wobble: 0.06,
  },
  {
    name: "ink-drip",
    palette: ["220 70% 25%", "0 0% 8%", "260 60% 30%", "200 80% 22%"],
    blend: "source-over",
    mix: "multiply",
    filter: "saturate(1.4) contrast(1.2)",
    bgFade: 0,
    spawnRate: 0.7,
    sizeMul: 1.3,
    ringChance: 0.1,
    streakChance: 0.05,
    gravity: 0.12,
    kinds: ["blob", "drop"],
    shapePoints: 26,
    wobble: 0.22,
  },
  {
    name: "confetti",
    palette: ["350 90% 62%", "45 100% 58%", "160 85% 48%", "220 90% 62%", "285 85% 65%"],
    blend: "source-over",
    mix: "normal",
    filter: "saturate(1.3)",
    bgFade: 0.04,
    spawnRate: 1.6,
    sizeMul: 0.6,
    ringChance: 0,
    streakChance: 0,
    gravity: 0.08,
    kinds: ["square", "star", "drop"],
    shapePoints: 5,
    wobble: 0.3,
  },
  {
    name: "smoke",
    palette: ["220 15% 55%", "260 20% 50%", "200 25% 60%", "0 0% 45%"],
    blend: "source-over",
    mix: "multiply",
    filter: "blur(6px) saturate(0.9)",
    bgFade: 0.02,
    spawnRate: 1.1,
    sizeMul: 1.5,
    reason: undefined as unknown as never,
    ringChance: 0.2,
    streakChance: 0.1,
    gravity: -0.02,
    kinds: ["blob", "ring"],
    shapePoints: 22,
    wobble: 0.18,
  } as Mode,
  {
    name: "rainbow-ribbon",
    palette: ["0 90% 60%", "40 95% 58%", "70 90% 55%", "150 85% 50%", "200 92% 55%", "260 85% 62%", "320 88% 62%"],
    blend: "source-over",
    mix: "multiply",
    filter: "saturate(1.5)",
    bgFade: 0,
    spawnRate: 1.2,
    sizeMul: 0.85,
    ringChance: 0.05,
    streakChance: 0.85,
    gravity: 0,
    kinds: ["streak", "blob"],
    shapePoints: 18,
    wobble: 0.08,
  },
  {
    name: "glitch",
    palette: ["350 100% 55%", "180 100% 50%", "270 100% 60%"],
    blend: "difference",
    mix: "normal",
    filter: "saturate(1.6) contrast(1.3)",
    bgFade: 0.08,
    spawnRate: 1,
    sizeMul: 0.9,
    ringChance: 0.15,
    streakChance: 0.4,
    gravity: 0,
    kinds: ["square", "streak", "blob"],
    shapePoints: 8,
    wobble: 0.05,
  },
];

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

const makeShape = (points: number, wobble: number) =>
  Array.from({ length: points }, (_, i) => {
    const wave = Math.sin(i * 1.7 + Math.random() * 0.8) * wobble;
    return randomBetween(1 - wobble * 1.6, 1 + wobble * 1.6) + wave;
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
  ctx.restore();
};

const drawRing = (ctx: CanvasRenderingContext2D, mark: PaintMark, progress: number) => {
  const radius = mark.radius * (0.45 + progress * 2.2);
  const alpha = mark.alpha * Math.pow(1 - progress, 1.8);
  if (alpha <= 0.01) return;
  ctx.beginPath();
  ctx.arc(mark.x, mark.y, radius, 0, Math.PI * 2);
  ctx.lineWidth = Math.max(1, mark.radius * (0.18 - progress * 0.08));
  ctx.strokeStyle = `hsl(${mark.color} / ${alpha})`;
  ctx.stroke();
};

const drawSquare = (ctx: CanvasRenderingContext2D, mark: PaintMark, progress: number) => {
  const size = mark.radius * (1 + easeOut(progress) * 0.3);
  const alpha = mark.alpha * Math.pow(1 - progress, 1.3);
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.translate(mark.x, mark.y);
  ctx.rotate(mark.rotation + progress * 4);
  ctx.fillStyle = `hsl(${mark.color} / ${alpha})`;
  ctx.fillRect(-size, -size * 0.5, size * 2, size);
  ctx.restore();
};

const drawStar = (ctx: CanvasRenderingContext2D, mark: PaintMark, progress: number) => {
  const r = mark.radius * (1 + easeOut(progress) * 0.4);
  const alpha = mark.alpha * Math.pow(1 - progress, 1.3);
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.translate(mark.x, mark.y);
  ctx.rotate(mark.rotation + progress * 2);
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI * i) / 5;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const x = Math.cos(a) * rad;
    const y = Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = `hsl(${mark.color} / ${alpha})`;
  ctx.fill();
  ctx.restore();
};

export function PaintCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef<Mode>(MODES[Math.floor(Math.random() * MODES.length)]);

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

    const applyMode = () => {
      const m = modeRef.current;
      canvas.style.filter = m.filter;
      canvas.style.mixBlendMode = m.mix;
    };
    applyMode();

    const cycleMode = () => {
      const current = modeRef.current;
      let next = current;
      while (next === current) next = MODES[Math.floor(Math.random() * MODES.length)];
      modeRef.current = next;
      marks.length = 0;
      ctx.clearRect(0, 0, width, height);
      applyMode();
    };

    const cycleTimer = window.setInterval(cycleMode, 9000);

    const marks: PaintMark[] = [];
    const MAX_MARKS = 380;
    let pointer: Pointer = { x: width / 2, y: height / 2 };
    let lastPointer: Pointer = { ...pointer };
    let lastMove = performance.now();

    const pushMark = (mark: PaintMark) => {
      marks.push(mark);
      while (marks.length > MAX_MARKS) marks.shift();
    };

    const pickKind = (): PaintMark["kind"] => {
      const kinds = modeRef.current.kinds;
      return kinds[Math.floor(Math.random() * kinds.length)];
    };

    const spawnPaint = (x: number, y: number, dx: number, dy: number, speed: number) => {
      const mode = modeRef.current;
      const direction = Math.atan2(dy || 0.01, dx || 0.01);
      const color = mode.palette[Math.floor(Math.random() * mode.palette.length)];
      const force = Math.min(1, speed / 42);

      pushMark({
        x: x + randomBetween(-2, 2),
        y: y + randomBetween(-2, 2),
        vx: dx * 0.008,
        vy: dy * 0.008,
        radius: (randomBetween(12, 24) + force * 13) * mode.sizeMul,
        life: 0,
        maxLife: randomBetween(850, 1450),
        color,
        alpha: 0.34,
        rotation: direction + randomBetween(-0.5, 0.5),
        stretch: randomBetween(0.82, 1.2) + force * 0.45,
        shape: makeShape(mode.shapePoints, mode.wobble),
        kind: "blob",
      });

      if (Math.random() < mode.ringChance + force * 0.3) {
        pushMark({
          x, y, vx: 0, vy: 0,
          radius: (randomBetween(18, 34) + force * 20) * mode.sizeMul,
          life: 0, maxLife: randomBetween(360, 620),
          color, alpha: 0.22, rotation: 0, stretch: 1,
          shape: makeShape(14, mode.wobble), kind: "ring",
        });
      }

      const drops = Math.floor((7 + force * 24) * mode.spawnRate);
      for (let i = 0; i < drops; i++) {
        const mostlyBackward = direction + Math.PI + randomBetween(-1.2, 1.2);
        const wild = randomBetween(0, Math.PI * 2);
        const angle = Math.random() < 0.72 ? mostlyBackward : wild;
        const distance = randomBetween(5, 20 + force * 58);
        const size = randomBetween(2.4, 8.5) * (1 + force * 0.55) * mode.sizeMul;
        const velocity = randomBetween(0.12, 1.35 + force * 1.8);

        pushMark({
          x: x + Math.cos(angle) * distance + randomBetween(-4, 4),
          y: y + Math.sin(angle) * distance + randomBetween(-4, 4),
          vx: Math.cos(angle) * velocity + dx * 0.01,
          vy: Math.sin(angle) * velocity + dy * 0.01,
          radius: size, life: 0, maxLife: randomBetween(620, 1200),
          color: Math.random() < 0.7 ? color : mode.palette[Math.floor(Math.random() * mode.palette.length)],
          alpha: randomBetween(0.28, 0.5),
          rotation: angle,
          stretch: randomBetween(0.75, 1.45),
          shape: makeShape(12, mode.wobble),
          kind: Math.random() < mode.streakChance ? "streak" : pickKind(),
        });
      }
    };

    const handlePoint = (x: number, y: number) => {
      const now = performance.now();
      const dx = x - lastPointer.x;
      const dy = y - lastPointer.y;
      const distance = Math.hypot(dx, dy);
      const speed = (distance / Math.max(12, now - lastMove)) * 16.67;
      const steps = Math.max(1, Math.ceil(distance / 18));
      for (let i = 1; i <= steps; i++) {
        const k = i / steps;
        spawnPaint(lastPointer.x + dx * k, lastPointer.y + dy * k, dx, dy, speed);
      }
      pointer = { x, y };
      lastPointer = { x, y };
      lastMove = now;
    };

    const onMove = (e: MouseEvent) => handlePoint(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) handlePoint(t.clientX, t.clientY);
    };
    const onClick = (e: MouseEvent) => {
      // burst on click
      for (let i = 0; i < 3; i++) spawnPaint(e.clientX, e.clientY, randomBetween(-30, 30), randomBetween(-30, 30), 40);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("click", onClick);

    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(40, now - last);
      last = now;
      const mode = modeRef.current;

      if (mode.bgFade > 0) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = `rgba(0,0,0,${mode.bgFade})`;
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
      ctx.globalCompositeOperation = mode.blend;

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
        mark.vy = mark.vy * 0.982 + (mark.kind === "drop" ? mode.gravity : mode.gravity * 0.3);

        if (mark.kind === "ring") drawRing(ctx, mark, progress);
        else if (mark.kind === "square") drawSquare(ctx, mark, progress);
        else if (mark.kind === "star") drawStar(ctx, mark, progress);
        else drawIrregularBlob(ctx, mark, progress);
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("click", onClick);
      window.clearInterval(cycleTimer);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30"
    />
  );
}
