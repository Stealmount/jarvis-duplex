import { getSessionOrGuest } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { searchWeb } from '@/lib/search';

export async function POST(req) {
  await getSessionOrGuest();
  const { query } = await req.json();
  if (!query) return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  const result = await searchWeb(query);
  return NextResponse.json(result);
}
