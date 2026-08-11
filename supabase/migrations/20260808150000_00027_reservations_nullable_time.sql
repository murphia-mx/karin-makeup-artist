-- Migración 00027: Hacer reservation_time opcional (NULL)
-- La hora de reserva es opcional: la clienta puede no saber la hora exacta todavía.

-- 1. Hacer la columna nullable
ALTER TABLE public.reservations
  ALTER COLUMN reservation_time DROP NOT NULL;

-- 2. Reemplazar la función RPC para:
--    - Aceptar p_reservation_time como nullable (TEXT en lugar de TIME para evitar coerción forzada)
--    - Solo verificar conflicto de horario cuando AMBOS date y time están presentes
--    - Guardar NULL en reservation_time cuando no se proporciona
CREATE OR REPLACE FUNCTION public.submit_reservation(
    p_client_name TEXT,
    p_client_phone TEXT,
    p_client_email TEXT,
    p_service_id UUID,
    p_reservation_date DATE,
    p_reservation_time TEXT,   -- Ahora TEXT nullable ("" o NULL = sin hora)
    p_notes TEXT,
    p_requires_home_service BOOLEAN,
    p_address TEXT,
    p_reference_image_url TEXT,
    p_storage_path TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_service_active BOOLEAN;
    v_conflict_count INTEGER;
    v_reservation_id UUID;
    v_time_value TIME;
BEGIN
    -- 1. Validar campos requeridos mínimos
    IF p_client_name IS NULL OR TRIM(p_client_name) = '' THEN
        RAISE EXCEPTION 'MISSING_CLIENT_NAME';
    END IF;
    IF p_client_phone IS NULL OR TRIM(p_client_phone) = '' THEN
        RAISE EXCEPTION 'MISSING_CLIENT_PHONE';
    END IF;

    -- 2. Validar que la fecha no sea pasada
    IF p_reservation_date < CURRENT_DATE THEN
        RAISE EXCEPTION 'PAST_DATE_NOT_ALLOWED';
    END IF;

    -- 3. Convertir string de hora a TIME (NULL si vacío o NULL)
    IF p_reservation_time IS NULL OR TRIM(p_reservation_time) = '' THEN
        v_time_value := NULL;
    ELSE
        v_time_value := p_reservation_time::TIME;
    END IF;

    -- 4. Validar existencia y estado del servicio
    SELECT active INTO v_service_active
    FROM public.services
    WHERE id = p_service_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'SERVICE_NOT_FOUND';
    END IF;

    IF NOT v_service_active THEN
        RAISE EXCEPTION 'SERVICE_NOT_ACTIVE';
    END IF;

    -- 5. Verificar conflicto SOLO cuando se proporcionó una hora específica
    --    (Si no hay hora, no se puede verificar conflicto de slot)
    IF v_time_value IS NOT NULL THEN
        SELECT COUNT(*) INTO v_conflict_count
        FROM public.reservations
        WHERE reservation_date = p_reservation_date
          AND reservation_time = v_time_value
          AND status IN ('pending', 'confirmed');

        IF v_conflict_count > 0 THEN
            RAISE EXCEPTION 'TIME_SLOT_UNAVAILABLE';
        END IF;
    END IF;

    -- 6. Crear la reserva
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
        v_time_value,         -- NULL si no se proporcionó hora
        p_notes,
        COALESCE(p_requires_home_service, false),
        p_address,
        p_reference_image_url,
        p_storage_path,
        'pending',
        'pending',
        50
    ) RETURNING id INTO v_reservation_id;

    RETURN jsonb_build_object(
        'success', true,
        'reservation_id', v_reservation_id
    );
END;
$$;

-- Conceder permisos de ejecución a usuarios anónimos (para el formulario público)
GRANT EXECUTE ON FUNCTION public.submit_reservation(TEXT, TEXT, TEXT, UUID, DATE, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.submit_reservation(TEXT, TEXT, TEXT, UUID, DATE, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT) TO authenticated;
