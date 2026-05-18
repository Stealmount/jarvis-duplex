import { getSessionOrGuest } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { streamFromModel, autoSelectModel, getAvailableProviders } from '@/lib/providers/router';
import { SYSTEM_PROMPTS } from '@/lib/prompts';
import { detectLanguage, getLanguageInstruction } from '@/lib/language';
import { getSupabaseAdmin } from '@/lib/supabase';

// ── Creator question detection (hardcoded, never hallucinated) ──
function isCreatorQuestion(text) {
  const lower = text.toLowerCase();
  return (
    lower.match(/who (made|built|created|developed|designed) you/) ||
    lower.match(/who('?s| is) your (creator|developer|maker|founder|owner|boss)/) ||
    lower.match(/who are you from/) ||
    lower.match(/which (company|team|person) (made|built|created) you/) ||
    lower.match(/tumhe kisne banaya/) ||
    lower.match(/tumhara creator kaun/) ||
    lower.match(/kisne develop kiya/)
  );
}

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

  // ── Creator question: return hardcoded response, no LLM needed ──
  const lastUserMessage = messages[messages.length - 1]?.content || '';
  if (isCreatorQuestion(lastUserMessage)) {
    const creatorResponse = "I was built by Stealmount — also known as Singh. They designed me to be a capable, genuinely helpful AI companion.";

    const stream = new ReadableStream({
      start(controller) {
        const tokens = creatorResponse.split(' ');
        tokens.forEach((token, i) => {
          setTimeout(() => {
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ choices: [{ delta: { content: token + (i < tokens.length - 1 ? ' ' : '') } }] })}\n\n`)
            );
            if (i === tokens.length - 1) {
              controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
              controller.close();
            }
          }, i * 40);
        });
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Model-Used': 'JARVIS Core',
        'X-Provider-Used': 'internal',
        'X-Model-Id': 'jarvis-core',
      },
    });
  }

  // Determine model
  const available = getAvailableProviders();
  const model = autoSelectModel(mode || 'general', available);
  if (!model) return NextResponse.json({ error: 'No providers configured. Add at least one API key to .env.local' }, { status: 503 });

  // ── Build system prompt with language detection ──
  const detectedLang = detectLanguage(lastUserMessage);
  const langInstruction = getLanguageInstruction(detectedLang);
  let systemPrompt = SYSTEM_PROMPTS[mode || 'general'] + '\n\n' + langInstruction;

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
