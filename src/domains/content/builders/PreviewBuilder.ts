import type { WorkspaceConfig } from '../../workspace/types/WorkspaceConfig';
import type { PreviewModel } from '../models/PreviewModel';
import { SeoBuilder } from './SeoBuilder';

export class PreviewBuilder {
  static build(workspace: WorkspaceConfig, siteUrl: string = 'https://karinmakeup.com'): PreviewModel {
    const seoMeta = SeoBuilder.build(workspace, siteUrl); // Using SeoBuilder temporarily to share logic
    
    const title = seoMeta.meta.title;
    const description = seoMeta.meta.description;
    const url = seoMeta.meta.canonicalUrl;
    const imageUrl = workspace.seo_image_url || workspace.cover_image_url || `${siteUrl}/default-og.jpg`;

    return {
      google: {
        title,
        url,
        description,
      },
      social: [
        { platform: 'whatsapp', title, description, domain: siteUrl.replace('https://', ''), imageUrl },
        { platform: 'facebook', title, description, domain: siteUrl.replace('https://', ''), imageUrl },
        { platform: 'linkedin', title, description, domain: siteUrl.replace('https://', ''), imageUrl },
        { platform: 'x', title, description, domain: siteUrl.replace('https://', ''), imageUrl }
      ]
    };
  }
}
