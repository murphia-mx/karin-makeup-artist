-- 00012_fix_ai_analytics_bias.sql
-- Description: Corrección de sesgo en el análisis de IA. Garantiza que solo se procesen reseñas aprobadas y agrega detección de riesgos en Business Insights.

-- ==============================================================================
-- 1. RPC: get_ai_executive_metrics()
-- ==============================================================================
-- Aseguramos que TODAS las subconsultas filtren explícitamente por status = 'approved'.
CREATE OR REPLACE FUNCTION public.get_ai_executive_metrics(
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_service_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_analyzed', COUNT(ara.id),
        'average_confidence', ROUND(AVG(ara.confidence_score), 2),
        'spam_detected', SUM(CASE WHEN ara.is_spam THEN 1 ELSE 0 END),
        
        -- Sentiment Distribution
        'sentiment_distribution', COALESCE((
            SELECT jsonb_object_agg(s.sentiment, s.count)
            FROM (
                SELECT ara2.sentiment, count(*) as count
                FROM public.ai_review_analysis ara2
                JOIN public.reviews r2 ON ara2.review_id = r2.id
                WHERE r2.status = 'approved'
                  AND (start_date IS NULL OR r2.created_at >= start_date)
                  AND (end_date IS NULL OR r2.created_at <= end_date)
                  AND (p_service_id IS NULL OR r2.service_id = p_service_id)
                GROUP BY ara2.sentiment
            ) s
        ), '{}'::jsonb),

        -- Top Keywords
        'top_keywords', COALESCE((
            SELECT jsonb_agg(jsonb_build_object('keyword', k.keyword, 'count', k.count))
            FROM (
                SELECT unnest(ara3.keywords) as keyword, count(*) as count
                FROM public.ai_review_analysis ara3
                JOIN public.reviews r3 ON ara3.review_id = r3.id
                WHERE r3.status = 'approved'
                  AND (start_date IS NULL OR r3.created_at >= start_date)
                  AND (end_date IS NULL OR r3.created_at <= end_date)
                  AND (p_service_id IS NULL OR r3.service_id = p_service_id)
                GROUP BY keyword
                ORDER BY count DESC
                LIMIT 15
            ) k
        ), '[]'::jsonb),

        -- Top Positive Aspects
        'top_positive_aspects', COALESCE((
            SELECT jsonb_agg(jsonb_build_object('aspect', pa.aspect, 'count', pa.count))
            FROM (
                SELECT unnest(ara4.positive_aspects) as aspect, count(*) as count
                FROM public.ai_review_analysis ara4
                JOIN public.reviews r4 ON ara4.review_id = r4.id
                WHERE r4.status = 'approved'
                  AND (start_date IS NULL OR r4.created_at >= start_date)
                  AND (end_date IS NULL OR r4.created_at <= end_date)
                  AND (p_service_id IS NULL OR r4.service_id = p_service_id)
                GROUP BY aspect
                ORDER BY count DESC
                LIMIT 15
            ) pa
        ), '[]'::jsonb),

        -- Top Negative Aspects
        'top_negative_aspects', COALESCE((
            SELECT jsonb_agg(jsonb_build_object('aspect', na.aspect, 'count', na.count))
            FROM (
                SELECT unnest(ara5.negative_aspects) as aspect, count(*) as count
                FROM public.ai_review_analysis ara5
                JOIN public.reviews r5 ON ara5.review_id = r5.id
                WHERE r5.status = 'approved'
                  AND (start_date IS NULL OR r5.created_at >= start_date)
                  AND (end_date IS NULL OR r5.created_at <= end_date)
                  AND (p_service_id IS NULL OR r5.service_id = p_service_id)
                GROUP BY aspect
                ORDER BY count DESC
                LIMIT 15
            ) na
        ), '[]'::jsonb)
    ) INTO result
    FROM public.ai_review_analysis ara
    JOIN public.reviews r ON ara.review_id = r.id
    WHERE r.status = 'approved'
      AND (start_date IS NULL OR r.created_at >= start_date)
      AND (end_date IS NULL OR r.created_at <= end_date)
      AND (p_service_id IS NULL OR r.service_id = p_service_id);

    RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_ai_executive_metrics(TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_ai_executive_metrics(TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, UUID) TO service_role;


-- ==============================================================================
-- 2. RPC: get_business_insights()
-- ==============================================================================
-- Agregamos la regla de "Riesgo de Calidad" si hay reseñas aprobadas de 3 o menos estrellas.
CREATE OR REPLACE FUNCTION public.get_business_insights()
RETURNS JSONB AS $$
DECLARE
    insights JSONB := '[]'::jsonb;
    current_avg NUMERIC;
    prev_avg NUMERIC;
    total_5_star INTEGER;
    total_approved INTEGER;
    total_negative INTEGER;
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
                'description', 'El servicio de ' || top_service || ' concentra la mayoría de tus reseñas exitosas.',
                'variation', top_service_percentage
            );
        END IF;

        -- Insight 3: Proporción de 5 Estrellas
        SELECT COUNT(*) INTO total_5_star FROM public.reviews WHERE status = 'approved' AND rating = 5;
        IF total_5_star > 0 THEN
            insights := insights || jsonb_build_object(
                'type', 'quality',
                'importance', 'high',
                'icon', 'star',
                'title', 'Excelencia en Servicio',
                'description', 'Las reseñas de 5 estrellas representan el ' || ROUND((total_5_star::numeric / total_approved) * 100, 1) || '% del total. Tienes clientas muy felices.',
                'variation', ROUND((total_5_star::numeric / total_approved) * 100, 1)
            );
        END IF;
        
        -- Novedad: Riesgo de Calidad
        SELECT COUNT(*) INTO total_negative FROM public.reviews WHERE status = 'approved' AND rating <= 3;
        IF total_negative > 0 THEN
            insights := insights || jsonb_build_object(
                'type', 'alert',
                'importance', 'high',
                'icon', 'alert-circle',
                'title', 'Atención Requerida',
                'description', 'Tienes ' || total_negative || ' reseña(s) con calificación regular o baja. Revísalas para encontrar oportunidades de mejora.',
                'variation', 0
            );
        END IF;
    END IF;

    RETURN insights;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
