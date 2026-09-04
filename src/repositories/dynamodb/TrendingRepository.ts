import { supabase } from '../../lib/supabase';
import { TrendingArticleItem } from '../types';

export class TrendingRepository {
  private static instance: TrendingRepository;
  private static cachedTrending: { data: TrendingArticleItem[]; timestamp: number } | null = null;
  private static CACHE_TTL_MS = 60 * 1000; // 60s memory cache

  public static getInstance(): TrendingRepository {
    if (!TrendingRepository.instance) {
      TrendingRepository.instance = new TrendingRepository();
    }
    return TrendingRepository.instance;
  }

  /**
   * Get cached trending articles.
   * Calculated from aggregated daily metrics + recency, cached aggressively.
   */
  public async getTrendingArticles(limit = 10): Promise<TrendingArticleItem[]> {
    if (
      TrendingRepository.cachedTrending &&
      Date.now() - TrendingRepository.cachedTrending.timestamp < TrendingRepository.CACHE_TTL_MS
    ) {
      return TrendingRepository.cachedTrending.data.slice(0, limit);
    }

    try {
      // Fetch top articles by daily aggregated views/metrics
      const { data, error } = await supabase
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

      if (error || !data || data.length === 0) {
        // Fallback to most viewed articles from articles table if daily metrics is newly created
        const { data: fallbackArticles } = await supabase
          .from('articles')
          .select(`
            id, slug, title, title_hi, category_id, featured_image_url, published_at, view_count,
            categories (name, slug)
          `)
          .eq('status', 'published')
          .order('view_count', { ascending: false })
          .limit(limit);

        if (!fallbackArticles) return [];

        const items: TrendingArticleItem[] = fallbackArticles.map((a: any, idx) => ({
          articleId: a.id,
          slug: a.slug,
          title: a.title,
          titleHi: a.title_hi || undefined,
          category: a.categories?.name || 'India',
          imageUrl: a.featured_image_url || undefined,
          score: 100 - idx,
          views: a.view_count || 100,
          likes: 0,
          comments: 0,
          publishedAt: a.published_at || new Date().toISOString(),
        }));

        TrendingRepository.cachedTrending = { data: items, timestamp: Date.now() };
        return items.slice(0, limit);
      }

      const items: TrendingArticleItem[] = data
        .filter((d: any) => d.articles && d.articles.title)
        .map((d: any) => {
          const art = d.articles;
          const views = Number(d.views) || 0;
          const likes = Number(d.likes) || 0;
          const comments = Number(d.comments) || 0;
          const shares = Number(d.shares) || 0;

          // Compute trending decay score: (V*1 + L*5 + C*10 + S*8) / (hours + 2)^1.5
          const hoursOld = Math.max(
            1,
            (Date.now() - new Date(art.published_at || Date.now()).getTime()) / (1000 * 3600)
          );
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
            likes,
            comments,
            publishedAt: art.published_at || new Date().toISOString(),
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      TrendingRepository.cachedTrending = { data: items, timestamp: Date.now() };
      return items;
    } catch {
      return [];
    }
  }

  /**
   * Set trending cache explicitly (called by Lambda background job)
   */
  public updateTrendingCache(items: TrendingArticleItem[]): void {
    TrendingRepository.cachedTrending = { data: items, timestamp: Date.now() };
  }
}
