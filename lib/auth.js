import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

// Check if Google OAuth is configured
const hasGoogleOAuth = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

const providers = [];
if (hasGoogleOAuth) {
  providers.push(Google({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }));
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  secret: process.env.NEXTAUTH_SECRET || 'jarvis-dev-fallback-secret',
  callbacks: {
    async signIn({ user, account }) {
      // Skip Supabase sync if not configured
      if (!process.env.SUPABASE_URL) return true;
      try {
        const { getSupabaseAdmin } = await import('@/lib/supabase');
        const supabase = getSupabaseAdmin();
        if (supabase) {
          await supabase.from('users').upsert({
            email: user.email,
            name: user.name,
            avatar_url: user.image,
            provider: account.provider,
          }, { onConflict: 'email' });
        }
      } catch (e) { console.error('Supabase sync skipped:', e.message); }
      return true;
    },
    async session({ session }) {
      if (!process.env.SUPABASE_URL) return session;
      try {
        const { getSupabaseAdmin } = await import('@/lib/supabase');
        const supabase = getSupabaseAdmin();
        if (supabase) {
          const { data } = await supabase.from('users').select('id').eq('email', session.user.email).single();
          if (data) session.user.dbId = data.id;
        }
      } catch {}
      return session;
    },
  },
});

// Helper: get session or return a guest session if auth isn't configured
export async function getSessionOrGuest() {
  try {
    const session = await auth();
    if (session) return session;
  } catch {}
  // Return guest session if no auth configured
  return { user: { name: 'Guest', email: 'guest@jarvis.local', dbId: 'guest' } };
}
