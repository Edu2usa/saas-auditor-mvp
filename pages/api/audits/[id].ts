import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth, createUserClient } from '@/lib/supabase-server';
import { checkCsrf } from '@/lib/csrf';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await requireAuth(req, res);
  if (!auth) return;

  const { id } = req.query;
  if (typeof id !== 'string' || !/^[0-9a-f-]{36}$/.test(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  // Per-request client with user JWT — RLS enforces user_id = auth.uid()
  const supabase = createUserClient(auth.token);

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('audits')
      .select('*')
      .eq('id', id)
      .eq('user_id', auth.user.id)
      .single();

    if (error) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(data);
  }

  if (req.method === 'DELETE') {
    if (!checkCsrf(req, res)) return;

    const { error } = await supabase
      .from('audits')
      .delete()
      .eq('id', id)
      .eq('user_id', auth.user.id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
