import { getSessionOrGuest } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getSessionOrGuest();

  const providers = [
    { name: 'openai', active: !!process.env.OPENAI_API_KEY },
    { name: 'anthropic', active: !!process.env.ANTHROPIC_API_KEY },
    { name: 'google gemini', active: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) },
    { name: 'openrouter', active: !!process.env.OPENROUTER_API_KEY },
    { name: 'groq', active: !!process.env.GROQ_API_KEY },
    { name: 'sambanova', active: !!process.env.SAMBANOVA_API_KEY },
    { name: 'cerebras', active: !!process.env.CEREBRAS_API_KEY },
    { name: 'elevenlabs', active: !!process.env.ELEVENLABS_API_KEY },
  ];

  // In-memory fallback when no Supabase
  if (!process.env.SUPABASE_URL) {
    return NextResponse.json({
      count: 0,
      limit: parseInt(process.env.DAILY_MESSAGE_LIMIT || '50'),
      providers,
    });
  }

  try {
    const { getSupabaseAdmin } = await import('@/lib/supabase');
    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ count: 0, limit: 50, providers });

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
      providers,
    });
  } catch {
    return NextResponse.json({ count: 0, limit: 50, providers });
  }
}
