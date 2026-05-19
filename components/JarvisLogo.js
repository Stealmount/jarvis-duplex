'use client';

import { useState, useEffect } from 'react';

export default function JarvisLogo({ size = 'sidebar', animated = true }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme') || 'dark';
      setIsDark(theme === 'dark');
    };
    checkTheme();
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          checkTheme();
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  const isGreeting = size === 'greeting';
  const gradientId = `jarvisGrad_${size}`;

  // Unified high-fidelity sacred geometry SVG emblem
  const renderEmblem = (pixelSize) => (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: animated ? 'drop-shadow(0 0 16px var(--accent-glow))' : 'none',
        flexShrink: 0,
        overflow: 'visible',
      }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--mode-deep, #7B8FFF)" />
          <stop offset="50%" stopColor="var(--mode-general, #E8572A)" />
          <stop offset="100%" stopColor="var(--voice-listening, #00E5B0)" />
        </linearGradient>
        <filter id={`glow_${size}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ambient glowing core background */}
      <circle cx="50" cy="50" r="15" fill={`url(#${gradientId})`} opacity="0.15" filter={`url(#glow_${size})`} />

      {/* Outer structural compass/tick rings */}
      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 6" opacity="0.25" />
      <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />

      {/* Orbit Ring 1: Thin outer rotating orbit */}
      <circle
        cx="50"
        cy="50"
        r="32"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.3"
        style={{
          transformOrigin: 'center',
          animation: animated ? 'spin-clockwise 15s linear infinite' : 'none',
        }}
      />
      {/* Node spark on Orbit 1 */}
      <circle
        cx="50"
        cy="18"
        r="2.5"
        fill="var(--mode-deep, #7B8FFF)"
        style={{
          transformOrigin: 'center',
          animation: animated ? 'spin-clockwise 15s linear infinite' : 'none',
        }}
      />

      {/* Orbit Ring 2: Counter-rotating inner orbit */}
      <circle
        cx="50"
        cy="50"
        r="22"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.4"
        style={{
          transformOrigin: 'center',
          animation: animated ? 'spin-counter 10s linear infinite' : 'none',
        }}
      />
      {/* Node spark on Orbit 2 */}
      <circle
        cx="72"
        cy="50"
        r="2"
        fill="var(--mode-general, #E8572A)"
        style={{
          transformOrigin: 'center',
          animation: animated ? 'spin-counter 10s linear infinite' : 'none',
        }}
      />

      {/* Center Intelligence Spark (4-point micro starburst) */}
      <path
        d="M50 36 L52 48 L64 50 L52 52 L50 64 L48 52 L36 50 L48 48 Z"
        fill={`url(#${gradientId})`}
        stroke="currentColor"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-clockwise {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spin-counter {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
      `}} />
    </svg>
  );

  if (size === 'sidebar') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', userSelect: 'none' }}>
        <span
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '1.2rem',
            fontWeight: 500,
            letterSpacing: '0.28em',
            background: 'linear-gradient(135deg, var(--text-1) 30%, var(--text-2) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textTransform: 'uppercase',
            lineHeight: 1,
            marginTop: '2px',
            marginLeft: '0.28em',
          }}
        >
          Jarvis
        </span>
        <span style={{
          fontSize: '0.55rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          padding: '1px 4px',
          borderRadius: '4px',
          background: 'rgba(59, 130, 246, 0.12)',
          color: '#3b82f6',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          fontFamily: "var(--font-mono), monospace",
          lineHeight: 1,
          alignSelf: 'center',
          marginTop: '1px',
        }}>
          BETA
        </span>
      </div>
    );
  }

  if (isGreeting) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', userSelect: 'none' }}>
        {/* Elegant typography bundle */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', textAlign: 'center' }}>
          <span
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '3.6rem',
              fontWeight: 400,
              letterSpacing: '0.45em',
              background: 'linear-gradient(135deg, var(--text-1) 10%, var(--text-2) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textTransform: 'uppercase',
              lineHeight: 1,
              marginLeft: '0.45em', // shifts center-drift back
              filter: isDark ? 'drop-shadow(0 4px 12px rgba(255,255,255,0.03))' : 'none',
            }}
          >
            Jarvis
          </span>
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '0.7rem',
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '0.35em',
            color: 'var(--text-2)',
            opacity: 0.5,
            marginLeft: '0.35em',
            marginTop: '0.2rem',
          }}>
            Cognitive Companion
          </span>
        </div>
      </div>
    );
  }

  return null;
}
