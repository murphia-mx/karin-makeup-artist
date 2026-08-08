-- 00018_realtime_setup.sql
-- Description: Habilitar Supabase Realtime para tablas críticas del Dashboard.

BEGIN;

-- Las publicaciones en PostgreSQL permiten transmitir eventos lógicos (INSERT, UPDATE, DELETE).
-- Supabase utiliza la publicación "supabase_realtime" para emitir estos eventos vía WebSockets.

-- Asegurarnos de que la publicación exista (Supabase la crea por defecto, pero por si acaso)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END
$$;

-- Añadir las tablas a la publicación para que emitan eventos
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_advisor_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_analysis;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_events;

-- Opcional: configurar replica identity si se necesita el payload antiguo completo en UPDATE/DELETE
-- ALTER TABLE public.reviews REPLICA IDENTITY FULL;
-- Por defecto 'DEFAULT' es suficiente para enviar el ID antiguo y los campos nuevos.

COMMIT;
