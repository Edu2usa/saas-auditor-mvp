import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

// Anon-key client — used only to verify JWTs. Does NOT bypass RLS.
const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Create a per-request Supabase client that carries the user's JWT so that
 * Postgres RLS policies fire as the authenticated user, not as the service role.
 */
export function createUserClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
      auth: {
        // Prevent the SDK from persisting sessions server-side
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}

export interface AuthenticatedUser {
  id: string;
  email?: string;
}

/**
 * Validate the Authorization header, verify the JWT with Supabase Auth,
 * and return { user, token }. Writes a 401 response and returns null on failure.
 */
export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<{ user: AuthenticatedUser; token: string } | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  const token = authHeader.slice(7);

  // getUser(jwt) hits Supabase Auth to validate the token server-side.
  // Using the anon-key client here is intentional and correct.
  const {
    data: { user },
    error,
  } = await supabaseAnon.auth.getUser(token);

  if (error || !user) {
    res.status(401).json({ error: 'Invalid token' });
    return null;
  }

  return { user: { id: user.id, email: user.email }, token };
}
