-- 1. Hacemos que client_email sea opcional (nullable)
-- Esto permite que se puedan crear invitaciones solo con el nombre de la clienta, pero mantiene el campo para futuros usos.
ALTER TABLE review_invitations
  ALTER COLUMN client_email DROP NOT NULL;

-- 2. Agregamos la columna service_date
-- Guardará exclusivamente la fecha del servicio, sin afectar las fechas de creación o expiración.
ALTER TABLE review_invitations
  ADD COLUMN IF NOT EXISTS service_date DATE;
