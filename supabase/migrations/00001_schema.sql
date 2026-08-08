-- 00001_schema.sql
-- Description: Inicialización del esquema principal de la base de datos (Enums, Tablas, Constraints, Relaciones)

-- 2. ENUMS
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected', 'spam', 'flagged');
CREATE TYPE user_role_type AS ENUM ('admin', 'moderator');

-- 3. TABLAS CORE

-- USER ROLES (Reemplaza la dependencia estricta de auth.role())
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- references auth.users(id) via Supabase
    role user_role_type NOT NULL DEFAULT 'moderator',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SERVICES
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    short_name TEXT,
    description TEXT,
    short_description TEXT,
    icon TEXT,
    cover_image TEXT,
    duration_minutes INTEGER,
    price_from NUMERIC(10, 2),
    featured BOOLEAN NOT NULL DEFAULT false,
    popular BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- REVIEW INVITATIONS
CREATE TABLE review_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    used BOOLEAN NOT NULL DEFAULT false,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- REVIEWS
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    invitation_id UUID REFERENCES review_invitations(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    status review_status NOT NULL DEFAULT 'pending',
    
    -- Metadatos Extendidos
    verified BOOLEAN NOT NULL DEFAULT false,
    featured BOOLEAN NOT NULL DEFAULT false,
    
    -- Respuesta Administrativa
    admin_reply TEXT,
    admin_reply_at TIMESTAMPTZ,
    
    -- Trazabilidad de Tiempo
    published_at TIMESTAMPTZ,
    edited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- REVIEW MEDIA (Soporte para múltiples fotos por reseña)
CREATE TABLE review_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    url TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI ANALYSIS (Metadatos completos de procesamiento)
CREATE TABLE ai_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE UNIQUE,
    
    -- Trazabilidad del modelo
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    version TEXT NOT NULL,
    
    -- Métricas de procesamiento
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processing_time_ms INTEGER NOT NULL,
    
    -- Resultados Estructurales
    sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    summary TEXT,
    emotion TEXT,
    language TEXT,
    
    -- Arrays JSON para flexibilidad sin perder estructura
    topics JSONB DEFAULT '[]'::jsonb,
    keywords JSONB DEFAULT '[]'::jsonb,
    
    -- Puntuaciones de Calidad
    spam_score NUMERIC(4,3) CHECK (spam_score >= 0 AND spam_score <= 1),
    toxicity_score NUMERIC(4,3) CHECK (toxicity_score >= 0 AND toxicity_score <= 1),
    confidence_score NUMERIC(4,3) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    
    -- Decisiones
    requires_human_review BOOLEAN NOT NULL DEFAULT false,
    final_decision review_status
);

-- REVIEW KEYWORDS (Para análisis relacional rápido)
CREATE TABLE review_keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AUDIT LOGS (Trazabilidad Administrativa)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SYSTEM EVENTS (Alimenta el Activity Timeline del Dashboard de forma ligera)
CREATE TABLE system_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ANALYTICS SNAPSHOTS (Histórico de Rendimiento Diario)
CREATE TABLE analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_date DATE NOT NULL UNIQUE,
    total_reviews INTEGER NOT NULL DEFAULT 0,
    average_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
    pending_reviews INTEGER NOT NULL DEFAULT 0,
    verified_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
