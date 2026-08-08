-- ==========================================
-- 00020_workspace_cms_engine.sql
-- Migration for Public Content Engine Phase 1
-- ==========================================

-- 1. Add fields to workspace_config
ALTER TABLE public.workspace_config 
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'México',
  ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT 'MakeupArtist';

-- 2. Drop the simple JSONB previous_snapshot field since we're adding a full history table
ALTER TABLE public.workspace_config 
  DROP COLUMN IF EXISTS previous_snapshot;

-- 3. Create History Table
CREATE TABLE IF NOT EXISTS public.workspace_config_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_config_id UUID REFERENCES public.workspace_config(id) ON DELETE CASCADE NOT NULL,
    snapshot JSONB NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast retrieval of history
CREATE INDEX idx_workspace_config_history_workspace_id 
    ON public.workspace_config_history(workspace_config_id, created_at DESC);

-- RLS for history
ALTER TABLE public.workspace_config_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view history" 
    ON public.workspace_config_history FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_roles.user_id = auth.uid() 
            AND user_roles.role = 'admin'
        )
    );

-- 4. Trigger Function: Save History & Enforce 20-version limit
CREATE OR REPLACE FUNCTION public.trg_save_workspace_history()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.workspace_config_history (workspace_config_id, snapshot, created_by)
    VALUES (NEW.id, to_jsonb(OLD), NEW.last_updated_by);

    -- Enforce 20 versions max (delete oldest if we exceed 20)
    DELETE FROM public.workspace_config_history
    WHERE workspace_config_id = NEW.id
      AND id NOT IN (
          SELECT id 
          FROM public.workspace_config_history 
          WHERE workspace_config_id = NEW.id 
          ORDER BY created_at DESC 
          LIMIT 20
      );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Attach Trigger
DROP TRIGGER IF EXISTS trg_workspace_config_history_save ON public.workspace_config;
CREATE TRIGGER trg_workspace_config_history_save
    AFTER UPDATE ON public.workspace_config
    FOR EACH ROW
    WHEN (OLD.* IS DISTINCT FROM NEW.*)
    EXECUTE FUNCTION public.trg_save_workspace_history();

-- 6. Add to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_config_history;
