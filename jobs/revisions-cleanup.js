/**
 * AWS Lambda Background Job: Article Revisions Cleanup
 * Enforces data retention rule: trims `article_revisions` to keep only the latest 20 revisions per article.
 * Scheduled to run daily.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bogjmdyolhazzvicjrjl.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZ2ptZHlvbGhhenp2aWNqcmpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NDcxNDAsImV4cCI6MjEwNDAyMzE0MH0.taOdcGmN6pQ3sfuIC2UIVkSV-8j0Y_wuXS-7Un4xo_0';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export async function handler(event, context) {
  console.log('[Lambda] Starting revisions cleanup (retention max 20 per article)...');
  const MAX_REVISIONS_PER_ARTICLE = 20;

  try {
    // 1. Get list of distinct articles having revisions
    const { data: revisions, error } = await supabase
      .from('article_revisions')
      .select('id, article_id, created_at')
      .order('created_at', { ascending: false });

    if (error || !revisions) {
      throw error || new Error('Failed to query revisions');
    }

    // Group by article_id
    const articleRevsMap = new Map();
    for (const rev of revisions) {
      if (!rev.article_id) continue;
      if (!articleRevsMap.has(rev.article_id)) {
        articleRevsMap.set(rev.article_id, []);
      }
      articleRevsMap.get(rev.article_id).push(rev.id);
    }

    let deletedCount = 0;
    for (const [articleId, revIds] of articleRevsMap.entries()) {
      if (revIds.length > MAX_REVISIONS_PER_ARTICLE) {
        // IDs beyond the latest 20
        const idsToDelete = revIds.slice(MAX_REVISIONS_PER_ARTICLE);
        const { error: delErr } = await supabase
          .from('article_revisions')
          .delete()
          .in('id', idsToDelete);

        if (!delErr) {
          deletedCount += idsToDelete.length;
        }
      }
    }

    console.log(`[Lambda] Pruned ${deletedCount} excess revisions beyond retention limit.`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        deletedCount,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (err) {
    console.error('[Lambda] Revisions cleanup failed:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  handler({}, {}).then(console.log);
}
