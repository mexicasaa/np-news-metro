import { supabase } from '../../lib/supabase';
import { AuditLogRecord } from '../types';

export class AuditRepository {
  private static instance: AuditRepository;

  public static getInstance(): AuditRepository {
    if (!AuditRepository.instance) {
      AuditRepository.instance = new AuditRepository();
    }
    return AuditRepository.instance;
  }

  /**
   * Log administrative action (lean, concise, no huge JSON snapshots)
   */
  public async log(entry: {
    actorUserId: string;
    actorEmail?: string;
    action: string;
    entityType: string;
    entityId: string;
    details?: string;
  }): Promise<void> {
    try {
      await supabase.from('admin_audit_logs').insert({
        actor_user_id: entry.actorUserId,
        actor_email: entry.actorEmail || null,
        action: entry.action.toUpperCase(),
        entity_type: entry.entityType.toUpperCase(),
        entity_id: entry.entityId,
        details: entry.details ? entry.details.slice(0, 500) : null,
      });
    } catch (err) {
      console.warn('Audit log write notice:', err);
    }
  }

  /**
   * Fetch recent audit logs for admin view
   */
  public async getRecentLogs(limit = 50): Promise<AuditLogRecord[]> {
    try {
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('id, actor_user_id, actor_email, action, entity_type, entity_id, details, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !data) return [];
      return data.map((d: any) => ({
        id: d.id,
        actorUserId: d.actor_user_id,
        actorEmail: d.actor_email,
        action: d.action,
        entityType: d.entity_type,
        entityId: d.entity_id,
        details: d.details,
        createdAt: d.created_at || new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  }
}
