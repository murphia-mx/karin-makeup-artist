-- 00006_indexes.sql
-- Description: Creación de índices B-Tree para optimización de rendimiento en grandes volúmenes.

-- 1. Services
CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services(slug);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(active) WHERE active = true;

-- 2. Reviews
-- Optimizar búsquedas frecuentes: Filtrado por status y ordenamiento por fecha.
CREATE INDEX IF NOT EXISTS idx_reviews_status_created_at ON public.reviews(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_service_id ON public.reviews(service_id);
CREATE INDEX IF NOT EXISTS idx_reviews_invitation_id ON public.reviews(invitation_id);

-- 3. Review Media
CREATE INDEX IF NOT EXISTS idx_review_media_review_id ON public.review_media(review_id);

-- 4. AI Analysis
CREATE INDEX IF NOT EXISTS idx_ai_analysis_review_id ON public.ai_analysis(review_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_requires_review ON public.ai_analysis(requires_human_review) WHERE requires_human_review = true;

-- 5. Review Invitations
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.review_invitations(client_email);

-- 6. Audit & Events
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON public.audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_system_events_created_at ON public.system_events(created_at DESC);
