import { getSessionOrGuest } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const session = await getSessionOrGuest();
  const { threadId, content, model, mode } = await req.json();
  if (!threadId || !content) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  // Only save if Supabase is configured
  try {
    const { getSupabaseAdmin } = await import('@/lib/supabase');
    const supabase = getSupabaseAdmin();
    if (supabase && session.user.dbId !== 'guest') {
      await supabase.from('messages').insert({
        thread_id: threadId, user_id: session.user.dbId,
        role: 'assistant', content, model, mode,
      });
    }
  } catch {}
  return NextResponse.json({ ok: true });
}
