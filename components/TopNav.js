'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

export default function TopNav({ status, usage, onToggleSidebar, onTogglePanel, userInfo }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleClick = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const statusClass = status === 'listening' ? 'listening' : status === 'thinking' ? 'thinking' : status === 'speaking' ? 'speaking' : '';
  const statusText = status === 'listening' ? 'Listening' : status === 'thinking' ? 'Thinking' : status === 'speaking' ? 'Speaking' : 'Ready';

  const handleSignOut = () => {
    localStorage.removeItem('jarvis_user');
    router.push('/');
  };

  const isDev = userInfo?.role === 'developer';

  return (
    <nav className="top-nav" id="top-nav">
      <div className="nav-logo">
        <span className="nav-logo-j">J</span>
        <span className="nav-logo-rest">ARVIS</span>
      </div>
      <div className="nav-status">
        <span className={`nav-status-dot ${statusClass}`} />
        <span>{statusText}</span>
        {/* Model name intentionally removed — never show specific model names */}
      </div>
      <div className="nav-spacer" />
      {isDev && (
        <div className="dev-badge" id="dev-badge">
          <span className="dev-badge-icon">⚡</span>
          <span className="dev-badge-text">DEV</span>
        </div>
      )}
      {usage && !isDev && (
        <div className="usage-meter" id="usage-meter">
          <span>{usage.count} / {usage.limit}</span>
          <div className="usage-bar">
            <div
              className={`usage-fill ${usage.count / usage.limit > 0.8 ? 'critical' : ''}`}
              style={{ width: `${(usage.count / usage.limit) * 100}%` }}
            />
          </div>
        </div>
      )}
      {isDev && (
        <div className="usage-meter" id="usage-meter-dev" style={{ color: 'var(--voice-listening)' }}>
          <span>∞ Unlimited</span>
        </div>
      )}
      <button className="nav-btn" onClick={onToggleSidebar} title="Toggle sidebar" id="toggle-sidebar">☰</button>
      <button className="nav-btn" onClick={onTogglePanel} title="Settings" id="toggle-panel">⚙</button>
      <ThemeToggle />
      <div style={{ position: 'relative' }} ref={dropRef}>
        <div className="nav-avatar" onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{ background: isDev ? 'var(--voice-listening)' : 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: '#fff' }}>
          {userInfo?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div className={`avatar-dropdown ${dropdownOpen ? 'open' : ''}`}>
          <div style={{ padding: '8px 12px', fontSize: 13, color: 'var(--text-1)', fontWeight: 500 }}>
            {userInfo?.name || 'Guest'}
          </div>
          <div style={{ padding: '2px 12px 8px', fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
            {userInfo?.email || ''}
          </div>
          {isDev && (
            <div style={{ padding: '4px 12px 8px', fontSize: 10, color: 'var(--voice-listening)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
              DEVELOPER MODE · UNLIMITED
            </div>
          )}
          <button onClick={handleSignOut} id="sign-out-btn">Sign out</button>
        </div>
      </div>
    </nav>
  );
}
