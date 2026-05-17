import { getSessionOrGuest } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  await getSessionOrGuest();
  if (!process.env.SUPABASE_URL) return NextResponse.json([]);
  try {
    const { getSupabaseAdmin } = await import('@/lib/supabase');
    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json([]);
    const session = await getSessionOrGuest();
    const { data } = await supabase.from('threads').select('*')
      .eq('user_id', session.user.dbId).order('updated_at', { ascending: false });
    return NextResponse.json(data || []);
  } catch { return NextResponse.json([]); }
}

export async function POST(req) {
  const session = await getSessionOrGuest();
  const { title, mode } = await req.json();
  // If no Supabase, return a client-generated thread
  if (!process.env.SUPABASE_URL) {
    return NextResponse.json({
      id: crypto.randomUUID(), title: title || 'New conversation',
      mode: mode || 'general', created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    });
  }
  try {
    const { getSupabaseAdmin } = await import('@/lib/supabase');
    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ id: crypto.randomUUID(), title, mode, created_at: new Date().toISOString() });
    const { data } = await supabase.from('threads').insert({
      user_id: session.user.dbId, title: title || 'New conversation', mode: mode || 'general',
    }).select().single();
    return NextResponse.json(data);
  } catch { return NextResponse.json({ id: crypto.randomUUID(), title, mode, created_at: new Date().toISOString() }); }
}

export async function DELETE(req) {
  await getSessionOrGuest();
  const { threadId } = await req.json();
  if (!threadId) return NextResponse.json({ error: 'Missing threadId' }, { status: 400 });
  if (!process.env.SUPABASE_URL) return NextResponse.json({ ok: true });
  try {
    const { getSupabaseAdmin } = await import('@/lib/supabase');
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const session = await getSessionOrGuest();
      await supabase.from('threads').delete().eq('id', threadId).eq('user_id', session.user.dbId);
    }
  } catch {}
  return NextResponse.json({ ok: true });
}
