import { supabase } from '../../lib/supabase';
import { CommentRecord } from '../types';

export class CommentRepository {
  private static instance: CommentRepository;

  public static getInstance(): CommentRepository {
    if (!CommentRepository.instance) {
      CommentRepository.instance = new CommentRepository();
    }
    return CommentRepository.instance;
  }

  /**
   * Fetch approved comments for a given article (cacheable, public)
   */
  public async getApprovedByArticle(articleId: string): Promise<CommentRecord[]> {
    if (!articleId) return [];

    try {
      const { data, error } = await supabase
        .from('comments')
        .select('id, article_id, user_id, author_name, author_email, parent_id, body, status, created_at, updated_at')
        .eq('article_id', articleId)
        .eq('status', 'approved')
        .order('created_at', { ascending: true });

      if (error || !data) return [];
      return data.map(this.mapRow);
    } catch {
      return [];
    }
  }

  /**
   * Submit new comment (defaults to 'pending' for moderation)
   */
  public async submitComment(input: {
    articleId: string;
    authorName: string;
    authorEmail: string;
    body: string;
    userId?: string | null;
    parentId?: string | null;
  }): Promise<{ success: boolean; comment?: CommentRecord; error?: string }> {
    if (!input.articleId || !input.body.trim() || !input.authorName.trim() || !input.authorEmail.trim()) {
      return { success: false, error: 'Article, name, email, and comment body are required.' };
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          article_id: input.articleId,
          author_name: input.authorName.trim().slice(0, 100),
          author_email: input.authorEmail.trim().slice(0, 120),
          body: input.body.trim().slice(0, 2000),
          user_id: input.userId || null,
          parent_id: input.parentId || null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, comment: this.mapRow(data) };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Comment submission failed.' };
    }
  }

  /**
   * Moderate comment (admin only)
   */
  public async updateStatus(
    commentId: string,
    status: 'approved' | 'rejected' | 'spam' | 'deleted'
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', commentId);

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Fetch all comments for admin review (pending, approved, spam, etc.)
   */
  public async getCommentsForAdmin(statusFilter?: string, limit = 100): Promise<CommentRecord[]> {
    try {
      let query = supabase
        .from('comments')
        .select('id, article_id, user_id, author_name, author_email, parent_id, body, status, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error || !data) return [];
      return data.map(this.mapRow);
    } catch {
      return [];
    }
  }

  /**
   * Count approved comments for an article
   */
  public async getApprovedCount(articleId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('article_id', articleId)
        .eq('status', 'approved');

      return (!error && typeof count === 'number') ? count : 0;
    } catch {
      return 0;
    }
  }

  private mapRow(row: any): CommentRecord {
    return {
      id: row.id,
      articleId: row.article_id,
      userId: row.user_id,
      authorName: row.author_name,
      authorEmail: row.author_email,
      parentId: row.parent_id,
      body: row.body,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
