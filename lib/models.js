export const MODEL_PRIORITY = {
  // ── GENERAL MODE ───────────────────────────────────────
  general: [
    // Paid (use if key exists)
    { id: 'claude-sonnet-4-5',           provider: 'anthropic',  label: 'Claude Sonnet 4.5' },
    { id: 'gpt-4.1',                     provider: 'openai',     label: 'GPT-4.1' },
    { id: 'grok-3',                      provider: 'xai',        label: 'Grok 3' },
    // Free — best quality
    { id: 'deepseek/deepseek-v3:free',   provider: 'openrouter', label: 'DeepSeek V3' },
    { id: 'llama3.1-70b',               provider: 'cerebras',   label: 'Llama 3.1 70B' },
    { id: 'llama-3.3-70b-versatile',    provider: 'groq',       label: 'Llama 3.3 70B' },
    { id: 'gemini-1.5-flash',           provider: 'google',     label: 'Gemini 1.5 Flash' },
    { id: 'moonshot-v1-32k',            provider: 'kimi',       label: 'Kimi 32K' },
    { id: 'command-r-plus',             provider: 'cohere',     label: 'Command R+' },
  ],

  // ── THERAPY MODE ────────────────────────────────────────
  therapy: [
    { id: 'claude-sonnet-4-5',          provider: 'anthropic',  label: 'Claude Sonnet 4.5' },
    { id: 'gpt-4.1',                    provider: 'openai',     label: 'GPT-4.1' },
    { id: 'llama3.1-70b',              provider: 'cerebras',   label: 'Llama 3.1 70B' },
    { id: 'llama-3.3-70b-versatile',   provider: 'groq',       label: 'Llama 3.3 70B' },
    { id: 'command-r-plus',            provider: 'cohere',     label: 'Command R+' },
    { id: 'gemini-1.5-flash',          provider: 'google',     label: 'Gemini 1.5 Flash' },
  ],

  // ── DEEP THINK MODE ─────────────────────────────────────
  // Intentionally slower — uses reasoning models
  deep: [
    { id: 'claude-opus-4',             provider: 'anthropic',  label: 'Claude Opus 4' },
    { id: 'gpt-4.1',                   provider: 'openai',     label: 'GPT-4.1' },
    { id: 'deepseek/deepseek-r1:free', provider: 'openrouter', label: 'DeepSeek R1' },
    { id: 'deepseek/deepseek-r1',      provider: 'nvidia',     label: 'DeepSeek R1' },
    { id: 'Meta-Llama-3.1-405B-Instruct', provider: 'sambanova', label: 'Llama 405B' },
    { id: 'command-r-plus',            provider: 'cohere',     label: 'Command R+' },
    { id: 'moonshot-v1-128k',          provider: 'kimi',       label: 'Kimi 128K' },
  ],

  // ── STUDY MODE ──────────────────────────────────────────
  study: [
    { id: 'claude-sonnet-4-5',          provider: 'anthropic',  label: 'Claude Sonnet 4.5' },
    { id: 'gpt-4.1',                    provider: 'openai',     label: 'GPT-4.1' },
    { id: 'Meta-Llama-3.1-405B-Instruct', provider: 'sambanova', label: 'Llama 405B' },
    { id: 'llama-3.3-70b-versatile',    provider: 'groq',       label: 'Llama 3.3 70B' },
    { id: 'command-r-plus',             provider: 'cohere',     label: 'Command R+' },
    { id: 'moonshot-v1-32k',            provider: 'kimi',       label: 'Kimi 32K' },
    { id: 'gemini-1.5-flash',           provider: 'google',     label: 'Gemini 1.5 Flash' },
  ],

  // ── RESEARCH MODE ───────────────────────────────────────
  research: [
    { id: 'gpt-4.1',                    provider: 'openai',     label: 'GPT-4.1' },
    { id: 'gemini-2.0-flash-exp',       provider: 'google',     label: 'Gemini 2.0 Flash' },
    { id: 'moonshot-v1-128k',           provider: 'kimi',       label: 'Kimi 128K' },
    { id: 'llama-3.3-70b-versatile',    provider: 'groq',       label: 'Llama 3.3 70B' },
    { id: 'command-r',                  provider: 'cohere',     label: 'Command R' },
    { id: 'deepseek/deepseek-v3:free',  provider: 'openrouter', label: 'DeepSeek V3' },
  ],
};
