export interface SchemaModel {
  localBusiness: Record<string, unknown>;
  organization: Record<string, unknown>;
  services: Record<string, unknown>[];
  faq?: Record<string, unknown>;
  aggregateRating?: Record<string, unknown>;
  breadcrumbs: Record<string, unknown>;
  jsonLd: string; // The complete stringified JSON-LD to inject
}
