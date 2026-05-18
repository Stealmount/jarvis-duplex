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

// System Instruction to force English/user language and prevent unsolicited Chinese
const SYSTEM_PROMPT = "You are JARVIS, a helpful, advanced AI companion built by Stealmount. You MUST always reply in the same language as the user's message (defaulting to English if not specified otherwise). You must NEVER respond in Chinese unless the user explicitly requests you to.";

// Unified call function for Google Gemini REST API (non-streaming)
async function callGoogle(modelId, messages, key) {
  const formattedMessages = [];
  
  // Collect history
  for (const msg of messages) {
    formattedMessages.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    });
  }

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: formattedMessages,
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google API error ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Google Gemini');
  return text;
}

// Unified call function for standard OpenAI-compatible endpoints
async function callOpenAICompatible(url, modelId, messages, key) {
  const payloadMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.map(m => ({ role: m.role, content: m.content }))
  ];

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages: payloadMessages,
      stream: false,
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API error ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error(`Empty response from model ${modelId}`);
  return text;
}

// MiniMax direct call (since it has a GroupId query parameter)
async function callMiniMax(modelId, messages, key, groupId) {
  const payloadMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.map(m => ({ role: m.role, content: m.content }))
  ];

  const res = await fetch(`https://api.minimax.chat/v1/text/chatcompletion_v2?GroupId=${groupId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages: payloadMessages,
      stream: false,
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`MiniMax error ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from MiniMax');
  return text;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { messages, model } = body;

    // ── Creator question override ──
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    if (isCreatorQuestion(lastUserMessage)) {
      return NextResponse.json({
        content: "I was built by Stealmount — also known as Singh. They designed me to be a capable, genuinely helpful AI companion.",
        model: "JARVIS Core"
      });
    }

    // Determine target provider and model based on model string
    let targetProvider = 'google';
    let targetModel = 'gemini-3.1-flash-lite'; // default fallback

    if (model) {
      if (model.includes('nvidia/')) {
        targetProvider = 'nvidia';
        targetModel = model.replace('nvidia/', '');
      } else if (model.includes('google/') || model.includes('gemini')) {
        targetProvider = 'google';
        targetModel = model.replace('google/', '');
      } else if (model.includes('groq/') || model.includes('llama')) {
        targetProvider = 'groq';
        targetModel = model.replace('groq/', '');
      } else if (model.includes('openrouter/') || model.includes('deepseek')) {
        targetProvider = 'openrouter';
        targetModel = model.replace('openrouter/', '');
      } else if (model.includes('minimax')) {
        targetProvider = 'minimax';
        targetModel = model.replace('minimax/', '');
      }
    }

    // Define providers list in priority order of preference
    const providers = [
      {
        name: 'google',
        key: process.env.GOOGLE_API_KEY,
        model: targetProvider === 'google' ? targetModel : 'gemini-3.1-flash-lite',
        action: async (m, msg, k) => callGoogle(m, msg, k)
      },
      {
        name: 'nvidia',
        key: process.env.NVIDIA_API_KEY,
        model: targetProvider === 'nvidia' ? targetModel : 'deepseek/deepseek-r1',
        action: async (m, msg, k) => callOpenAICompatible('https://integrate.api.nvidia.com/v1/chat/completions', m, msg, k)
      },
      {
        name: 'groq',
        key: process.env.GROQ_API_KEY,
        model: targetProvider === 'groq' ? targetModel : 'llama-3.3-70b-versatile',
        action: async (m, msg, k) => callOpenAICompatible('https://api.groq.com/openai/v1/chat/completions', m, msg, k)
      },
      {
        name: 'openrouter',
        key: process.env.OPENROUTER_API_KEY,
        model: targetProvider === 'openrouter' ? targetModel : 'deepseek/deepseek-chat',
        action: async (m, msg, k) => callOpenAICompatible('https://openrouter.ai/api/v1/chat/completions', m, msg, k)
      },
      {
        name: 'minimax',
        key: process.env.MINIMAX_API_KEY,
        model: targetProvider === 'minimax' ? targetModel : 'minimax-m2.5',
        action: async (m, msg, k) => callMiniMax(m, msg, k, process.env.MINIMAX_GROUP_ID || '')
      }
    ];

    // Rearrange providers list so the target provider is tried first
    const sortedProviders = [
      ...providers.filter(p => p.name === targetProvider),
      ...providers.filter(p => p.name !== targetProvider)
    ];

    let lastError = null;
    let finalContent = null;
    let finalModelName = model;

    // Loop through providers and execute the first one that has an API key and succeeds
    for (const provider of sortedProviders) {
      if (!provider.key) {
        continue; // skip if no key is configured
      }
      try {
        console.log(`Routing chat request to ${provider.name} (${provider.model})...`);
        const result = await provider.action(provider.model, messages, provider.key);
        finalContent = result;
        finalModelName = `${provider.name}/${provider.model}`;
        break; // break loop on success!
      } catch (err) {
        console.error(`Provider ${provider.name} failed:`, err.message);
        lastError = err;
        // Continue loop to try next provider
      }
    }

    if (finalContent === null) {
      throw new Error(`All providers failed. Last error: ${lastError ? lastError.message : 'No working API keys configured'}`);
    }

    return NextResponse.json({
      content: finalContent,
      model: finalModelName
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
