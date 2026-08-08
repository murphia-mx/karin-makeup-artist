import type { WorkspaceConfig } from '../../workspace/types/WorkspaceConfig';
import type { SeoModel } from '../models/SeoModel';

export class SeoBuilder {
  static build(
    workspace: WorkspaceConfig, 
    siteUrl: string = 'https://karinmakeup.com' // Fallback configurable
  ): SeoModel {
    const title = workspace.seo_title || `${workspace.business_name} | ${workspace.tagline || 'Makeup Artist'}`;
    const description = workspace.seo_description || workspace.short_description || workspace.story || '';
    const canonical = workspace.seo_custom_slug ? `${siteUrl}/${workspace.seo_custom_slug}` : siteUrl;
    const imageUrl = workspace.seo_image_url || workspace.cover_image_url || `${siteUrl}/default-og.jpg`;

    // 1. Meta & OG & Twitter
    const meta = { title, description, canonicalUrl: canonical };
    const openGraph = {
      title,
      description,
      url: canonical,
      siteName: workspace.business_name,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: workspace.business_name }],
      locale: 'es_MX',
      type: 'website',
    };
    const twitter = {
      card: 'summary_large_image',
      title,
      description,
      image: imageUrl,
    };

    return {
      meta,
      openGraph,
      twitter,
      schemas: {
        localBusiness: {},
        services: [],
        breadcrumbs: {},
      } // Retained to satisfy SeoModel interface temporarily until SeoModel is updated
    };
  }
}
