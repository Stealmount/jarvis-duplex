import { getSessionOrGuest } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(req) {
  await getSessionOrGuest();
  const { searchParams } = new URL(req.url);
  const threadId = searchParams.get('threadId');
  if (!threadId) return NextResponse.json({ error: 'Missing threadId' }, { status: 400 });
  if (!process.env.SUPABASE_URL) return NextResponse.json([]);
  try {
    const { getSupabaseAdmin } = await import('@/lib/supabase');
    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json([]);
    const session = await getSessionOrGuest();
    const { data } = await supabase.from('messages').select('*')
      .eq('thread_id', threadId).eq('user_id', session.user.dbId)
      .order('created_at', { ascending: true });
    return NextResponse.json(data || []);
  } catch { return NextResponse.json([]); }
}
