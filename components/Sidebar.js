'use client';
import { useState } from 'react';
import JarvisLogo from './JarvisLogo';
import ThemeToggle from './ThemeToggle';

const MODE_COLORS = {
  general: '#e85a2a', therapy: '#6ebf8b', deep: '#7b8fff',
  study: '#f5c842', research: '#4abde8',
};

// SVG icon components
const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const ChatIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const SparkleIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const SettingsIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;

export default function Sidebar({
  threads, activeThreadId, onSelectThread, onNewThread, onDeleteThread,
  isDuplex, onToggleDuplex, isOpen, voiceGender, onVoiceGenderChange,
  onDuplexStateChange, userInfo, onTogglePanel,
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={() => {}} />}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${isOpen ? 'mobile-open' : ''}`}>
        {/* Top: Logo + collapse */}
        <div className="sidebar-top">
          {!collapsed && <JarvisLogo size="sidebar" animated />}
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)} title={collapsed ? 'Expand' : 'Collapse'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {collapsed ? <polyline points="9 18 15 12 9 6"/> : <polyline points="15 18 9 12 15 6"/>}
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <nav className="sidebar-nav">
          <button className="nav-item" data-id="new-chat" onClick={onNewThread}>
            <PlusIcon />{!collapsed && <span>New Chat</span>}
          </button>
          <button className="nav-item" data-id="chats" onClick={() => {}}>
            <ChatIcon />{!collapsed && <span>Chats</span>}
          </button>
          <button className="nav-item" data-id="imagine" onClick={() => {}}>
            <SparkleIcon />{!collapsed && <span>Imagine</span>}
          </button>
        </nav>

        <div className="sidebar-divider" />

        {/* Recents */}
        {!collapsed && (
          <div className="sidebar-recents">
            <span className="sidebar-section-label">Recents</span>
            <div className="recent-threads">
              {threads.slice(0, 8).map(thread => (
                <button
                  key={thread.id}
                  className={`recent-thread ${thread.id === activeThreadId ? 'active' : ''}`}
                  onClick={() => onSelectThread(thread.id)}
                >
                  <span className="thread-mode-dot" style={{ background: MODE_COLORS[thread.mode] || 'var(--text-3)' }} />
                  <span className="thread-title-text">{thread.title || 'New conversation'}</span>
                </button>
              ))}
              {threads.length > 8 && (
                <button className="see-all-btn">See all →</button>
              )}
            </div>
          </div>
        )}

        {/* Duplex toggle */}
        {!collapsed && (
          <div style={{ padding: '0 12px 8px' }}>
            <button
              className={`nav-item ${isDuplex ? 'active' : ''}`}
              onClick={onToggleDuplex}
              title={isDuplex ? 'Disable voice' : 'Enable voice'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
              <span>{isDuplex ? 'Voice On' : 'Voice Off'}</span>
            </button>
            {isDuplex && (
              <div style={{ padding: '4px 10px', display: 'flex', gap: 8 }}>
                <button
                  className={`preset-pill ${voiceGender === 'male' ? 'active' : ''}`}
                  onClick={() => onVoiceGenderChange('male')}
                  style={{ fontSize: 10, padding: '3px 8px' }}
                >Male</button>
                <button
                  className={`preset-pill ${voiceGender === 'female' ? 'active' : ''}`}
                  onClick={() => onVoiceGenderChange('female')}
                  style={{ fontSize: 10, padding: '3px 8px' }}
                >Female</button>
              </div>
            )}
          </div>
        )}

        {/* Bottom actions */}
        <div className="sidebar-bottom">
          <ThemeToggle />
          <div className="nav-avatar" style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-1)', border: '1px solid var(--border)', flexShrink: 0 }}>
            {userInfo?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <button className="settings-btn" onClick={onTogglePanel} title="Settings" style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <SettingsIcon />
          </button>
        </div>
      </aside>
    </>
  );
}
