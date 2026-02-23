import { useEffect, useRef } from 'react';

// Lightweight confetti using canvas (no external deps)
export default function Confetti({ show = false, duration = 2500 }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!show) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const pieces = [];
    const colors = ['#4f93ff', '#ff7a1a', '#ffd166', '#7de3c3', '#a78bfa'];

    function rand(min, max) { return Math.random() * (max - min) + min; }

    for (let i = 0; i < 120; i++) {
      pieces.push({
        x: rand(0, w),
        y: rand(-h, 0),
        w: rand(6, 12),
        h: rand(8, 18),
        vx: rand(-0.6, 0.6),
        vy: rand(1, 3),
        r: rand(0, Math.PI * 2),
        vr: rand(-0.1, 0.1),
        color: colors[Math.floor(rand(0, colors.length))]
      });
    }

    let start = performance.now();

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);

    function draw(now) {
      const t = now - start;
      ctx.clearRect(0, 0, w, h);
      for (const p of pieces) {
        p.x += p.vx;
        p.y += p.vy + 0.5 * Math.sin(t / 300 + p.x);
        p.r += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    const timeout = setTimeout(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      ctx.clearRect(0, 0, w, h);
    }, duration);

    return () => {
      clearTimeout(timeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      try { ctx.clearRect(0, 0, w, h); } catch (e) {}
    };
  }, [show, duration]);

  return <canvas ref={canvasRef} className="confetti-canvas" aria-hidden />;
}
