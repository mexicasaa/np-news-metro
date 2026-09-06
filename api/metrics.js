import './_suppressWarnings.js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bogjmdyolhazzvicjrjl.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZ2ptZHlvbGhhenp2aWNqcmpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NDcxNDAsImV4cCI6MjEwNDAyMzE0MH0.taOdcGmN6pQ3sfuIC2UIVkSV-8j0Y_wuXS-7Un4xo_0';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const articleId = (req.query?.articleId || '').trim();
  const date = (req.query?.date || new Date().toISOString().split('T')[0]).trim();

  if (!articleId) {
    return res.status(400).json({ error: 'articleId required' });
  }

  try {
    const { data, error } = await supabase
      .from('article_metrics_daily')
      .select('article_id, date, views, likes, shares, comments')
      .eq('article_id', articleId)
      .eq('date', date)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    
    if (!data) {
      return res.status(200).json({
        articleId,
        date,
        views: 0,
        likes: 0,
        shares: 0,
        comments: 0
      });
    }

    return res.status(200).json({
      articleId: data.article_id,
      date: data.date,
      views: data.views || 0,
      likes: data.likes || 0,
      shares: data.shares || 0,
      comments: data.comments || 0,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
