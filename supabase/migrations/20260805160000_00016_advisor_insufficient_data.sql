-- 20260805160000_00016_advisor_insufficient_data.sql

CREATE OR REPLACE FUNCTION get_latest_advisor_report()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    latest_report record;
    curr_total int;
    curr_avg numeric;
    curr_positive int;
    curr_negative int;
    curr_latest timestamp with time zone;
    is_stale boolean := false;
BEGIN
    -- 1. Obtener la firma actual del negocio
    SELECT 
        COUNT(*),
        COALESCE(AVG(rating), 0),
        COUNT(*) FILTER (WHERE rating >= 4),
        COUNT(*) FILTER (WHERE rating <= 3),
        MAX(created_at)
    INTO 
        curr_total,
        curr_avg,
        curr_positive,
        curr_negative,
        curr_latest
    FROM reviews
    WHERE status = 'approved';

    -- Si hay menos de 3 reseñas, forzamos un estado de "insufficient_data"
    IF curr_total < 3 THEN
        RETURN jsonb_build_object(
            'status', 'insufficient_data',
            'current_reviews', curr_total,
            'minimum_required', 3,
            'message', 'Todavía no hay suficientes opiniones para generar una asesoría confiable.'
        );
    END IF;

    -- 2. Obtener el reporte más reciente
    SELECT *
    INTO latest_report
    FROM ai_advisor_reports
    ORDER BY created_at DESC
    LIMIT 1;

    -- 3. Si no hay reporte, retornar null
    IF latest_report IS NULL THEN
        RETURN NULL;
    END IF;

    -- 4. Evaluar vigencia
    IF (latest_report.snapshot_total_reviews IS DISTINCT FROM curr_total) OR
       (TRUNC(latest_report.snapshot_average_rating, 2) IS DISTINCT FROM TRUNC(curr_avg, 2)) OR
       (latest_report.snapshot_positive_reviews IS DISTINCT FROM curr_positive) OR
       (latest_report.snapshot_negative_reviews IS DISTINCT FROM curr_negative) OR
       (latest_report.snapshot_latest_review_at IS DISTINCT FROM curr_latest) OR
       (latest_report.created_at < NOW() - INTERVAL '7 days') THEN
        is_stale := true;
    END IF;

    -- 5. Retornar JSON
    RETURN jsonb_build_object(
        'status', 'success',
        'id', latest_report.id,
        'period_start', latest_report.period_start,
        'period_end', latest_report.period_end,
        'total_reviews_analyzed', latest_report.snapshot_total_reviews,
        'observations', latest_report.observations,
        'created_at', latest_report.created_at,
        'is_stale', is_stale
    );
END;
$$;
