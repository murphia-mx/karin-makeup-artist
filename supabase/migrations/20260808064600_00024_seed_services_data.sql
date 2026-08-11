-- 00024_seed_services_data.sql
-- Description: Actualiza los 8 servicios existentes con la información visual de la Landing. 
-- Desactiva el servicio a domicilio.
-- NO se eliminan UUIDs ni se crean servicios que ya existan para no romper invitaciones.

BEGIN;

-- 1. Maquillaje de Novia
UPDATE public.services
SET 
  landing_title_top = 'Maquillaje de',
  landing_title_bottom = 'Novia',
  cover_image = 'public/images/portfolio/work3.jpeg',
  features = '[{"title": "Luminosidad eterna", "subtitle": "Acabado fotográfico HD", "icon": "sparkle"}, {"title": "Piel perfecta 16 h", "subtitle": "Resistente a lágrimas y emociones", "icon": "heart"}]'::jsonb
WHERE slug = 'maquillaje-para-novias';

-- 2. Maquillaje Social
UPDATE public.services
SET 
  landing_title_top = 'Maquillaje',
  landing_title_bottom = 'Social',
  cover_image = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=85&w=1000&auto=format&fit=crop',
  features = '[{"title": "Elegancia nocturna superior", "subtitle": "Mirada y piel de lujo", "icon": "moon"}, {"title": "Fijación absoluta", "subtitle": "Intacto hasta el final", "icon": "sparkle"}]'::jsonb
WHERE slug = 'maquillaje-social';

-- 3. Maquillaje para XV Años
UPDATE public.services
SET 
  landing_title_top = 'Maquillaje para',
  landing_title_bottom = 'XV Años',
  cover_image = 'https://images.unsplash.com/photo-1629814696209-4f4faf2ab874?q=85&w=1000&auto=format&fit=crop&crop=faces',
  features = '[{"title": "Brillo juvenil y frescura", "subtitle": "Resalta tu belleza natural", "icon": "flower"}, {"title": "Larga duración garantizada", "subtitle": "Disfruta sin preocuparte", "icon": "sparkle"}]'::jsonb
WHERE slug = 'maquillaje-para-xv-anos';

-- 4. Maquillaje para Graduaciones
UPDATE public.services
SET 
  landing_title_top = 'Maquillaje de',
  landing_title_bottom = 'Graduación',
  cover_image = 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?q=85&w=1000&auto=format&fit=crop&crop=faces',
  features = '[{"title": "Personalización total", "subtitle": "Diseñado para tus facciones.", "icon": "sparkle"}, {"title": "Duración garantizada", "subtitle": "Piel perfecta por horas.", "icon": "heart"}]'::jsonb
WHERE slug = 'maquillaje-para-graduaciones';

-- 5. Maquillaje Artístico
UPDATE public.services
SET 
  landing_title_top = 'Maquillaje',
  landing_title_bottom = 'Artístico',
  cover_image = 'https://images.unsplash.com/photo-1509631179647-0c91af23f733?q=85&w=1000&auto=format&fit=crop',
  features = '[{"title": "Personalización total", "subtitle": "Diseñado para tus facciones.", "icon": "palette"}, {"title": "Productos profesionales", "subtitle": "Body paint y efectos especiales.", "icon": "sparkle"}]'::jsonb
WHERE slug = 'maquillaje-artistico';

-- 6. Sesiones Fotográficas
UPDATE public.services
SET 
  landing_title_top = 'Sesiones',
  landing_title_bottom = 'Fotográficas',
  cover_image = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=85&w=1000&auto=format&fit=crop',
  features = '[{"title": "Preparación para fotografía", "subtitle": "Acabado optimizado para cámara.", "icon": "camera"}, {"title": "Larga duración", "subtitle": "Perfecto durante toda la sesión.", "icon": "sparkle"}]'::jsonb
WHERE slug = 'maquillaje-para-sesiones-fotograficas';

-- 7. Peinados y Estilismo
UPDATE public.services
SET 
  landing_title_top = 'Peinados y',
  landing_title_bottom = 'Estilismo',
  cover_image = 'https://images.unsplash.com/photo-1620331311520-246422fd82f9?q=85&w=1000&auto=format&fit=crop',
  features = '[{"title": "Personalización total", "subtitle": "Peinado acorde a tu estilo.", "icon": "scissors"}, {"title": "Acabado profesional", "subtitle": "Diseñado para durar durante todo el evento.", "icon": "sparkle"}]'::jsonb
WHERE slug = 'peinados';

-- 8. Servicio a Domicilio (DEACTIVATE)
UPDATE public.services
SET 
  show_in_landing = false,
  active = false
WHERE slug = 'servicio-a-domicilio';

-- 9. Insertar servicios faltantes (NO existían en DB pero sí en Landing, así que no rompemos invitaciones, solo los agregamos)
-- "Sesión Fotográfica XV Años"
INSERT INTO public.services (slug, name, short_name, description, duration_minutes, price_from, featured, popular, display_order, active, show_in_landing, category, landing_title_top, landing_title_bottom, cover_image, features)
SELECT 
  'sesion-fotos-xv', 
  'Sesión Fotográfica XV Años', 
  'XV Años', 
  'Acabado profesional diseñado para cámaras, luces y video.', 
  180, 
  1200, 
  false, 
  false, 
  4, 
  true, 
  true, 
  'general', 
  'Sesión Fotográfica', 
  'XV Años', 
  'https://images.unsplash.com/photo-1512496015851-a1cbfd383921?q=85&w=1000&auto=format&fit=crop', 
  '[{"title": "Preparación e hidratación de la piel", "subtitle": "Para un acabado natural y radiante.", "icon": "sparkle"}, {"title": "Maquillaje especial para fotografía", "subtitle": "Técnicas que favorecen la iluminación y la cámara.", "icon": "camera"}, {"title": "Pestañas de tira y sellado profesional", "subtitle": "Mayor definición y larga duración.", "icon": "heart"}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE slug = 'sesion-fotos-xv');

-- "Sesión Fotográfica + Acompañamiento"
INSERT INTO public.services (slug, name, short_name, description, duration_minutes, price_from, featured, popular, display_order, active, show_in_landing, category, landing_title_top, landing_title_bottom, cover_image, features)
SELECT 
  'sesion-fotos-xv-acompanamiento', 
  'Sesión Fotográfica + Acompañamiento', 
  '+ Acompañamiento', 
  'Retoques y cambios durante toda tu sesión para un resultado impecable.', 
  240, 
  1850, 
  false, 
  false, 
  5, 
  true, 
  true, 
  'general', 
  'Sesión Fotográfica', 
  '+ Acompañamiento', 
  'https://images.unsplash.com/photo-1526413232644-8a40f4110398?q=85&w=1000&auto=format&fit=crop', 
  '[{"title": "Maquillaje profesional fotográfico", "subtitle": "Acabado perfecto para fotografía y video.", "icon": "camera"}, {"title": "Acompañamiento en sesión", "subtitle": "Retoques cuando sean necesarios.", "icon": "lipstick"}, {"title": "Cambios de maquillaje (opcional)", "subtitle": "Segundo look sin costo adicional.", "icon": "sparkle"}, {"title": "Ajustes de labios, piel y pestañas", "subtitle": "Cada fotografía debe verse impecable.", "icon": "heart"}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE slug = 'sesion-fotos-xv-acompanamiento');

COMMIT;
