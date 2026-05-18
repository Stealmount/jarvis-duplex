'use client';

import { useEffect, useRef, useState } from 'react';

const LIGHT_COLORS = [
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#c084fc', // light purple
  '#f472b6', // pink
  '#fb7185', // rose
  '#fbbf24', // amber
  '#f59e0b', // orange
  '#ef4444', // red
];

const DARK_COLORS = [
  '#60a5fa', // lighter blue
  '#818cf8', // lighter indigo
  '#a78bfa', // lighter violet
  '#c084fc', // light purple
  '#e879f9', // lighter pink
  '#f472b6', // pink
  '#fb7185', // rose
  '#fcd34d', // lighter amber
  '#fbbf24', // amber
  '#f87171', // lighter red
];

export default function ParticleBackground() {
  const canvasRef = useRef(null);
  const [isDark, setIsDark] = useState(true);
  const particlesRef = useRef([]);
  const mouseRef = useRef({
    x: -1000,
    y: -1000,
    prevX: -1000,
    prevY: -1000,
    active: false,
  });
  const animRef = useRef(0);
  const dimensionsRef = useRef({ width: 0, height: 0 });

  // 1. Observe html data-theme attribute to dynamically adjust colors
  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme') || 'dark';
      setIsDark(theme === 'dark');
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // 2. Initialize and run particle system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

    function resize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      dimensionsRef.current = { width, height };

      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createParticle(initial = false) {
      const { width, height } = dimensionsRef.current;
      return {
        x: Math.random() * width,
        y: initial ? Math.random() * height : height + 20,
        size: Math.random() * 3 + 1.5, // 1.5px to 4.5px
        speedY: -(Math.random() * 0.8 + 0.3), // float upward slowly
        speedX: (Math.random() - 0.5) * 0.4, // subtle horizontal drift
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.5 + 0.3, // 0.3 to 0.8 transparency
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        shape: Math.random() > 0.3 ? 'rect' : 'circle', // mostly rotated rectangles (confetti), some circles
        aspectRatio: Math.random() * 2 + 0.5,
        vx: 0,
        vy: 0,
      };
    }

    function initParticles() {
      resize();
      const { width, height } = dimensionsRef.current;
      const count = Math.floor((width * height) / 8000); 
      particlesRef.current = Array.from({ length: count }, () => createParticle(true));
    }

    function animate() {
      const { width, height } = dimensionsRef.current;
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;

      // Calculate mouse velocity
      const mouseVelX = mouse.x - mouse.prevX;
      const mouseVelY = mouse.y - mouse.prevY;
      const mouseSpeed = Math.sqrt(mouseVelX * mouseVelX + mouseVelY * mouseVelY);

      const currentColors = isDark ? DARK_COLORS : LIGHT_COLORS;

      for (const p of particlesRef.current) {
        // Sync particle colors when theme changes dynamically
        if (!currentColors.includes(p.color)) {
          p.color = currentColors[Math.floor(Math.random() * currentColors.length)];
        }

        // Base drift upward (incorporate drag & drift target velocity)
        p.vx += (p.speedX - p.vx) * 0.02;
        p.vy += (p.speedY - p.vy) * 0.02;

        // Cursor wake & displacement effect
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 180;

          if (dist < maxDist) {
            const force = (maxDist - dist) / maxDist;
            const angle = Math.atan2(dy, dx);

            // 1. Push away slightly (like fluid displacement)
            p.vx += Math.cos(angle) * force * 0.8;
            p.vy += Math.sin(angle) * force * 0.8;

            // 2. Trailing wake: pull in direction of cursor movement
            if (mouseSpeed > 2) {
              const wakeStrength = force * Math.min(mouseSpeed * 0.15, 8);
              p.vx += (mouseVelX * 0.08) * wakeStrength;
              p.vy += (mouseVelY * 0.08) * wakeStrength;

              // 3. Fluid swirl/rotation based on cursor direction and offset
              const swirl = (mouseVelX * dy - mouseVelY * dx) * 0.0001 * force;
              p.rotationSpeed += swirl;
            }
          }
        }

        // Apply velocity with damping (drag friction)
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        
        p.rotation += p.rotationSpeed;
        p.rotationSpeed *= 0.98; // dampen rotation

        // Wrap horizontally
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        // Respawn from bottom if exits top boundary
        if (p.y < -20) {
          Object.assign(p, createParticle());
          p.y = height + Math.random() * 50;
        }
        
        // Respawn from top if pushed below bottom boundary
        if (p.y > height + 50) {
          Object.assign(p, createParticle());
          p.y = -20;
        }

        // Draw particle
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          const w = p.size;
          const h = p.size * p.aspectRatio;
          ctx.fillRect(-w / 2, -h / 2, w, h);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Update previous mouse position for velocity derivation on next tick
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;

      animRef.current = requestAnimationFrame(animate);
    }

    const onMouseMove = (e) => {
      const m = mouseRef.current;
      m.prevX = m.x;
      m.prevY = m.y;
      m.x = e.clientX;
      m.y = e.clientY;
      m.active = true;
    };

    const onMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const onTouchMove = (e) => {
      const m = mouseRef.current;
      if (e.touches && e.touches[0]) {
        m.prevX = m.x;
        m.prevY = m.y;
        m.x = e.touches[0].clientX;
        m.y = e.touches[0].clientY;
        m.active = true;
      }
    };

    const onTouchEnd = () => {
      mouseRef.current.active = false;
    };

    const handleResize = () => {
      resize();
      const { width, height } = dimensionsRef.current;
      const targetCount = Math.floor((width * height) / 8000);
      const currentCount = particlesRef.current.length;
      
      if (targetCount > currentCount) {
        for (let i = 0; i < targetCount - currentCount; i++) {
          particlesRef.current.push(createParticle(true));
        }
      } else if (targetCount < currentCount) {
        particlesRef.current = particlesRef.current.slice(0, targetCount);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('resize', handleResize);

    initParticles();
    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', handleResize);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -1,
      }}
    />
  );
}
