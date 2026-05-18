import { NextResponse } from 'next/server';

// Creator question detection (hardcoded)
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
  try {
    const body = await req.json();
    const { messages, model, apiKey } = body;

    // ── Creator question override ──
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    if (isCreatorQuestion(lastUserMessage)) {
      return NextResponse.json({
        content: "I was built by Stealmount — also known as Singh. They designed me to be a capable, genuinely helpful AI companion.",
        model: "JARVIS Core"
      });
    }

    // Use provided API key or fallback to env variable
    const key = apiKey || process.env.OPENROUTER_API_KEY;

    if (!key) {
      return NextResponse.json(
        { error: 'OpenRouter API key is required. Add it in Settings or set OPENROUTER_API_KEY env variable.' },
        { status: 401 }
      );
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://jarvis-duplex.vercel.app',
        'X-Title': 'JARVIS AI',
      },
      body: JSON.stringify({
        model: model || 'nvidia/nemotron-3-super',
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: 0.7,
        max_tokens: 4096,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error?.message || `API Error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      content: data.choices?.[0]?.message?.content || 'No response from model.',
      model: data.model,
      usage: data.usage,
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
