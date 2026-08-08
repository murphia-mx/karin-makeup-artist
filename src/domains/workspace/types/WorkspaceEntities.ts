import type { FaqItem } from './LandingConfig';

// Tipos para otras entidades del Workspace

export interface GalleryItem {
  id: string;
  storage_path: string;
  url: string;
  alt_text: string | null;
  category: 'general' | 'antes_despues' | 'novias' | 'graduaciones' | 'social' | 'editorial';
  is_cover: boolean;
  is_favorite: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string | null;
  discount_code: string | null;
  service_id: string | null;
  starts_at: string;
  ends_at: string;
  show_in_landing: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type PromotionStatus = 'active' | 'scheduled' | 'expired';

export const getPromotionStatus = (p: Promotion): PromotionStatus => {
  const now = new Date();
  const start = new Date(p.starts_at);
  const end = new Date(p.ends_at);
  if (!p.active) return 'expired';
  if (now < start) return 'scheduled';
  if (now > end) return 'expired';
  return 'active';
};

export interface BookingBlockedDate {
  id: string;
  starts_at: string; // DATE
  ends_at: string | null; // DATE, null = solo ese día
  note: string | null;
  created_at: string;
}

// Para el slide-over de servicios extendido
export interface ServiceExtended {
  id: string;
  slug: string;
  name: string;
  short_name: string | null;
  description: string | null;
  short_description: string | null;
  icon: string | null;
  cover_image: string | null;
  duration_minutes: number | null;
  price_from: number | null;
  featured: boolean;
  popular: boolean;
  display_order: number;
  active: boolean;
  show_in_landing: boolean;
  accepts_bookings: boolean;
  category: string;
  created_at: string;
  updated_at: string;
  // Stats (calculados desde reviews)
  _stats?: {
    review_count: number;
    average_rating: number;
    is_top_rated: boolean;
  };
}

// Para el editor de FAQ
export type { FaqItem };
