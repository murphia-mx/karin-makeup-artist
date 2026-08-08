-- seed_admin.sql
-- Description: Instrucciones y preparación para el rol de administrador.
-- 
-- IMPORTANTE:
-- Supabase Auth maneja las contraseñas con encriptación bcrypt/argon2 nativamente.
-- Insertar un usuario manualmente en auth.users a través de SQL no es recomendado
-- ya que requiere generar el hash correctamente.
--
-- FLUJO CORRECTO:
-- 1. Ve al panel de Supabase > Authentication > Users > Add User (admin@karinmakeup.com)
-- 2. Copia el UUID generado.
-- 3. Reemplaza 'INSERT_UUID_HERE' con ese UUID en este script y ejecútalo.

/*
INSERT INTO public.user_roles (user_id, role)
VALUES ('INSERT_UUID_HERE', 'admin')
ON CONFLICT DO NOTHING;
*/
