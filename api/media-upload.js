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

  const { contentHash, fileName, mimeType, fileSize, width, height, articleId } = body;

  if (!contentHash) {
    return res.status(400).json({ error: 'contentHash required' });
  }

  try {
    // 1. Search media by content hash (deduplication check)
    const { data: existing, error: searchErr } = await supabase
      .from('media')
      .select('id, file_name, storage_path, public_url, content_hash, r2_key, width, height')
      .eq('content_hash', contentHash)
      .maybeSingle();

    if (existing) {
      // Image already exists! Reuse media.id and create relationship
      if (articleId) {
        await supabase.from('article_media').upsert({
          article_id: articleId,
          media_id: existing.id,
          usage_type: 'featured',
          sort_order: 0,
        });

        await supabase
          .from('articles')
          .update({ featured_media_id: existing.id })
          .eq('id', articleId);
      }

      return res.status(200).json({
        isDuplicate: true,
        media: existing,
        message: 'Reusing existing deduplicated media asset. Zero additional storage used.',
      });
    }

    // 2. Hash does not exist. Authorize upload
    const cleanName = (fileName || 'image.webp').replace(/[^a-zA-Z0-9._-]/g, '_');
    const r2Key = `media/${contentHash}/${cleanName}`;
    const storagePath = `media/${contentHash}/${cleanName}`;

    return res.status(200).json({
      isDuplicate: false,
      r2Key,
      storagePath,
      uploadAuthorized: true,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
