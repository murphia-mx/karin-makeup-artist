export interface FaqItem {
  id: string; // client-side UUID for key
  q: string;
  a: string;
  order: number;
}

export interface LandingConfig {
  id: string;
  hero_title: string;
  hero_subtitle: string | null;
  hero_cta_text: string;
  hero_image_url: string | null;
  show_services: boolean;
  show_testimonials: boolean;
  show_gallery: boolean;
  show_faq: boolean;
  show_promotions: boolean;
  featured_service_ids: string[];
  featured_review_ids: string[];
  faq_items: FaqItem[];
  cta_title: string | null;
  cta_button_text: string;
  footer_credits: string | null;
  show_social_footer: boolean;
  status: 'published' | 'draft';
  published_at: string | null;
  updated_at: string;
  created_at: string;
}

// Un "ChangelogItem" que resume qué se modificó en el borrador vs publicado
export interface LandingChangelogItem {
  section: string;
  icon: string;
  description: string;
}

// Compara published vs draft y genera el changelog
export const computeLandingChangelog = (
  published: LandingConfig,
  draft: LandingConfig
): LandingChangelogItem[] => {
  const changes: LandingChangelogItem[] = [];

  if (draft.hero_title !== published.hero_title || 
      draft.hero_subtitle !== published.hero_subtitle ||
      draft.hero_cta_text !== published.hero_cta_text ||
      draft.hero_image_url !== published.hero_image_url) {
    changes.push({ section: 'Hero', icon: '✦', description: 'Sección Hero actualizada' });
  }

  const draftServices = JSON.stringify([...draft.featured_service_ids].sort());
  const pubServices   = JSON.stringify([...published.featured_service_ids].sort());
  if (draftServices !== pubServices || draft.show_services !== published.show_services) {
    changes.push({ section: 'Servicios', icon: '✂️', description: 'Servicios destacados modificados' });
  }

  const draftReviews = JSON.stringify([...draft.featured_review_ids].sort());
  const pubReviews   = JSON.stringify([...published.featured_review_ids].sort());
  if (draftReviews !== pubReviews || draft.show_testimonials !== published.show_testimonials) {
    changes.push({ section: 'Testimonios', icon: '⭐', description: 'Testimonios destacados modificados' });
  }

  if (JSON.stringify(draft.faq_items) !== JSON.stringify(published.faq_items) ||
      draft.show_faq !== published.show_faq) {
    changes.push({ section: 'FAQ', icon: '💬', description: 'Preguntas frecuentes actualizadas' });
  }

  if (draft.cta_title !== published.cta_title || draft.cta_button_text !== published.cta_button_text) {
    changes.push({ section: 'CTA Final', icon: '🎯', description: 'Llamada a la acción actualizada' });
  }

  if (draft.footer_credits !== published.footer_credits || 
      draft.show_social_footer !== published.show_social_footer) {
    changes.push({ section: 'Footer', icon: '📄', description: 'Footer actualizado' });
  }

  return changes;
};
