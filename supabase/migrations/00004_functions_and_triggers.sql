-- 00004_functions_and_triggers.sql
-- Description: Funciones genéricas, Triggers de auditoría, Webhooks y RPCs.

-- 1. Helper function para actualizar 'updated_at' automáticamente
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Asignar el trigger a las tablas correspondientes
CREATE TRIGGER set_updated_at_services
BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TRIGGER set_updated_at_reviews
BEFORE UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

-- 2. Webhook / Trigger para invocar la Edge Function de IA (Event Driven)
-- Este trigger se dispara después de que una reseña es insertada.
-- Usaremos un http request nativo si pg_net está habilitado, o un webhook a través del dashboard.
-- Para migraciones, definimos la función que hace el llamado usando supabase net/http (requiere extensión pg_net)
-- Si la extensión no está, podemos crear el esquema del webhook trigger.

-- Por ahora, lo más seguro es preparar el payload. El usuario configurará la URL de la Edge Function en sus variables o usando Supabase Webhooks nativos. 
-- Aquí definimos un log del evento que podemos interceptar vía Realtime o Edge Functions database webhooks:

CREATE OR REPLACE FUNCTION public.log_new_review_for_ai()
RETURNS TRIGGER AS $$
BEGIN
    -- Registrar un evento en system_events para auditoría
    INSERT INTO public.system_events (type, title, description, metadata)
    VALUES (
        'review_created',
        'Nueva reseña recibida',
        'Se ha recibido una nueva reseña de ' || NEW.client_name,
        jsonb_build_object('review_id', NEW.id, 'service_id', NEW.service_id)
    );
    
    -- La plataforma de Supabase puede enlazar un Database Webhook nativo a la tabla 'reviews' 
    -- que disparará la Edge Function automáticamente sin necesidad de pg_net en esta migración.
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_review_insert
AFTER INSERT ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.log_new_review_for_ai();

-- 3. RPC para generar métricas avanzadas (Business Intelligence)
-- Esta función procesará los datos desde la BD para ser consumidos por el Dashboard.
CREATE OR REPLACE FUNCTION public.get_dashboard_kpis()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_reviews', COUNT(*),
        'average_rating', COALESCE(AVG(rating), 0),
        'verified_percentage', COALESCE(
            (SUM(CASE WHEN verified THEN 1 ELSE 0 END)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 
        0),
        'pending_reviews', SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)
    ) INTO result
    FROM public.reviews;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
