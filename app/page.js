'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import JarvisLogo from '@/components/JarvisLogo';
import { getOrCreateGuestId } from '@/lib/guest';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestError, setGuestError] = useState('');

  useEffect(() => {
    // Apply saved theme
    const saved = localStorage.getItem('jarvis_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    
    // Redirect if already authenticated via NextAuth or local storage
    if (status === 'authenticated') {
      router.push('/chat');
    } else {
      const localUser = localStorage.getItem('jarvis_user');
      if (localUser) {
        router.push('/chat');
      }
    }
  }, [status, router]);

  const handleGuestSubmit = (e) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setGuestError('Please enter your name.');
      return;
    }
    const guestId = getOrCreateGuestId();
    localStorage.setItem('jarvis_user', JSON.stringify({
      name: guestName.trim(),
      email: `${guestId}@jarvis.local`,
      role: 'guest',
    }));
    router.push('/chat');
  };

  return (
    <div className="auth-page">
      {/* Logo */}
      <div className="auth-logo">
        <JarvisLogo size="greeting" />
      </div>

      {/* Tagline */}
      <div className="auth-tagline">
        <h1 className="auth-headline">Your personal AI companion.</h1>
        <p className="auth-sub">Fast. Thoughtful. Always available.</p>
      </div>

      {/* Auth actions */}
      <div className="auth-actions">
        {/* Google Sign In */}
        <button className="auth-btn auth-btn--primary" onClick={() => signIn('google', { callbackUrl: '/chat' })}>
          <GoogleIcon />
          <span>Sign up with Google</span>
        </button>

        {/* Create Account */}
        <button className="auth-btn auth-btn--secondary" onClick={() => router.push('/signup')}>
          <span>✦</span>
          <span>Create account</span>
        </button>

        {/* Divider */}
        <div className="auth-divider">
          <span>or</span>
        </div>

        {/* Guest */}
        <button className="auth-btn auth-btn--ghost" onClick={() => setShowGuestModal(true)}>
          <span>⚡</span>
          <span>Continue as guest</span>
        </button>

        {/* Developer */}
        <button className="auth-btn auth-btn--dev" onClick={() => router.push('/dev')}>
          <span>🔑</span>
          <span>Developer access</span>
        </button>
      </div>

      {/* Feature pills */}
      <div className="auth-feature-pills">
        {['Voice', 'PDF', 'Research', 'Therapy', 'Deep Think', 'Imagine'].map(f => (
          <span key={f} className="feature-pill">{f}</span>
        ))}
      </div>

      {/* Limits info */}
      <div className="auth-limits">
        <div className="limit-row">
          <span className="limit-tier">Guest</span>
          <span className="limit-detail">50 messages · 10 images · resets weekly</span>
        </div>
        <div className="limit-row">
          <span className="limit-tier">Account</span>
          <span className="limit-detail">100 messages · 20 images · resets daily</span>
        </div>
      </div>

      {/* Guest Name Modal */}
      {showGuestModal && (
        <div className="settings-overlay animate-popover" style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', background: 'rgba(0,0,0,0.5)', zIndex: 99999 }}>
          <div className="settings-panel animate-modal" style={{ maxWidth: '380px', padding: '24px', borderRadius: '20px', background: 'rgba(10, 10, 15, 0.9)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', margin: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 500, color: '#fff' }}>Enter Your Name</h3>
                <button 
                  onClick={() => { setShowGuestModal(false); setGuestError(''); }} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: '1.4rem' }}
                >
                  ×
                </button>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
                Please enter your name to start your session with JARVIS.
              </p>
              <form onSubmit={handleGuestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={guestName}
                  onChange={(e) => { setGuestName(e.target.value); setGuestError(''); }}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '15px',
                    outline: 'none',
                  }}
                />
                {guestError && (
                  <p style={{ color: '#ff5555', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>{guestError}</p>
                )}
                <button
                  type="submit"
                  className="auth-btn auth-btn--primary"
                  style={{ width: '100%', padding: '12px', background: '#fff', color: '#000', border: 'none', fontWeight: 500 }}
                >
                  Let's Go ⚡
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
