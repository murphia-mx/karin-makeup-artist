-- 20260805170000_00017_advisor_signature.sql

-- 1. Agregamos las nuevas columnas de firma a la tabla
ALTER TABLE ai_advisor_reports 
ADD COLUMN IF NOT EXISTS snapshot_signature TEXT,
ADD COLUMN IF NOT EXISTS snapshot_generated_at TIMESTAMPTZ;

-- 2. Creamos la función criptográfica central (Única Fuente de Verdad)
-- Escucha ID, Rating, Texto, Status, Servicio y Updated At.
-- El uso de md5() y string_agg() procesará miles de filas en ~1-2ms, 
-- pero se ordena por ID para garantizar consistencia absoluta.
CREATE OR REPLACE FUNCTION get_reviews_signature()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    signature text;
BEGIN
    SELECT md5(string_agg(
        id::text || '|' || 
        rating::text || '|' || 
        status::text || '|' || 
        service_id::text || '|' || 
        COALESCE(review_text, '') || '|' || 
        updated_at::text, 
        ',' ORDER BY id
    ))
    INTO signature
    FROM reviews
    WHERE status = 'approved';

    RETURN COALESCE(signature, 'empty_signature');
END;
$$;

-- 3. Sobrescribimos el RPC principal para delegar en la firma
CREATE OR REPLACE FUNCTION get_latest_advisor_report()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    latest_report record;
    curr_total int;
    curr_signature text;
    is_stale boolean := false;
BEGIN
    -- Obtenemos el total para validación de negocio (mínimo 3)
    SELECT COUNT(*) INTO curr_total FROM reviews WHERE status = 'approved';

    IF curr_total < 3 THEN
        RETURN jsonb_build_object(
            'status', 'insufficient_data',
            'current_reviews', curr_total,
            'minimum_required', 3,
            'message', 'Todavía no hay suficientes opiniones para generar una asesoría confiable.'
        );
    END IF;

    -- Obtenemos la firma criptográfica actual
    curr_signature := get_reviews_signature();

    -- Buscamos el reporte más reciente
    SELECT *
    INTO latest_report
    FROM ai_advisor_reports
    ORDER BY created_at DESC
    LIMIT 1;

    -- Si no hay reporte, devolvemos null para entrar a Estado B
    IF latest_report IS NULL THEN
        RETURN NULL;
    END IF;

    -- Evaluamos vigencia estrictamente comparando las firmas
    IF (latest_report.snapshot_signature IS NULL) OR 
       (latest_report.snapshot_signature IS DISTINCT FROM curr_signature) THEN
        is_stale := true;
    END IF;

    -- Devolvemos el estado limpio y puramente manejado por backend
    RETURN jsonb_build_object(
        'status', 'success',
        'id', latest_report.id,
        'period_start', latest_report.period_start,
        'period_end', latest_report.period_end,
        'total_reviews_analyzed', latest_report.total_reviews_analyzed,
        'observations', latest_report.observations,
        'created_at', latest_report.created_at,
        'snapshot_generated_at', latest_report.snapshot_generated_at,
        'snapshot_signature', latest_report.snapshot_signature,
        'current_signature', curr_signature,
        'is_stale', is_stale
    );
END;
$$;
