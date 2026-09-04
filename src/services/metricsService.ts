import { MetricsRepository } from '../repositories/dynamodb/MetricsRepository';
import { TrendingRepository } from '../repositories/dynamodb/TrendingRepository';
import { TrendingArticleItem } from '../repositories/types';

/**
 * Record a page view in a completely non-blocking manner.
 * Never awaits or blocks article page rendering.
 */
export const recordPageView = (articleId: string): void => {
  if (!articleId) return;

  // Use browser sendBeacon if available, or async queue
  try {
    if (typeof window !== 'undefined' && navigator.sendBeacon) {
      const data = JSON.stringify({ articleId, type: 'view' });
      const sent = navigator.sendBeacon('/api/metrics', data);
      if (sent) return;
    }
  } catch {}

  // Fallback to internal non-blocking repository queue
  MetricsRepository.getInstance().recordView(articleId);
};

/**
 * Record an article share event in a non-blocking manner.
 */
export const recordArticleShare = (articleId: string): void => {
  if (!articleId) return;

  try {
    if (typeof window !== 'undefined' && navigator.sendBeacon) {
      const data = JSON.stringify({ articleId, type: 'share' });
      navigator.sendBeacon('/api/metrics', data);
    }
  } catch {}

  MetricsRepository.getInstance().recordShare(articleId);
};

/**
 * Fetch top trending articles from edge cache
 */
export const getTrendingArticles = async (limit = 10): Promise<TrendingArticleItem[]> => {
  // 1. Try serverless edge-cached endpoint
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch(`/api/trending?limit=${limit}`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.trending)) {
          return json.trending;
        }
      }
    }
  } catch {}

  // 2. Repository fallback
  return TrendingRepository.getInstance().getTrendingArticles(limit);
};
