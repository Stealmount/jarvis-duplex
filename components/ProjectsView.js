'use client';

import { useState, useEffect } from 'react';

export default function ProjectsView({ isDark, router }) {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    // 1. Load local fallback projects
    const localProj = localStorage.getItem('jarvis_projects');
    if (localProj) {
      setProjects(JSON.parse(localProj));
    }

    // 2. Fetch server-side if authenticated
    fetch('/api/projects')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProjects(data);
          localStorage.setItem('jarvis_projects', JSON.stringify(data));
        }
      })
      .catch(() => {});
  }, []);

  const createProject = async () => {
    const name = prompt('Enter project name:');
    if (!name?.trim()) return;
    const desc = prompt('Enter project description (optional):') || '';

    const newProj = {
      id: crypto.randomUUID(),
      name: name.trim(),
      description: desc.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [...projects, newProj];
    setProjects(updated);
    localStorage.setItem('jarvis_projects', JSON.stringify(updated));

    // Server-sync
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProj.name, description: newProj.description }),
      });
      if (res.ok) {
        const saved = await res.json();
        const serverUpdated = projects.map(p => p.id === newProj.id ? saved : p);
        if (!projects.find(p => p.id === saved.id)) serverUpdated.push(saved);
        setProjects(serverUpdated);
        localStorage.setItem('jarvis_projects', JSON.stringify(serverUpdated));
      }
    } catch {}
  };

  const deleteProject = async (id) => {
    if (!confirm('Are you sure you want to delete this project? Conversations inside will be preserved.')) return;

    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem('jarvis_projects', JSON.stringify(updated));

    try {
      await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
    } catch {}
  };

  return (
    <div className="page-layout" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1rem', maxWidth: '800px', width: '100%', margin: '0 auto' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ fontFamily: 'var(--font-sans)', fontSize: '24px', fontWeight: 500, color: 'inherit', margin: 0 }}>Projects</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            className="auth-btn auth-btn--primary"
            onClick={createProject}
            style={{ width: 'auto', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', background: isDark ? '#fff' : '#000', color: isDark ? '#000' : '#fff', border: 'none', fontWeight: 500 }}
          >
            New project
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '2rem', position: 'relative' }}>
        <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <input 
          type="text" 
          placeholder="Search projects..." 
          style={{
            width: '100%',
            padding: '12px 16px 12px 40px',
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: '8px',
            color: 'inherit',
            fontSize: '14px',
            outline: 'none'
          }}
        />
      </div>

      {projects.length === 0 ? (
        <div
          className="empty-state"
          style={{
            textAlign: 'center',
            padding: '48px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div style={{ marginBottom: '8px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'inherit', opacity: 0.6 }}>
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <path d="M14 14h7v7h-7z" />
              <path d="M16 11v6" />
              <path d="M13 14h6" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h2 style={{ margin: 0, fontWeight: 500, color: 'inherit', fontSize: '18px' }}>Looking to start a project?</h2>
            <p style={{ margin: 0, color: 'inherit', opacity: 0.6, fontSize: '13px', maxWidth: '360px', lineHeight: 1.5 }}>
              Upload materials, set custom instructions, and organize conversations in one space.
            </p>
          </div>
          <button
            className="auth-btn auth-btn--secondary"
            onClick={createProject}
            style={{ width: 'auto', padding: '8px 16px', fontSize: '13px', borderRadius: '8px', marginTop: '8px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`, background: 'transparent', color: 'inherit', display: 'flex', gap: '8px', alignItems: 'center' }}
          >
            <span>+</span> New project
          </button>
        </div>
      ) : (
        <div className="projects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {projects.map(project => (
            <div
              key={project.id}
              className="project-card"
              style={{
                background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '120px',
                transition: 'border-color 150ms',
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 600, color: 'inherit' }}>{project.name}</h3>
                <p style={{ margin: 0, fontSize: '12px', color: 'inherit', opacity: 0.7, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {project.description || 'No description provided.'}
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '8px', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                <button
                  className="sample-try"
                  onClick={() => router.push(`/chat?project=${project.id}`)}
                  style={{ fontSize: '11px', padding: '4px 8px' }}
                >
                  Open
                </button>
                <button
                  onClick={() => deleteProject(project.id)}
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
