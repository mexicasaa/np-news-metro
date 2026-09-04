import { supabase } from '../../lib/supabase';
import { DailyMetricsRecord } from '../types';

export class MetricsRepository {
  private static instance: MetricsRepository;
  private static isDynamoDbAvailable = false; // Will switch dynamically if AWS DynamoDB credentials become active
  private batchBuffer: Array<{ articleId: string; type: 'view' | 'share' }> = [];
  private flushTimer: any = null;

  public static getInstance(): MetricsRepository {
    if (!MetricsRepository.instance) {
      MetricsRepository.instance = new MetricsRepository();
    }
    return MetricsRepository.instance;
  }

  /**
   * Queue non-blocking page view. Batched every 2 seconds to keep requests minimal.
   * Rule 28: Never store one record per eyeball.
   */
  public recordView(articleId: string): void {
    if (!articleId) return;
    this.batchBuffer.push({ articleId, type: 'view' });

    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => {
        this.flushTimer = null;
        this.flushBatch();
      }, 2000);
    }
  }

  /**
   * Record share event
   */
  public recordShare(articleId: string): void {
    if (!articleId) return;
    this.batchBuffer.push({ articleId, type: 'share' });

    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => {
        this.flushTimer = null;
        this.flushBatch();
      }, 2000);
    }
  }

  /**
   * Flush batched metrics into daily aggregate table (or DynamoDB when active)
   */
  public async flushBatch(): Promise<void> {
    if (this.batchBuffer.length === 0) return;

    const items = [...this.batchBuffer];
    this.batchBuffer = [];

    // Aggregate by articleId in-memory before writing
    const counts: Record<string, { views: number; shares: number }> = {};
    for (const item of items) {
      if (!counts[item.articleId]) {
        counts[item.articleId] = { views: 0, shares: 0 };
      }
      if (item.type === 'view') counts[item.articleId].views++;
      if (item.type === 'share') counts[item.articleId].shares++;
    }

    const today = new Date().toISOString().split('T')[0];

    // Failure-isolated write to Supabase aggregate table
    for (const [articleId, stat] of Object.entries(counts)) {
      try {
        await supabase.rpc('increment_article_metric', {
          p_article_id: articleId,
          p_date: today,
          p_views: stat.views,
          p_shares: stat.shares,
          p_likes: 0,
          p_comments: 0,
        });
      } catch (err) {
        // Never let metric recording fail or throw
        console.warn('Metric batch increment non-fatal warning:', err);
      }
    }
  }

  /**
   * Fetch daily metrics for an article
   */
  public async getArticleMetrics(articleId: string, date?: string): Promise<DailyMetricsRecord | null> {
    if (!articleId) return null;
    const targetDate = date || new Date().toISOString().split('T')[0];

    try {
      const { data, error } = await supabase
        .from('article_metrics_daily')
        .select('article_id, date, views, likes, shares, comments')
        .eq('article_id', articleId)
        .eq('date', targetDate)
        .maybeSingle();

      if (error || !data) return null;

      return {
        articleId: data.article_id || articleId,
        date: data.date,
        views: Number(data.views) || 0,
        likes: Number(data.likes) || 0,
        shares: Number(data.shares) || 0,
        comments: Number(data.comments) || 0,
      };
    } catch {
      return null;
    }
  }
}
