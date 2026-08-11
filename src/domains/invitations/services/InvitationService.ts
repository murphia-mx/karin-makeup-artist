import { supabase } from '../../../lib/supabase';
import { logger } from '../../../lib/observability/logger';
import type { CreateInvitationPayload, Invitation } from '../types/Invitation';
import { addDays } from 'date-fns';

/**
 * Domain Service for Review Invitations.
 */
export class InvitationService {
  
  /**
   * Generates a secure, unique URL for a client to leave a verified review.
   */
  static async generateInvitationLink(payload: CreateInvitationPayload): Promise<{ url: string; id: string }> {
    const logContext = { domain: 'INVITATIONS' as const, action: 'generateInvitation' };
    
    try {
      const expiresAt = addDays(new Date(), 30).toISOString();

      const supabaseAny = supabase as any;
      const { data, error } = await supabaseAny
        .from('review_invitations')
        .insert({ 
          client_name: payload.clientName,
          service_id: payload.serviceId,
          service_date: payload.serviceDate,
          expires_at: expiresAt
        })
        .select('id')
        .single();

      if (error) {
        // Lanza el error real si client_email es NOT NULL o por caché de esquema
        throw error;
      }

      logger.info('Invitation generated successfully', { ...logContext, id: data.id });
      
      const url = `${window.location.origin}/leave-review?token=${data.id}`;
      return { url, id: data.id };
      
    } catch (error: any) {
      logger.error(error, logContext);
      const detailedMessage = `Error: ${error.message || 'Unknown'}\nCode: ${error.code || 'N/A'}\nDetails: ${error.details || 'N/A'}\nHint: ${error.hint || 'N/A'}`;
      throw new Error(detailedMessage);
    }
  }

  /**
   * Retrieves all invitations with their service details
   */
  static async getInvitations(): Promise<Invitation[]> {
    const logContext = { domain: 'INVITATIONS' as const, action: 'getInvitations' };
    
    try {
      const supabaseAny = supabase as any;
      const { data, error } = await supabaseAny
        .from('review_invitations')
        .select(`
          *,
          services ( name )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((inv: any) => ({
        ...inv,
        service_name: inv.services?.name
      })) as Invitation[];
      
    } catch (error) {
      logger.error(error as Error, logContext);
      throw new Error('Could not fetch invitations');
    }
  }

  /**
   * Validates if a token is unused and exists, returning full status securely via RPC.
   */
  static async validateToken(tokenId: string): Promise<{ 
    status: 'valid' | 'used' | 'expired' | 'invalid'; 
    data?: { client_name: string; service_id: string; service_name?: string; service_date?: string } 
  }> {
    const logContext = { domain: 'INVITATIONS' as const, action: 'validateToken' };
    
    try {
      const supabaseAny = supabase as any;
      const { data, error } = await supabaseAny.rpc('validate_review_invitation', {
        token_id: tokenId
      });

      if (error || !data) {
        return { status: 'invalid' };
      }

      const response = data as {
        status: 'valid' | 'used' | 'expired' | 'invalid';
        client_name?: string;
        service_id?: string;
        service_name?: string;
        service_date?: string;
      };

      if (response.status === 'valid') {
        return { 
          status: 'valid', 
          data: {
            client_name: response.client_name!,
            service_id: response.service_id!,
            service_name: response.service_name,
            service_date: response.service_date
          }
        };
      }

      return { status: response.status };
    } catch (error) {
      logger.error(error as Error, logContext);
      return { status: 'invalid' };
    }
  }
}
