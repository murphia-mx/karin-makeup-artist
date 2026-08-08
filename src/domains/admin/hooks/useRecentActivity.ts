import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../types/database.types';

type SystemEvent = Database['public']['Tables']['system_events']['Row'];

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['recentActivity'],
    queryFn: async (): Promise<SystemEvent[]> => {
      const { data, error } = await supabase
        .from('system_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw new Error(error.message);
      return data as SystemEvent[];
    }
  });
};
