// WorkspaceConfig — configuración central del negocio
export interface WorkspaceConfig {
  id: string;
  business_name: string;
  tagline: string | null;
  short_description: string | null;
  story: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  primary_color: string;
  secondary_color: string;
  theme: 'light' | 'dark';
  whatsapp: string | null;
  address: string | null;
  maps_embed_url: string | null;
  instagram_handle: string | null;
  tiktok_handle: string | null;
  facebook_url: string | null;
  schedule: Record<string, { open: string; close: string; active: boolean }>;
  seo_title: string | null;
  seo_description: string | null;
  seo_image_url: string | null;
  seo_custom_slug: string | null;
  review_moderation_mode: 'manual' | 'auto_4plus';
  show_rating_landing: boolean;
  show_review_count: boolean;
  show_only_verified: boolean;
  review_sort_order: 'recent' | 'highest_rating' | 'featured';
  booking_min_advance_hours: number;
  booking_buffer_minutes: number;
  booking_cancellation_hours: number;
  previous_snapshot: WorkspaceConfig | null;
  snapshot_updated_at: string | null;
  updated_at: string;
  created_at: string;
}

// Campos que definen si el perfil está "completo" para el completion indicator
export type WorkspaceField = keyof Pick<
  WorkspaceConfig,
  | 'business_name'
  | 'tagline'
  | 'short_description'
  | 'story'
  | 'logo_url'
  | 'cover_image_url'
  | 'whatsapp'
  | 'address'
  | 'instagram_handle'
  | 'seo_title'
  | 'seo_description'
>;

export interface CompletionItem {
  field: WorkspaceField;
  label: string;
  href: string;
  completed: boolean;
}

// Paleta de colores curatorizados (el diseñador los fija, Karin elige)
export const BRAND_COLOR_PALETTE: {
  slug: string;
  label: string;
  hex: string;
  textClass: string;
  bgClass: string;
}[] = [
  { slug: 'rose',       label: 'Rosa Karin',    hex: '#D99AA8', textClass: 'text-[#D99AA8]', bgClass: 'bg-[#D99AA8]' },
  { slug: 'nude',       label: 'Nude',          hex: '#C9A98A', textClass: 'text-[#C9A98A]', bgClass: 'bg-[#C9A98A]' },
  { slug: 'blush',      label: 'Blush',         hex: '#E8BFC8', textClass: 'text-[#E8BFC8]', bgClass: 'bg-[#E8BFC8]' },
  { slug: 'mauve',      label: 'Mauve',         hex: '#B58EA0', textClass: 'text-[#B58EA0]', bgClass: 'bg-[#B58EA0]' },
  { slug: 'terracotta', label: 'Terracota',     hex: '#C47A5A', textClass: 'text-[#C47A5A]', bgClass: 'bg-[#C47A5A]' },
  { slug: 'champagne',  label: 'Champagne',     hex: '#D4C5A9', textClass: 'text-[#D4C5A9]', bgClass: 'bg-[#D4C5A9]' },
  { slug: 'burgundy',   label: 'Borgoña',       hex: '#7D3C5A', textClass: 'text-[#7D3C5A]', bgClass: 'bg-[#7D3C5A]' },
  { slug: 'gold',       label: 'Dorado',        hex: '#C9A84C', textClass: 'text-[#C9A84C]', bgClass: 'bg-[#C9A84C]' },
  { slug: 'sage',       label: 'Sage',          hex: '#8DAA91', textClass: 'text-[#8DAA91]', bgClass: 'bg-[#8DAA91]' },
  { slug: 'slate',      label: 'Pizarra',       hex: '#6B7B8D', textClass: 'text-[#6B7B8D]', bgClass: 'bg-[#6B7B8D]' },
  { slug: 'ivory',      label: 'Marfil',        hex: '#F5F0E8', textClass: 'text-[#F5F0E8]', bgClass: 'bg-[#F5F0E8]' },
  { slug: 'charcoal',   label: 'Carbón',        hex: '#3D3D3D', textClass: 'text-[#3D3D3D]', bgClass: 'bg-[#3D3D3D]' },
];
