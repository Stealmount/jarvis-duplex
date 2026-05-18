'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import JarvisLogo from '@/components/JarvisLogo';

export default function DevLoginPage() {
  const router = useRouter();
  const [devCode, setDevCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDevLogin = async (e) => {
    e.preventDefault();
    if (!devCode.trim()) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dev-login', devCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid developer code');
        setLoading(false);
        return;
      }
      // Store dev session
      localStorage.setItem('jarvis_user', JSON.stringify(data.user));
      router.push('/chat');
    } catch {
      setError('Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <button className="back-btn" onClick={() => router.push('/')}>← Back</button>

      <div className="auth-logo">
        <JarvisLogo size="greeting" />
      </div>

      <div className="auth-tagline">
        <h1 className="auth-headline">Developer Console</h1>
        <p className="auth-sub">Enter the master key to bypass all limits.</p>
      </div>

      <form onSubmit={handleDevLogin} className="auth-actions" style={{ gap: '16px' }}>
        <input
          type="password"
          className="dev-input"
          placeholder="Master Key"
          value={devCode}
          onChange={(e) => setDevCode(e.target.value)}
          disabled={loading}
          autoFocus
        />

        {error && (
          <p className="auth-error-msg">{error}</p>
        )}

        <button
          type="submit"
          className="auth-btn auth-btn--primary"
          disabled={loading || !devCode.trim()}
        >
          {loading ? 'Verifying...' : 'Bypass Limits ⚡'}
        </button>
      </form>
    </div>
  );
}
