import type { WorkspaceConfig } from '../../workspace/types/WorkspaceConfig';
import type { ServiceExtended } from '../../workspace/types/WorkspaceEntities';
import type { BusinessContext } from '../models/BusinessContext';

export class BusinessContextBuilder {
  static build(
    workspace: WorkspaceConfig,
    services: ServiceExtended[],
    metrics: { rating: number; reviewCount: number }
  ): BusinessContext {
    
    // Only send the LLM the active services, and strip out unnecessary DB metadata
    // like timestamps, to keep the context window clean.
    const activeServices = services
      .filter(s => s.active)
      .map(s => ({
        id: s.id,
        name: s.name,
        category: s.category,
        price: s.price_from,
        description: s.description,
      }));

    return {
      identity: {
        name: workspace.business_name,
        type: (workspace as any).business_type || 'MakeupArtist',
        city: (workspace as any).city || '',
        country: (workspace as any).country || 'México',
        specialties: activeServices.map(s => s.category).filter((v, i, a) => a.indexOf(v) === i) as string[], // Extract unique categories
      },
      positioning: {
        tagline: workspace.tagline || '',
        shortDescription: workspace.short_description || '',
        story: workspace.story || '',
      },
      offerings: {
        activeServices,
        promotions: [], // Add when promotions feature is ready
      },
      reputation: {
        totalReviews: metrics.reviewCount,
        averageRating: metrics.rating,
      },
    };
  }
}
