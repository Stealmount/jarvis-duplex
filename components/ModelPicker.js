'use client';
import { useState, useMemo } from 'react';

// Provider badge mapping
const PROVIDER_BADGES = {
  cerebras:    'CB',
  sambanova:   'SN',
  groq:        'GQ',
  openrouter:  'OR',
  kimi:        'KM',
  minimax:     'MM',
  google:      'GG',
  mistral:     'MI',
  cohere:      'CO',
  nvidia:      'NV',
  cloudflare:  'CF',
  sarvam:      'SV',
  huggingface: 'HF',
  together:    'TG',
  fireworks:   'FW',
  deepseek:    'DS',
  openai:      'OA',
};

// Model categories for grouped display
const MODEL_CATEGORIES = [
  {
    label: 'REASONING & DEEP ANALYSIS',
    filter: (m) => m.specialty?.match(/Reasoning|Deep|Math/i),
  },
  {
    label: 'CODE SPECIALISTS',
    filter: (m) => m.specialty?.match(/Code|80\+/i) && !m.specialty?.match(/Reasoning|Deep/i),
  },
  {
    label: 'FASTEST MODELS',
    filter: (m) => m.speed === 'fast' && m.specialty?.match(/Ultra-fast|Lightning|Instant|Fast/i),
  },
  {
    label: 'LONG CONTEXT',
    filter: (m) => m.specialty?.match(/Long context|Ultra-long|128K/i),
  },
  {
    label: 'INDIAN LANGUAGE',
    filter: (m) => m.specialty?.match(/Hindi|Indian/i),
  },
  {
    label: 'GENERAL PURPOSE',
    filter: (m) => true, // Catch-all for remaining models
  },
];

export default function ModelPicker({ models, activeModelId, autoMode, onSelectModel, onToggleAuto, availableProviders }) {
  const [expanded, setExpanded] = useState(false);

  // Filter to available models only
  const availableModels = useMemo(() =>
    models.filter(m => availableProviders.includes(m.provider)),
    [models, availableProviders]
  );

  // Categorize models
  const categorizedModels = useMemo(() => {
    const placed = new Set();
    const categories = [];

    for (const cat of MODEL_CATEGORIES) {
      const catModels = availableModels.filter(m => {
        if (placed.has(m.id)) return false;
        return cat.filter(m);
      });
      if (catModels.length > 0) {
        // For the catch-all "General Purpose" category, only add models not yet placed
        if (cat.label === 'GENERAL PURPOSE') {
          const remaining = catModels.filter(m => !placed.has(m.id));
          if (remaining.length > 0) {
            categories.push({ label: cat.label, models: remaining });
            remaining.forEach(m => placed.add(m.id));
          }
        } else {
          categories.push({ label: cat.label, models: catModels });
          catModels.forEach(m => placed.add(m.id));
        }
      }
    }
    return categories;
  }, [availableModels]);

  const activeModel = models.find(m => m.id === activeModelId);

  return (
    <div className="panel-section">
      <div className="panel-label">ACTIVE MODEL</div>
      <div className="model-card" onClick={() => setExpanded(!expanded)}>
        <div className="model-active">
          <span className="model-active-dot" />
          <span className="model-active-name">
            {autoMode ? 'Auto' : (activeModel?.label || 'None')}
          </span>
          <span className="model-active-meta">
            {autoMode ? 'JARVIS picks' : (activeModel?.speed || '')} ▾
          </span>
        </div>
        {expanded && (
          <div className="model-dropdown">
            {/* Auto option */}
            <div
              className={`model-option ${autoMode ? 'selected' : ''}`}
              onClick={(e) => { e.stopPropagation(); onToggleAuto(); }}
            >
              <span className="model-option-radio" />
              <span className="model-option-name">Auto (JARVIS picks per mode)</span>
            </div>

            {/* Categorized models */}
            {categorizedModels.map((cat) => (
              <div key={cat.label}>
                <div className="model-group-label">— {cat.label} —</div>
                {cat.models.map((m) => (
                  <div
                    key={m.id}
                    className={`model-option ${!autoMode && activeModelId === m.id ? 'selected' : ''}`}
                    onClick={(e) => { e.stopPropagation(); onSelectModel(m.id); }}
                    title={m.description}
                  >
                    <span className="model-option-radio" />
                    <span className="model-option-name">{m.label}</span>
                    <span className="model-specialty">{m.specialty}</span>
                    <span className={`tier-pill ${m.tier}`}>{m.tier}</span>
                    <span className="provider-badge">{PROVIDER_BADGES[m.provider] || m.provider.slice(0, 2).toUpperCase()}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
