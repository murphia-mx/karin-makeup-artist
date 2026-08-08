export interface SeoModel {
  meta: {
    title: string;
    description: string;
    canonicalUrl: string;
  };
  openGraph: {
    title: string;
    description: string;
    url: string;
    siteName: string;
    images: {
      url: string;
      width: number;
      height: number;
      alt: string;
    }[];
    locale: string;
    type: string;
  };
  twitter: {
    card: string;
    title: string;
    description: string;
    image: string;
  };
  schemas: {
    localBusiness: Record<string, unknown>;
    services: Record<string, unknown>[];
    faq?: Record<string, unknown>;
    aggregateRating?: Record<string, unknown>;
    breadcrumbs: Record<string, unknown>;
  };
}
