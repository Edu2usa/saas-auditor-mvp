import type { NextApiRequest, NextApiResponse } from 'next';

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Lightweight CSRF defense for API routes.
 *
 * These routes use Authorization: Bearer <jwt> (not cookies), so the classic
 * CSRF vector (browser auto-attaching cookies) doesn't apply. We still add
 * defense-in-depth via:
 *   1. Content-Type enforcement on POST/PUT/PATCH (prevents simple-form attacks)
 *   2. Origin header allowlist when the browser sends one
 *
 * Returns true if the request should proceed, false if a 4xx was already sent.
 */
export function checkCsrf(req: NextApiRequest, res: NextApiResponse): boolean {
  const method = req.method ?? '';
  if (!STATE_CHANGING_METHODS.has(method)) return true;

  // 1. Content-Type check (skip for DELETE — no body expected)
  if (method !== 'DELETE') {
    const ct = req.headers['content-type'] ?? '';
    if (!ct.includes('application/json')) {
      res.status(415).json({ error: 'Content-Type must be application/json' });
      return false;
    }
  }

  // 2. Origin allowlist (browser always sends Origin on cross-origin requests)
  const origin = req.headers.origin;
  if (origin) {
    const host = req.headers.host ?? '';
    const allowed = buildAllowedOrigins(host);
    if (!allowed.has(origin)) {
      res.status(403).json({ error: 'Forbidden: origin not allowed' });
      return false;
    }
  }

  return true;
}

function buildAllowedOrigins(host: string): Set<string> {
  const origins = new Set<string>();
  if (host) {
    origins.add(`https://${host}`);
    origins.add(`http://${host}`);
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) origins.add(appUrl.replace(/\/$/, ''));
  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:3000');
    origins.add('http://localhost:3001');
    origins.add('http://127.0.0.1:3000');
  }
  return origins;
}
