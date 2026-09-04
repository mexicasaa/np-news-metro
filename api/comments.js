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
    if (!articleId) {
      return res.status(400).json({ error: 'articleId required' });
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .select('id, article_id, author_name, parent_id, body, status, created_at')
        .eq('article_id', articleId)
        .eq('status', 'approved')
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=300');
      return res.status(200).json({ comments: data || [] });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { articleId, authorName, authorEmail, body: commentBody, parentId } = body;

    if (!articleId || !authorName?.trim() || !authorEmail?.trim() || !commentBody?.trim()) {
      return res.status(400).json({ error: 'articleId, authorName, authorEmail, and body are required' });
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          article_id: articleId,
          author_name: authorName.trim().slice(0, 100),
          author_email: authorEmail.trim().slice(0, 120),
          body: commentBody.trim().slice(0, 2000),
          parent_id: parentId || null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.setHeader('Cache-Control', 'no-store');
      return res.status(201).json({
        success: true,
        message: 'Comment submitted for editorial review.',
        commentId: data.id,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (method === 'PATCH') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { commentId, status } = body;

    if (!commentId || !['approved', 'rejected', 'spam', 'deleted'].includes(status)) {
      return res.status(400).json({ error: 'Valid commentId and status required' });
    }

    try {
      const { error } = await supabase
        .from('comments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', commentId);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ success: true, commentId, status });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
