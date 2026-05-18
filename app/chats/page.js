'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/TopNav';
import { getLocalThreads, setLocalThreads, deleteLocalThread } from '@/lib/storage';

export default function ChatsPage() {
  const router = useRouter();
  const [threads, setThreads] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    // 1. Load local threads
    const localData = getLocalThreads();
    const localThreadArray = Object.entries(localData)
      .filter(([, v]) => v && v.meta)
      .map(([id, v]) => ({ id, ...v.meta }))
      .sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
    setThreads(localThreadArray);

    // 2. Fetch server threads if online
    fetch('/api/threads')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setThreads(data);
          // Sync to local
          const newLocal = { ...localData };
          data.forEach(t => {
            if (!newLocal[t.id]) newLocal[t.id] = { messages: [], meta: t, synced: true };
            else { newLocal[t.id].meta = t; newLocal[t.id].synced = true; }
          });
          setLocalThreads(newLocal);
        }
      })
      .catch(() => {});
  }, []);

  const createNewThread = async () => {
    // Basic local fallback
    const id = crypto.randomUUID();
    const newThreadMeta = {
      id,
      title: 'New conversation',
      mode: 'general',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const localData = getLocalThreads();
    localData[id] = { messages: [], meta: newThreadMeta, synced: false };
    setLocalThreads(localData);
    
    // Server creation
    try {
      const res = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New conversation', mode: 'general' }),
      });
      if (res.ok) {
        const serverThread = await res.json();
        localData[serverThread.id] = { messages: [], meta: serverThread, synced: true };
        delete localData[id];
        setLocalThreads(localData);
        router.push(`/chat?thread=${serverThread.id}`);
        return;
      }
    } catch {}
    router.push(`/chat?thread=${id}`);
  };

  const handleDeleteThread = async (id) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;
    deleteLocalThread(id);
    setThreads(prev => prev.filter(t => t.id !== id));

    try {
      await fetch('/api/threads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId: id }),
      });
    } catch {}
  };

  // Filter threads by mode
  const filteredThreads = threads.filter(t => {
    if (activeFilter === 'All') return true;
    const norm = activeFilter.toLowerCase().replace(' ', '');
    // Map Deep Think -> deep
    const targetMode = norm === 'deepthink' ? 'deep' : norm;
    return t.mode === targetMode;
  });

  // Group threads by date
  const groupThreads = (list) => {
    const today = [];
    const yesterday = [];
    const thisWeek = [];
    const older = [];

    const now = new Date();
    now.setHours(0,0,0,0);
    const yest = new Date(now);
    yest.setDate(yest.getDate() - 1);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    list.forEach(t => {
      const date = new Date(t.updated_at || t.created_at);
      if (date >= now) today.push(t);
      else if (date >= yest) yesterday.push(t);
      else if (date >= sevenDaysAgo) thisWeek.push(t);
      else older.push(t);
    });

    const groups = [];
    if (today.length > 0) groups.push({ label: 'Today', threads: today });
    if (yesterday.length > 0) groups.push({ label: 'Yesterday', threads: yesterday });
    if (thisWeek.length > 0) groups.push({ label: 'Previous 7 Days', threads: thisWeek });
    if (older.length > 0) groups.push({ label: 'Older', threads: older });
    return groups;
  };

  const groupedThreads = groupThreads(filteredThreads);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>
      <TopNav status="idle" onToggleSidebar={() => {}} onTogglePanel={() => {}} />
      <div className="page-layout" style={{ flex: 1, overflowY: 'auto', padding: '40px 24px', maxWidth: '800px', width: '100%', margin: '0 auto' }}>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 className="page-title" style={{ fontFamily: 'var(--font-sans)', fontSize: '28px', fontWeight: 500, color: 'var(--text-1)' }}>Chats</h1>
          <button
            className="auth-btn auth-btn--primary"
            onClick={createNewThread}
            style={{ width: 'auto', padding: '10px 16px', borderRadius: '10px', fontSize: '13px' }}
          >
            + New Chat
          </button>
        </div>

        {/* Filter bar */}
        <div className="filter-bar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
          {['All', 'General', 'Therapy', 'Deep Think', 'Study', 'Research'].map(f => (
            <button
              key={f}
              className={`preset-pill ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Thread list */}
        {groupedThreads.length === 0 ? (
          <div className="empty-state" style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--raised)', borderRadius: '14px', border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text-2)', fontSize: '14px', margin: 0 }}>No conversations found.</p>
          </div>
        ) : (
          <div className="thread-list-full" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {groupedThreads.map(group => (
              <div key={group.label} className="thread-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span className="thread-group-label" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)' }}>
                  {group.label}
                </span>
                {group.threads.map(thread => (
                  <div
                    key={thread.id}
                    className="thread-list-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: 'var(--raised)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      transition: 'border-color 150ms',
                    }}
                  >
                    <button
                      onClick={() => router.push(`/chat?thread=${thread.id}`)}
                      style={{
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        flex: 1,
                        cursor: 'pointer',
                        color: 'var(--text-1)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '14px',
                        fontWeight: 500,
                        padding: 0,
                        marginRight: '12px',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {thread.title || 'Untitled conversation'}
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span
                        className="feature-pill"
                        style={{
                          fontSize: '9px',
                          padding: '2px 6px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          opacity: 0.8,
                        }}
                      >
                        {thread.mode || 'general'}
                      </span>
                      <button
                        onClick={() => handleDeleteThread(thread.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ff5555',
                          cursor: 'pointer',
                          fontSize: '13px',
                          padding: '4px',
                          opacity: 0.7,
                          transition: 'opacity 150ms',
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = 1}
                        onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
                        title="Delete chat"
                      >
                        ✕
                      </button>
                    </div>
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
