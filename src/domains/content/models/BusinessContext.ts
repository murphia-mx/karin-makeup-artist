import type { ServiceExtended } from '../../workspace/types/WorkspaceEntities';

export interface BusinessContext {
  identity: {
    name: string;
    type: string;
    city: string;
    country: string;
    specialties: string[];
  };
  positioning: {
    tagline: string;
    shortDescription: string;
    story: string;
  };
  offerings: {
    activeServices: Partial<ServiceExtended>[]; // Sent to LLM with only relevant fields
    promotions: string[];
  };
  reputation: {
    totalReviews: number;
    averageRating: number;
  };
}
