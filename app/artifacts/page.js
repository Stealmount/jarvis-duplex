'use client';

import { useState, useEffect } from 'react';
import TopNav from '@/components/TopNav';

export default function ArtifactsPage() {
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>
      <TopNav status="idle" onToggleSidebar={() => {}} onTogglePanel={() => {}} />
      <div className="page-layout" style={{ flex: 1, overflowY: 'auto', padding: '40px 24px', maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 className="page-title" style={{ fontFamily: 'var(--font-sans)', fontSize: '28px', fontWeight: 500, color: 'var(--text-1)', margin: 0 }}>Artifacts</h1>
          <button
            className="auth-btn auth-btn--primary"
            style={{ width: 'auto', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', background: 'var(--text-1)', color: 'var(--bg)', border: 'none', fontWeight: 500 }}
          >
            New artifact
          </button>
        </div>

        {/* Tabs */}
        <div className="artifacts-tabs" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '48px' }}>
          <button
            className="preset-pill active"
            style={{ fontSize: '13px', padding: '6px 0', background: 'none', border: 'none', color: 'var(--text-1)', fontWeight: 500, borderRadius: 0, borderBottom: '2px solid var(--text-1)' }}
          >
            Your artifacts
          </button>
        </div>

        {/* Grid */}
        {filteredArtifacts.length === 0 ? (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-1)', marginBottom: '16px' }}>Let's get cooking! Pick an artifact category or start building your idea from scratch.</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { label: 'Apps and websites', icon: '📱' },
                { label: 'Documents and templates', icon: '📄' },
                { label: 'Games', icon: '🎮' },
                { label: 'Productivity tools', icon: '⚡' },
                { label: 'Creative projects', icon: '🎨' },
                { label: 'Quiz or survey', icon: '📝' },
                { label: 'Start from scratch', icon: '➕' },
              ].map(cat => (
                <button
                  key={cat.label}
                  style={{
                    background: 'var(--raised)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    minHeight: '120px',
                    cursor: 'pointer',
                    color: 'var(--text-1)',
                    fontSize: '15px',
                    fontWeight: 500,
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <span>{cat.label}</span>
                  <span style={{ fontSize: '18px', opacity: 0.7, alignSelf: 'flex-end' }}>{cat.icon}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="artifacts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {filteredArtifacts.map(art => (
              <div
                key={art.id}
                className="artifact-card"
                style={{
                  background: 'var(--raised)',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '160px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="feature-pill" style={{ fontSize: '9px', padding: '2px 6px', textTransform: 'uppercase' }}>
                      {art.type}
                    </span>
                    {art.language && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)' }}>
                        {art.language}
                      </span>
                    )}
                  </div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 600, color: 'var(--text-1)' }}>{art.title || 'Untitled Artifact'}</h3>
                  {art.type === 'code' && (
                    <pre style={{ margin: 0, padding: '8px', background: 'var(--bg)', borderRadius: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', border: '1px solid var(--border)' }}>
                      {art.content}
                    </pre>
                  )}
                  {art.type === 'image' && (
                    <div style={{ width: '100%', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <img src={art.storage_path || art.content} alt={art.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  {art.type === 'document' && (
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-2)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {art.content}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                  <button
                    className="sample-try"
                    onClick={() => downloadArtifact(art)}
                    style={{ fontSize: '11px', padding: '5px 10px' }}
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
    </div>
  );
}
