// @ts-nocheck
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

  const limit = Math.min(20, Math.max(1, parseInt(req.query?.limit || '10', 10)));

  try {
    // 1. Fetch top metrics from daily aggregate
    const { data: metricsData, error: metricsErr } = await supabase
      .from('article_metrics_daily')
      .select(`
        article_id, views, likes, comments, shares,
        articles (
          id, slug, title, title_hi, category_id, featured_image_url, published_at,
          categories (name, slug)
        )
      `)
      .order('views', { ascending: false })
      .limit(limit * 2);

    if (!metricsErr && metricsData && metricsData.length > 0) {
      const trending = metricsData
        .filter((d) => d.articles && d.articles.title)
        .map((d) => {
          const art = d.articles;
          const views = Number(d.views) || 0;
          const likes = Number(d.likes) || 0;
          const comments = Number(d.comments) || 0;
          const shares = Number(d.shares) || 0;
          const hoursOld = Math.max(1, (Date.now() - new Date(art.published_at || Date.now()).getTime()) / 3600000);
          const score = ((views * 1.0) + (likes * 5.0) + (comments * 10.0) + (shares * 8.0)) / Math.pow(hoursOld + 2, 1.3);

          return {
            articleId: art.id,
            slug: art.slug,
            title: art.title,
            titleHi: art.title_hi || undefined,
            category: art.categories?.name || 'India',
            imageUrl: art.featured_image_url || undefined,
            score: Math.round(score * 100) / 100,
            views,
            publishedAt: art.published_at,
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
      return res.status(200).json({ trending });
    }

    // 2. Fallback to articles view_count
    const { data: articles, error } = await supabase
      .from('articles')
      .select(`
        id, slug, title, title_hi, category_id, featured_image_url, published_at, view_count,
        categories (name, slug)
      `)
      .eq('status', 'published')
      .order('view_count', { ascending: false })
      .limit(limit);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const fallbackTrending = (articles || []).map((art, idx) => ({
      articleId: art.id,
      slug: art.slug,
      title: art.title,
      titleHi: art.title_hi || undefined,
      category: art.categories?.name || 'India',
      imageUrl: art.featured_image_url || undefined,
      score: 100 - idx,
      views: art.view_count || 100,
      publishedAt: art.published_at,
    }));

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ trending: fallbackTrending });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
