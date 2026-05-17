import { NextResponse } from 'next/server';
import crypto from 'crypto';

// In-memory user store (persists during server lifetime, resets on restart)
// For production, swap with Supabase or a real DB
const users = new Map();

// Developer master code — set in .env.local as DEV_MASTER_CODE
// Defaults to 'jarvis-master-2026' if not set
const DEV_MASTER_CODE = process.env.DEV_MASTER_CODE || 'jarvis-master-2026';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(req) {
  const { action, email, password, name, devCode } = await req.json();

  // ── Developer Login ──
  if (action === 'dev-login') {
    if (!devCode || devCode !== DEV_MASTER_CODE) {
      return NextResponse.json({ error: 'Invalid developer code' }, { status: 401 });
    }
    return NextResponse.json({
      user: {
        name: 'Developer',
        email: 'dev@jarvis.local',
        role: 'developer',
        unlimited: true,
      },
    });
  }

  // ── Sign Up ──
  if (action === 'signup') {
    if (!email || !password || !name) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }
    const normalizedEmail = email.toLowerCase().trim();
    if (users.has(normalizedEmail)) {
      return NextResponse.json({ error: 'Account already exists. Please sign in.' }, { status: 409 });
    }
    const user = {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      role: 'user',
      unlimited: false,
      createdAt: new Date().toISOString(),
    };
    users.set(normalizedEmail, user);

    // Also try to persist to Supabase if available
    try {
      if (process.env.SUPABASE_URL) {
        const { getSupabaseAdmin } = await import('@/lib/supabase');
        const supabase = getSupabaseAdmin();
        if (supabase) {
          await supabase.from('users').upsert({
            email: normalizedEmail,
            name: user.name,
            provider: 'local',
          }, { onConflict: 'email' });
        }
      }
    } catch {}

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        unlimited: user.unlimited,
      },
    });
  }

  // ── Sign In ──
  if (action === 'signin') {
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const user = users.get(normalizedEmail);
    if (!user) {
      return NextResponse.json({ error: 'No account found. Please sign up first.' }, { status: 404 });
    }
    if (user.passwordHash !== hashPassword(password)) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }
    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        unlimited: user.unlimited,
      },
    });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
