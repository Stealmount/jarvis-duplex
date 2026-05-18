import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  if (!url) return new Response('URL parameter is required', { status: 400 });

  try {
    const res = await fetch(url);
    if (!res.ok) return new Response(`Failed to fetch image: ${res.status}`, { status: res.status });

    const blob = await res.blob();
    const headers = new Headers();
    headers.set('Content-Type', res.headers.get('Content-Type') || 'image/jpeg');
    headers.set('Cache-Control', 'public, max-age=86400');
    // Bypasses COEP
    headers.set('Cross-Origin-Resource-Policy', 'cross-origin');

    return new NextResponse(blob, { headers });
  } catch (err) {
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
}
