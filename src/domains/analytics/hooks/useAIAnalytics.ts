import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { AIAnalyticsService } from '../services/AIAnalyticsService';
import { SupabaseAIAnalyticsRepository } from '../repositories/SupabaseAIAnalyticsRepository';
import type { AIAnalyticsFilters } from '../types/AIAnalytics';

const repository = new SupabaseAIAnalyticsRepository();
const service = new AIAnalyticsService(repository);

export const useAIExecutiveMetrics = (filters?: AIAnalyticsFilters) => {
  return useQuery({
    queryKey: ['ai-executive-metrics', filters],
    queryFn: () => service.getExecutiveMetrics(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    // keepPreviousData: true is deprecated in v5, placeholderData: keepPreviousData can be used, but let's stick to default for now
  });
};

export const useAIHealthMetrics = () => {
  return useQuery({
    queryKey: ['ai-health-metrics'],
    queryFn: () => service.getHealthMetrics(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// ==========================================
// AI Business Advisor
// ==========================================
export interface AdvisorObservation {
  type: 'good_news' | 'needs_review' | 'opportunity';
  priority: 'high' | 'medium' | 'low';
  title: string;
  what_we_saw: string;
  what_we_recommend: string;
  evidence_count: number;
}

export interface AdvisorPayload {
  hero_greeting: string;
  hero_action: string;
  items: AdvisorObservation[];
}

export interface AdvisorReport {
  id?: string;
  status: 'success' | 'insufficient_data';
  period_start?: string;
  period_end?: string;
  total_reviews_analyzed?: number;
  observations?: AdvisorPayload;
  created_at?: string;
  snapshot_generated_at?: string;
  snapshot_signature?: string;
  current_signature?: string;
  is_stale?: boolean;
  current_reviews?: number;
  minimum_required?: number;
  message?: string;
}

export const useAiAdvisor = () => {
  return useQuery({
    queryKey: ['ai-advisor', 'latest'],
    queryFn: async (): Promise<AdvisorReport | null> => {
      const { data, error } = await supabase.rpc('get_latest_advisor_report');
      if (error) throw new Error(error.message);
      return data as unknown as AdvisorReport | null;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    // Removed refetchInterval: Sincronización Realtime se encarga de esto vía WebSockets
  });
};

export const useGenerateAdvisorReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-advisor-report');
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-advisor', 'latest'] });
    }
  });
};
