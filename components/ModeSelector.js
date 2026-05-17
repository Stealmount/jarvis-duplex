'use client';
const MODES = [
  { id: 'general', name: 'GENERAL', icon: '◎', desc: 'Everyday conversations', color: 'var(--mode-general)' },
  { id: 'therapy', name: 'THERAPY', icon: '◌', desc: 'Empathetic listener', color: 'var(--mode-therapy)' },
  { id: 'deep', name: 'DEEP THINK', icon: '◈', desc: 'Analytical reasoning', color: 'var(--mode-deep)' },
  { id: 'study', name: 'STUDY', icon: '◇', desc: 'Socratic tutoring', color: 'var(--mode-study)' },
  { id: 'research', name: 'RESEARCH', icon: '◆', desc: 'Web research & analysis', color: 'var(--mode-research)' },
];

export default function ModeSelector({ activeMode, onSelectMode }) {
  return (
    <div className="panel-section">
      <div className="panel-label">MODE</div>
      <div className="mode-grid">
        {MODES.map((m) => (
          <div
            key={m.id}
            className={`mode-card ${activeMode === m.id ? 'active' : ''}`}
            data-mode={m.id}
            onClick={() => onSelectMode(m.id)}
            role="button"
            tabIndex={0}
          >
            <div className="mode-icon" style={{ color: m.color }}>{m.icon}</div>
            <div className="mode-name">{m.name}</div>
            <div className="mode-desc">{m.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { MODES };
