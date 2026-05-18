'use client';
import { useRouter } from 'next/navigation';

export default function TopNav({ status, usage, onToggleSidebar, onTogglePanel, userInfo, streamingModel, currentMode, onToggleModeSelector }) {
  const router = useRouter();
  const isDev = userInfo?.role === 'developer';
  const statusClass = status === 'listening' ? 'listening' : status === 'thinking' ? 'thinking' : status === 'speaking' ? 'speaking' : '';
  const statusText = status === 'listening' ? 'Listening' : status === 'thinking' ? 'Thinking' : status === 'speaking' ? 'Speaking' : 'Ready';

  // Mode Display Helper
  const modeLabel = currentMode === 'therapy' ? 'THERAPY' : currentMode === 'deep' ? 'DEEP THINK' : currentMode === 'study' ? 'STUDY' : currentMode === 'research' ? 'RESEARCH' : 'GENERAL';
  const modeColor = currentMode === 'general' ? 'var(--text-3)' : `var(--mode-${currentMode})`;

  return (
    <nav className="top-nav" id="top-nav">
      <div className="top-nav-left">
        <button className="hamburger-btn" onClick={onToggleSidebar} aria-label="Menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      <div className="top-nav-center">
        <button 
          className="mode-pill-nav" 
          onClick={onToggleModeSelector}
          style={{ borderColor: modeColor, color: modeColor }}
        >
          {modeLabel}
        </button>
        <div className="status-pill">
          <span className={`nav-status-dot ${statusClass}`} />
          <span>{statusText}</span>
          {streamingModel && <span style={{ opacity: 0.5, fontSize: 9, marginLeft: 4 }}>· {streamingModel}</span>}
        </div>
      </div>

      <div className="top-nav-right">
        <button className="nav-action-pill" onClick={() => router.push('/imagine')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span>Imagine</span>
        </button>

        {isDev ? (
          <div className="dev-badge" id="dev-badge">
            <span style={{ fontSize: 10 }}>⚡</span>
          </div>
        ) : usage ? (
          <div className="usage-counter" id="usage-meter">
            {usage.count}/{usage.limit}
          </div>
        ) : null}
      </div>
    </nav>
  );
}
