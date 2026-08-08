-- =========================================================================================
-- MIGRATION: 00010_ai_intelligence_engine.sql
-- DESCRIPTION: Enterprise-grade architecture for AI processing, telemetry, and queuing.
-- =========================================================================================

-- 1. FEATURE FLAGS
CREATE TABLE IF NOT EXISTS public.ai_feature_flags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feature_name TEXT NOT NULL UNIQUE,
    is_enabled BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. LLM PROVIDERS
CREATE TABLE IF NOT EXISTS public.llm_providers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_name TEXT NOT NULL UNIQUE, -- 'openai', 'anthropic', 'gemini'
    is_active BOOLEAN DEFAULT true,
    api_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. AI PROMPTS (Version Control)
CREATE TABLE IF NOT EXISTS public.ai_prompts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL, -- e.g., 'review_analysis', 'executive_summary'
    version TEXT NOT NULL, -- e.g., '1.0', '1.1'
    provider_id UUID REFERENCES public.llm_providers(id),
    model TEXT NOT NULL, -- e.g., 'gpt-4o-mini'
    system_prompt TEXT NOT NULL,
    temperature NUMERIC DEFAULT 0.0,
    max_tokens INTEGER DEFAULT 1000,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(name, version)
);

-- 4. AI TELEMETRY (Observability & Billing)
CREATE TABLE IF NOT EXISTS public.ai_telemetry (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    execution_id UUID NOT NULL,
    analysis_type TEXT NOT NULL,
    target_id UUID, -- References review_id or executive_summary_id loosely
    provider_id UUID REFERENCES public.llm_providers(id),
    model TEXT NOT NULL,
    prompt_version_id UUID REFERENCES public.ai_prompts(id),
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    estimated_cost_usd NUMERIC DEFAULT 0.0,
    duration_ms INTEGER DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('success', 'error', 'rate_limit', 'filtered_by_rule')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. AI REVIEW ANALYSIS (Granular insights)
CREATE TABLE IF NOT EXISTS public.ai_review_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE UNIQUE NOT NULL,
    sentiment TEXT CHECK (sentiment IN ('highly_positive', 'positive', 'neutral', 'negative', 'highly_negative')),
    confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
    keywords TEXT[] DEFAULT '{}',
    topics TEXT[] DEFAULT '{}',
    intent TEXT,
    tone TEXT,
    positive_aspects TEXT[] DEFAULT '{}',
    negative_aspects TEXT[] DEFAULT '{}',
    is_spam BOOLEAN DEFAULT false,
    spam_reason TEXT,
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    telemetry_id UUID REFERENCES public.ai_telemetry(id)
);

-- 6. AI EXECUTIVE SUMMARIES (Macro Insights)
CREATE TABLE IF NOT EXISTS public.ai_executive_summaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed')),
    executive_summary TEXT,
    strengths TEXT[] DEFAULT '{}',
    weaknesses TEXT[] DEFAULT '{}',
    opportunities TEXT[] DEFAULT '{}',
    risks TEXT[] DEFAULT '{}',
    business_recommendations TEXT[] DEFAULT '{}',
    marketing_recommendations TEXT[] DEFAULT '{}',
    alerts TEXT[] DEFAULT '{}',
    analyzed_reviews_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    telemetry_id UUID REFERENCES public.ai_telemetry(id)
);

-- 7. AI JOBS QUEUE (Asynchronous processing)
CREATE TABLE IF NOT EXISTS public.ai_jobs_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_type TEXT NOT NULL, -- 'analyze_review', 'reprocess_bulk', 'generate_summary'
    payload JSONB NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    attempts INTEGER DEFAULT 0,
    last_error TEXT,
    locked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- =========================================================================================
-- UPDATED_AT TRIGGERS
-- =========================================================================================
CREATE TRIGGER set_ai_feature_flags_updated_at BEFORE UPDATE ON public.ai_feature_flags FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
CREATE TRIGGER set_ai_jobs_queue_updated_at BEFORE UPDATE ON public.ai_jobs_queue FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

-- =========================================================================================
-- RLS POLICIES (Secure by default)
-- =========================================================================================

-- Enable RLS on all tables
ALTER TABLE public.ai_feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_review_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_executive_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_jobs_queue ENABLE ROW LEVEL SECURITY;

-- 1. ai_feature_flags (Admins read/write)
CREATE POLICY "Admins can view AI flags" ON public.ai_feature_flags FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Service Role can manage AI flags" ON public.ai_feature_flags TO service_role USING (true) WITH CHECK (true);

-- 2. llm_providers (Admins read, Service Role write)
CREATE POLICY "Admins can view LLM providers" ON public.llm_providers FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Service Role can manage LLM providers" ON public.llm_providers TO service_role USING (true) WITH CHECK (true);

-- 3. ai_prompts (Admins read, Service Role write)
CREATE POLICY "Admins can view AI prompts" ON public.ai_prompts FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Service Role can manage AI prompts" ON public.ai_prompts TO service_role USING (true) WITH CHECK (true);

-- 4. ai_telemetry (Admins read, Service Role write)
CREATE POLICY "Admins can view AI telemetry" ON public.ai_telemetry FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Service Role can manage AI telemetry" ON public.ai_telemetry TO service_role USING (true) WITH CHECK (true);

-- 5. ai_review_analysis (Admins read, Service Role write)
CREATE POLICY "Admins can view AI review analysis" ON public.ai_review_analysis FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Service Role can manage AI review analysis" ON public.ai_review_analysis TO service_role USING (true) WITH CHECK (true);

-- 6. ai_executive_summaries (Admins read, Service Role write)
CREATE POLICY "Admins can view AI executive summaries" ON public.ai_executive_summaries FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Service Role can manage AI executive summaries" ON public.ai_executive_summaries TO service_role USING (true) WITH CHECK (true);

-- 7. ai_jobs_queue (Service Role ONLY)
CREATE POLICY "Service Role full access to jobs queue" ON public.ai_jobs_queue TO service_role USING (true) WITH CHECK (true);

-- =========================================================================================
-- INITIAL SEED DATA
-- =========================================================================================

-- Insert default Feature Flags
INSERT INTO public.ai_feature_flags (feature_name, is_enabled, description) VALUES
('review_analysis', true, 'Analiza automáticamente cada reseña aprobada.'),
('executive_summary', true, 'Genera resúmenes ejecutivos globales periódicamente.'),
('semantic_search', false, 'Habilita la búsqueda por vectores (embeddings).'),
('suggested_replies', false, 'Sugiere respuestas administrativas basadas en tono de marca.');

-- Insert default LLM Providers
INSERT INTO public.llm_providers (provider_name, is_active, api_url) VALUES
('openai', true, 'https://api.openai.com/v1/chat/completions'),
('anthropic', false, 'https://api.anthropic.com/v1/messages'),
('gemini', false, 'https://generativelanguage.googleapis.com/v1beta/models');
