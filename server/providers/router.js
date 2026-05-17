import fetch from 'node-fetch';

const PROVIDER_PRIORITY = ['deepseek','groq','openrouter','together','google','nvidia','openai'];

const SYSTEM_PROMPTS = {
  general: `You are JARVIS, a voice-first Indian AI companion. Speak Hinglish naturally — mix Hindi and English the way a Delhi/Mumbai educated person would. Keep replies concise (under 30 words for voice, longer if the user is typing). Be warm, witty, culturally aware. Know Bollywood, cricket, Indian startups, CAT exam, desi food, UPSC. Never say you are Claude, GPT, or any base model — you are JARVIS.`,
  therapy: `You are JARVIS in Therapy mode. You are a compassionate listener trained in CBT principles. Speak gently. Always validate feelings before offering perspective. Use phrases like "Yeh sunke dil bhaari ho gaya", "It sounds like you're carrying a lot". Never give medical advice. Ask one open-ended question at a time. Keep responses under 40 words. Never project emotions — always ask.`,
  deep: `You are JARVIS in Deep Think mode. You are a rigorous analytical thinker. When given a problem, first say "Analyzing..." then break it down systematically. Use first-principles reasoning. Show your chain of thought. For math: show each step. Be thorough — longer responses are fine here.`,
  study: `You are JARVIS in Study mode. You are a Socratic tutor specializing in Indian competitive exams (CAT, GMAT, UPSC, JEE, NEET). NEVER give answers directly — always ask guiding questions first. "Pehle socho — kya pattern dikh raha hai?" Ask "What's the trap here?" When the student gets it right, celebrate warmly. When wrong, guide with hints.`,
};

const PROVIDER_CONFIGS = {
  deepseek: {
    name: 'DeepSeek',
    envKey: 'DEEPSEEK_API_KEY',
    endpoint: 'https://api.deepseek.com/chat/completions',
    models: {
      default: 'deepseek-chat',
      deep: 'deepseek-reasoner',
    },
    allModels: ['deepseek-chat', 'deepseek-reasoner'],
  },
  groq: {
    name: 'Groq',
    envKey: 'GROQ_API_KEY',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    models: {
      default: 'llama-3.1-8b-instant',
      deep: 'llama-3.3-70b-versatile',
      study: 'llama-3.3-70b-versatile',
    },
    allModels: ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'gemma2-9b-it'],
  },
  openrouter: {
    name: 'OpenRouter',
    envKey: 'OPENROUTER_API_KEY',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    models: {
      default: 'meta-llama/llama-3.1-8b-instruct:free',
      deep: 'deepseek/deepseek-r1:free',
    },
    allModels: ['deepseek/deepseek-r1:free', 'deepseek/deepseek-v3:free', 'google/gemma-2-9b-it:free', 'meta-llama/llama-3.1-8b-instruct:free'],
  },
  together: {
    name: 'Together AI',
    envKey: 'TOGETHER_API_KEY',
    endpoint: 'https://api.together.xyz/v1/chat/completions',
    models: { default: 'meta-llama/Llama-3-8b-chat-hf' },
    allModels: ['meta-llama/Llama-3-8b-chat-hf', 'mistralai/Mistral-7B-Instruct-v0.2'],
  },
  google: {
    name: 'Google Gemini',
    envKey: 'GOOGLE_API_KEY',
    type: 'gemini',
    models: { default: 'gemini-1.5-flash', deep: 'gemini-1.5-flash' },
    allModels: ['gemini-1.5-flash', 'gemini-2.0-flash-exp'],
  },
  nvidia: {
    name: 'NVIDIA NIM',
    envKey: 'NVIDIA_API_KEY',
    endpoint: 'https://integrate.api.nvidia.com/v1/chat/completions',
    models: { default: 'meta/llama-3.1-8b-instruct', deep: 'deepseek/deepseek-r1' },
    allModels: ['meta/llama-3.1-8b-instruct', 'deepseek/deepseek-r1'],
  },
  openai: {
    name: 'OpenAI',
    envKey: 'OPENAI_API_KEY',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    models: { default: 'gpt-4o-mini' },
    allModels: ['gpt-4o-mini', 'gpt-3.5-turbo'],
  },
};

export function getAvailableProviders() {
  return PROVIDER_PRIORITY
    .filter(id => !!process.env[PROVIDER_CONFIGS[id]?.envKey])
    .map(id => ({
      id,
      name: PROVIDER_CONFIGS[id].name,
      available: true,
      models: PROVIDER_CONFIGS[id].allModels,
    }));
}

