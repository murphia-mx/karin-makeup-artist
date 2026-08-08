-- 00019_workspace_tables.sql
-- Description: Tablas del módulo Workspace (CMS completo del negocio de Karin)

BEGIN;

-- ============================================================
-- 1. WORKSPACE CONFIG (Mi Negocio + Apariencia + Reviews settings)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.workspace_config (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identidad
  business_name          TEXT NOT NULL DEFAULT 'Karin',
  tagline                TEXT,
  short_description      TEXT,
  story                  TEXT, -- Texto simple con markdown mínimo: **bold** *italic* - listas

  -- Media
  logo_url               TEXT,
  cover_image_url        TEXT,

  -- Marca (slugs predefinidos — el sistema traduce a valores CSS)
  primary_color          TEXT NOT NULL DEFAULT 'rose',
  secondary_color        TEXT NOT NULL DEFAULT 'nude',
  theme                  TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark')),

  -- Contacto
  whatsapp               TEXT,
  address                TEXT,
  maps_embed_url         TEXT,

  -- Redes Sociales
  instagram_handle       TEXT,
  tiktok_handle          TEXT,
  facebook_url           TEXT,

  -- Horarios: JSON { "mon": { "open": "09:00", "close": "18:00", "active": true }, ... }
  schedule               JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- SEO
  seo_title              TEXT,
  seo_description        TEXT,
  seo_image_url          TEXT,
  seo_custom_slug        TEXT,

  -- Review policy
  review_moderation_mode TEXT NOT NULL DEFAULT 'manual' CHECK (review_moderation_mode IN ('manual', 'auto_4plus')),
  show_rating_landing    BOOLEAN NOT NULL DEFAULT true,
  show_review_count      BOOLEAN NOT NULL DEFAULT true,
  show_only_verified     BOOLEAN NOT NULL DEFAULT false,
  review_sort_order      TEXT NOT NULL DEFAULT 'featured' CHECK (review_sort_order IN ('recent', 'highest_rating', 'featured')),

  -- Reservas
  booking_min_advance_hours  INTEGER NOT NULL DEFAULT 24,
  booking_buffer_minutes     INTEGER NOT NULL DEFAULT 30,
  booking_cancellation_hours INTEGER NOT NULL DEFAULT 24,

  -- Versioning (undo — guarda el estado anterior completo)
  previous_snapshot      JSONB,
  snapshot_updated_at    TIMESTAMPTZ,

  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para updated_at
CREATE OR REPLACE TRIGGER workspace_config_updated_at
  BEFORE UPDATE ON public.workspace_config
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Seed: una sola fila de configuración por negocio
INSERT INTO public.workspace_config (business_name, tagline)
VALUES ('Karin', 'Maquillaje profesional en cada momento')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 2. BOOKING BLOCKED DATES (Vacaciones/bloqueos)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.booking_blocked_dates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  starts_at   DATE NOT NULL,
  ends_at     DATE,  -- NULL = solo ese día
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. LANDING CONFIG (Publicado vs Borrador)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.landing_config (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Hero
  hero_title            TEXT NOT NULL DEFAULT 'Maquillaje que te hace brillar',
  hero_subtitle         TEXT,
  hero_cta_text         TEXT NOT NULL DEFAULT 'Agenda tu cita',
  hero_image_url        TEXT,

  -- Secciones visibilidad
  show_services         BOOLEAN NOT NULL DEFAULT true,
  show_testimonials     BOOLEAN NOT NULL DEFAULT true,
  show_gallery          BOOLEAN NOT NULL DEFAULT true,
  show_faq              BOOLEAN NOT NULL DEFAULT true,
  show_promotions       BOOLEAN NOT NULL DEFAULT false,

  -- Contenido seleccionado
  featured_service_ids  UUID[] NOT NULL DEFAULT '{}',
  featured_review_ids   UUID[] NOT NULL DEFAULT '{}',

  -- FAQ: [{ "q": "...", "a": "...", "order": 0 }]
  faq_items             JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- CTA Final
  cta_title             TEXT,
  cta_button_text       TEXT NOT NULL DEFAULT 'Reservar ahora',

  -- Footer
  footer_credits        TEXT,
  show_social_footer    BOOLEAN NOT NULL DEFAULT true,

  -- Draft/Publish System
  -- "published" = lo que ve el público
  -- "draft" = ediciones pendientes de publicar
  status                TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  published_at          TIMESTAMPTZ,

  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Dos filas fijas: 'published' y 'draft'
-- El frontend sincroniza el draft -> published al "Publicar cambios"
-- Insertamos ambas al inicio
INSERT INTO public.landing_config (status, published_at)
VALUES ('published', NOW())
ON CONFLICT DO NOTHING;

INSERT INTO public.landing_config (status)
VALUES ('draft')
ON CONFLICT DO NOTHING;

-- Trigger
CREATE OR REPLACE TRIGGER landing_config_updated_at
  BEFORE UPDATE ON public.landing_config
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ============================================================
-- 4. GALLERY ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path  TEXT NOT NULL,
  url           TEXT NOT NULL,
  alt_text      TEXT,
  category      TEXT NOT NULL DEFAULT 'general'
                  CHECK (category IN ('general', 'antes_despues', 'novias', 'graduaciones', 'social', 'editorial')),
  is_cover      BOOLEAN NOT NULL DEFAULT false,
  is_favorite   BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER gallery_items_updated_at
  BEFORE UPDATE ON public.gallery_items
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ============================================================
-- 5. PROMOTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.promotions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  discount_code   TEXT,
  service_id      UUID REFERENCES public.services(id) ON DELETE SET NULL,
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ NOT NULL,
  show_in_landing BOOLEAN NOT NULL DEFAULT true,
  active          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER promotions_updated_at
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ============================================================
-- 6. EXTENDER TABLA SERVICES
-- ============================================================
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS show_in_landing  BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS accepts_bookings BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS category         TEXT NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS short_description TEXT;

-- El campo price_from y duration_minutes ya existen en el schema 00001

-- ============================================================
-- 7. RLS Policies para nuevas tablas (solo admin)
-- ============================================================
ALTER TABLE public.workspace_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_blocked_dates ENABLE ROW LEVEL SECURITY;

-- workspace_config: solo admins escriben, todos leen (para la landing pública)
CREATE POLICY "Public read workspace_config"
  ON public.workspace_config FOR SELECT USING (true);

CREATE POLICY "Admin write workspace_config"
  ON public.workspace_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- landing_config: el registro 'published' es público, 'draft' solo admin
CREATE POLICY "Public read published landing"
  ON public.landing_config FOR SELECT
  USING (status = 'published' OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admin write landing_config"
  ON public.landing_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- gallery_items: público para leer, admin para escribir
CREATE POLICY "Public read gallery"
  ON public.gallery_items FOR SELECT USING (true);

CREATE POLICY "Admin write gallery"
  ON public.gallery_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- promotions: público lee las activas y dentro de rango de fechas
CREATE POLICY "Public read active promotions"
  ON public.promotions FOR SELECT
  USING (active = true AND show_in_landing = true AND now() BETWEEN starts_at AND ends_at);

CREATE POLICY "Admin write promotions"
  ON public.promotions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin manage blocked dates"
  ON public.booking_blocked_dates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- 8. Agregar tablas a Realtime Publication
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_config;
ALTER PUBLICATION supabase_realtime ADD TABLE public.landing_config;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gallery_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.promotions;

COMMIT;
