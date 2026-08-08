-- seed_services.sql
-- Description: Inserción de los servicios base de Karin Makeup Artist sin UUIDs hardcodeados.

INSERT INTO public.services (slug, name, short_name, description, short_description, duration_minutes, price_from, featured, popular, display_order, active)
VALUES
('maquillaje-para-novias', 'Maquillaje para Novias', 'Novias', 'Servicio exclusivo para el día más importante. Incluye prueba previa, preparación de piel con productos de alta gama y fijación de extra duración.', 'Luce radiante en tu gran día con nuestro servicio especializado.', 120, 250.00, true, true, 1, true),

('maquillaje-social', 'Maquillaje Social', 'Social', 'Maquillaje diseñado para eventos, galas y celebraciones. Destacamos tus mejores rasgos manteniendo tu esencia.', 'Ideal para eventos de día o de noche.', 90, 80.00, false, true, 2, true),

('maquillaje-para-xv-anos', 'Maquillaje para XV Años', 'XV Años', 'Un estilo fresco, juvenil y de larga duración diseñado especialmente para quinceañeras.', 'Maquillaje juvenil y fresco para tu celebración.', 90, 100.00, true, false, 3, true),

('maquillaje-para-graduaciones', 'Maquillaje para Graduaciones', 'Graduaciones', 'Luce espectacular en tu fiesta de graduación. Un look resistente a las lágrimas y al baile.', 'Destaca en tu fiesta de graduación.', 90, 85.00, false, true, 4, true),

('maquillaje-artistico', 'Maquillaje Artístico', 'Artístico', 'Caracterización, Halloween, y editoriales. Utilizamos productos profesionales para body paint y efectos especiales.', 'Editorial, caracterización y efectos.', 150, 120.00, false, false, 5, true),

('maquillaje-para-sesiones-fotograficas', 'Sesiones Fotográficas', 'Fotografía', 'Maquillaje técnico optimizado para luces de estudio, flashes y cámaras HD/4K. Evita el rebote de luz.', 'Optimizado para cámaras y luces de estudio.', 90, 95.00, false, false, 6, true),

('peinados', 'Peinados y Estilismo', 'Peinados', 'Desde ondas al agua hasta recogidos clásicos. Complemento perfecto para tu servicio de maquillaje.', 'El complemento perfecto para tu maquillaje.', 60, 60.00, false, true, 7, true),

('servicio-a-domicilio', 'Servicio a Domicilio', 'A Domicilio', 'Llevamos la experiencia del estudio a la comodidad de tu hogar o lugar del evento.', 'La experiencia de nuestro estudio en tu ubicación.', 0, 30.00, true, false, 8, true)
ON CONFLICT (slug) DO NOTHING;


-- seed_admin.sql
-- Description: Instrucciones y preparación para el rol de administrador.
/*
INSERT INTO public.user_roles (user_id, role)
VALUES ('INSERT_UUID_HERE', 'admin')
ON CONFLICT DO NOTHING;
*/


-- seed_demo.sql
-- Description: Datos ficticios (solo para entornos de desarrollo local).
-- Utiliza subconsultas por slug e idempotencia (WHERE NOT EXISTS) para garantizar integridad referencial sin UUIDs hardcodeados.

-- 1. Insertar Invitaciones (Idempotente)
INSERT INTO public.review_invitations (service_id, client_name, client_email, expires_at)
SELECT id, 'Laura Jiménez', 'laura.demo@ejemplo.com', NOW() + INTERVAL '7 days'
FROM public.services 
WHERE slug = 'maquillaje-para-novias'
AND NOT EXISTS (SELECT 1 FROM public.review_invitations WHERE client_email = 'laura.demo@ejemplo.com');

INSERT INTO public.review_invitations (service_id, client_name, client_email, expires_at)
SELECT id, 'Daniela Soto', 'daniela.demo@ejemplo.com', NOW() + INTERVAL '7 days'
FROM public.services 
WHERE slug = 'maquillaje-social'
AND NOT EXISTS (SELECT 1 FROM public.review_invitations WHERE client_email = 'daniela.demo@ejemplo.com');

-- 2. Insertar algunas reseñas aprobadas (Idempotente)
INSERT INTO public.reviews (service_id, client_name, rating, review_text, status, verified, featured, created_at)
SELECT id, 'Valentina Silva', 5, 'El maquillaje quedó espectacular. Karin entendió perfectamente lo que quería para mi boda y el resultado fue increíble. ¡Duró toda la noche intacto!', 'approved', true, true, NOW() - INTERVAL '2 days'
FROM public.services 
WHERE slug = 'maquillaje-para-novias'
AND NOT EXISTS (SELECT 1 FROM public.reviews WHERE client_name = 'Valentina Silva');

INSERT INTO public.reviews (service_id, client_name, rating, review_text, status, verified, featured, created_at)
SELECT id, 'Camila Rojas', 5, 'Me encantó el maquillaje social. Me sentí hermosa durante todo el evento y recibí muchos cumplidos. 100% recomendada.', 'approved', true, false, NOW() - INTERVAL '5 days'
FROM public.services 
WHERE slug = 'maquillaje-social'
AND NOT EXISTS (SELECT 1 FROM public.reviews WHERE client_name = 'Camila Rojas');

INSERT INTO public.reviews (service_id, client_name, rating, review_text, status, verified, featured, created_at)
SELECT id, 'Sofía Méndez', 4, 'Un trato increíble para los XV de mi hija. Las fotos salieron hermosas gracias al excelente trabajo de Karin.', 'approved', false, false, NOW() - INTERVAL '10 days'
FROM public.services 
WHERE slug = 'maquillaje-para-xv-anos'
AND NOT EXISTS (SELECT 1 FROM public.reviews WHERE client_name = 'Sofía Méndez');


-- 3. Insertar reseñas pendientes (Para el Dashboard) (Idempotente)
INSERT INTO public.reviews (service_id, client_name, rating, review_text, status, verified, created_at)
SELECT id, 'María García', 5, 'Excelente peinado, aguantó toda la noche a pesar de que no paré de bailar.', 'pending', true, NOW() - INTERVAL '2 hours'
FROM public.services 
WHERE slug = 'peinados'
AND NOT EXISTS (SELECT 1 FROM public.reviews WHERE client_name = 'María García');

INSERT INTO public.reviews (service_id, client_name, rating, review_text, status, verified, created_at)
SELECT id, 'Ana Laura', 5, 'La comodidad de que vengan a tu casa no tiene precio. Además el resultado es de estudio. Maravilloso.', 'pending', false, NOW() - INTERVAL '5 hours'
FROM public.services 
WHERE slug = 'servicio-a-domicilio'
AND NOT EXISTS (SELECT 1 FROM public.reviews WHERE client_name = 'Ana Laura');


-- 4. Insertar eventos del sistema (Idempotente)
INSERT INTO public.system_events (type, title, description, created_at)
SELECT 'auth_login', 'Inicio de sesión', 'Admin inició sesión en el panel', NOW() - INTERVAL '1 hour'
WHERE NOT EXISTS (SELECT 1 FROM public.system_events WHERE type = 'auth_login');

INSERT INTO public.system_events (type, title, description, created_at)
SELECT 'review_approved', 'Reseña aprobada', 'Se aprobó la reseña de Valentina Silva', NOW() - INTERVAL '2 days'
WHERE NOT EXISTS (SELECT 1 FROM public.system_events WHERE title = 'Reseña aprobada');
