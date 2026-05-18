import { streamDeepSeek } from './deepseek.js';
import { streamGroq } from './groq.js';
import { streamOpenRouter } from './openrouter.js';
import { streamGoogle } from './google.js';
import { streamTogether } from './together.js';
import { streamNvidia } from './nvidia.js';
import { streamOpenAI } from './openai.js';
import { streamCerebras } from './cerebras.js';
import { streamSambanova } from './sambanova.js';
import { streamMistral } from './mistral.js';
import { streamCohere } from './cohere.js';
import { streamCloudflare } from './cloudflare.js';
import { streamSarvam } from './sarvam.js';
import { streamHuggingFace } from './huggingface.js';
import { streamFireworks } from './fireworks.js';
import { streamKimi } from './kimi.js';
import { streamMinimax } from './minimax.js';
import { streamXai } from './xai.js';
import { streamAimlapi } from './aimlapi.js';

// ═══════════════════════════════════════════════
// Complete Model Catalog — 35+ models
// ═══════════════════════════════════════════════
export const ALL_MODELS = [

  // ── CEREBRAS — Fastest free inference (2000 tok/sec) ──
  {
    id: 'llama3.1-70b',
    label: 'Llama 3.1 70B',
    provider: 'cerebras',
    speed: 'fast',
    tier: 'free',
    specialty: 'General · Ultra-fast',
    bestFor: ['general', 'therapy'],
    description: 'World\'s fastest free LLM inference. Great for conversation.',
  },
  {
    id: 'llama3.1-8b',
    label: 'Llama 3.1 8B',
    provider: 'cerebras',
    speed: 'fast',
    tier: 'free',
    specialty: 'General · Lightning fast',
    bestFor: ['general'],
    description: 'Extremely fast responses for quick tasks.',
  },

  // ── SAMBANOVA — Large models, free ──
  {
    id: 'Meta-Llama-3.1-405B-Instruct',
    label: 'Llama 3.1 405B',
    provider: 'sambanova',
    speed: 'medium',
    tier: 'free',
    specialty: 'Reasoning · Deep analysis',
    bestFor: ['deep', 'study'],
    description: 'One of the largest open models. Exceptional at complex reasoning.',
  },
  {
    id: 'Meta-Llama-3.1-70B-Instruct',
    label: 'Llama 3.1 70B (SN)',
    provider: 'sambanova',
    speed: 'fast',
    tier: 'free',
    specialty: 'General · Balanced',
    bestFor: ['general'],
    description: 'Strong general model with SambaNova\'s fast infrastructure.',
  },

  // ── GROQ — Reliable, fast, widely used ──
  {
    id: 'llama-3.1-8b-instant',
    label: 'Llama 3.1 8B Instant',
    provider: 'groq',
    speed: 'fast',
    tier: 'free',
    specialty: 'General · Instant replies',
    bestFor: ['general'],
    description: 'Groq\'s fastest model. Ideal for voice conversations.',
  },
  {
    id: 'llama-3.3-70b-versatile',
    label: 'Llama 3.3 70B',
    provider: 'groq',
    speed: 'medium',
    tier: 'free',
    specialty: 'Study · Research',
    bestFor: ['study', 'research'],
    description: 'Versatile and capable. Good for academic and research tasks.',
  },
  {
    id: 'gemma2-9b-it',
    label: 'Gemma 2 9B',
    provider: 'groq',
    speed: 'fast',
    tier: 'free',
    specialty: 'General · Concise',
    bestFor: ['general'],
    description: 'Google\'s Gemma 2, fast on Groq infrastructure.',
  },
  {
    id: 'mixtral-8x7b-32768',
    label: 'Mixtral 8x7B',
    provider: 'groq',
    speed: 'fast',
    tier: 'free',
    specialty: 'General · Long context',
    bestFor: ['general'],
    description: 'Mixture-of-experts model. Strong at following instructions.',
  },

  // ── OPENROUTER — Gateway to many free models ──
  {
    id: 'deepseek/deepseek-r1:free',
    label: 'DeepSeek R1',
    provider: 'openrouter',
    speed: 'medium',
    tier: 'free',
    specialty: 'Reasoning · Math · Code',
    bestFor: ['deep', 'study'],
    description: 'DeepSeek\'s reasoning model. Exceptional at math, logic, and code.',
  },
  {
    id: 'deepseek/deepseek-v3:free',
    label: 'DeepSeek V3',
    provider: 'openrouter',
    speed: 'fast',
    tier: 'free',
    specialty: 'Code · General',
    bestFor: ['general', 'deep'],
    description: 'DeepSeek\'s flagship chat model. Excellent at coding tasks.',
  },
  {
    id: 'google/gemma-2-9b-it:free',
    label: 'Gemma 2 9B (OR)',
    provider: 'openrouter',
    speed: 'fast',
    tier: 'free',
    specialty: 'General · Concise',
    bestFor: ['general'],
    description: 'Google\'s efficient open model via OpenRouter.',
  },
  {
    id: 'mistralai/mistral-7b-instruct:free',
    label: 'Mistral 7B',
    provider: 'openrouter',
    speed: 'fast',
    tier: 'free',
    specialty: 'General · Instruction following',
    bestFor: ['general'],
    description: 'Reliable instruction-following model.',
  },
  {
    id: 'microsoft/phi-3-mini-128k-instruct:free',
    label: 'Phi-3 Mini 128K',
    provider: 'openrouter',
    speed: 'fast',
    tier: 'free',
    specialty: 'Long context · Code',
    bestFor: ['study'],
    description: 'Microsoft\'s small but capable model with 128K context.',
  },
  {
    id: 'qwen/qwen-2.5-72b-instruct:free',
    label: 'Qwen 2.5 72B',
    provider: 'openrouter',
    speed: 'medium',
    tier: 'free',
    specialty: 'Code · Multilingual',
    bestFor: ['deep', 'study'],
    description: 'Alibaba\'s strong model. Excellent for code and multilingual tasks.',
  },

  // ── KIMI (Moonshot AI) — Long context specialist ──
  {
    id: 'moonshot-v1-8k',
    label: 'Kimi 8K',
    provider: 'kimi',
    speed: 'fast',
    tier: 'free',
    specialty: 'General · Code',
    bestFor: ['general'],
    description: 'Moonshot AI\'s Kimi model. Strong at code and Chinese/English tasks.',
  },
  {
    id: 'moonshot-v1-32k',
    label: 'Kimi 32K',
    provider: 'kimi',
    speed: 'medium',
    tier: 'free',
    specialty: 'Long context · Code · Documents',
    bestFor: ['study', 'research'],
    description: 'Kimi with 32K context — great for long documents and complex coding.',
  },
  {
    id: 'moonshot-v1-128k',
    label: 'Kimi 128K',
    provider: 'kimi',
    speed: 'medium',
    tier: 'free',
    specialty: 'Ultra-long context · Research',
    bestFor: ['research'],
    description: 'Massive 128K context window. Best for analyzing large documents.',
  },

  // ── MINIMAX — Long context, strong reasoning ──
  {
    id: 'abab6.5s-chat',
    label: 'MiniMax 6.5s',
    provider: 'minimax',
    speed: 'fast',
    tier: 'free',
    specialty: 'Reasoning · Long context',
    bestFor: ['deep', 'study'],
    description: 'MiniMax\'s flagship model. Strong reasoning with long context.',
  },
  {
    id: 'abab5.5-chat',
    label: 'MiniMax 5.5',
    provider: 'minimax',
    speed: 'fast',
    tier: 'free',
    specialty: 'General · Fast',
    bestFor: ['general'],
    description: 'MiniMax\'s lighter model for faster responses.',
  },

  // ── GOOGLE GEMINI ──
  {
    id: 'gemini-1.5-flash',
    label: 'Gemini 1.5 Flash',
    provider: 'google',
    speed: 'fast',
    tier: 'free',
    specialty: 'General · Vision · Code',
    bestFor: ['general', 'research'],
    description: 'Google\'s fastest model. Supports images and long context.',
  },
  {
    id: 'gemini-2.0-flash-exp',
    label: 'Gemini 2.0 Flash',
    provider: 'google',
    speed: 'fast',
    tier: 'free',
    specialty: 'Research · Multimodal',
    bestFor: ['research'],
    description: 'Google\'s latest flash model. Excellent for research with web access.',
  },

  // ── MISTRAL DIRECT ──
  {
    id: 'mistral-small-latest',
    label: 'Mistral Small',
    provider: 'mistral',
    speed: 'fast',
    tier: 'free',
    specialty: 'General · Efficient',
    bestFor: ['general'],
    description: 'Mistral\'s production-grade small model. Efficient and reliable.',
  },
  {
    id: 'open-mistral-7b',
    label: 'Mistral 7B',
    provider: 'mistral',
    speed: 'fast',
    tier: 'free',
    specialty: 'General · Open source',
    bestFor: ['general'],
    description: 'The original open-source Mistral model.',
  },
  {
    id: 'codestral-latest',
    label: 'Codestral',
    provider: 'mistral',
    speed: 'fast',
    tier: 'free',
    specialty: 'Code · 80+ languages',
    bestFor: ['deep'],
    description: 'Mistral\'s dedicated coding model. Supports 80+ programming languages.',
  },

  // ── COHERE ──
  {
    id: 'command-r',
    label: 'Command R',
    provider: 'cohere',
    speed: 'fast',
    tier: 'free',
    specialty: 'RAG · Research · Retrieval',
    bestFor: ['general', 'study'],
    description: 'Cohere\'s RAG-optimized model. Excellent at citing sources.',
  },
  {
    id: 'command-r-plus',
    label: 'Command R+',
    provider: 'cohere',
    speed: 'medium',
    tier: 'free',
    specialty: 'Reasoning · Analysis',
    bestFor: ['deep', 'study'],
    description: 'Cohere\'s most capable model. Strong reasoning and analysis.',
  },

  // ── CLOUDFLARE WORKERS AI ──
  {
    id: '@cf/meta/llama-3.1-8b-instruct',
    label: 'Llama 3.1 8B (CF)',
    provider: 'cloudflare',
    speed: 'fast',
    tier: 'free',
    specialty: 'General · Edge inference',
    bestFor: ['general'],
    description: 'Llama running on Cloudflare\'s global edge network.',
  },
  {
    id: '@cf/mistral/mistral-7b-instruct-v0.1',
    label: 'Mistral 7B (CF)',
    provider: 'cloudflare',
    speed: 'fast',
    tier: 'free',
    specialty: 'General · Edge inference',
    bestFor: ['general'],
    description: 'Mistral on Cloudflare edge. Low latency globally.',
  },

  // ── NVIDIA NIM ──
  {
    id: 'meta/llama-3.1-405b-instruct',
    label: 'Llama 3.1 405B (NIM)',
    provider: 'nvidia',
    speed: 'medium',
    tier: 'free',
    specialty: 'Deep reasoning · Complex tasks',
    bestFor: ['deep', 'study'],
    description: 'Massive 405B model on NVIDIA\'s optimized infrastructure.',
  },
  {
    id: 'deepseek/deepseek-r1',
    label: 'DeepSeek R1 (NIM)',
    provider: 'nvidia',
    speed: 'medium',
    tier: 'free',
    specialty: 'Math · Code · Reasoning',
    bestFor: ['deep'],
    description: 'DeepSeek R1 on NVIDIA. Chain-of-thought reasoning model.',
  },

  // ── HUGGINGFACE INFERENCE ──
  {
    id: 'mistralai/Mistral-7B-Instruct-v0.3',
    label: 'Mistral 7B (HF)',
    provider: 'huggingface',
    speed: 'slow',
    tier: 'free',
    specialty: 'General · Open source',
    bestFor: ['general'],
    description: 'Mistral via HuggingFace Inference API. Slower but always available.',
  },
  {
    id: 'google/gemma-7b-it',
    label: 'Gemma 7B (HF)',
    provider: 'huggingface',
    speed: 'slow',
    tier: 'free',
    specialty: 'General',
    bestFor: ['general'],
    description: 'Google Gemma on HuggingFace.',
  },

  // ── SARVAM AI — Indian language specialist ──
  {
    id: 'sarvam-2b-v0.5',
    label: 'Sarvam 2B',
    provider: 'sarvam',
    speed: 'fast',
    tier: 'free',
    specialty: 'Hindi · Hinglish · Indian languages',
    bestFor: ['general'],
    description: 'India\'s own LLM. Best for Hindi, Hinglish, and Indian language tasks.',
  },

  // ── TOGETHER AI ──
  {
    id: 'meta-llama/Llama-3-8b-chat-hf',
    label: 'Llama 3 8B',
    provider: 'together',
    speed: 'fast',
    tier: 'free',
    specialty: 'General · Chat',
    bestFor: ['general'],
    description: 'Meta\'s Llama 3 on Together AI\'s infrastructure.',
  },

  // ── FIREWORKS AI ──
  {
    id: 'accounts/fireworks/models/llama-v3p1-8b-instruct',
    label: 'Llama 3.1 8B (FW)',
    provider: 'fireworks',
    speed: 'fast',
    tier: 'free',
    specialty: 'General · Fast inference',
    bestFor: ['general'],
    description: 'Llama on Fireworks\' optimized inference platform.',
  },

  // ── OPENAI (paid) ──
  {
    id: 'gpt-4o-mini',
    label: 'GPT-4o Mini',
    provider: 'openai',
    speed: 'fast',
    tier: 'paid',
    specialty: 'General · All-round',
    bestFor: ['general'],
    capabilities: ['text', 'image_input', 'pdf'],
    description: 'OpenAI\'s efficient paid model.',
  },
  {
    id: 'gpt-4o',
    label: 'GPT-4o',
    provider: 'openai',
    speed: 'medium',
    tier: 'paid',
    specialty: 'Deep reasoning · Research',
    bestFor: ['deep', 'research'],
    capabilities: ['text', 'image_input', 'pdf', 'audio_input'],
    description: 'OpenAI\'s most capable model.',
  },

  // ── xAI / Grok ──
  {
    id: 'grok-3-mini-fast',
    label: 'Grok 3 Mini Fast',
    provider: 'xai',
    speed: 'fast',
    tier: 'paid',
    specialty: 'General · Fast reasoning',
    bestFor: ['general'],
    capabilities: ['text'],
    description: 'xAI\'s fastest Grok model. Great for quick conversations.',
  },
  {
    id: 'grok-3-mini',
    label: 'Grok 3 Mini',
    provider: 'xai',
    speed: 'fast',
    tier: 'paid',
    specialty: 'Reasoning · Code',
    bestFor: ['general', 'deep'],
    capabilities: ['text'],
    description: 'xAI\'s Grok 3 Mini. Strong reasoning and code.',
  },
  {
    id: 'grok-3',
    label: 'Grok 3',
    provider: 'xai',
    speed: 'medium',
    tier: 'paid',
    specialty: 'Deep reasoning · Research',
    bestFor: ['deep', 'research'],
    capabilities: ['text', 'image_input'],
    description: 'xAI\'s most capable model. Excellent at complex reasoning.',
  },

  // ── AIML API (Kimi via AI/ML gateway) ──
  {
    id: 'moonshot-v1-8k',
    label: 'Kimi 8K (AIML)',
    provider: 'aimlapi',
    speed: 'fast',
    tier: 'free',
    specialty: 'General · Code',
    bestFor: ['general'],
    capabilities: ['text'],
    description: 'Moonshot Kimi via AIML API gateway.',
  },
];

