import { getSessionOrGuest } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req) {
  await getSessionOrGuest();
  const formData = await req.formData();
  const file = formData.get('file');
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
      body: (() => {
        const fd = new FormData();
        fd.append('file', new Blob([buffer], { type: file.type || 'audio/webm' }), file.name || 'audio.webm');
        fd.append('model', 'whisper-large-v3');
        fd.append('language', 'en');
        return fd;
      })(),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('Groq STT error:', errText);
      return NextResponse.json({ error: 'STT failed' }, { status: 500 });
    }

    const data = await groqRes.json();
    return NextResponse.json({ text: data.text || '' });
  } catch (err) {
    console.error('STT error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
