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

    // Route based on model
    let apiUrl = '';
    let headers = {};
    let payload = {};

    if (model && model.includes('minimax')) {
      const key = process.env.MINIMAX_API_KEY;
      const groupId = process.env.MINIMAX_GROUP_ID || '';
      if (!key) return NextResponse.json({ error: 'MiniMax API key missing in .env' }, { status: 401 });
      
      apiUrl = `https://api.minimax.chat/v1/text/chatcompletion_v2?GroupId=${groupId}`;
      headers = {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      };
      payload = {
        model: model.replace('minimax/', ''),
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        stream: false,
        max_tokens: 4096,
        temperature: 0.7,
      };
    } else {
      // Default to DeepSeek
      const key = process.env.DEEPSEEK_API_KEY;
      if (!key) return NextResponse.json({ error: 'DeepSeek API key missing in .env' }, { status: 401 });
      
      apiUrl = 'https://api.deepseek.com/chat/completions';
      headers = {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      };
      payload = {
        model: model ? model.replace('deepseek/', '') : 'deepseek-chat',
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        stream: false,
        max_tokens: 4096,
        temperature: 0.7,
      };
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
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
      model: model,
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
