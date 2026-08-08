import type { WorkspaceConfig } from '../../workspace/types/WorkspaceConfig';
import type { LandingConfig } from '../../workspace/types/LandingConfig';
import type { ServiceExtended } from '../../workspace/types/WorkspaceEntities';
import type { SchemaModel } from '../models/SchemaModel';

export class SchemaBuilder {
  static build(
    workspace: WorkspaceConfig,
    landing: LandingConfig,
    services: ServiceExtended[],
    metrics: { rating: number; reviewCount: number },
    siteUrl: string = 'https://karinmakeup.com'
  ): SchemaModel {
    const imageUrl = workspace.seo_image_url || workspace.cover_image_url || `${siteUrl}/default-og.jpg`;

    const localBusiness = {
      '@context': 'https://schema.org',
      '@type': 'HealthAndBeautyBusiness',
      name: workspace.business_name,
      image: imageUrl,
      '@id': siteUrl,
      url: siteUrl,
      telephone: workspace.whatsapp || '',
      address: {
        '@type': 'PostalAddress',
        streetAddress: workspace.address || '',
        addressLocality: (workspace as any).city || '',
        addressCountry: (workspace as any).country || 'MX'
      },
      sameAs: [
        workspace.instagram_handle ? `https://instagram.com/${workspace.instagram_handle}` : null,
        workspace.facebook_url,
        workspace.tiktok_handle ? `https://tiktok.com/@${workspace.tiktok_handle}` : null
      ].filter(Boolean)
    };

    const organization = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: workspace.business_name,
      url: siteUrl,
      logo: workspace.logo_url || imageUrl,
    };

    const activeServices = services.filter(s => s.active);
    const servicesSchema = activeServices.map(service => ({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: service.name,
      description: service.description,
      provider: {
        '@type': 'LocalBusiness',
        name: workspace.business_name
      }
    }));

    let faq: Record<string, unknown> | undefined = undefined;
    if (landing.show_faq && landing.faq_items && landing.faq_items.length > 0) {
      faq = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: landing.faq_items.map(item => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a
          }
        }))
      };
    }

    let aggregateRating: Record<string, unknown> | undefined = undefined;
    if (metrics.reviewCount > 0) {
      aggregateRating = {
        '@context': 'https://schema.org',
        '@type': 'AggregateRating',
        ratingValue: metrics.rating,
        reviewCount: metrics.reviewCount,
        itemReviewed: {
          '@type': 'LocalBusiness',
          name: workspace.business_name
        }
      };
    }

    const breadcrumbs = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [{
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: siteUrl
      }]
    };

    // Construct full JSON-LD payload string
    const jsonLdPayload = [
      localBusiness,
      organization,
      ...servicesSchema,
      ...(faq ? [faq] : []),
      ...(aggregateRating ? [aggregateRating] : []),
      breadcrumbs
    ];

    return {
      localBusiness,
      organization,
      services: servicesSchema,
      faq,
      aggregateRating,
      breadcrumbs,
      jsonLd: JSON.stringify(jsonLdPayload)
    };
  }
}
