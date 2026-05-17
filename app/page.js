'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup' | 'dev'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [devCode, setDevCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Apply saved theme
    const saved = localStorage.getItem('jarvis_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/chat');
    }
  }, [status, router]);

  const hasGoogleAuth = false; // Will be true when GOOGLE_CLIENT_ID is set

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signin', email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Sign in failed'); setLoading(false); return; }
      // Store auth in localStorage
      localStorage.setItem('jarvis_user', JSON.stringify(data.user));
      router.push('/chat');
    } catch {
      setError('Something went wrong');
    }
    setLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Name is required'); return; }
    if (!email.trim()) { setError('Email is required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signup', email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Sign up failed'); setLoading(false); return; }
      localStorage.setItem('jarvis_user', JSON.stringify(data.user));
      router.push('/chat');
    } catch {
      setError('Something went wrong');
    }
    setLoading(false);
  };

  const handleDevLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dev-login', devCode }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Invalid developer code'); setLoading(false); return; }
      localStorage.setItem('jarvis_user', JSON.stringify(data.user));
      router.push('/chat');
    } catch {
      setError('Something went wrong');
    }
    setLoading(false);
  };

  const handleGuestEntry = () => {
    localStorage.setItem('jarvis_user', JSON.stringify({
      name: 'Guest',
      email: 'guest@jarvis.local',
      role: 'guest',
    }));
    router.push('/chat');
  };

  if (!mounted) return null;

  return (
    <div className="landing">
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 100 }}>
        <ThemeToggle />
      </div>
      <div className="landing-hero" aria-hidden="true">JARVIS</div>
      <div className="landing-card">
        <h2>Your Indian AI companion.</h2>
        <p className="landing-tagline">Suno. Samjho. Seekho.</p>
        <div className="landing-divider" />

        {!showAuth ? (
          <>
            <button className="auth-btn primary-btn" onClick={() => { setShowAuth(true); setAuthMode('signin'); }} id="signin-btn">
              <span style={{ fontSize: '18px' }}>👤</span>
              Sign In
            </button>
            <button className="auth-btn secondary-btn" onClick={() => { setShowAuth(true); setAuthMode('signup'); }} id="signup-btn" style={{ marginTop: 10 }}>
              <span style={{ fontSize: '18px' }}>✨</span>
              Create Account
            </button>
            <div className="landing-divider" style={{ margin: '16px auto' }} />
            <button className="auth-btn guest-btn" onClick={handleGuestEntry} id="guest-btn">
              <span style={{ fontSize: '18px' }}>⚡</span>
              Continue as Guest
            </button>
            <button className="dev-link" onClick={() => { setShowAuth(true); setAuthMode('dev'); }} id="dev-login-link">
              🔑 Developer Access
            </button>
          </>
        ) : (
          <div className="auth-form-wrapper">
            {/* Tab Switcher */}
            <div className="auth-tabs">
              <button
                className={`auth-tab ${authMode === 'signin' ? 'active' : ''}`}
                onClick={() => { setAuthMode('signin'); setError(''); }}
              >Sign In</button>
              <button
                className={`auth-tab ${authMode === 'signup' ? 'active' : ''}`}
                onClick={() => { setAuthMode('signup'); setError(''); }}
              >Sign Up</button>
              <button
                className={`auth-tab ${authMode === 'dev' ? 'active' : ''}`}
                onClick={() => { setAuthMode('dev'); setError(''); }}
              >Dev</button>
            </div>

            {authMode === 'signin' && (
              <form onSubmit={handleSignIn} className="auth-form">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="auth-input"
                  required
                  id="signin-email"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="auth-input"
                  required
                  id="signin-password"
                />
                {error && <div className="auth-error">{error}</div>}
                <button type="submit" className="auth-btn primary-btn" disabled={loading}>
                  {loading ? '...' : 'Sign In'}
                </button>
              </form>
            )}

            {authMode === 'signup' && (
              <form onSubmit={handleSignUp} className="auth-form">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="auth-input"
                  required
                  id="signup-name"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="auth-input"
                  required
                  id="signup-email"
                />
                <input
                  type="password"
                  placeholder="Password (min 6 chars)"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="auth-input"
                  required
                  minLength={6}
                  id="signup-password"
                />
                {error && <div className="auth-error">{error}</div>}
                <button type="submit" className="auth-btn primary-btn" disabled={loading}>
                  {loading ? '...' : 'Create Account'}
                </button>
              </form>
            )}

            {authMode === 'dev' && (
              <form onSubmit={handleDevLogin} className="auth-form">
                <div className="dev-notice">
                  <span style={{ fontSize: 20 }}>🔐</span>
                  <span>Enter your developer master code.<br/>Unlimited access. No restrictions.</span>
                </div>
                <input
                  type="password"
                  placeholder="Developer Code"
                  value={devCode}
                  onChange={e => setDevCode(e.target.value)}
                  className="auth-input dev-input"
                  required
                  id="dev-code-input"
                />
                {error && <div className="auth-error">{error}</div>}
                <button type="submit" className="auth-btn dev-btn" disabled={loading}>
                  {loading ? '...' : '🔓 Unlock Developer Mode'}
                </button>
              </form>
            )}

            <button className="auth-back-btn" onClick={() => { setShowAuth(false); setError(''); }}>
              ← Back
            </button>
          </div>
        )}

        <div className="landing-features">
          {['Voice', 'PDF', 'Research', 'Therapy', 'Deep Think'].map(f => (
            <span key={f} className="landing-pill">{f}</span>
          ))}
        </div>
        <p className="landing-footer">50 messages/day · Free · No credit card</p>
      </div>
    </div>
  );
}
