import { CommentRepository } from '../repositories/supabase/CommentRepository';
import { CommentRecord } from '../repositories/types';

export interface CommentSubmission {
  articleId: string;
  authorName: string;
  authorEmail: string;
  body: string;
  parentId?: string | null;
}

export const getArticleComments = async (articleId: string): Promise<CommentRecord[]> => {
  if (!articleId) return [];

  // 1. Try serverless edge API
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch(`/api/comments?articleId=${encodeURIComponent(articleId)}`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.comments)) {
          return json.comments;
        }
      }
    }
  } catch {}

  // 2. Repository fallback
  return CommentRepository.getInstance().getApprovedByArticle(articleId);
};

export const postComment = async (
  input: CommentSubmission
): Promise<{ success: boolean; comment?: CommentRecord; error?: string }> => {
  // 1. Try serverless API
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (res.ok) {
        return await res.json();
      }
    }
  } catch {}

  // 2. Repository fallback
  return CommentRepository.getInstance().submitComment({
    ...input,
    userId: null,
  });
};

export const moderateComment = async (
  commentId: string,
  status: 'approved' | 'rejected' | 'spam' | 'deleted'
): Promise<boolean> => {
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, status }),
      });
      if (res.ok) {
        const json = await res.json();
        return !!json.success;
      }
    }
  } catch {}

  return CommentRepository.getInstance().updateStatus(commentId, status);
};

export const getCommentsForAdmin = async (
  statusFilter?: string,
  limit = 100
): Promise<CommentRecord[]> => {
  return CommentRepository.getInstance().getCommentsForAdmin(statusFilter, limit);
};
