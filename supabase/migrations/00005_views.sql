-- 00005_views.sql
-- Description: Vistas de agregación para Business Intelligence y tableros en tiempo real

-- 1. Vista de Analytics del Dashboard
-- Esta vista permite al frontend consumir métricas en tiempo real sin cálculos costosos recurrentes.
CREATE OR REPLACE VIEW public.dashboard_analytics_view AS
SELECT
    COUNT(*) as total_reviews,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_reviews,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_reviews,
    COUNT(*) FILTER (WHERE status = 'spam') as spam_reviews,
    COALESCE(ROUND(AVG(rating)::numeric, 1), 0) as average_rating,
    COALESCE(ROUND((COUNT(*) FILTER (WHERE verified = true)::numeric / NULLIF(COUNT(*), 0)) * 100, 1), 0) as verified_percentage,
    MAX(created_at) as last_review_at
FROM public.reviews;

-- Asegurar políticas de seguridad sobre la vista (hereda los permisos de la tabla subyacente, 
-- pero garantizamos que solo el administrador pueda leerla si la tabla original estuviera abierta).
-- NOTA: Las vistas estándar no pueden tener RLS directamente si no se configuran como 'security invoker'.
-- En Postgres 15+, podemos hacer:
ALTER VIEW public.dashboard_analytics_view SET (security_invoker = true);

-- 2. Vista de Servicios Populares
CREATE OR REPLACE VIEW public.popular_services_view AS
SELECT 
    s.id as service_id,
    s.name as service_name,
    COUNT(r.id) as total_reviews,
    COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) as average_rating
FROM public.services s
LEFT JOIN public.reviews r ON s.id = r.service_id AND r.status = 'approved'
GROUP BY s.id, s.name
ORDER BY total_reviews DESC;

ALTER VIEW public.popular_services_view SET (security_invoker = true);
