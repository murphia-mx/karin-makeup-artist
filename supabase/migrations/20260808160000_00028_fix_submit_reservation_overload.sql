-- ============================================================
-- Migración 00028: Eliminar sobrecarga ambigua de submit_reservation
-- ============================================================
-- Problema:
--   Existen dos funciones públicas submit_reservation:
--     1. (TEXT para p_reservation_time)  ← versión obsoleta de migración 00027
--     2. (TIME para p_reservation_time)  ← versión original de migración 00026
--   PostgREST no puede resolver cuál ejecutar → error "Could not choose best candidate"
--
-- Solución:
--   1. Eliminar la versión obsoleta con p_reservation_time TEXT
--   2. Recrear la versión canónica con p_reservation_time TIME DEFAULT NULL
--   3. Recargar schema de PostgREST

-- PASO 1: Eliminar la versión obsoleta con p_reservation_time TEXT
-- Se especifica la firma EXACTA para no borrar la versión correcta accidentalmente
DROP FUNCTION IF EXISTS public.submit_reservation(
    TEXT,   -- p_client_name
    TEXT,   -- p_client_phone
    TEXT,   -- p_client_email
    UUID,   -- p_service_id
    DATE,   -- p_reservation_date
    TEXT,   -- p_reservation_time ← esta es la firma obsoleta
    TEXT,   -- p_notes
    BOOLEAN,-- p_requires_home_service
    TEXT,   -- p_address
    TEXT,   -- p_reference_image_url
    TEXT    -- p_storage_path
);

-- PASO 2: Eliminar también la versión TIME original para recrearla limpiamente
DROP FUNCTION IF EXISTS public.submit_reservation(
    TEXT,   -- p_client_name
    TEXT,   -- p_client_phone
    TEXT,   -- p_client_email
    UUID,   -- p_service_id
    DATE,   -- p_reservation_date
    TIME,   -- p_reservation_time ← versión original
    TEXT,   -- p_notes
    BOOLEAN,-- p_requires_home_service
    TEXT,   -- p_address
    TEXT,   -- p_reference_image_url
    TEXT    -- p_storage_path
);

-- PASO 3: Crear la función canónica ÚNICA
-- p_reservation_time es TIME con DEFAULT NULL → hora completamente opcional
CREATE OR REPLACE FUNCTION public.submit_reservation(
    p_client_name           TEXT,
    p_client_phone          TEXT,
    p_client_email          TEXT        DEFAULT NULL,
    p_service_id            UUID        DEFAULT NULL,
    p_reservation_date      DATE        DEFAULT NULL,
    p_reservation_time      TIME        DEFAULT NULL,  -- OPCIONAL
    p_notes                 TEXT        DEFAULT NULL,
    p_requires_home_service BOOLEAN     DEFAULT FALSE,
    p_address               TEXT        DEFAULT NULL,
    p_reference_image_url   TEXT        DEFAULT NULL,
    p_storage_path          TEXT        DEFAULT NULL
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

    -- 4. Verificar conflicto de horario SOLO cuando se proporcionó una hora específica
    --    (Si no hay hora, no se puede determinar conflicto de slot)
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
        reservation_time,       -- puede ser NULL (hora a confirmar)
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
        p_reservation_time,     -- NULL si no se proporcionó
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

-- PASO 4: Permisos
-- Anónimos (clientas públicas) pueden llamar al RPC
GRANT EXECUTE ON FUNCTION public.submit_reservation(
    TEXT, TEXT, TEXT, UUID, DATE, TIME, TEXT, BOOLEAN, TEXT, TEXT, TEXT
) TO anon;

GRANT EXECUTE ON FUNCTION public.submit_reservation(
    TEXT, TEXT, TEXT, UUID, DATE, TIME, TEXT, BOOLEAN, TEXT, TEXT, TEXT
) TO authenticated;

-- PASO 5: Recargar schema de PostgREST para que reconozca la función actualizada
NOTIFY pgrst, 'reload schema';