export function getAllProviderStatus() {
  return Object.entries(PROVIDER_CONFIGS).map(([id, cfg]) => ({
    id,
    name: cfg.name,
    available: !!process.env[cfg.envKey],
    models: cfg.allModels,
  }));
}

function selectProvider(mode, preferredProvider) {
  const avail = PROVIDER_PRIORITY.filter(id => !!process.env[PROVIDER_CONFIGS[id]?.envKey]);
  if (!avail.length) return null;

  // If a specific provider is preferred and available, use it
  if (preferredProvider && preferredProvider !== 'auto' && avail.includes(preferredProvider)) {
    return preferredProvider;
  }

  // Mode-specific preferences
  if (mode === 'deep') {
    const deepPrefs = ['deepseek', 'openrouter', 'nvidia', 'groq'];
    for (const p of deepPrefs) { if (avail.includes(p)) return p; }
  }
  if (mode === 'study') {
    const studyPrefs = ['deepseek', 'groq', 'google'];
    for (const p of studyPrefs) { if (avail.includes(p)) return p; }
  }

  return avail[0];
}

export async function streamChat(messages, mode, res) {
  const autoFallback = process.env.AUTO_FALLBACK !== 'false';
  const defaultProv = process.env.DEFAULT_PROVIDER || 'auto';
  const avail = PROVIDER_PRIORITY.filter(id => !!process.env[PROVIDER_CONFIGS[id]?.envKey]);

  // Build attempt list
  const first = selectProvider(mode, defaultProv);
  const attempts = first ? [first, ...avail.filter(id => id !== first)] : avail;
  if (!autoFallback && first) attempts.splice(1);

  const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.general;
  const fullMessages = [{ role: 'system', content: systemPrompt }, ...messages];

  for (const providerId of attempts) {
    const cfg = PROVIDER_CONFIGS[providerId];
    const apiKey = process.env[cfg.envKey];
    if (!apiKey) continue;

    const model = cfg.models[mode] || cfg.models.default;
    console.log(`[JARVIS] Using ${cfg.name} / ${model}`);

    try {
      if (cfg.type === 'gemini') {
        await streamGemini(apiKey, model, fullMessages, res);
      } else {
        await streamOpenAI(cfg.endpoint, apiKey, model, fullMessages, res, providerId);
      }
      return; // success
    } catch (err) {
      console.error(`[JARVIS] ${cfg.name} failed:`, err.message);
      if (!autoFallback) break;
    }
  }

  // All failed
  res.write(`data: {"token":"Sorry, all providers failed. Check server logs."}\n\n`);
  res.write('data: [DONE]\n\n');
  res.end();
}

async function streamOpenAI(endpoint, apiKey, model, messages, res, providerId) {
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
  if (providerId === 'openrouter') {
    headers['HTTP-Referer'] = 'http://localhost:3000';
    headers['X-Title'] = 'JARVIS';
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ model, messages, stream: true, temperature: 0.7, max_tokens: 400 }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`${response.status}: ${errText.slice(0, 200)}`);
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const reader = response.body;
  let buffer = '';

  for await (const chunk of reader) {
    buffer += chunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const payload = trimmed.slice(6);
      if (payload === '[DONE]') {
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }
      try {
        const data = JSON.parse(payload);
        const token = data.choices?.[0]?.delta?.content;
        if (token) res.write(`data: ${JSON.stringify({ token })}\n\n`);
      } catch {}
    }
  }

  res.write('data: [DONE]\n\n');
  res.end();
}

async function streamGemini(apiKey, model, messages, res) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`;
  const systemContent = messages.find(m => m.role === 'system')?.content || '';
  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: (m.role === 'user' && systemContent ? systemContent + '\n\n' : '') + m.content }],
    }));

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini ${response.status}: ${errText.slice(0, 200)}`);
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  let buffer = '';
  for await (const chunk of response.body) {
    buffer += chunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const payload = trimmed.startsWith('data: ') ? trimmed.slice(6) : trimmed;
      if (payload === '[DONE]' || payload === '[' || payload === ']') continue;
      try {
        const data = JSON.parse(payload.replace(/,$/, ''));
        const token = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (token) res.write(`data: ${JSON.stringify({ token })}\n\n`);
      } catch {}
    }
  }

  res.write('data: [DONE]\n\n');
  res.end();
}
