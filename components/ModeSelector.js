'use client';
import { MODES } from '@/lib/modes';

const ThinkingIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const LearningIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const TherapyIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

export default function ModeSelector({ currentMode, onSelect, onClose }) {
  const getModeIcon = (id) => {
    if (id === 'deep') return <ThinkingIcon size={20} />;
    if (id === 'study') return <LearningIcon size={20} />;
    if (id === 'therapy') return <TherapyIcon size={20} />;
    return null;
  };

  return (
    <>
      {/* Backdrop */}
      <div className="mode-backdrop" onClick={onClose} />

      {/* Sheet */}
      <div className="mode-sheet">
        <div className="mode-sheet-handle" />
        <div className="mode-sheet-title">Switch Mode</div>

        <div className="mode-grid">
          {Object.values(MODES).filter(m => !m.isDefault).map(mode => (
            <button
              key={mode.id}
              className={`mode-card ${currentMode === mode.id ? 'active' : ''}`}
              style={{ '--mode-color': mode.color }}
              onClick={() => {
                onSelect(mode.id);
                onClose();
              }}
            >
              <span className="mode-card-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{getModeIcon(mode.id)}</span>
              <span className="mode-card-label">{mode.label}</span>
              <span className="mode-card-desc">{mode.description}</span>
            </button>
          ))}
        </div>

        {/* Return to General */}
        {currentMode !== 'general' && (
          <button
            className="mode-general-btn"
            onClick={() => { onSelect('general'); onClose(); }}
          >
            Return to General
          </button>
        )}
      </div>
    </>
  );
}
