import { streamDeepSeek } from './deepseek.js';
import { streamGroq } from './groq.js';
import { streamOpenRouter } from './openrouter.js';
import { streamGoogle } from './google.js';
import { streamTogether } from './together.js';
import { streamNvidia } from './nvidia.js';
import { streamOpenAI } from './openai.js';

// All available models — shown in dropdown
export const ALL_MODELS = [
  // DeepSeek
  { id: 'deepseek-chat',      label: 'DeepSeek V3',       provider: 'deepseek',    speed: 'fast',   tier: 'free',  bestFor: ['general', 'study'] },
  { id: 'deepseek-reasoner',  label: 'DeepSeek R1',       provider: 'deepseek',    speed: 'medium', tier: 'free',  bestFor: ['deep'] },

  // Groq
  { id: 'llama-3.1-8b-instant',    label: 'Llama 3.1 8B',    provider: 'groq', speed: 'fast',   tier: 'free', bestFor: ['general'] },
  { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B',   provider: 'groq', speed: 'medium', tier: 'free', bestFor: ['study', 'research'] },
  { id: 'gemma2-9b-it',            label: 'Gemma 2 9B',      provider: 'groq', speed: 'fast',   tier: 'free', bestFor: ['general'] },
  { id: 'mixtral-8x7b-32768',      label: 'Mixtral 8x7B',    provider: 'groq', speed: 'fast',   tier: 'free', bestFor: ['general'] },

  // OpenRouter free models
  { id: 'deepseek/deepseek-r1:free',                    label: 'DeepSeek R1 (OR)',   provider: 'openrouter', speed: 'medium', tier: 'free', bestFor: ['deep'] },
  { id: 'deepseek/deepseek-v3:free',                    label: 'DeepSeek V3 (OR)',   provider: 'openrouter', speed: 'fast',   tier: 'free', bestFor: ['general'] },
  { id: 'google/gemma-2-9b-it:free',                    label: 'Gemma 2 9B (OR)',    provider: 'openrouter', speed: 'fast',   tier: 'free', bestFor: ['general'] },
  { id: 'meta-llama/llama-3.1-8b-instruct:free',        label: 'Llama 3.1 8B (OR)', provider: 'openrouter', speed: 'fast',   tier: 'free', bestFor: ['general'] },
  { id: 'mistralai/mistral-7b-instruct:free',           label: 'Mistral 7B (OR)',    provider: 'openrouter', speed: 'fast',   tier: 'free', bestFor: ['general'] },
  { id: 'microsoft/phi-3-mini-128k-instruct:free',      label: 'Phi-3 Mini (OR)',    provider: 'openrouter', speed: 'fast',   tier: 'free', bestFor: ['study'] },

  // Together AI
  { id: 'meta-llama/Llama-3-8b-chat-hf',       label: 'Llama 3 8B',     provider: 'together', speed: 'fast',   tier: 'free', bestFor: ['general'] },
  { id: 'mistralai/Mistral-7B-Instruct-v0.2',  label: 'Mistral 7B',     provider: 'together', speed: 'fast',   tier: 'free', bestFor: ['general'] },

  // Google Gemini
  { id: 'gemini-1.5-flash',      label: 'Gemini 1.5 Flash', provider: 'google', speed: 'fast',   tier: 'free', bestFor: ['general', 'research'] },
  { id: 'gemini-2.0-flash-exp',  label: 'Gemini 2.0 Flash', provider: 'google', speed: 'fast',   tier: 'free', bestFor: ['research'] },

  // NVIDIA NIM
  { id: 'meta/llama-3.1-8b-instruct',   label: 'Llama 3.1 8B (NIM)',  provider: 'nvidia', speed: 'fast',   tier: 'free', bestFor: ['general'] },
  { id: 'deepseek/deepseek-r1',         label: 'DeepSeek R1 (NIM)',   provider: 'nvidia', speed: 'medium', tier: 'free', bestFor: ['deep'] },

  // OpenAI (paid)
  { id: 'gpt-4o-mini',    label: 'GPT-4o Mini',  provider: 'openai', speed: 'fast',   tier: 'paid', bestFor: ['general'] },
  { id: 'gpt-4o',         label: 'GPT-4o',       provider: 'openai', speed: 'medium', tier: 'paid', bestFor: ['deep', 'research'] },
];

// Auto-select best model per mode
export function autoSelectModel(mode, availableProviders) {
  const modePreference = {
    general:  ['deepseek-chat@deepseek', 'llama-3.1-8b-instant@groq', 'deepseek/deepseek-v3:free@openrouter'],
    therapy:  ['deepseek-chat@deepseek', 'llama-3.3-70b-versatile@groq', 'gemini-1.5-flash@google'],
    deep:     ['deepseek-reasoner@deepseek', 'deepseek/deepseek-r1:free@openrouter', 'deepseek/deepseek-r1@nvidia'],
    study:    ['llama-3.3-70b-versatile@groq', 'deepseek-chat@deepseek', 'gemini-1.5-flash@google'],
    research: ['gemini-2.0-flash-exp@google', 'llama-3.3-70b-versatile@groq', 'deepseek-chat@deepseek'],
  };

  const prefs = modePreference[mode] || modePreference.general;
  for (const pref of prefs) {
    const [modelId, providerKey] = pref.split('@');
    if (availableProviders.includes(providerKey)) {
      const model = ALL_MODELS.find(m => m.id === modelId);
      if (model) return model;
    }
  }
  return ALL_MODELS.find(m => availableProviders.includes(m.provider));
}

// Available providers (checks env vars)
export function getAvailableProviders() {
  const providers = [];
  if (process.env.DEEPSEEK_API_KEY)   providers.push('deepseek');
  if (process.env.GROQ_API_KEY)       providers.push('groq');
  if (process.env.OPENROUTER_API_KEY) providers.push('openrouter');
  if (process.env.GOOGLE_AI_KEY)      providers.push('google');
  if (process.env.TOGETHER_API_KEY)   providers.push('together');
  if (process.env.NVIDIA_API_KEY)     providers.push('nvidia');
  if (process.env.OPENAI_API_KEY)     providers.push('openai');
  return providers;
}

// Stream from a specific model — with auto-fallback
export async function streamFromModel(model, messages, systemPrompt) {
  const streamers = {
    deepseek:   streamDeepSeek,
    groq:       streamGroq,
    openrouter: streamOpenRouter,
    google:     streamGoogle,
    together:   streamTogether,
    nvidia:     streamNvidia,
    openai:     streamOpenAI,
  };

  const streamer = streamers[model.provider];
  if (!streamer) throw new Error(`Unknown provider: ${model.provider}`);

  try {
    return await streamer(model.id, messages, systemPrompt);
  } catch (err) {
    console.error(`Provider ${model.provider} failed:`, err.message);
    // On rate limit or error, try next available model
    const available = getAvailableProviders();
    const fallbacks = ALL_MODELS.filter(
      m => m.provider !== model.provider && available.includes(m.provider)
    );
    for (const fallback of fallbacks) {
      try {
        console.log(`Falling back to ${fallback.label}`);
        return await streamers[fallback.provider](fallback.id, messages, systemPrompt);
      } catch (e) {
        console.error(`Fallback ${fallback.label} also failed:`, e.message);
      }
    }
    throw new Error('All providers failed');
  }
}
