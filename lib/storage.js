'use client';

/**
 * Dual-layer storage manager: Supabase + localStorage
 * Authenticated users: both layers (Supabase is source of truth)
 * Guest users: localStorage only
 */

const LOCAL_THREADS_KEY = 'jarvis_threads_v2';
const LOCAL_CURRENT_KEY = 'jarvis_current_thread';

// ─── LOCAL STORAGE ────────────────────────────────────────────────────────────

export function getLocalThreads() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_THREADS_KEY) || '{}');
  } catch { return {}; }
}

export function setLocalThreads(threads) {
  localStorage.setItem(LOCAL_THREADS_KEY, JSON.stringify(threads));
}

export function getLocalCurrentThreadId() {
  return localStorage.getItem(LOCAL_CURRENT_KEY) || null;
}

export function setLocalCurrentThreadId(id) {
  localStorage.setItem(LOCAL_CURRENT_KEY, id);
}

export function saveMessageToLocal(threadId, message) {
  const threads = getLocalThreads();
  if (!threads[threadId]) threads[threadId] = { messages: [], meta: {} };
  threads[threadId].messages.push(message);
  // Keep only last 100 messages in local storage per thread
  if (threads[threadId].messages.length > 100) {
    threads[threadId].messages = threads[threadId].messages.slice(-100);
  }
  setLocalThreads(threads);
}

export function deleteLocalThread(threadId) {
  const threads = getLocalThreads();
  delete threads[threadId];
  setLocalThreads(threads);
}

// ─── SUPABASE (Server-side via API routes) ───────────────────────────────────

export async function fetchThreadsFromServer() {
  try {
    const res = await fetch('/api/threads');
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

export async function fetchMessagesFromServer(threadId, limit = 50) {
  try {
    const res = await fetch(`/api/messages?threadId=${threadId}&limit=${limit}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

export async function createThreadOnServer(mode = 'general') {
  try {
    const res = await fetch('/api/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New conversation', mode }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

export async function deleteThreadOnServer(threadId) {
  try {
    await fetch('/api/threads', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId }),
    });
  } catch {}
}

export async function updateThreadTitleOnServer(threadId, title) {
  try {
    await fetch('/api/threads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId, title: title.slice(0, 80) }),
    });
  } catch {}
}

// ─── SYNC ────────────────────────────────────────────────────────────────────

/**
 * Merge server threads with localStorage threads.
 * Called on app load after auth resolves.
 */
export async function syncThreads(isAuthenticated) {
  if (!isAuthenticated) return getLocalThreads();

  const remoteThreads = await fetchThreadsFromServer();
  const localThreads = getLocalThreads();

  // Build merged structure
  const merged = { ...localThreads };

  remoteThreads.forEach(rt => {
    if (!merged[rt.id]) {
      merged[rt.id] = { messages: [], meta: rt, synced: true };
    } else {
      // Update meta from remote, keep local messages as cache
      merged[rt.id].meta = { ...merged[rt.id].meta, ...rt };
      merged[rt.id].synced = true;
    }
  });

  setLocalThreads(merged);
  return merged;
}

/**
 * Format relative time for thread list
 */
export function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