// ═══════════════════════════════════════════════
// Mode → Model preferences (with Kimi, MiniMax, Codestral)
// ═══════════════════════════════════════════════
const MODE_PREFERENCES = {
  general: [
    'llama3.1-70b@cerebras',
    'llama-3.1-8b-instant@groq',
    'deepseek/deepseek-v3:free@openrouter',
    'command-r@cohere',
    'gemini-1.5-flash@google',
    'moonshot-v1-8k@kimi',
    'abab6.5s-chat@minimax',
  ],
  therapy: [
    'llama3.1-70b@cerebras',
    'command-r-plus@cohere',
    'llama-3.3-70b-versatile@groq',
    'gemini-1.5-flash@google',
  ],
  deep: [
    'deepseek/deepseek-r1:free@openrouter',
    'deepseek/deepseek-r1@nvidia',
    'Meta-Llama-3.1-405B-Instruct@sambanova',
    'command-r-plus@cohere',
    'abab6.5s-chat@minimax',
    'codestral-latest@mistral',
  ],
  study: [
    'Meta-Llama-3.1-405B-Instruct@sambanova',
    'llama-3.3-70b-versatile@groq',
    'command-r-plus@cohere',
    'moonshot-v1-32k@kimi',
    'gemini-1.5-flash@google',
  ],
  research: [
    'gemini-2.0-flash-exp@google',
    'moonshot-v1-128k@kimi',
    'llama-3.3-70b-versatile@groq',
    'command-r@cohere',
    'deepseek/deepseek-v3:free@openrouter',
  ],
};

