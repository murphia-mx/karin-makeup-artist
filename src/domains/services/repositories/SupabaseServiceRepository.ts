import { supabase } from '../../../lib/supabase';
import type { IServiceRepository } from './IServiceRepository';
import type { Service } from '../types/Service';

export class SupabaseServiceRepository implements IServiceRepository {
  async getActiveServices(): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true });

    if (error) throw new Error(`Failed to fetch active services: ${error.message}`);
    return data as unknown as Service[];
  }

  async getServiceById(id: string): Promise<Service | null> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch service by id: ${error.message}`);
    }
    return data as unknown as Service;
  }

  async getServiceBySlug(slug: string): Promise<Service | null> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch service by slug: ${error.message}`);
    }
    return data as unknown as Service;
  }
}
