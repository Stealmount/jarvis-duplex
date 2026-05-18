import { getSessionOrGuest } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getSessionOrGuest();
  if (!session || session.user?.role === 'guest') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Return the key — only to authenticated users
  const key = process.env.ELEVENLABS_KEY;
  if (!key) return NextResponse.json({ available: false });

  return NextResponse.json({
    available: true,
    key,
    voiceIds: {
      male:   process.env.ELEVENLABS_VOICE_MALE   || 'TX3LPaxmHKxFdv7VOQHJ',
      female: process.env.ELEVENLABS_VOICE_FEMALE || 'Xb7hH8MSUJpSbSDYk0k2',
    },
  });
}
