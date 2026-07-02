import { useEffect } from "react";

const COLORS = ["#F97316", "#7C3AED", "#06B6D4"];
const SIZE = 64;

export function AnimatedFavicon() {
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let favicon = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }

    const originalHref = favicon.href;
    const originalType = favicon.type;
    let frameId = 0;
    let lastFrame = 0;

    const drawStrand = (
      time: number,
      colorA: string,
      colorB: string,
      offset: number,
      width: number,
    ) => {
      const gradient = ctx.createLinearGradient(8, 12, 56, 52);
      gradient.addColorStop(0, colorA);
      gradient.addColorStop(0.55, COLORS[1]);
      gradient.addColorStop(1, colorB);

      ctx.save();
      ctx.shadowColor = colorA;
      ctx.shadowBlur = 8;
      ctx.strokeStyle = gradient;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.beginPath();

      for (let x = 7; x <= 57; x += 2) {
        const t = (x - 7) / 50;
        const wave = Math.sin(t * Math.PI * 3.2 + time + offset) * 12;
        const counterWave = Math.sin(t * Math.PI * 6 - time * 0.7 + offset) * 4;
        const y = 32 + wave + counterWave;

        if (x === 7) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
      ctx.restore();
    };

    const draw = (now: number) => {
      frameId = requestAnimationFrame(draw);
      if (now - lastFrame < 90) return;
      lastFrame = now;

      const time = now * 0.003;
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.fillStyle = "#0b0714";
      ctx.beginPath();
      ctx.roundRect(0, 0, SIZE, SIZE, 16);
      ctx.fill();

      drawStrand(time, COLORS[0], COLORS[2], 0, 5.2);
      drawStrand(time * 1.15, COLORS[2], COLORS[0], 2.2, 4.4);

      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 5;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.4;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let x = 13; x <= 53; x += 2) {
        const t = (x - 13) / 40;
        const y = 32 + Math.sin(t * Math.PI * 4.4 - time * 1.2) * 8;
        if (x === 13) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      favicon.type = "image/png";
      favicon.href = canvas.toDataURL("image/png");
    };

    frameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameId);
      favicon.href = originalHref;
      favicon.type = originalType;
    };
  }, []);

  return null;
}
