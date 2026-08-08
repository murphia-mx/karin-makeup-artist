import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useEffect } from 'react';
import { supabaseAny as supabase } from '../../../lib/supabase'; // Using untyped until types are updated
import { LandingBuilder } from '../builders/LandingBuilder';
import { SeoBuilder } from '../builders/SeoBuilder';
import { REVIEW_STATUS } from '../../reviews/types/Review';
import { ThemeBuilder } from '../builders/ThemeBuilder';
import { BusinessContextBuilder } from '../builders/BusinessContextBuilder';
import { BookingBuilder } from '../builders/BookingBuilder';
import { PreviewBuilder } from '../builders/PreviewBuilder';
import { SchemaBuilder } from '../builders/SchemaBuilder';
import { ContentValidator } from '../builders/ContentValidator';

// Shared fetcher function
const fetchAllPublicData = async () => {
  // Fetch workspace config
  const { data: workspace, error: wErr } = await supabase
    .from('workspace_config')
    .select('*')
    .limit(1)
    .single();

  if (wErr) throw new Error(`Workspace fetch failed: ${wErr.message}`);

  // Fetch published landing config
  const { data: landing, error: lErr } = await supabase
    .from('landing_config')
    .select('*')
    .eq('status', 'published')
    .limit(1)
    .single();
    
  if (lErr && lErr.code !== 'PGRST116') throw new Error(`Landing config fetch failed: ${lErr.message}`);

  // Fetch services
  const { data: services, error: sErr } = await supabase
    .from('services')
    .select('*')
    .order('display_order');
    
  if (sErr) throw new Error(`Services fetch failed: ${sErr.message}`);

  // Fetch gallery (favorites/cover items)
  const { data: galleryItems, error: gErr } = await supabase
    .from('gallery_items')
    .select('*')
    .or('is_favorite.eq.true,is_cover.eq.true')
    .order('created_at', { ascending: false });
    
  if (gErr) throw new Error(`Gallery fetch failed: ${gErr.message}`);
  
  const gallery = (galleryItems || []).map((g: any) => ({
    url: g.url,
    alt: g.title || 'Galería',
    category: g.category
  }));

  // Fetch basic review metrics (for rating & trust)
  const { data: reviews, error: rErr } = await supabase
    .from('reviews')
    .select('*')
    .eq('status', REVIEW_STATUS.APPROVED);
    
  if (rErr) throw new Error(`Reviews fetch failed: ${rErr.message}`);
  
  const reviewCount = reviews ? reviews.length : 0;
  const avgRating = reviewCount > 0 
    ? (reviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) / reviewCount)
    : 5.0;

  const metrics = { rating: Number(avgRating.toFixed(1)), reviewCount };

  // Fallback landing config if none published yet
  const safeLanding = landing || {
    hero_title: workspace.business_name,
    hero_subtitle: workspace.tagline,
    hero_cta_text: 'AGENDAR CITA',
    hero_image_url: workspace.cover_image_url,
    show_services: true,
    show_testimonials: true,
    show_gallery: true,
    show_faq: true,
    show_promotions: true,
    featured_service_ids: [],
    featured_review_ids: [],
    faq_items: [],
    cta_title: 'Agenda tu cita',
    cta_button_text: 'Contactar',
    footer_credits: `© ${new Date().getFullYear()} ${workspace.business_name}`,
    show_social_footer: true,
    status: 'published'
  };

  return { workspace, landing: safeLanding, services: services || [], gallery, reviews: reviews || [], metrics };
};

export function usePublicContent() {
  const queryClient = useQueryClient();

  const { data: rawData, isLoading, error } = useQuery({
    queryKey: ['public-content'],
    queryFn: fetchAllPublicData,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  // Realtime integration for reviews and config changes
  useEffect(() => {
    const channel = supabase
      .channel('public-content-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reviews' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['public-content'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'landing_config' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['public-content'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workspace_config' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['public-content'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const models = useMemo(() => {
    if (!rawData) return null;

    const { workspace, landing, services, gallery, reviews, metrics } = rawData;
    const siteUrl = import.meta.env.VITE_SITE_URL || 'https://karinmakeup.com';

    return {
      landing: LandingBuilder.build(workspace, landing, services, gallery, reviews, metrics),
      seo: SeoBuilder.build(workspace, siteUrl),
      theme: ThemeBuilder.build(workspace),
      business: BusinessContextBuilder.build(workspace, services, metrics),
      booking: BookingBuilder.build(workspace),
      preview: PreviewBuilder.build(workspace, siteUrl),
      schema: SchemaBuilder.build(workspace, landing, services, metrics, siteUrl),
      validation: ContentValidator.validate(workspace, landing, services, metrics)
    };
  }, [rawData]);

  return { models, isLoading, error };
}
