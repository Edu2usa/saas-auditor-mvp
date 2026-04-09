import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { requireAuth, createUserClient } from '@/lib/supabase-server';
import { checkCsrf } from '@/lib/csrf';
import { checkRateLimit } from '@/lib/rate-limit';

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const subscriptionSchema = z.object({
  vendor: z.string().max(500),
  category: z.string().max(200),
  monthly_cost: z.number().finite().nonnegative(),
  annual_cost: z.number().finite().nonnegative(),
  users_count: z.number().int().nonnegative().max(1_000_000),
  billing_cycle: z.enum(['monthly', 'annual', 'quarterly', 'unknown']),
  // raw_row is user-supplied CSV columns — keep but don't validate shape
  raw_row: z.record(z.string()).optional(),
});

const reportDataSchema = z.object({
  subscriptions: z.array(subscriptionSchema).max(10_000),
  category_breakdown: z
    .array(
      z.object({
        category: z.string().max(200),
        monthly_cost: z.number().finite().nonnegative(),
        annual_cost: z.number().finite().nonnegative(),
        vendor_count: z.number().int().nonneg(),
        color: z.string().max(50),
      })
    )
    .max(200),
  total_monthly_cost: z.number().finite().nonnegative(),
  total_annual_cost: z.number().finite().nonnegative(),
  vendor_count: z.number().int().nonneg().max(10_000),
  warnings: z.array(z.string().max(500)).max(1_000),
});

const createAuditBody = z.object({
  name: z.string().min(1, 'name is required').max(200, 'name must be 200 chars or fewer').trim(),
  total_monthly_cost: z.number().finite().nonnegative(),
  total_annual_cost: z.number().finite().nonnegative(),
  vendor_count: z.number().int().nonneg().max(10_000),
  report_data: reportDataSchema,
});

// ---------------------------------------------------------------------------
// Rate-limit config
// ---------------------------------------------------------------------------
// Audit creation: 20 per hour per authenticated user
const AUDIT_CREATE_MAX = 20;
const AUDIT_CREATE_WINDOW_MS = 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await requireAuth(req, res);
  if (!auth) return; // requireAuth already sent 401

  // Per-request Supabase client — uses anon key + user JWT so RLS applies
  const supabase = createUserClient(auth.token);

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('audits')
      .select('id, name, created_at, status, total_monthly_cost, total_annual_cost, vendor_count')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    if (!checkCsrf(req, res)) return;

    // Rate limiting — keyed per user so one user can't flood the table
    const rl = checkRateLimit(
      `audit-create:${auth.user.id}`,
      AUDIT_CREATE_MAX,
      AUDIT_CREATE_WINDOW_MS
    );
    if (!rl.allowed) {
      res.setHeader('Retry-After', Math.ceil((rl.resetAt - Date.now()) / 1000));
      return res.status(429).json({ error: 'Too many requests — try again later' });
    }

    // Validate body
    const parsed = createAuditBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid body' });
    }

    const { name, total_monthly_cost, total_annual_cost, vendor_count, report_data } = parsed.data;

    const { data, error } = await supabase
      .from('audits')
      .insert({
        user_id: auth.user.id,
        name,
        status: 'complete',
        total_monthly_cost,
        total_annual_cost,
        vendor_count,
        report_data,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
