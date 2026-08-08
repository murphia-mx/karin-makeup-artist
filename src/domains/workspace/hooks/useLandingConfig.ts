import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseAny as supabase } from '../../../lib/supabase';
import { logger } from '../../../lib/observability/logger';
import { toast } from 'sonner';
import type { LandingConfig } from '../types/LandingConfig';

const LOG = { domain: 'ADMIN' as const, action: 'landing_config' };
export const PUBLISHED_KEY = ['landing', 'published'] as const;
export const DRAFT_KEY = ['landing', 'draft'] as const;

const fetchLanding = async (status: 'published' | 'draft'): Promise<LandingConfig | null> => {
  const { data, error } = await supabase
    .from('landing_config')
    .select('*')
    .eq('status', status)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as LandingConfig | null;
};

export const useLandingPublished = () => useQuery({
  queryKey: PUBLISHED_KEY,
  queryFn: () => fetchLanding('published'),
  staleTime: 1000 * 60 * 5,
});

export const useLandingDraft = () => useQuery({
  queryKey: DRAFT_KEY,
  queryFn: () => fetchLanding('draft'),
  staleTime: 1000 * 60 * 5,
});

// Guardar borrador (auto-save silencioso)
export const useUpdateLandingDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patch: Partial<LandingConfig>) => {
      const draft = queryClient.getQueryData<LandingConfig>(DRAFT_KEY);
      if (!draft) throw new Error('No draft loaded');

      const { error } = await supabase
        .from('landing_config')
        .update(patch as unknown as Record<string, unknown>)
        .eq('id', draft.id);

      if (error) throw new Error(error.message);
      logger.info('landing draft updated', LOG);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DRAFT_KEY });
    },
    onError: (error: Error) => {
      logger.error(error, LOG);
    },
  });
};

// PUBLICAR: copia draft → published
export const usePublishLanding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const draft = queryClient.getQueryData<LandingConfig>(DRAFT_KEY);
      const published = queryClient.getQueryData<LandingConfig>(PUBLISHED_KEY);
      if (!draft || !published) throw new Error('Datos no cargados');

      // Copia los campos de contenido del draft al published
      const contentFields: Partial<LandingConfig> = {
        hero_title: draft.hero_title,
        hero_subtitle: draft.hero_subtitle,
        hero_cta_text: draft.hero_cta_text,
        hero_image_url: draft.hero_image_url,
        show_services: draft.show_services,
        show_testimonials: draft.show_testimonials,
        show_gallery: draft.show_gallery,
        show_faq: draft.show_faq,
        show_promotions: draft.show_promotions,
        featured_service_ids: draft.featured_service_ids,
        featured_review_ids: draft.featured_review_ids,
        faq_items: draft.faq_items,
        cta_title: draft.cta_title,
        cta_button_text: draft.cta_button_text,
        footer_credits: draft.footer_credits,
        show_social_footer: draft.show_social_footer,
        published_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('landing_config')
        .update(contentFields as unknown as Record<string, unknown>)
        .eq('id', published.id);

      if (error) throw new Error(error.message);
      logger.info('landing published', LOG);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PUBLISHED_KEY });
      queryClient.invalidateQueries({ queryKey: DRAFT_KEY });
      toast.success('¡Landing publicada! Los cambios ya son visibles para tus clientes.', {
        duration: 5000,
      });
    },
    onError: (error: Error) => {
      logger.error(error, LOG);
      toast.error(`Error al publicar: ${error.message}`);
    },
  });
};

// Verificar si hay cambios sin publicar
export const hasUnpublishedChanges = (
  published: LandingConfig | null | undefined,
  draft: LandingConfig | null | undefined
): boolean => {
  if (!published || !draft) return false;

  const fields: (keyof LandingConfig)[] = [
    'hero_title', 'hero_subtitle', 'hero_cta_text', 'hero_image_url',
    'show_services', 'show_testimonials', 'show_gallery', 'show_faq', 'show_promotions',
    'featured_service_ids', 'featured_review_ids', 'faq_items',
    'cta_title', 'cta_button_text', 'footer_credits', 'show_social_footer',
  ];

  return fields.some(f => JSON.stringify(draft[f]) !== JSON.stringify(published[f]));
};