// Auto-select best model per mode
export function autoSelectModel(mode, availableProviders) {
  const prefs = MODE_PREFERENCES[mode] || MODE_PREFERENCES.general;
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
  if (process.env.CEREBRAS_API_KEY)    providers.push('cerebras');
  if (process.env.SAMBANOVA_API_KEY)   providers.push('sambanova');
  if (process.env.GROQ_API_KEY)        providers.push('groq');
  if (process.env.OPENROUTER_API_KEY)  providers.push('openrouter');
  if (process.env.GOOGLE_API_KEY)      providers.push('google');
  if (process.env.MISTRAL_API_KEY)     providers.push('mistral');
  if (process.env.COHERE_API_KEY)      providers.push('cohere');
  if (process.env.NVIDIA_API_KEY)      providers.push('nvidia');
  if (process.env.CLOUDFLARE_API_KEY && process.env.CLOUDFLARE_ACCOUNT_ID)
                                       providers.push('cloudflare');
  if (process.env.SARVAM_API_KEY)      providers.push('sarvam');
  if (process.env.HF_API_KEY)          providers.push('huggingface');
  if (process.env.TOGETHER_API_KEY)    providers.push('together');
  if (process.env.FIREWORKS_API_KEY)   providers.push('fireworks');
  if (process.env.KIMI_API_KEY)        providers.push('kimi');
  if (process.env.MINIMAX_API_KEY)     providers.push('minimax');
  if (process.env.DEEPSEEK_API_KEY)    providers.push('deepseek');
  if (process.env.OPENAI_API_KEY)      providers.push('openai');
  if (process.env.XAI_API_KEY)         providers.push('xai');
  if (process.env.AIMLAPI_API_KEY)     providers.push('aimlapi');
  return providers;
}

// All streaming functions mapped by provider
const STREAMERS = {
  cerebras:    streamCerebras,
  sambanova:   streamSambanova,
  groq:        streamGroq,
  openrouter:  streamOpenRouter,
  google:      streamGoogle,
  mistral:     streamMistral,
  cohere:      streamCohere,
  nvidia:      streamNvidia,
  cloudflare:  streamCloudflare,
  sarvam:      streamSarvam,
  huggingface: streamHuggingFace,
  together:    streamTogether,
  fireworks:   streamFireworks,
  kimi:        streamKimi,
  minimax:     streamMinimax,
  deepseek:    streamDeepSeek,
  openai:      streamOpenAI,
  xai:         streamXai,
  aimlapi:     streamAimlapi,
};

// Stream from a specific model — with auto-fallback
export async function streamFromModel(model, messages, systemPrompt) {
  const streamer = STREAMERS[model.provider];
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
        const fbStreamer = STREAMERS[fallback.provider];
        if (fbStreamer) return await fbStreamer(fallback.id, messages, systemPrompt);
      } catch (e) {
        console.error(`Fallback ${fallback.label} also failed:`, e.message);
      }
    }
    throw new Error('All providers failed');
  }
}
