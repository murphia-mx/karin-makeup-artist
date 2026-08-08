-- 00014_refactor_advisor_schema.sql
-- Description: Refactoriza la tabla ai_advisor_reports para soportar observaciones dinámicas e independientes en lugar de un reporte rígido.

-- 1. Alterar la tabla
ALTER TABLE public.ai_advisor_reports
DROP COLUMN IF EXISTS best_performing_area,
DROP COLUMN IF EXISTS worsening_area,
DROP COLUMN IF EXISTS detected_opportunity,
DROP COLUMN IF EXISTS recommended_action,
ADD COLUMN IF NOT EXISTS observations JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 2. Actualizar el RPC
CREATE OR REPLACE FUNCTION public.get_latest_advisor_report()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'id', id,
        'period_start', period_start,
        'period_end', period_end,
        'total_reviews_analyzed', total_reviews_analyzed,
        'observations', observations,
        'created_at', created_at,
        'is_stale', (created_at < (NOW() - INTERVAL '7 days'))
    ) INTO result
    FROM public.ai_advisor_reports
    ORDER BY created_at DESC
    LIMIT 1;

    RETURN COALESCE(result, NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
