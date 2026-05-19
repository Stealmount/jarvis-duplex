'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    // Password validations
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one numeric character (0-9).');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one capital letter (A-Z).');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError('Password must contain at least one special character (e.g. !@#$%^&*).');
      return;
    }

    // Set the user in local storage as a regular 'user' (full member access)
    localStorage.setItem('jarvis_user', JSON.stringify({
      name: name.trim(),
      email: email.trim(),
      role: 'user',
    }));

    router.push('/chat');
  };

  // Helper validation status checks
  const hasMinLen = password.length >= 8;
  const hasNumber = /[0-9]/.test(password);
  const hasCapital = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    <div className="auth-page">
      <button className="back-btn" onClick={() => router.back()}>← Back</button>

      <div className="auth-tagline">
        <h1 className="auth-headline">Create your account</h1>
        <p className="auth-sub">Register securely with any email and password credentials</p>
      </div>

      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        maxWidth: '380px',
        margin: '0 auto 24px auto',
        padding: '24px',
        borderRadius: '24px',
        background: 'rgba(255,255,255,0.015)',
        border: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
      }}>
        {/* Full Name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Full Name</label>
          <input
            type="text"
            placeholder="e.g. Tony Stark"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            required
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#fff',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
        </div>

        {/* Email Address */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Email Address</label>
          <input
            type="email"
            placeholder="e.g. tony@starkindustries.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            required
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#fff',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
        </div>

        {/* Password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Password</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              required
              style={{
                width: '100%',
                padding: '12px 48px 12px 16px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#fff',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
              }}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {/* Dynamic Requirement Checklist */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          padding: '12px',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.04)',
        }}>
          {[
            { label: '8+ Characters', met: hasMinLen },
            { label: '1 Numeric (0-9)', met: hasNumber },
            { label: '1 Capital (A-Z)', met: hasCapital },
            { label: '1 Special (!@#...)', met: hasSpecial },
          ].map((req, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.7rem',
              color: req.met ? '#10b981' : 'rgba(255,255,255,0.4)',
              transition: 'color 0.2s',
            }}>
              <span style={{ fontSize: '0.8rem' }}>{req.met ? '✓' : '○'}</span>
              <span>{req.label}</span>
            </div>
          ))}
        </div>

        {error && (
          <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '4px 0 0 0', fontFamily: 'var(--font-mono)' }}>{error}</p>
        )}

        <button
          type="submit"
          className="auth-btn auth-btn--secondary"
          style={{
            marginTop: '8px',
            background: '#fff',
            color: '#000',
            border: 'none',
            fontWeight: 600,
            justifyContent: 'center',
            padding: '14px',
          }}
        >
          Create account
        </button>

        <div className="auth-divider" style={{ margin: '8px 0' }}>
          <span>or</span>
        </div>

        {/* Google sign up option */}
        <button
          type="button"
          className="auth-btn auth-btn--primary"
          onClick={() => signIn('google', { callbackUrl: '/chat' })}
          style={{ justifyContent: 'center', padding: '12px', gap: '10px' }}
        >
          <GoogleIcon />
          <span>Sign up with Google</span>
        </button>
      </form>

      <div className="auth-account-benefits" style={{ marginTop: '0px' }}>
        <div className="benefit-row"><span>✓</span><span>100 messages per day</span></div>
        <div className="benefit-row"><span>✓</span><span>20 image generations per day</span></div>
        <div className="benefit-row"><span>✓</span><span>Chat history saved across devices</span></div>
        <div className="benefit-row"><span>✓</span><span>Projects and artifacts</span></div>
        <div className="benefit-row"><span>✓</span><span>PDF and file uploads</span></div>
      </div>
    </div>
  );
}
