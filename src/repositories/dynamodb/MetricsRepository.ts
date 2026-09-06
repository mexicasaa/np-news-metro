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

    // Failure-isolated write to new Edge API
    for (const [articleId, stat] of Object.entries(counts)) {
      try {
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify({
            articleId,
            type: stat.views > 0 ? 'view' : 'share'
          })], { type: 'application/json' });
          navigator.sendBeacon('/api/telemetry', blob);
        } else {
          fetch('/api/telemetry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              articleId,
              type: stat.views > 0 ? 'view' : 'share'
            }),
            keepalive: true
          }).catch(() => {});
        }
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
      const response = await fetch(`/api/metrics?articleId=${articleId}&date=${targetDate}`);
      if (!response.ok) return null;
      
      const data = await response.json();
      return {
        articleId: data.articleId || articleId,
        date: data.date || targetDate,
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
