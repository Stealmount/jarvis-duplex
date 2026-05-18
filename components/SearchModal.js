'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getLocalThreads } from '@/lib/storage';

export default function SearchModal({ onClose, onSelectThread }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const modalRef = useRef(null);

  useEffect(() => {
    // Focus search on mount
    const input = document.getElementById('search-input');
    input?.focus();

    // Close on click outside
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  // Debounced search logic supporting BOTH server database and client-side fallback
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      const matchQuery = query.toLowerCase();
      const localResults = [];

      // 1. Search client-side LocalStorage
      const localData = getLocalThreads();
      Object.entries(localData).forEach(([threadId, thread]) => {
        const titleMatch = thread.meta?.title?.toLowerCase().includes(matchQuery);
        let contentMatch = null;
        
        thread.messages?.forEach(msg => {
          if (msg.content?.toLowerCase().includes(matchQuery)) {
            contentMatch = msg.content;
          }
        });

        if (titleMatch || contentMatch) {
          localResults.push({
            thread_id: threadId,
            title: thread.meta?.title || 'Untitled conversation',
            mode: thread.meta?.mode || 'general',
            excerpt: contentMatch ? contentMatch : 'Matched conversation title',
          });
        }
      });

      // 2. Try server-side DB search
      try {
        const res = await fetch(`/api/chat-search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const dbData = await res.json();
          if (Array.isArray(dbData) && dbData.length > 0) {
            // Merge with local results, avoiding duplicates
            const merged = [...localResults];
            dbData.forEach(item => {
              if (!merged.find(m => m.thread_id === item.thread_id)) {
                merged.push({
                  thread_id: item.thread_id,
                  title: item.title || 'Untitled conversation',
                  mode: item.mode || 'general',
                  excerpt: item.content || '',
                });
              }
            });
            setResults(merged);
            return;
          }
        }
      } catch {}

      setResults(localResults);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '80px',
      }}
    >
      <div
        ref={modalRef}
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '18px', color: 'var(--text-3)' }}>🔍</span>
          <input
            id="search-input"
            type="text"
            placeholder="Search your conversations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-1)',
              fontFamily: 'var(--font-sans)',
              fontSize: '16px',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '8px' }}>
          {results.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-3)', padding: '24px', fontSize: '13px', margin: 0 }}>
              {query.trim() ? 'No results found.' : 'Type to search thread titles and messages...'}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (onSelectThread) {
                      onSelectThread(r.thread_id);
                    } else {
                      router.push(`/chat?thread=${r.thread_id}`);
                    }
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    width: '100%',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'background 120ms',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--raised)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-1)' }}>{r.title}</span>
                    <span className="feature-pill" style={{ fontSize: '9px', padding: '2px 6px', textTransform: 'uppercase' }}>
                      {r.mode}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-3)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {r.excerpt}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
