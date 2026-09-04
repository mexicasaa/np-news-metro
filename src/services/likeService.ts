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

export const getArticleLikeState = async (articleId: string): Promise<LikeState> => {
  if (!articleId) return { hasLiked: false, likeCount: 0 };
  const userId = getVisitorId();

  // 1. Try serverless edge API if in browser
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch(`/api/likes?articleId=${encodeURIComponent(articleId)}&userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        return await res.json();
      }
    }
  } catch {}

  // 2. Direct repository fallback
  const repo = LikeRepository.getInstance();
  const [hasLiked, likeCount] = await Promise.all([
    repo.hasLiked(articleId, userId),
    repo.getLikesCount(articleId),
  ]);

  return { hasLiked, likeCount };
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
        return await res.json();
      }
    }
  } catch {}

  // 2. Direct repository fallback
  const repo = LikeRepository.getInstance();
  const result = await repo.toggleLike(articleId, userId);
  return { hasLiked: result.liked, likeCount: result.count };
};
