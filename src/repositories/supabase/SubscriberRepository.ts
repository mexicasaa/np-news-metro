import { supabase } from '../../lib/supabase';
import { SubscriberRecord } from '../types';

export class SubscriberRepository {
  private static instance: SubscriberRepository;

  public static getInstance(): SubscriberRepository {
    if (!SubscriberRepository.instance) {
      SubscriberRepository.instance = new SubscriberRepository();
    }
    return SubscriberRepository.instance;
  }

  /**
   * Subscribe an email address with optional topic preferences.
   * Safe and idempotent: updates preferences if email exists.
   */
  public async subscribe(
    email: string,
    topics: string[] = ['daily_morning']
  ): Promise<{ success: boolean; subscriber?: SubscriberRecord; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'A valid email address is required.' };
    }

    try {
      // 1. Check or insert subscriber
      let subscriberId: string;
      const { data: existing } = await supabase
        .from('subscribers')
        .select('id, email, status, confirmed_at, unsubscribed_at, created_at')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existing) {
        subscriberId = existing.id;
        if (existing.status === 'unsubscribed') {
          await supabase
            .from('subscribers')
            .update({ status: 'confirmed', confirmed_at: new Date().toISOString(), unsubscribed_at: null })
            .eq('id', subscriberId);
        }
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from('subscribers')
          .insert({
            email: cleanEmail,
            status: 'confirmed',
            confirmed_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertError) {
          return { success: false, error: insertError.message };
        }
        subscriberId = inserted.id;
      }

      // 2. Save topic preferences
      if (topics && topics.length > 0) {
        const prefs = topics.map((topic) => ({
          subscriber_id: subscriberId,
          topic,
          enabled: true,
        }));
        await supabase.from('subscriber_preferences').upsert(prefs, { onConflict: 'subscriber_id,topic' });
      }

      return {
        success: true,
        subscriber: {
          id: subscriberId,
          email: cleanEmail,
          status: 'confirmed',
          confirmedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          preferences: topics,
        },
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Subscription processing failed.' };
    }
  }

  /**
   * Unsubscribe an email
   */
  public async unsubscribe(email: string): Promise<boolean> {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const { error } = await supabase
        .from('subscribers')
        .update({
          status: 'unsubscribed',
          unsubscribed_at: new Date().toISOString(),
        })
        .eq('email', cleanEmail);

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Fetch all subscribers for admin dashboard
   */
  public async getAllSubscribers(statusFilter?: string, limit = 200): Promise<SubscriberRecord[]> {
    try {
      let query = supabase
        .from('subscribers')
        .select(`
          id, email, status, confirmed_at, unsubscribed_at, created_at,
          subscriber_preferences (topic, enabled)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        email: row.email,
        status: row.status as 'pending' | 'confirmed' | 'unsubscribed',
        confirmedAt: row.confirmed_at,
        unsubscribedAt: row.unsubscribed_at,
        createdAt: row.created_at || new Date().toISOString(),
        preferences: Array.isArray(row.subscriber_preferences)
          ? row.subscriber_preferences.filter((p: any) => p.enabled).map((p: any) => p.topic)
          : [],
      }));
    } catch {
      return [];
    }
  }

  /**
   * Export active subscribers to CSV format
   */
  public async exportSubscribersCsv(): Promise<string> {
    const subscribers = await this.getAllSubscribers('confirmed', 5000);
    const headers = ['Email', 'Status', 'Confirmed At', 'Preferences', 'Created At'];
    const rows = subscribers.map((s) => [
      s.email,
      s.status,
      s.confirmedAt || '',
      `"${(s.preferences || []).join(', ')}"`,
      s.createdAt,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}
