import { getSessionOrGuest } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const session = await getSessionOrGuest();
  if (!session || session.user?.role === 'guest') {
    return NextResponse.json([]);
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');
  if (!query?.trim()) return NextResponse.json([]);

  if (!process.env.SUPABASE_URL) return NextResponse.json([]);

  try {
    const { getSupabaseAdmin } = await import('@/lib/supabase');
    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json([]);

    // Query messages that match
    const { data, error } = await supabase
      .from('messages')
      .select('content, thread_id, threads(title, mode)')
      .ilike('content', `%${query}%`)
      .eq('user_id', session.user.dbId)
      .limit(20);

    if (error) {
      console.error('[Search] Supabase error:', error.message);
      return NextResponse.json([]);
    }

    const formatted = data?.map(r => ({
      thread_id: r.thread_id,
      title: r.threads?.title,
      mode: r.threads?.mode,
      content: r.content,
    })) || [];

    return NextResponse.json(formatted);
  } catch (err) {
    console.error('[Search] Failed:', err.message);
    return NextResponse.json([]);
  }
}
