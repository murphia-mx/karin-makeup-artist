-- seed_demo.sql
-- Description: Datos ficticios (solo para entornos de desarrollo local).
-- Utiliza subconsultas por slug para garantizar integridad referencial sin UUIDs hardcodeados.

-- Insertar algunas reseñas aprobadas
INSERT INTO public.reviews (service_id, client_name, rating, review_text, status, verified, featured, created_at)
SELECT id, 'Valentina Silva', 5, 'El maquillaje quedó espectacular. Karin entendió perfectamente lo que quería para mi boda y el resultado fue increíble. ¡Duró toda la noche intacto!', 'approved', true, true, NOW() - INTERVAL '2 days'
FROM public.services WHERE slug = 'maquillaje-para-novias';

INSERT INTO public.reviews (service_id, client_name, rating, review_text, status, verified, featured, created_at)
SELECT id, 'Camila Rojas', 5, 'Me encantó el maquillaje social. Me sentí hermosa durante todo el evento y recibí muchos cumplidos. 100% recomendada.', 'approved', true, false, NOW() - INTERVAL '5 days'
FROM public.services WHERE slug = 'maquillaje-social';

INSERT INTO public.reviews (service_id, client_name, rating, review_text, status, verified, featured, created_at)
SELECT id, 'Sofía Méndez', 4, 'Un trato increíble para los XV de mi hija. Las fotos salieron hermosas gracias al excelente trabajo de Karin.', 'approved', false, false, NOW() - INTERVAL '10 days'
FROM public.services WHERE slug = 'maquillaje-para-xv-anos';


-- Insertar reseñas pendientes (Para el Dashboard)
INSERT INTO public.reviews (service_id, client_name, rating, review_text, status, verified, created_at)
SELECT id, 'María García', 5, 'Excelente peinado, aguantó toda la noche a pesar de que no paré de bailar.', 'pending', true, NOW() - INTERVAL '2 hours'
FROM public.services WHERE slug = 'peinados';

INSERT INTO public.reviews (service_id, client_name, rating, review_text, status, verified, created_at)
SELECT id, 'Ana Laura', 5, 'La comodidad de que vengan a tu casa no tiene precio. Además el resultado es de estudio. Maravilloso.', 'pending', false, NOW() - INTERVAL '5 hours'
FROM public.services WHERE slug = 'servicio-a-domicilio';


-- Insertar eventos del sistema
INSERT INTO public.system_events (type, title, description, created_at)
VALUES 
('auth_login', 'Inicio de sesión', 'Admin inició sesión en el panel', NOW() - INTERVAL '1 hour'),
('review_approved', 'Reseña aprobada', 'Se aprobó la reseña de Valentina Silva', NOW() - INTERVAL '2 days');
