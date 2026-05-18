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

import { MODEL_PRIORITY } from '../models';
import { streamAnthropic } from './anthropic.js';

// Auto-select best model per mode based on priority list
export function autoSelectModel(mode, availableProviders) {
  const priorityList = MODEL_PRIORITY[mode] || MODEL_PRIORITY.general;
  
  for (const model of priorityList) {
    if (availableProviders.includes(model.provider)) {
      return model;
    }
  }
  
  // Ultimate fallback if none in the list work: return the first available model in general
  for (const model of MODEL_PRIORITY.general) {
    if (availableProviders.includes(model.provider)) {
      return model;
    }
  }
  return null;
}

// Available providers (checks env vars)
export function getAvailableProviders() {
  const providers = [];
  if (process.env.ANTHROPIC_API_KEY)   providers.push('anthropic');
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
  anthropic:   streamAnthropic,
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
    // On rate limit or error, try next available model in general priority
    const available = getAvailableProviders();
    const fallbacks = MODEL_PRIORITY.general.filter(
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
