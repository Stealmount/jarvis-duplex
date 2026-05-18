import { getSessionOrGuest } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const session = await getSessionOrGuest();
  if (!session || session.user?.role === 'guest') {
    return NextResponse.json({ error: 'Sign in to use Imagine' }, { status: 401 });
  }

  const { prompt, style, mode } = await req.json();
  if (!prompt) return NextResponse.json({ error: 'Prompt required' }, { status: 400 });

  // Seedream / image generation API integration
  // Update endpoint when API docs are available
  const key = process.env.SEEDREAM_API_KEY;
  if (!key) return NextResponse.json({ error: 'Image generation not configured' }, { status: 503 });

  try {
    const fullPrompt = style ? `${prompt}, ${style} style` : prompt;
    const res = await fetch('https://api.seedream.io/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: fullPrompt, n: 2, size: '1024x1024' }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Generation failed' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({
      images: data.data?.map(img => img.url || img.b64_json) || [],
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
