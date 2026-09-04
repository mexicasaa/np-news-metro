// @ts-nocheck
import './_suppressWarnings.js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bogjmdyolhazzvicjrjl.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZ2ptZHlvbGhhenp2aWNqcmpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NDcxNDAsImV4cCI6MjEwNDAyMzE0MH0.taOdcGmN6pQ3sfuIC2UIVkSV-8j0Y_wuXS-7Un4xo_0';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export default async function handler(req, res) {
  const method = req.method;

  if (method === 'GET') {
    const articleId = (req.query?.articleId || '').trim();
    const userId = (req.query?.userId || '').trim();

    if (!articleId) {
      return res.status(400).json({ error: 'articleId required' });
    }

    try {
      const [countRes, likedRes] = await Promise.all([
        supabase.from('article_likes').select('id', { count: 'exact', head: true }).eq('article_id', articleId),
        userId ? supabase.from('article_likes').select('id').eq('article_id', articleId).eq('user_id', userId).maybeSingle() : Promise.resolve({ data: null }),
      ]);

      res.setHeader('Cache-Control', 'public, max-age=15, s-maxage=30, stale-while-revalidate=60');
      return res.status(200).json({
        hasLiked: !!likedRes?.data,
        likeCount: countRes?.count || 0,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const articleId = (body.articleId || '').trim();
    const userId = (body.userId || '').trim();

    if (!articleId || !userId) {
      return res.status(400).json({ error: 'articleId and userId required' });
    }

    try {
      // Check if already liked
      const { data: existing } = await supabase
        .from('article_likes')
        .select('id')
        .eq('article_id', articleId)
        .eq('user_id', userId)
        .maybeSingle();

      let hasLiked = false;
      if (existing) {
        await supabase.from('article_likes').delete().eq('id', existing.id);
        hasLiked = false;
      } else {
        await supabase.from('article_likes').insert({ article_id: articleId, user_id: userId });
        hasLiked = true;
      }

      const { count } = await supabase
        .from('article_likes')
        .select('id', { count: 'exact', head: true })
        .eq('article_id', articleId);

      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({
        hasLiked,
        likeCount: count || 0,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
