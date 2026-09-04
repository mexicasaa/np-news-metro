/**
 * AWS Lambda Background Job: Orphan Media Cleanup
 * Identifies media records with 0 referencing articles in `article_media`
 * older than a 30-day retention window.
 * Scheduled to run weekly.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bogjmdyolhazzvicjrjl.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZ2ptZHlvbGhhenp2aWNqcmpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NDcxNDAsImV4cCI6MjEwNDAyMzE0MH0.taOdcGmN6pQ3sfuIC2UIVkSV-8j0Y_wuXS-7Un4xo_0';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export async function handler(event, context) {
  console.log('[Lambda] Starting orphan media cleanup...');
  const RETENTION_DAYS = 30;
  const cutoffDate = new Date(Date.now() - RETENTION_DAYS * 24 * 3600 * 1000).toISOString();

  try {
    // 1. Fetch media older than 30 days
    const { data: oldMedia, error } = await supabase
      .from('media')
      .select('id, file_name, storage_path, r2_key, created_at')
      .lt('created_at', cutoffDate)
      .limit(100);

    if (error || !oldMedia) {
      throw error || new Error('No media returned');
    }

    let cleanedCount = 0;
    for (const item of oldMedia) {
      // Check if referenced in article_media
      const { count, error: countErr } = await supabase
        .from('article_media')
        .select('article_id', { count: 'exact', head: true })
        .eq('media_id', item.id);

      if (!countErr && count === 0) {
        // Safe to remove unreferenced media
        console.log(`[Lambda] Cleaning orphan media: ${item.id} (${item.file_name})`);

        if (item.storage_path) {
          await supabase.storage.from('article-images').remove([item.storage_path]);
        }

        await supabase.from('media').delete().eq('id', item.id);
        cleanedCount++;
      }
    }

    console.log(`[Lambda] Cleaned ${cleanedCount} orphan media records.`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        cleanedCount,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (err) {
    console.error('[Lambda] Orphan cleanup failed:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  handler({}, {}).then(console.log);
}
