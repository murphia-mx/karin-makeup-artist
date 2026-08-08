-- 00002_rls.sql
-- Description: Políticas de Seguridad a Nivel de Fila (RLS) y helper de roles

-- 1. Helper Function para verificar roles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Habilitar RLS en TODAS las tablas
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- 3. Políticas para administradores (Tienen acceso TOTAL a todo)
CREATE POLICY "Admins have full access to user_roles" ON public.user_roles FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to services" ON public.services FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to review_invitations" ON public.review_invitations FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to reviews" ON public.reviews FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to review_media" ON public.review_media FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to ai_analysis" ON public.ai_analysis FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to review_keywords" ON public.review_keywords FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to audit_logs" ON public.audit_logs FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to system_events" ON public.system_events FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to analytics_snapshots" ON public.analytics_snapshots FOR ALL USING (is_admin());

-- 4. Políticas Públicas (Usuarios anónimos y clientes)

-- Services: Cualquier persona puede ver los servicios activos.
CREATE POLICY "Anyone can view active services" ON public.services
    FOR SELECT USING (active = true);

-- Reviews: Cualquier persona puede ver las reseñas aprobadas.
CREATE POLICY "Anyone can view approved reviews" ON public.reviews
    FOR SELECT USING (status = 'approved');

-- Reviews: Cualquier persona puede insertar una nueva reseña (quedará 'pending' por default).
CREATE POLICY "Anyone can insert reviews" ON public.reviews
    FOR INSERT WITH CHECK (true);

-- Review Media: Cualquier persona puede ver las fotos de las reseñas.
CREATE POLICY "Anyone can view review media" ON public.review_media
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.reviews r 
            WHERE r.id = review_media.review_id 
            AND r.status = 'approved'
        )
    );

-- Review Media: Cualquier persona puede insertar fotos (se asocia desde el cliente antes de aprobar la reseña).
CREATE POLICY "Anyone can insert review media" ON public.review_media
    FOR INSERT WITH CHECK (true);

-- System Events: Solo administradores (Policy de ALL ya cubre esto, pero explícitamente negamos a los demás)
-- (No se requiere policy explícita de negación, la ausencia de una policy de acceso niega el acceso por default)
