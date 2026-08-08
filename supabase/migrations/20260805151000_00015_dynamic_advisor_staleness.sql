-- 00015_dynamic_advisor_staleness.sql
-- Description: Agrega soporte de firmas (snapshots) a ai_advisor_reports y redefine get_latest_advisor_report

-- 1. Agregar columnas de snapshot
ALTER TABLE public.ai_advisor_reports
ADD COLUMN IF NOT EXISTS snapshot_total_reviews INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS snapshot_average_rating NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS snapshot_positive_reviews INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS snapshot_negative_reviews INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS snapshot_latest_review_at TIMESTAMP WITH TIME ZONE;

-- 2. Actualizar el RPC get_latest_advisor_report
CREATE OR REPLACE FUNCTION public.get_latest_advisor_report()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    curr_total INTEGER;
    curr_avg NUMERIC;
    curr_positive INTEGER;
    curr_negative INTEGER;
    curr_latest TIMESTAMP WITH TIME ZONE;
    stale_flag BOOLEAN := false;
BEGIN
    -- Calcular la firma del negocio actual
    SELECT 
        COUNT(*),
        COALESCE(ROUND(AVG(rating), 2), 0),
        COALESCE(SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN rating <= 3 THEN 1 ELSE 0 END), 0),
        MAX(created_at)
    INTO 
        curr_total, curr_avg, curr_positive, curr_negative, curr_latest
    FROM public.reviews 
    WHERE status = 'approved';

    -- Regla 1: Mínimo 3 reseñas para tener asesoría
    IF curr_total < 3 THEN
        RETURN NULL;
    END IF;

    -- Obtener el último reporte
    -- Se evalúa la firma actual vs la firma almacenada
    SELECT jsonb_build_object(
        'id', id,
        'period_start', period_start,
        'period_end', period_end,
        'total_reviews_analyzed', snapshot_total_reviews,
        'observations', observations,
        'created_at', created_at,
        'is_stale', (
            -- Comparación de firma
            (curr_total != snapshot_total_reviews) OR
            (curr_avg != snapshot_average_rating) OR
            (curr_positive != snapshot_positive_reviews) OR
            (curr_negative != snapshot_negative_reviews) OR
            (curr_latest IS DISTINCT FROM snapshot_latest_review_at) OR
            -- Decaimiento temporal
            (created_at < (NOW() - INTERVAL '7 days'))
        )
    ) INTO result
    FROM public.ai_advisor_reports
    ORDER BY created_at DESC
    LIMIT 1;

    RETURN COALESCE(result, NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
