'use client';

export default function JarvisLogo({ size = 'sidebar', animated = true }) {
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
        filter: animated ? 'drop-shadow(0 0 12px var(--accent-glow))' : 'none',
        animation: animated ? 'jarvisBreathe 6s ease-in-out infinite' : 'none',
        flexShrink: 0,
      }}
    >
      {/* Outer dotted orbit ring */}
      <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.25" />
      {/* Inner solid orbit ring */}
      <circle cx="50" cy="50" r="28" stroke="currentColor" strokeWidth="0.75" opacity="0.35" />
      {/* Coordinate axes lines */}
      <path d="M50 6 L50 94 M6 50 L94 50" stroke="currentColor" strokeWidth="0.75" opacity="0.45" />
      {/* Diagonal grid lines */}
      <path d="M19 19 L81 81 M19 81 L81 19" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
      
      {/* Central Diamond Starburst with premium multi-gradient fill */}
      <path
        d="M50 12 L54.5 45.5 L88 50 L54.5 54.5 L50 88 L45.5 54.5 L12 50 L45.5 45.5 Z"
        fill={`url(#${gradientId})`}
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      
      <defs>
        <linearGradient id={gradientId} x1="12" y1="12" x2="88" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--mode-general, #E8572A)" />
          <stop offset="50%" stopColor="var(--mode-deep, #7B8FFF)" />
          <stop offset="100%" stopColor="var(--voice-listening, #00E5B0)" />
        </linearGradient>
      </defs>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes jarvisBreathe {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.9; }
          50% { transform: scale(1.05) rotate(180deg); opacity: 1; }
        }
      `}} />
    </svg>
  );

  if (size === 'sidebar') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', userSelect: 'none' }}>
        {renderEmblem(22)}
        <span
          style={{
            fontFamily: 'var(--font-serif), serif',
            fontSize: '1.25rem',
            fontWeight: 400,
            letterSpacing: '0.22em',
            color: 'var(--text-1)',
            textTransform: 'uppercase',
            lineHeight: 1,
            marginTop: '2px',
          }}
        >
          Jarvis
        </span>
      </div>
    );
  }

  if (isGreeting) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', userSelect: 'none' }}>
        {renderEmblem(76)}
        <span
          style={{
            fontFamily: 'var(--font-serif), serif',
            fontSize: '2.5rem',
            fontWeight: 300,
            letterSpacing: '0.35em',
            color: 'var(--text-1)',
            textTransform: 'uppercase',
            lineHeight: 1,
            marginLeft: '0.35em', // offsets letter-spacing center-drift
            textShadow: '0 0 30px var(--accent-glow)',
          }}
        >
          Jarvis
        </span>
      </div>
    );
  }

  return null;
}
