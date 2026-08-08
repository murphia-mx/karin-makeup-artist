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
