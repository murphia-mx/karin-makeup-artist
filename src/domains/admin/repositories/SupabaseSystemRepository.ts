import { supabase } from '../../../lib/supabase';
import type { ISystemRepository } from './ISystemRepository';
import type { Database } from '../../../types/database.types';

type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert'];
type SystemEventInsert = Database['public']['Tables']['system_events']['Insert'];

export class SupabaseSystemRepository implements ISystemRepository {
  async logAuditAction(
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    payload?: any
  ): Promise<void> {
    const logData: AuditLogInsert = {
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      payload: payload || null,
    };

    const { error } = await (supabase as any).from('audit_logs').insert([logData as any]);

    if (error) {
      console.error('Failed to insert audit log:', error);
      throw new Error(`Failed to log audit action: ${error.message}`);
    }
  }

  async createSystemEvent(
    type: string,
    title: string,
    description?: string,
    metadata?: any
  ): Promise<void> {
    const eventData: SystemEventInsert = {
      type,
      title,
      description: description || null,
      metadata: metadata || null,
    };

    const { error } = await (supabase as any).from('system_events').insert([eventData as any]);

    if (error) {
      console.error('Failed to create system event:', error);
      throw new Error(`Failed to create system event: ${error.message}`);
    }
  }
}
