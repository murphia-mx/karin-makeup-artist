-- Tabla de reservas
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_email TEXT,
    service_id UUID REFERENCES public.services(id) ON DELETE RESTRICT,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    notes TEXT,
    requires_home_service BOOLEAN NOT NULL DEFAULT false,
    address TEXT,
    reference_image_url TEXT,
    storage_path TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    deposit_status TEXT NOT NULL DEFAULT 'pending' CHECK (deposit_status IN ('pending', 'paid')),
    deposit_percentage INTEGER NOT NULL DEFAULT 50,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Políticas para Reservations
-- Sólo el admin puede leer, modificar o eliminar
CREATE POLICY "Admin can do all on reservations"
    ON public.reservations
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Storage: Bucket para imágenes privadas de referencia
INSERT INTO storage.buckets (id, name, public) 
VALUES ('reservations-assets', 'reservations-assets', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- Anónimo puede SUBIR (INSERT) pero NO puede LEER (SELECT)
CREATE POLICY "Anon can upload reservation images"
    ON storage.objects
    FOR INSERT
    TO public
    WITH CHECK (bucket_id = 'reservations-assets');

-- Admin puede hacer TODO en el bucket
CREATE POLICY "Admin can do all on reservation images"
    ON storage.objects
    FOR ALL
    TO authenticated
    USING (bucket_id = 'reservations-assets')
    WITH CHECK (bucket_id = 'reservations-assets');

-- Función RPC para registrar la reserva de manera segura
CREATE OR REPLACE FUNCTION public.submit_reservation(
    p_client_name TEXT,
    p_client_phone TEXT,
    p_client_email TEXT,
    p_service_id UUID,
    p_reservation_date DATE,
    p_reservation_time TIME,
    p_notes TEXT,
    p_requires_home_service BOOLEAN,
    p_address TEXT,
    p_reference_image_url TEXT,
    p_storage_path TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecuta con permisos de creador (admin bypass RLS)
AS $$
DECLARE
    v_service_active BOOLEAN;
    v_conflict_count INTEGER;
    v_reservation_id UUID;
BEGIN
    -- 1. Validar campos requeridos mínimos
    IF p_client_name IS NULL OR p_client_name = '' THEN
        RAISE EXCEPTION 'MISSING_CLIENT_NAME';
    END IF;
    IF p_client_phone IS NULL OR p_client_phone = '' THEN
        RAISE EXCEPTION 'MISSING_CLIENT_PHONE';
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

    -- 4. Protección básica contra duplicados/conflictos
    -- Evitar 2 reservas activas (pending o confirmed) para la misma fecha y hora exacta
    SELECT COUNT(*) INTO v_conflict_count
    FROM public.reservations
    WHERE reservation_date = p_reservation_date 
      AND reservation_time = p_reservation_time
      AND status IN ('pending', 'confirmed');

    IF v_conflict_count > 0 THEN
        RAISE EXCEPTION 'TIME_SLOT_UNAVAILABLE';
    END IF;

    -- 5. Crear la reserva
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
        p_reservation_time,
        p_notes,
        p_requires_home_service,
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
