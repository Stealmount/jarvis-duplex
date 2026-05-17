import { getSessionOrGuest } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { streamFromModel, autoSelectModel, getAvailableProviders, ALL_MODELS } from '@/lib/providers/router';
import { SYSTEM_PROMPTS } from '@/lib/prompts';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req) {
  const session = await getSessionOrGuest();

  const supabase = getSupabaseAdmin();

  // Check daily limit (in-memory fallback if no DB)
  let count = 0;
  const limit = parseInt(process.env.DAILY_MESSAGE_LIMIT || '50');

  if (supabase && session.user.dbId && session.user.dbId !== 'guest') {
    const today = new Date().toISOString().split('T')[0];
    const { data: usage } = await supabase
      .from('daily_usage')
      .select('message_count')
      .eq('user_id', session.user.dbId)
      .eq('date', today)
      .single();
    count = usage?.message_count || 0;
    if (count >= limit) {
      return NextResponse.json({ error: 'Daily limit reached' }, { status: 429 });
    }
  }

  const { messages, mode, modelId, threadId, ragContext } = await req.json();

  // Determine model
  const available = getAvailableProviders();
  let model;
  if (modelId) {
    model = ALL_MODELS.find(m => m.id === modelId && available.includes(m.provider));
  }
  if (!model) model = autoSelectModel(mode || 'general', available);
  if (!model) return NextResponse.json({ error: 'No providers configured. Add at least one API key to .env.local' }, { status: 503 });

  // Build system prompt
  let systemPrompt = SYSTEM_PROMPTS[mode || 'general'];
  if (ragContext) {
    systemPrompt += `\n\n--- DOCUMENT CONTEXT ---\n${ragContext}\n--- END CONTEXT ---\nAnswer using the above context when relevant.`;
  }

  try {
    const stream = await streamFromModel(model, messages, systemPrompt);

    // Increment usage in DB (async, don't block stream)
    if (supabase && session.user.dbId && session.user.dbId !== 'guest') {
      const today = new Date().toISOString().split('T')[0];
      supabase.from('daily_usage').upsert(
        { user_id: session.user.dbId, date: today, message_count: count + 1 },
        { onConflict: 'user_id,date' }
      ).then(() => {});

      if (threadId && messages.length > 0) {
        const lastUser = messages[messages.length - 1];
        supabase.from('messages').insert({
          thread_id: threadId, user_id: session.user.dbId,
          role: 'user', content: lastUser.content, mode, model: model.id,
        }).then(() => {});
        supabase.from('threads').update({ updated_at: new Date().toISOString() })
          .eq('id', threadId).then(() => {});
      }
    }

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Model-Used': model.label,
        'X-Provider-Used': model.provider,
        'X-Model-Id': model.id,
      },
    });
  } catch (err) {
    console.error('Chat error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
