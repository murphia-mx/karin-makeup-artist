-- 00023_services_cms.sql
-- Description: Agrega campos a la tabla services para CMS de Landing y bucket public-assets

BEGIN;

-- 1. Ampliar la tabla services
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS landing_title_top TEXT,
  ADD COLUMN IF NOT EXISTS landing_title_bottom TEXT,
  ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;

-- 2. Crear bucket para imágenes públicas si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-assets', 'public-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas de acceso para 'public-assets' (si ya existen fallará, por eso usamos DO)

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access for public-assets') THEN
        CREATE POLICY "Public Access for public-assets" ON storage.objects
            FOR SELECT USING (bucket_id = 'public-assets');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can upload to public-assets') THEN
        CREATE POLICY "Admins can upload to public-assets" ON storage.objects
            FOR INSERT WITH CHECK (
                bucket_id = 'public-assets' AND
                public.is_admin()
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update public-assets') THEN
        CREATE POLICY "Admins can update public-assets" ON storage.objects
            FOR UPDATE USING (
                bucket_id = 'public-assets' AND 
                public.is_admin()
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete public-assets') THEN
        CREATE POLICY "Admins can delete public-assets" ON storage.objects
            FOR DELETE USING (
                bucket_id = 'public-assets' AND 
                public.is_admin()
            );
    END IF;
END $$;

COMMIT;
