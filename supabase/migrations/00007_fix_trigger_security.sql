-- 00007_fix_trigger_security.sql
-- Fix: Add SECURITY DEFINER to the trigger function so anonymous users 
-- can trigger the insert into system_events without violating RLS.

CREATE OR REPLACE FUNCTION public.log_new_review_for_ai()
RETURNS TRIGGER AS $$
BEGIN
    -- Registrar un evento en system_events para auditoría
    INSERT INTO public.system_events (type, title, description, metadata)
    VALUES (
        'review_created',
        'Nueva reseña recibida',
        'Se ha recibido una nueva reseña de ' || NEW.client_name,
        jsonb_build_object('review_id', NEW.id, 'service_id', NEW.service_id)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
