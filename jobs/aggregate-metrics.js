/**
 * AWS Lambda Background Job: Aggregate Metrics & Trending Scores
 * Computes trending decay scores from aggregated daily views, likes, comments, and shares.
 * Scheduled to run every 15-30 minutes.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bogjmdyolhazzvicjrjl.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZ2ptZHlvbGhhenp2aWNqcmpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NDcxNDAsImV4cCI6MjEwNDAyMzE0MH0.taOdcGmN6pQ3sfuIC2UIVkSV-8j0Y_wuXS-7Un4xo_0';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export async function handler(event, context) {
  console.log('[Lambda] Starting metrics aggregation and trending calculation...');

  try {
    const today = new Date().toISOString().split('T')[0];

    // Fetch top active articles from metrics table
    const { data: metrics, error } = await supabase
      .from('article_metrics_daily')
      .select(`
        article_id, views, likes, comments, shares,
        articles (
          id, slug, title, title_hi, category_id, featured_image_url, published_at
        )
      `)
      .order('views', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    const scored = (metrics || [])
      .filter((m) => m.articles && m.articles.title)
      .map((m) => {
        const art = m.articles;
        const views = Number(m.views) || 0;
        const likes = Number(m.likes) || 0;
        const comments = Number(m.comments) || 0;
        const shares = Number(m.shares) || 0;

        const hoursOld = Math.max(1, (Date.now() - new Date(art.published_at || Date.now()).getTime()) / (1000 * 3600));
        const trendingScore = ((views * 1.0) + (likes * 5.0) + (comments * 10.0) + (shares * 8.0)) / Math.pow(hoursOld + 2, 1.3);

        return {
          articleId: art.id,
          slug: art.slug,
          score: Math.round(trendingScore * 100) / 100,
        };
      })
      .sort((a, b) => b.score - a.score);

    console.log(`[Lambda] Aggregated ${scored.length} articles for trending.`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        aggregatedCount: scored.length,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (err) {
    console.error('[Lambda] Aggregation failed:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  handler({}, {}).then(console.log);
}
