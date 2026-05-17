'use client';
import { useState } from 'react';

// Map model IDs to generic display names — never expose specific model names
const GENERIC_LABELS = {
  // Speed-based naming
  'fast': ['Lightning', 'Flash', 'Swift', 'Breeze', 'Spark', 'Dash', 'Bolt', 'Rapid'],
  'medium': ['Precision', 'Balanced', 'Steady', 'Apex', 'Prime'],
};

// Generate a consistent generic label from model info
function getGenericLabel(model, index) {
  const speedLabels = GENERIC_LABELS[model.speed] || GENERIC_LABELS['fast'];
  const tierPrefix = model.tier === 'paid' ? 'Pro ' : '';
  const bestForTag = model.bestFor?.[0] || 'general';
  const bestForLabel = {
    'general': 'General',
    'study': 'Study',
    'deep': 'Deep Think',
    'research': 'Research',
    'therapy': 'Companion',
  }[bestForTag] || 'General';

  const label = speedLabels[index % speedLabels.length];
  return `${tierPrefix}${label} · ${bestForLabel}`;
}

export default function ModelPicker({ models, activeModelId, autoMode, onSelectModel, onToggleAuto, availableProviders }) {
  const [expanded, setExpanded] = useState(false);
  const activeModel = models.find(m => m.id === activeModelId);

  const freeModels = models.filter(m => m.tier === 'free' && availableProviders.includes(m.provider));
  const paidModels = models.filter(m => m.tier === 'paid' && availableProviders.includes(m.provider));

  // Generate generic label for active model
  const activeGenericLabel = activeModel
    ? getGenericLabel(activeModel, models.indexOf(activeModel))
    : 'None';

  return (
    <div className="panel-section">
      <div className="panel-label">ACTIVE MODEL</div>
      <div className="model-card" onClick={() => setExpanded(!expanded)}>
        <div className="model-active">
          <span className="model-active-dot" />
          <span className="model-active-name">{autoMode ? 'Auto' : activeGenericLabel}</span>
          <span className="model-active-meta">{autoMode ? 'JARVIS picks' : (activeModel?.speed || '')} ▾</span>
        </div>
        {expanded && (
          <div className="model-dropdown">
            <div
              className={`model-option ${autoMode ? 'selected' : ''}`}
              onClick={(e) => { e.stopPropagation(); onToggleAuto(); }}
            >
              <span className="model-option-radio" />
              <span className="model-option-name">Auto (JARVIS picks per mode)</span>
            </div>
            {freeModels.length > 0 && <div className="model-group-label">— FREE —</div>}
            {freeModels.map((m, i) => (
              <div
                key={m.id}
                className={`model-option ${!autoMode && activeModelId === m.id ? 'selected' : ''}`}
                onClick={(e) => { e.stopPropagation(); onSelectModel(m.id); }}
              >
                <span className="model-option-radio" />
                <span className="model-option-name">{getGenericLabel(m, i)}</span>
                <span className={`speed-pill ${m.speed}`}>{m.speed}</span>
                <span className={`tier-pill ${m.tier}`}>{m.tier}</span>
              </div>
            ))}
            {paidModels.length > 0 && <div className="model-group-label">— PRO —</div>}
            {paidModels.map((m, i) => (
              <div
                key={m.id}
                className={`model-option ${!autoMode && activeModelId === m.id ? 'selected' : ''}`}
                onClick={(e) => { e.stopPropagation(); onSelectModel(m.id); }}
              >
                <span className="model-option-radio" />
                <span className="model-option-name">{getGenericLabel(m, freeModels.length + i)}</span>
                <span className={`speed-pill ${m.speed}`}>{m.speed}</span>
                <span className={`tier-pill ${m.tier}`}>{m.tier}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
