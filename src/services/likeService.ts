import { LikeRepository } from '../repositories/supabase/LikeRepository';

const VISITOR_ID_KEY = 'np_visitor_token';

export const getVisitorId = (): string => {
  if (typeof window === 'undefined') return 'anon-server';
  let token = localStorage.getItem(VISITOR_ID_KEY);
  if (!token) {
    token = `vis_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(VISITOR_ID_KEY, token);
  }
  return token;
};

export interface LikeState {
  hasLiked: boolean;
  likeCount: number;
}

const LIKED_STORAGE_PREFIX = 'np_liked_article_';

export const getArticleLikeState = async (articleId: string): Promise<LikeState> => {
  if (!articleId) return { hasLiked: false, likeCount: 0 };
  
  // Instant client-side state evaluation
  let hasLiked = false;
  if (typeof window !== 'undefined') {
    hasLiked = localStorage.getItem(`${LIKED_STORAGE_PREFIX}${articleId}`) === 'true';
  }

  // 1. Try public edge-cached likeCount API (No userId parameter = 100% CDN cache hits)
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch(`/api/likes?articleId=${encodeURIComponent(articleId)}`);
      if (res.ok) {
        const data = await res.json();
        return {
          hasLiked,
          likeCount: typeof data.likeCount === 'number' ? data.likeCount : 0,
        };
      }
    }
  } catch {}

  // 2. Direct repository fallback (count only)
  try {
    const repo = LikeRepository.getInstance();
    const likeCount = await repo.getLikesCount(articleId);
    return { hasLiked, likeCount };
  } catch {
    return { hasLiked, likeCount: 0 };
  }
};

export const toggleArticleLike = async (articleId: string): Promise<LikeState> => {
  if (!articleId) return { hasLiked: false, likeCount: 0 };
  const userId = getVisitorId();

  // 1. Try serverless API
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, userId }),
      });
      if (res.ok) {
        const json = await res.json();
        localStorage.setItem(`${LIKED_STORAGE_PREFIX}${articleId}`, json.hasLiked ? 'true' : 'false');
        return json;
      }
    }
  } catch {}

  // 2. Direct repository fallback
  const repo = LikeRepository.getInstance();
  const result = await repo.toggleLike(articleId, userId);
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${LIKED_STORAGE_PREFIX}${articleId}`, result.liked ? 'true' : 'false');
  }
  return { hasLiked: result.liked, likeCount: result.count };
};
