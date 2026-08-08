-- 00009_analytics_dashboard.sql
-- Description: Consolidación de Business Intelligence en RPCs estructuradas y adición de índices de alto impacto.

-- ==============================================================================
-- 1. ÍNDICES (Optimizaciones Justificadas)
-- ==============================================================================
-- Se añaden únicamente los índices estrictamente necesarios para acelerar los GROUP BY
-- y los cálculos de tendencias temporales usados en las RPCs de esta migración.

-- Justificación: Acelera drásticamente la distribución de estrellas (GROUP BY rating)
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);

-- Justificación: Permite contar métricas clave (destacadas y verificadas) con Index-Only Scans
CREATE INDEX IF NOT EXISTS idx_reviews_featured ON public.reviews(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_reviews_verified ON public.reviews(verified) WHERE verified = true;

-- Justificación: Fundamental para el filtrado temporal en las tendencias (semanal/mensual) 
-- y para optimizar los cálculos de tiempos promedio (published_at - created_at)
CREATE INDEX IF NOT EXISTS idx_reviews_dates_analytics ON public.reviews(created_at, published_at, admin_reply_at);

-- ==============================================================================
-- 2. RPC: get_dashboard_kpis()
-- ==============================================================================
-- Consolidado JSON de todas las métricas escalares del dashboard. Evita múltiples peticiones.
CREATE OR REPLACE FUNCTION public.get_dashboard_kpis()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'reviews', jsonb_build_object(
            'total', COUNT(*),
            'approved', COUNT(*) FILTER (WHERE status = 'approved'),
            'pending', COUNT(*) FILTER (WHERE status = 'pending'),
            'rejected', COUNT(*) FILTER (WHERE status IN ('rejected', 'spam', 'flagged')),
            'featured', COUNT(*) FILTER (WHERE featured = true),
            'verified', COUNT(*) FILTER (WHERE verified = true)
        ),
        'rating', jsonb_build_object(
            'average', COALESCE(ROUND(AVG(rating)::numeric, 1), 0),
            'trend', 0 -- Calculable comparando promedios de periodos, pero para el MVP se deja preparado
        ),
        'response', jsonb_build_object(
            -- Tiempos devueltos en horas
            'avgApprovalHours', COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (published_at - created_at))) / 3600), 0),
            'avgReplyHours', COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (admin_reply_at - created_at))) / 3600), 0)
        )
    ) INTO result
    FROM public.reviews;

    -- Agregar información de servicios usando la vista popular_services_view
    SELECT jsonb_set(
        result, 
        '{services}', 
        jsonb_build_object(
            'topRated', (SELECT service_name FROM public.popular_services_view WHERE total_reviews > 0 ORDER BY average_rating DESC LIMIT 1),
            'mostReviewed', (SELECT service_name FROM public.popular_services_view ORDER BY total_reviews DESC LIMIT 1)
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==============================================================================
-- 3. RPC: get_dashboard_charts()
-- ==============================================================================
-- Retorna todas las series temporales y distribuciones para alimentar Recharts
CREATE OR REPLACE FUNCTION public.get_dashboard_charts()
RETURNS JSONB AS $$
DECLARE
    star_dist JSONB;
    monthly_trend JSONB;
    weekly_trend JSONB;
    services_chart JSONB;
BEGIN
    -- 3.1. Distribución de estrellas (Siempre devuelve 5 niveles, incluso con 0)
    WITH stars AS (
        SELECT generate_series(1,5) as rating
    )
    SELECT jsonb_agg(jsonb_build_object('stars', s.rating, 'count', COALESCE(c.count, 0)) ORDER BY s.rating DESC)
    INTO star_dist
    FROM stars s
    LEFT JOIN (
        SELECT rating, COUNT(*) as count 
        FROM public.reviews 
        WHERE status = 'approved' 
        GROUP BY rating
    ) c ON s.rating = c.rating;

    -- 3.2. Tendencia mensual (Últimos 12 meses)
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'month', to_char(month_date, 'YYYY-MM'),
        'total', count,
        'average', average
    ) ORDER BY month_date ASC), '[]'::jsonb)
    INTO monthly_trend
    FROM (
        SELECT 
            date_trunc('month', created_at) as month_date,
            COUNT(*) as count,
            COALESCE(ROUND(AVG(rating)::numeric, 1), 0) as average
        FROM public.reviews
        WHERE created_at >= date_trunc('month', NOW() - INTERVAL '11 months')
        GROUP BY month_date
    ) t;

    -- 3.3. Tendencia semanal y Aprobadas vs Pendientes (Últimas 12 semanas)
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'week', to_char(week_date, 'IYYY-IW'),
        'approved', approved_count,
        'pending', pending_count
    ) ORDER BY week_date ASC), '[]'::jsonb)
    INTO weekly_trend
    FROM (
        SELECT 
            date_trunc('week', created_at) as week_date,
            COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
            COUNT(*) FILTER (WHERE status = 'pending') as pending_count
        FROM public.reviews
        WHERE created_at >= date_trunc('week', NOW() - INTERVAL '11 weeks')
        GROUP BY week_date
    ) t;

    -- 3.4. Servicios Populares
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'name', service_name,
        'reviews', total_reviews,
        'rating', average_rating
    )), '[]'::jsonb)
    INTO services_chart
    FROM (
        SELECT service_name, total_reviews, average_rating
        FROM public.popular_services_view
        LIMIT 5
    ) t;

    -- 3.5. Compilación del JSON Final
    RETURN jsonb_build_object(
        'starDistribution', star_dist,
        'monthlyTrend', monthly_trend,
        'weeklyTrend', weekly_trend,
        'services', services_chart,
        'approvalTrend', weekly_trend -- Reutilizamos la tendencia semanal que ya incluye approved/pending
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==============================================================================
-- 4. RPC: get_business_insights()
-- ==============================================================================
-- Genera conclusiones analíticas del negocio en formato estructurado (preparado para IA)
CREATE OR REPLACE FUNCTION public.get_business_insights()
RETURNS JSONB AS $$
DECLARE
    insights JSONB := '[]'::jsonb;
    current_avg NUMERIC;
    prev_avg NUMERIC;
    total_5_star INTEGER;
    total_approved INTEGER;
    top_service TEXT;
    top_service_percentage NUMERIC;
BEGIN
    -- Insight 1: Variación de calificación (Mes actual vs Anterior)
    SELECT COALESCE(AVG(rating), 0) INTO current_avg 
    FROM public.reviews WHERE created_at >= date_trunc('month', NOW()) AND status = 'approved';
    
    SELECT COALESCE(AVG(rating), 0) INTO prev_avg 
    FROM public.reviews WHERE created_at >= date_trunc('month', NOW() - INTERVAL '1 month') 
                          AND created_at < date_trunc('month', NOW()) AND status = 'approved';

    IF prev_avg > 0 AND current_avg != prev_avg THEN
        insights := insights || jsonb_build_object(
            'type', 'trend',
            'importance', 'high',
            'icon', CASE WHEN current_avg >= prev_avg THEN 'trending-up' ELSE 'trending-down' END,
            'title', 'Satisfacción Promedio',
            'description', 'La calificación promedio pasó de ' || ROUND(prev_avg, 1) || ' a ' || ROUND(current_avg, 1) || ' este mes.',
            'variation', ROUND(((current_avg - prev_avg) / prev_avg) * 100, 1)
        );
    END IF;

    -- Insight 2: Concentración del Servicio Principal
    SELECT COUNT(*) INTO total_approved FROM public.reviews WHERE status = 'approved';
    
    IF total_approved > 0 THEN
        SELECT s.name, COUNT(r.id) INTO top_service, total_5_star
        FROM public.services s
        JOIN public.reviews r ON s.id = r.service_id AND r.status = 'approved'
        GROUP BY s.name ORDER BY COUNT(r.id) DESC LIMIT 1;
        
        IF top_service IS NOT NULL THEN
            top_service_percentage := ROUND((total_5_star::numeric / total_approved) * 100, 1);
            insights := insights || jsonb_build_object(
                'type', 'concentration',
                'importance', 'medium',
                'icon', 'pie-chart',
                'title', 'Servicio Líder',
                'description', 'El servicio de ' || top_service || ' concentra el ' || top_service_percentage || '% de tus reseñas exitosas.',
                'variation', top_service_percentage
            );
        END IF;

        -- Insight 3: Proporción de 5 Estrellas
        SELECT COUNT(*) INTO total_5_star FROM public.reviews WHERE status = 'approved' AND rating = 5;
        insights := insights || jsonb_build_object(
            'type', 'quality',
            'importance', 'high',
            'icon', 'star',
            'title', 'Excelencia en Servicio',
            'description', 'Las reseñas de 5 estrellas representan el ' || ROUND((total_5_star::numeric / total_approved) * 100, 1) || '% del total.',
            'variation', ROUND((total_5_star::numeric / total_approved) * 100, 1)
        );
    END IF;

    RETURN insights;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
