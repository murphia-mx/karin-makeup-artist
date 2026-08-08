import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

export const useServicesQuery = () => {
  return useQuery({
    queryKey: ['invitation_services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('id, name')
        .eq('active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};
