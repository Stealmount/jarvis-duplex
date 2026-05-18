'use client';
import { MODES } from '@/lib/modes';

export default function ModeSelector({ currentMode, onSelect, onClose }) {
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
              <span className="mode-card-icon">{mode.icon}</span>
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
