'use client';
import DuplexToggle from './DuplexToggle';

export default function Sidebar({ threads, activeThreadId, onSelectThread, onNewThread, onDeleteThread, isDuplex, onToggleDuplex, isOpen, voiceGender, onVoiceGenderChange }) {
  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const modeColors = {
    general: 'var(--mode-general)', therapy: 'var(--mode-therapy)',
    deep: 'var(--mode-deep)', study: 'var(--mode-study)', research: 'var(--mode-research)',
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
      <div className="sidebar-header">
        <button className="new-thread-btn" onClick={onNewThread} id="new-thread-btn">
          <span style={{ fontSize: 16 }}>+</span>
          <span>New conversation</span>
        </button>
      </div>
      <div className="thread-list" id="thread-list">
        {threads.map((t) => (
          <div
            key={t.id}
            className={`thread-item ${t.id === activeThreadId ? 'active' : ''}`}
            onClick={() => onSelectThread(t.id)}
          >
            <span className="thread-mode-dot" style={{ background: modeColors[t.mode] || modeColors.general }} />
            <span className="thread-title">{t.title}</span>
            <span className="thread-time">{formatTime(t.updated_at || t.created_at)}</span>
            <button className="thread-delete" onClick={(e) => { e.stopPropagation(); onDeleteThread(t.id); }} title="Delete">×</button>
          </div>
        ))}
      </div>
      <DuplexToggle isDuplex={isDuplex} onToggle={onToggleDuplex} voiceGender={voiceGender} onVoiceGenderChange={onVoiceGenderChange} />
    </aside>
  );
}
