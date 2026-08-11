-- ============================================================
-- Migración 00029: Función submit_reservation canónica y sin ambigüedad
-- ============================================================
-- Problema adicional: usar DEFAULT en parámetros puede causar
-- que PostgREST construya sobrecargas implícitas.
-- Solución: firma fija sin DEFAULT, el frontend siempre envía los 11 parámetros.

-- Eliminar cualquier versión existente, sin importar la firma exacta
-- (ya sabemos que pueden existir hasta 2: TEXT y TIME)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT p.oid, pg_get_function_identity_arguments(p.oid) AS args
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public' AND p.proname = 'submit_reservation'
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS public.submit_reservation(%s)', r.args);
    END LOOP;
END;
$$;

-- Crear la función canónica ÚNICA — firma fija, sin DEFAULT, 11 parámetros
-- p_reservation_time es TIME pero puede recibir NULL desde el cliente JS
CREATE FUNCTION public.submit_reservation(
    p_client_name           TEXT,
    p_client_phone          TEXT,
    p_client_email          TEXT,
    p_service_id            UUID,
    p_reservation_date      DATE,
    p_reservation_time      TIME,       -- NULL = hora por confirmar
    p_notes                 TEXT,
    p_requires_home_service BOOLEAN,
    p_address               TEXT,
    p_reference_image_url   TEXT,
    p_storage_path          TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_service_active  BOOLEAN;
    v_conflict_count  INTEGER;
    v_reservation_id  UUID;
BEGIN
    -- 1. Validar campos requeridos mínimos
    IF p_client_name IS NULL OR TRIM(p_client_name) = '' THEN
        RAISE EXCEPTION 'MISSING_CLIENT_NAME';
    END IF;

    IF p_client_phone IS NULL OR TRIM(p_client_phone) = '' THEN
        RAISE EXCEPTION 'MISSING_CLIENT_PHONE';
    END IF;

    IF p_service_id IS NULL THEN
        RAISE EXCEPTION 'MISSING_SERVICE_ID';
    END IF;

    IF p_reservation_date IS NULL THEN
        RAISE EXCEPTION 'MISSING_DATE';
    END IF;

    -- 2. Validar que la fecha no sea pasada
    IF p_reservation_date < CURRENT_DATE THEN
        RAISE EXCEPTION 'PAST_DATE_NOT_ALLOWED';
    END IF;

    -- 3. Validar existencia y estado del servicio
    SELECT active INTO v_service_active
    FROM public.services
    WHERE id = p_service_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'SERVICE_NOT_FOUND';
    END IF;

    IF NOT v_service_active THEN
        RAISE EXCEPTION 'SERVICE_NOT_ACTIVE';
    END IF;

    -- 4. Verificar conflicto SOLO cuando se proporcionó hora
    IF p_reservation_time IS NOT NULL THEN
        SELECT COUNT(*) INTO v_conflict_count
        FROM public.reservations
        WHERE reservation_date = p_reservation_date
          AND reservation_time = p_reservation_time
          AND status IN ('pending', 'confirmed');

        IF v_conflict_count > 0 THEN
            RAISE EXCEPTION 'TIME_SLOT_UNAVAILABLE';
        END IF;
    END IF;

    -- 5. Insertar la reserva
    INSERT INTO public.reservations (
        client_name,
        client_phone,
        client_email,
        service_id,
        reservation_date,
        reservation_time,
        notes,
        requires_home_service,
        address,
        reference_image_url,
        storage_path,
        status,
        deposit_status,
        deposit_percentage
    ) VALUES (
        p_client_name,
        p_client_phone,
        p_client_email,
        p_service_id,
        p_reservation_date,
        p_reservation_time,     -- NULL si la clienta no especificó hora
        p_notes,
        COALESCE(p_requires_home_service, FALSE),
        p_address,
        p_reference_image_url,
        p_storage_path,
        'pending',
        'pending',
        50
    )
    RETURNING id INTO v_reservation_id;

    RETURN jsonb_build_object(
        'success', true,
        'reservation_id', v_reservation_id
    );
END;
$$;

-- Permisos: anónimos (clientas) y autenticados (admin) pueden ejecutar
GRANT EXECUTE ON FUNCTION public.submit_reservation(
    TEXT, TEXT, TEXT, UUID, DATE, TIME, TEXT, BOOLEAN, TEXT, TEXT, TEXT
) TO anon;

GRANT EXECUTE ON FUNCTION public.submit_reservation(
    TEXT, TEXT, TEXT, UUID, DATE, TIME, TEXT, BOOLEAN, TEXT, TEXT, TEXT
) TO authenticated;

-- Recargar schema de PostgREST
NOTIFY pgrst, 'reload schema';
