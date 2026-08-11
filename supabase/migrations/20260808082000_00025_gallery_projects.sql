-- Migración 00025: CMS de Galería / Portafolio

-- 1. Tabla gallery_projects
CREATE TABLE IF NOT EXISTS public.gallery_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('Novias', 'Social', 'XV Años', 'Editorial', 'Graduación', 'Artístico')),
  image_url TEXT NOT NULL,
  storage_path TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 999,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger para updated_at (usando la función existente update_modified_column)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_gallery_projects_modtime'
  ) THEN
    CREATE TRIGGER update_gallery_projects_modtime
    BEFORE UPDATE ON public.gallery_projects
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();
  END IF;
END $$;

-- 2. Seguridad (RLS)
ALTER TABLE public.gallery_projects ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública: Todos pueden ver proyectos activos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public can view active gallery projects'
  ) THEN
    CREATE POLICY "Public can view active gallery projects"
    ON public.gallery_projects
    FOR SELECT
    USING (active = true);
  END IF;
END $$;

-- Política para administradores (CRUD completo)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage gallery projects'
  ) THEN
    CREATE POLICY "Admins can manage gallery projects"
    ON public.gallery_projects
    FOR ALL
    USING (public.is_admin());
  END IF;
END $$;

-- 3. Función Segura para Controlar Límite de Favoritos
-- Esto garantiza a nivel de base de datos que no existan más de 6 favoritos
CREATE OR REPLACE FUNCTION public.toggle_gallery_favorite(p_id UUID, p_favorite BOOLEAN)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_favorites INT;
BEGIN
  -- Validar permisos (solo admin)
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_favorite THEN
    -- Contar favoritos actuales excluyendo el que estamos editando
    SELECT COUNT(*) INTO current_favorites FROM public.gallery_projects WHERE is_favorite = true AND id != p_id;
    
    IF current_favorites >= 6 THEN
      RAISE EXCEPTION 'MAX_FAVORITES_REACHED';
    END IF;
  END IF;

  -- Actualizar el registro
  UPDATE public.gallery_projects SET is_favorite = p_favorite WHERE id = p_id;
  RETURN true;
END;
$$;

-- 4. Seed de Datos Iniciales (Conservando los 9 proyectos exigidos)
-- Los 6 primeros son favoritos para la Landing, los otros 3 son normales para el Portafolio.
INSERT INTO public.gallery_projects (id, title, description, category, image_url, is_favorite, display_order)
VALUES 
  -- Favoritos (Landing)
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Look Natural Glam', 'Resalta la luminosidad natural de la piel.', 'Novias', 'public/images/portfolio/work1.jpeg', true, 1),
  ('a1b2c3d4-0000-0000-0000-000000000002', 'Evento Nocturno', 'Smokey eyes sutil en tonos tierra.', 'Social', 'public/images/portfolio/work1.jpeg', true, 2),
  ('a1b2c3d4-0000-0000-0000-000000000003', 'Acabado de Alta Definición', 'Diseñado específicamente para luces de estudio.', 'Editorial', 'public/images/portfolio/work2.jpeg', true, 3),
  ('a1b2c3d4-0000-0000-0000-000000000004', 'Brillo Juvenil y Frescura', 'Fresco, juvenil y luminoso para fotografía.', 'XV Años', 'public/images/portfolio/work3.jpeg', true, 4),
  ('a1b2c3d4-0000-0000-0000-000000000005', 'Soft Glam Elegante', 'Soft glam resistente para disfrutar toda la noche.', 'Graduación', 'public/images/portfolio/work4.jpeg', true, 5),
  ('a1b2c3d4-0000-0000-0000-000000000006', 'Editorial Beauty', 'Para cámaras HD con texturas hiperrealistas.', 'Editorial', 'public/images/portfolio/work5.jpeg', true, 6),
  
  -- No favoritos (Solo en Portafolio Completo)
  ('a1b2c3d4-0000-0000-0000-000000000007', 'Novia Romántica', 'Estilos suaves y románticos, con tonos rosados.', 'Novias', 'https://images.unsplash.com/photo-1526413232644-8a40f4110398?q=85&w=1200&auto=format&fit=crop', false, 7),
  ('a1b2c3d4-0000-0000-0000-000000000008', 'Caracterización', 'Maquillaje artístico con aplicaciones para eventos.', 'Artístico', 'https://images.unsplash.com/photo-1509631179647-0c91af23f733?q=85&w=1200&auto=format&fit=crop', false, 8),
  ('a1b2c3d4-0000-0000-0000-000000000009', 'Social Glamour', 'Piel aterciopelada y delineado gráfico moderno.', 'Social', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=85&w=1200&auto=format&fit=crop', false, 9)
ON CONFLICT DO NOTHING;
