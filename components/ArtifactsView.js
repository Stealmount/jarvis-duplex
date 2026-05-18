'use client';

import { useState, useEffect } from 'react';

const DeviceIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);

const DocumentIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const GameIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="2" y="6" width="20" height="12" rx="3" />
    <path d="M6 12h4M8 10v4M15 11h.01M18 13h.01" />
  </svg>
);

const ProductivityIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const CreativePaletteIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M12 22C17.52 22 22 17.52 22 12S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z" />
    <circle cx="7.5" cy="10.5" r="1.5" />
    <circle cx="11.5" cy="7.5" r="1.5" />
    <circle cx="16.5" cy="9.5" r="1.5" />
    <circle cx="15.5" cy="14.5" r="1.5" />
  </svg>
);

const SurveyIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <line x1="9" y1="12" x2="15" y2="12" />
    <line x1="9" y1="16" x2="15" y2="16" />
    <polyline points="9 9 9.01 9" />
    <polyline points="9 13 9.01 13" />
  </svg>
);

const StartFromScratchIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default function ArtifactsView({ isDark }) {
  const [artifacts, setArtifacts] = useState([]);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    // 1. Load local fallback artifacts
    const localArts = localStorage.getItem('jarvis_artifacts');
    if (localArts) {
      setArtifacts(JSON.parse(localArts));
    }

    // 2. Fetch server-side if authenticated
    fetch('/api/artifacts')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setArtifacts(data);
          localStorage.setItem('jarvis_artifacts', JSON.stringify(data));
        }
      })
      .catch(() => {});
  }, []);

  const deleteArtifact = async (id) => {
    if (!confirm('Are you sure you want to delete this artifact?')) return;

    const updated = artifacts.filter(a => a.id !== id);
    setArtifacts(updated);
    localStorage.setItem('jarvis_artifacts', JSON.stringify(updated));

    try {
      await fetch(`/api/artifacts?id=${id}`, { method: 'DELETE' });
    } catch {}
  };

  const downloadArtifact = (art) => {
    const element = document.createElement('a');
    const file = new Blob([art.content || ''], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${art.title || 'artifact'}.${art.type === 'code' ? (art.language || 'txt') : 'txt'}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const filteredArtifacts = artifacts.filter(art => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Code') return art.type === 'code';
    if (activeTab === 'Images') return art.type === 'image';
    if (activeTab === 'Documents') return art.type === 'document';
    return true;
  });

  return (
    <div className="page-layout" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1rem', maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ fontFamily: 'var(--font-sans)', fontSize: '24px', fontWeight: 500, color: 'inherit', margin: 0 }}>Artifacts</h1>
      </div>

      {/* Tabs */}
      <div className="artifacts-tabs" style={{ display: 'flex', gap: '8px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, paddingBottom: '12px', marginBottom: '2rem' }}>
        <button
          className="preset-pill active"
          style={{ fontSize: '13px', padding: '6px 0', background: 'none', border: 'none', color: 'inherit', fontWeight: 500, borderRadius: 0, borderBottom: '2px solid currentColor' }}
        >
          Your artifacts
        </button>
      </div>

      {/* Grid */}
      {filteredArtifacts.length === 0 ? (
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 500, color: 'inherit', marginBottom: '1.5rem', opacity: 0.8 }}>Let's get cooking! Pick an artifact category or start building your idea from scratch.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
            {[
              { label: 'Apps and websites', icon: <DeviceIcon size={18} /> },
              { label: 'Documents and templates', icon: <DocumentIcon size={18} /> },
              { label: 'Games', icon: <GameIcon size={18} /> },
              { label: 'Productivity tools', icon: <ProductivityIcon size={18} /> },
              { label: 'Creative projects', icon: <CreativePaletteIcon size={18} /> },
              { label: 'Quiz or survey', icon: <SurveyIcon size={18} /> },
              { label: 'Start from scratch', icon: <StartFromScratchIcon size={18} /> },
            ].map(cat => (
              <button
                key={cat.label}
                style={{
                  background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  minHeight: '100px',
                  cursor: 'pointer',
                  color: 'inherit',
                  fontSize: '14px',
                  fontWeight: 500,
                  textAlign: 'left',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}
              >
                <span>{cat.label}</span>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mode-deep, #7b8fff)', opacity: 0.85, alignSelf: 'flex-end' }}>{cat.icon}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="artifacts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {filteredArtifacts.map(art => (
            <div
              key={art.id}
              className="artifact-card"
              style={{
                background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '140px',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="feature-pill" style={{ fontSize: '9px', padding: '2px 6px', textTransform: 'uppercase' }}>
                    {art.type}
                  </span>
                  {art.language && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', opacity: 0.6 }}>
                      {art.language}
                    </span>
                  )}
                </div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 600, color: 'inherit' }}>{art.title || 'Untitled Artifact'}</h3>
                {art.type === 'code' && (
                  <pre style={{ margin: 0, padding: '8px', background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)', borderRadius: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                    {art.content}
                  </pre>
                )}
                {art.type === 'image' && (
                  <div style={{ width: '100%', height: '80px', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                    <img src={art.storage_path || art.content} alt={art.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                {art.type === 'document' && (
                  <p style={{ margin: 0, fontSize: '12px', color: 'inherit', opacity: 0.8, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {art.content}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '8px', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                <button
                  className="sample-try"
                  onClick={() => downloadArtifact(art)}
                  style={{ fontSize: '11px', padding: '4px 8px' }}
                >
                  Download
                </button>
                <button
                  onClick={() => deleteArtifact(art.id)}
                  style={{ background: 'none', border: 'none', color: '#ff5555', cursor: 'pointer', fontSize: '12px', opacity: 0.8 }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
