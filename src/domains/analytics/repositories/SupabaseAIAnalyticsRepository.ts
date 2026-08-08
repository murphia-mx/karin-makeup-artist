import { supabase } from '../../../lib/supabase';
import type { IAIAnalyticsRepository } from './IAIAnalyticsRepository';
import type { AIExecutiveMetrics, AIHealthMetric, AIAnalyticsFilters } from '../types/AIAnalytics';

export class SupabaseAIAnalyticsRepository implements IAIAnalyticsRepository {
  async getExecutiveMetrics(filters?: AIAnalyticsFilters): Promise<AIExecutiveMetrics> {
    const { data, error } = await (supabase as any).rpc('get_ai_executive_metrics', {
      start_date: filters?.startDate || null,
      end_date: filters?.endDate || null,
      p_service_id: filters?.serviceId || null,
    });

    if (error) {
      throw new Error(`Failed to fetch AI executive metrics: ${error.message}`);
    }

    return data as AIExecutiveMetrics;
  }

  async getHealthMetrics(): Promise<AIHealthMetric[]> {
    const { data, error } = await (supabase as any)
      .from('ai_health_view')
      .select('*');

    if (error) {
      throw new Error(`Failed to fetch AI health metrics: ${error.message}`);
    }

    return data as AIHealthMetric[];
  }
}
