'use client';
import { useEffect, useRef } from 'react';

const LOGO_STATES = [
  { color: '#ffffff', glow: 'rgba(255,255,255,0.4)' },
  { color: '#c8c8c8', glow: 'rgba(200,200,200,0.3)' },
  { color: '#e8e8e8', glow: 'rgba(255,255,255,0.2)' },
  { color: '#a0a0a0', glow: 'rgba(160,160,160,0.25)' },
  { color: '#f0f0f0', glow: 'rgba(240,240,240,0.35)' },
];

export default function JarvisLogo({ size = 'sidebar', animated = true }) {
  const ref = useRef(null);
  const stateRef = useRef(0);

  useEffect(() => {
    if (!animated || !ref.current || size !== 'sidebar') return;
    const el = ref.current;
    const cycle = () => {
      stateRef.current = (stateRef.current + 1) % LOGO_STATES.length;
      const s = LOGO_STATES[stateRef.current];
      el.style.color = s.color;
      el.style.textShadow = `0 0 20px ${s.glow}`;
    };
    const interval = setInterval(cycle, 3500);
    return () => clearInterval(interval);
  }, [animated, size]);

  if (size === 'sidebar') {
    return (
      <div className="logo-sidebar" ref={ref}>
        <span className="logo-j">J</span>
        <span className="logo-arvis">ARVIS</span>
      </div>
    );
  }

  if (size === 'greeting') {
    return <GreetingLogo />;
  }

  return null;
}

function GreetingLogo() {
  const variant = useRef(Math.floor(Math.random() * 5)).current;

  const variants = {
    0: <div className="greeting-logo variant-outlined">JARVIS</div>,
    1: (
      <div className="greeting-logo variant-stacked">
        <span className="gl-j">J</span>
        <span className="gl-arvis">ARVIS</span>
      </div>
    ),
    2: <div className="greeting-logo variant-monogram">J</div>,
    3: (
      <div className="greeting-logo variant-dot">
        {['J','A','R','V','I','S'].map((letter, i) => (
          <span key={letter} className="gl-letter" style={{ animationDelay: `${i * 80}ms` }}>{letter}</span>
        ))}
      </div>
    ),
    4: (
      <div className="greeting-logo variant-underline">
        <span>JARVIS</span>
        <div className="gl-underline" />
      </div>
    ),
  };

  return variants[variant];
}
