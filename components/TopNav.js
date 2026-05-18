'use client';
import { useRouter } from 'next/navigation';

export default function TopNav({ status, usage, onToggleSidebar, onTogglePanel, userInfo, streamingModel }) {
  const router = useRouter();
  const isDev = userInfo?.role === 'developer';
  const statusClass = status === 'listening' ? 'listening' : status === 'thinking' ? 'thinking' : status === 'speaking' ? 'speaking' : '';
  const statusText = status === 'listening' ? 'Listening' : status === 'thinking' ? 'Thinking' : status === 'speaking' ? 'Speaking' : 'Ready';

  return (
    <nav className="top-nav" id="top-nav">
      {/* Mobile hamburger */}
      <button className="hamburger-btn" onClick={onToggleSidebar} aria-label="Menu">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {/* Status */}
      <div className="nav-status">
        <span className={`nav-status-dot ${statusClass}`} />
        <span>{statusText}</span>
        {streamingModel && <span style={{ opacity: 0.5, fontSize: 9, marginLeft: 4 }}>· {streamingModel}</span>}
      </div>

      <div className="nav-spacer" />

      {/* Right actions */}
      <div className="nav-right-actions">
        <button className="nav-action-pill" onClick={() => router.push('/imagine')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span>Imagine</span>
        </button>
      </div>

      {isDev && (
        <div className="dev-badge" id="dev-badge">
          <span style={{ fontSize: 10 }}>⚡</span>
          <span style={{ fontSize: 10 }}>DEV</span>
        </div>
      )}

      {usage && !isDev && (
        <div className="usage-meter" id="usage-meter">
          <span>{usage.count} / {usage.limit}</span>
          <div className="usage-bar">
            <div className={`usage-fill ${usage.count / usage.limit > 0.8 ? 'critical' : ''}`} style={{ width: `${(usage.count / usage.limit) * 100}%` }} />
          </div>
        </div>
      )}
      {isDev && <div className="usage-meter" style={{ color: 'var(--text-2)' }}><span>∞</span></div>}
    </nav>
  );
}
