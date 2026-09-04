import { supabase } from '../../lib/supabase';

export class LikeRepository {
  private static instance: LikeRepository;

  public static getInstance(): LikeRepository {
    if (!LikeRepository.instance) {
      LikeRepository.instance = new LikeRepository();
    }
    return LikeRepository.instance;
  }

  /**
   * Check if user has liked an article
   */
  public async hasLiked(articleId: string, userId: string): Promise<boolean> {
    if (!articleId || !userId) return false;

    try {
      const { data, error } = await supabase
        .from('article_likes')
        .select('id')
        .eq('article_id', articleId)
        .eq('user_id', userId)
        .maybeSingle();

      return !error && !!data;
    } catch {
      return false;
    }
  }

  /**
   * Get total persistent likes count for an article
   */
  public async getLikesCount(articleId: string): Promise<number> {
    if (!articleId) return 0;

    try {
      const { count, error } = await supabase
        .from('article_likes')
        .select('id', { count: 'exact', head: true })
        .eq('article_id', articleId);

      return (!error && typeof count === 'number') ? count : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Toggle persistent like: insert if not exists, delete if already liked.
   * Guarantees UNIQUE(article_id, user_id) constraint compliance.
   */
  public async toggleLike(
    articleId: string,
    userId: string
  ): Promise<{ liked: boolean; count: number }> {
    if (!articleId || !userId) {
      return { liked: false, count: 0 };
    }

    try {
      const alreadyLiked = await this.hasLiked(articleId, userId);

      if (alreadyLiked) {
        await supabase
          .from('article_likes')
          .delete()
          .eq('article_id', articleId)
          .eq('user_id', userId);

        const count = await this.getLikesCount(articleId);
        return { liked: false, count };
      } else {
        await supabase
          .from('article_likes')
          .insert({
            article_id: articleId,
            user_id: userId,
          });

        const count = await this.getLikesCount(articleId);
        return { liked: true, count };
      }
    } catch (err) {
      console.warn('Like toggle operation exception:', err);
      const count = await this.getLikesCount(articleId);
      return { liked: false, count };
    }
  }
}
