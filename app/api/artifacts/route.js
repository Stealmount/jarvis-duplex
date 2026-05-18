import { getSessionOrGuest } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getSessionOrGuest();
  if (!session || session.user?.role === 'guest') {
    return NextResponse.json([]);
  }

  if (!process.env.SUPABASE_URL) return NextResponse.json([]);

  try {
    const { getSupabaseAdmin } = await import('@/lib/supabase');
    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json([]);

    const { data } = await supabase
      .from('artifacts')
      .select('*')
      .eq('user_id', session.user.dbId)
      .order('created_at', { ascending: false });

    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req) {
  const session = await getSessionOrGuest();
  if (!session || session.user?.role === 'guest') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { type, title, content, storage_path, language, thread_id } = await req.json();
  if (!type) return NextResponse.json({ error: 'Missing type' }, { status: 400 });

  if (!process.env.SUPABASE_URL) {
    return NextResponse.json({
      id: crypto.randomUUID(),
      type,
      title,
      content,
      storage_path,
      language,
      thread_id,
      created_at: new Date().toISOString(),
    });
  }

  try {
    const { getSupabaseAdmin } = await import('@/lib/supabase');
    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: 'DB Unavailable' }, { status: 503 });

    const { data, error } = await supabase
      .from('artifacts')
      .insert({
        user_id: session.user.dbId,
        thread_id,
        type,
        title,
        content,
        storage_path,
        language,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const session = await getSessionOrGuest();
  if (!session || session.user?.role === 'guest') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  if (!process.env.SUPABASE_URL) return NextResponse.json({ ok: true });

  try {
    const { getSupabaseAdmin } = await import('@/lib/supabase');
    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase
        .from('artifacts')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.dbId);
    }
  } catch {}

  return NextResponse.json({ ok: true });
}
