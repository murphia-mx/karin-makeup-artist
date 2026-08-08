import type { Database } from '../../../types/database.types';

export type InvitationRow = Database['public']['Tables']['review_invitations']['Row'];

export interface Invitation extends InvitationRow {
  service_name?: string; // We'll enrich this from the services table if possible
}

export interface CreateInvitationPayload {
  clientName: string;
  serviceId: string;
  serviceDate: string; // YYYY-MM-DD
}
