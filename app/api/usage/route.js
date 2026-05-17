import { getSessionOrGuest } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getSessionOrGuest();

  // In-memory fallback when no Supabase
  if (!process.env.SUPABASE_URL) {
    return NextResponse.json({ count: 0, limit: parseInt(process.env.DAILY_MESSAGE_LIMIT || '50') });
  }

  try {
    const { getSupabaseAdmin } = await import('@/lib/supabase');
    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ count: 0, limit: 50 });

    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('daily_usage')
      .select('message_count')
      .eq('user_id', session.user.dbId)
      .eq('date', today)
      .single();

    return NextResponse.json({
      count: data?.message_count || 0,
      limit: parseInt(process.env.DAILY_MESSAGE_LIMIT || '50'),
    });
  } catch {
    return NextResponse.json({ count: 0, limit: 50 });
  }
}
