'use client';
import { useRef, useEffect } from 'react';

export default function VoiceOrb({ state, isDuplex }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = isDuplex ? 120 : 36;
    canvas.width = size * 2;
    canvas.height = size * 2;

    let t = 0;
    function draw() {
      t += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2, cy = canvas.height / 2;
      const r = size * 0.7;

      if (state === 'listening') {
        // Waveform circle
        ctx.beginPath();
        for (let i = 0; i <= 360; i += 2) {
          const a = (i * Math.PI) / 180;
          const wave = Math.sin(a * 6 + t * 4) * (r * 0.12) + Math.sin(a * 3 + t * 2) * (r * 0.06);
          const x = cx + Math.cos(a) * (r + wave);
          const y = cy + Math.sin(a) * (r + wave);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = '#00E5B0';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (state === 'speaking') {
        // Radial bars
        const bars = 24;
        for (let i = 0; i < bars; i++) {
          const a = (i / bars) * Math.PI * 2;
          const h = (Math.sin(i * 0.8 + t * 5) * 0.5 + 0.5) * r * 0.4 + 4;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(a);
          ctx.fillStyle = '#E8572A';
          ctx.globalAlpha = 0.6 + Math.sin(i + t * 3) * 0.4;
          ctx.fillRect(r * 0.5, -1.5, h, 3);
          ctx.restore();
        }
      } else if (state === 'thinking') {
        // Conic shimmer
        const grad = ctx.createConicGradient(t * 2, cx, cy);
        grad.addColorStop(0, 'rgba(245,200,66,0.6)');
        grad.addColorStop(0.3, 'rgba(245,200,66,0)');
        grad.addColorStop(0.7, 'rgba(245,200,66,0)');
        grad.addColorStop(1, 'rgba(245,200,66,0.6)');
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 3;
        ctx.stroke();
      } else {
        // Idle — subtle ring
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [state, isDuplex]);

  return (
    <div className={`orb-wrapper ${isDuplex ? 'active' : ''}`} id="voice-orb">
      <canvas ref={canvasRef} className="orb-canvas" />
    </div>
  );
}
