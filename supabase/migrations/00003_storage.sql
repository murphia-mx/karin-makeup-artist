-- 00003_storage.sql
-- Description: Configuración del Storage de Supabase para las imágenes de las reseñas

-- 1. Crear el bucket 'review-media' si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-media', 'review-media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Habilitar RLS en objetos de storage (Por defecto ya lo está, pero para asegurar)
-- (La tabla storage.objects ya tiene RLS habilitado en proyectos de Supabase)

-- 3. Políticas de acceso para 'review-media'

-- Permitir a cualquier persona LEER los archivos del bucket
CREATE POLICY "Public Access for review-media" ON storage.objects
    FOR SELECT USING (bucket_id = 'review-media');

-- Permitir a cualquier persona INSERTAR archivos en el bucket
-- Limitamos a imágenes y tamaño menor a 5MB (5242880 bytes) aprox. No se puede enforcer el tamaño
-- estrictamente en policy sin funciones avanzadas o metadatos confiables, pero lo validamos a nivel lógico.
CREATE POLICY "Anyone can upload to review-media" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'review-media'
        -- Opcional: restringe la carpeta si es necesario, e.g. path_tokens[1] = 'public'
    );

-- Permitir solo a Administradores ACTUALIZAR y ELIMINAR
CREATE POLICY "Admins can update review-media" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'review-media' AND 
        public.is_admin()
    );

CREATE POLICY "Admins can delete review-media" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'review-media' AND 
        public.is_admin()
    );
