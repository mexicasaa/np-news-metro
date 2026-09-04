// @ts-nocheck
import './_suppressWarnings.js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bogjmdyolhazzvicjrjl.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZ2ptZHlvbGhhenp2aWNqcmpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NDcxNDAsImV4cCI6MjEwNDAyMzE0MH0.taOdcGmN6pQ3sfuIC2UIVkSV-8j0Y_wuXS-7Un4xo_0';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = {};
  if (typeof req.body === 'string') {
    try {
      body = JSON.parse(req.body);
    } catch {}
  } else {
    body = req.body || {};
  }

  const articleId = (body.articleId || '').trim();
  const type = body.type || 'view';

  if (!articleId) {
    return res.status(400).json({ error: 'articleId required' });
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const isShare = type === 'share';

    await supabase.rpc('increment_article_metric', {
      p_article_id: articleId,
      p_date: today,
      p_views: isShare ? 0 : 1,
      p_shares: isShare ? 1 : 0,
      p_likes: 0,
      p_comments: 0,
    });

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ success: true, recorded: type });
  } catch (err) {
    // Non-blocking, return 200 with error log
    return res.status(200).json({ success: false, error: err.message });
  }
}
