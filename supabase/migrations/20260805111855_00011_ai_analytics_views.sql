-- =========================================================================================
-- MIGRATION: 00011_ai_analytics_views.sql
-- DESCRIPTION: High performance AI aggregations, views, and indexes.
-- =========================================================================================

-- 1. INDEXES
CREATE INDEX IF NOT EXISTS idx_ai_review_analysis_sentiment ON public.ai_review_analysis(sentiment);
CREATE INDEX IF NOT EXISTS idx_ai_telemetry_target ON public.ai_telemetry(target_id);
CREATE INDEX IF NOT EXISTS idx_ai_telemetry_created_at ON public.ai_telemetry(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_status_created ON public.reviews(status, created_at DESC);

-- 2. AI HEALTH VIEW
-- Aggregates telemetry data to show provider health, latency, and success rates.
CREATE OR REPLACE VIEW public.ai_health_view AS
SELECT 
    p.provider_name,
    t.model,
    COUNT(t.id) as total_requests,
    ROUND((SUM(CASE WHEN t.status = 'success' THEN 1 ELSE 0 END)::numeric * 100.0) / NULLIF(COUNT(t.id), 0), 2) as success_rate,
    ROUND(AVG(t.duration_ms)) as avg_latency_ms,
    ROUND(AVG(t.total_tokens)) as avg_tokens,
    MAX(t.created_at) as last_analysis_at
FROM public.ai_telemetry t
JOIN public.llm_providers p ON t.provider_id = p.id
GROUP BY p.provider_name, t.model;

-- Grant access to authenticated users (admins via RLS usually, but views don't have RLS by default unless security invoker)
GRANT SELECT ON public.ai_health_view TO authenticated;
GRANT SELECT ON public.ai_health_view TO service_role;


-- 3. EXECUTIVE METRICS RPC
-- Returns aggregated AI metrics dynamically filtered by date and service without causing N+1 or heavy memory loads in React.
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
                WHERE (start_date IS NULL OR r2.created_at >= start_date)
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
                WHERE (start_date IS NULL OR r3.created_at >= start_date)
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
                WHERE (start_date IS NULL OR r4.created_at >= start_date)
                  AND (end_date IS NULL OR r4.created_at <= end_date)
                  AND (p_service_id IS NULL OR r4.service_id = p_service_id)
                GROUP BY aspect
                ORDER BY count DESC
                LIMIT 10
            ) pa
        ), '[]'::jsonb),

        -- Top Negative Aspects
        'top_negative_aspects', COALESCE((
            SELECT jsonb_agg(jsonb_build_object('aspect', na.aspect, 'count', na.count))
            FROM (
                SELECT unnest(ara5.negative_aspects) as aspect, count(*) as count
                FROM public.ai_review_analysis ara5
                JOIN public.reviews r5 ON ara5.review_id = r5.id
                WHERE (start_date IS NULL OR r5.created_at >= start_date)
                  AND (end_date IS NULL OR r5.created_at <= end_date)
                  AND (p_service_id IS NULL OR r5.service_id = p_service_id)
                GROUP BY aspect
                ORDER BY count DESC
                LIMIT 10
            ) na
        ), '[]'::jsonb)
    ) INTO result
    FROM public.ai_review_analysis ara
    JOIN public.reviews r ON ara.review_id = r.id
    WHERE (start_date IS NULL OR r.created_at >= start_date)
      AND (end_date IS NULL OR r.created_at <= end_date)
      AND (p_service_id IS NULL OR r.service_id = p_service_id);

    RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant Execute
GRANT EXECUTE ON FUNCTION public.get_ai_executive_metrics(TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_ai_executive_metrics(TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, UUID) TO service_role;
