-- 00013_ai_advisor_reports.sql
-- Description: Estructura para almacenar los reportes de la Asesora IA.

CREATE TABLE IF NOT EXISTS public.ai_advisor_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    total_reviews_analyzed INTEGER NOT NULL,
    
    -- Los campos deben cumplir la regla #2 de hablar como consultora,
    -- pero en BD guardamos las claves estructurales en inglés para consistencia.
    best_performing_area JSONB NOT NULL, -- { "title": "Lo que mejor está funcionando", "description": "..." }
    worsening_area JSONB,                -- { "title": "Lo que merece atención", "description": "..." }
    detected_opportunity JSONB,          -- { "title": "Una oportunidad que vale la pena aprovechar", "description": "..." }
    recommended_action JSONB NOT NULL,   -- { "title": "Lo que te recomendamos hacer esta semana", "description": "..." }
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.ai_advisor_reports ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura (solo administradores pueden ver los reportes)
-- Asumimos que los administradores usan service_role o están autenticados como admin
CREATE POLICY "Admins can view advisor reports" ON public.ai_advisor_reports
    FOR SELECT USING (auth.role() = 'authenticated');

-- Función para obtener el último reporte
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
        'best_performing_area', best_performing_area,
        'worsening_area', worsening_area,
        'detected_opportunity', detected_opportunity,
        'recommended_action', recommended_action,
        'created_at', created_at,
        'is_stale', (created_at < (NOW() - INTERVAL '7 days'))
    ) INTO result
    FROM public.ai_advisor_reports
    ORDER BY created_at DESC
    LIMIT 1;

    RETURN COALESCE(result, NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_latest_advisor_report() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_latest_advisor_report() TO service_role;
