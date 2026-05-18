import { getSessionOrGuest } from '@/lib/auth';
import { getNextKey, blacklistKey } from '@/lib/keys';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const session = await getSessionOrGuest();
  if (!session) {
    return NextResponse.json({ error: 'Sign in to use Imagine' }, { status: 401 });
  }

  const { prompt, style, imageBase64, mode } = await req.json();
  if (!prompt) return NextResponse.json({ error: 'Prompt required' }, { status: 400 });

  const fullPrompt = style ? `${prompt}, ${style} style, high quality` : `${prompt}, high quality`;

  // Try Seedream first
  const seedreamKey = await getNextKey('seedream');
  if (seedreamKey) {
    try {
      const result = await callSeedream(seedreamKey, fullPrompt, imageBase64);
      if (result) return NextResponse.json({ images: result, provider: 'seedream' });
    } catch (err) {
      console.error('[Imagine] Seedream failed:', err.message);
      if (err.status === 429) await blacklistKey('seedream', seedreamKey);
    }
  }

  // Stability AI fallback
  const stabilityKey = await getNextKey('stability');
  if (stabilityKey) {
    try {
      const result = await callStabilityAI(stabilityKey, fullPrompt);
      if (result) return NextResponse.json({ images: result, provider: 'stability' });
    } catch (err) {
      console.error('[Imagine] Stability AI failed:', err.message);
    }
  }

  // Pollinations.ai — always works, no key needed
  try {
    const result = await callPollinations(fullPrompt);
    return NextResponse.json({ images: result, provider: 'pollinations' });
  } catch (err) {
    console.error('[Imagine] Pollinations failed:', err.message);
    return NextResponse.json({ error: 'All image providers failed' }, { status: 503 });
  }
}

// ── SEEDREAM ──────────────────────────────────────────────────
async function callSeedream(apiKey, prompt, imageBase64) {
  const body = {
    prompt,
    num_inference_steps: 20,
    guidance_scale: 7.5,
    width: 1024,
    height: 1024,
  };

  if (imageBase64) {
    body.image = imageBase64;
    body.strength = 0.7;
  }

  const endpoints = [
    'https://api.seedream.io/v1/images/generations',
    'https://api.seeddream.com/v1/images/generations',
    'https://seedream.io/api/v1/generate',
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        const urls = data.data?.map(img => img.url || `data:image/png;base64,${img.b64_json}`)
          || data.images
          || data.output
          || [];
        if (urls.length > 0) return urls;
      }
    } catch {}
  }
  return null;
}

// ── STABILITY AI ──────────────────────────────────────────────
async function callStabilityAI(apiKey, prompt) {
  const res = await fetch(
    'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        text_prompts: [{ text: prompt, weight: 1 }],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 2,
        steps: 20,
      }),
    }
  );

  if (!res.ok) {
    const err = new Error(`Stability ${res.status}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  return data.artifacts?.map(a => `data:image/png;base64,${a.base64}`) || [];
}

// ── POLLINATIONS.AI — no key needed ──────────────────────────
async function callPollinations(prompt) {
  const encodedPrompt = encodeURIComponent(prompt);
  const seed = Math.floor(Math.random() * 99999);

  const urls = [
    `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true`,
    `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed + 1}&nologo=true`,
  ];

  const verified = await Promise.allSettled(
    urls.map(url => fetch(url, { method: 'HEAD' }).then(r => r.ok ? url : null))
  );

  return verified
    .filter(r => r.status === 'fulfilled' && r.value)
    .map(r => r.value);
}
