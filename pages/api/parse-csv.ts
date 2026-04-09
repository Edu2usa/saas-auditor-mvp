import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/supabase-server';
import { checkCsrf } from '@/lib/csrf';
import { checkRateLimit } from '@/lib/rate-limit';
import { parseCSVText } from '@/lib/csv-parser';

// Max 5 MB of CSV text
const MAX_CSV_BYTES = 5 * 1024 * 1024;
// Max 10 000 rows (PapaParse counts header as non-data row, so this is generous)
const MAX_CSV_ROWS = 10_000;

// Rate limit: 30 parse requests per hour per user
const PARSE_MAX = 30;
const PARSE_WINDOW_MS = 60 * 60 * 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Auth required — prevents unauthenticated DoS
  const auth = await requireAuth(req, res);
  if (!auth) return;

  if (!checkCsrf(req, res)) return;

  const rl = checkRateLimit(`parse-csv:${auth.user.id}`, PARSE_MAX, PARSE_WINDOW_MS);
  if (!rl.allowed) {
    res.setHeader('Retry-After', Math.ceil((rl.resetAt - Date.now()) / 1000));
    return res.status(429).json({ error: 'Too many requests — try again later' });
  }

  const { csvText } = req.body;
  if (!csvText || typeof csvText !== 'string') {
    return res.status(400).json({ error: 'csvText is required' });
  }

  // Size guard
  if (Buffer.byteLength(csvText, 'utf8') > MAX_CSV_BYTES) {
    return res.status(413).json({ error: `CSV must be smaller than ${MAX_CSV_BYTES / 1024 / 1024} MB` });
  }

  // Row-count guard — count newlines as a cheap proxy before parsing
  const roughRowCount = csvText.split('\n').length - 1; // subtract header
  if (roughRowCount > MAX_CSV_ROWS) {
    return res.status(400).json({ error: `CSV must have at most ${MAX_CSV_ROWS.toLocaleString()} rows` });
  }

  try {
    const result = parseCSVText(csvText);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Parse failed' });
  }
}
