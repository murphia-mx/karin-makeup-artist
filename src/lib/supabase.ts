import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// These environment variables will be required in production
// For now, they can be empty strings to allow the build to pass before configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_anon_key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * Untyped Supabase client for workspace tables (workspace_config, landing_config, etc.)
 * that are not yet reflected in the generated database.types.ts.
 * Once types are regenerated after migration, switch back to the typed client.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseAny = supabase as any;

