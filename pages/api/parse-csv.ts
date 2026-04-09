import type { NextApiRequest, NextApiResponse } from 'next';
import { parseCSVText } from '@/lib/csv-parser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { csvText } = req.body;
  if (!csvText || typeof csvText !== 'string') {
    return res.status(400).json({ error: 'csvText is required' });
  }

  try {
    const result = parseCSVText(csvText);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Parse failed' });
  }
}
