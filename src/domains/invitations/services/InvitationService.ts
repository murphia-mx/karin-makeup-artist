import { supabase } from '../../../lib/supabase';
import { logger } from '../../../lib/observability/logger';

/**
 * Domain Service for Review Invitations.
 */
export class InvitationService {
  /**
   * Generates a secure, unique URL for a client to leave a verified review.
   */
  static async generateInvitationLink(servicePrefill: string): Promise<string> {
    const logContext = { domain: 'INVITATIONS' as const, action: 'generateInvitation' };
    
    try {
      const { data, error } = await (supabase
        .from('review_invitations')
        .insert({ service_prefill: servicePrefill } as any)
        .select('id')
        .single() as any);

      if (error) throw error;

      logger.info('Invitation generated successfully', { ...logContext, id: data.id });
      
      // Assume the app lives at the root domain for now
      return `${window.location.origin}/leave-review?token=${data.id}`;
      
    } catch (error) {
      logger.error(error as Error, logContext);
      throw new Error('Could not generate invitation link');
    }
  }

  /**
   * Validates if a token is unused and exists.
   */
  static async validateToken(tokenId: string): Promise<{ valid: boolean; prefill?: string }> {
    const logContext = { domain: 'INVITATIONS' as const, action: 'validateToken' };
    
    try {
      const { data, error } = await (supabase
        .from('review_invitations')
        .select('used, service_prefill')
        .eq('id', tokenId)
        .single() as any);

      if (error || !data) {
        return { valid: false };
      }

      if (data.used) {
        logger.warn('Attempted to use an already consumed token', { ...logContext, tokenId });
        return { valid: false };
      }

      return { valid: true, prefill: data.service_prefill || undefined };
    } catch (error) {
      logger.error(error as Error, logContext);
      return { valid: false };
    }
  }
}
