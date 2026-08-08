import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

// ==========================================
// 1. KPIs
// ==========================================
export interface AnalyticsKPIs {
  reviews: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    featured: number;
    verified: number;
  };
  rating: {
    average: number;
    trend: number;
  };
  services: {
    topRated: string | null;
    mostReviewed: string | null;
  };
  response: {
    avgApprovalHours: number;
    avgReplyHours: number;
  };
}

export const useAnalyticsKPIs = () => {
  return useQuery({
    queryKey: ['analytics', 'kpis'],
    queryFn: async (): Promise<AnalyticsKPIs> => {
      const { data, error } = await supabase.rpc('get_dashboard_kpis');
      if (error) throw new Error(error.message);
      return data as unknown as AnalyticsKPIs;
    }
  });
};

// ==========================================
// 2. Charts
// ==========================================
export interface AnalyticsCharts {
  starDistribution: { stars: number; count: number }[];
  monthlyTrend: { month: string; total: number; average: number }[];
  weeklyTrend: { week: string; approved: number; pending: number }[];
  services: { name: string; reviews: number; rating: number }[];
  approvalTrend: { week: string; approved: number; pending: number }[];
}

export const useAnalyticsCharts = () => {
  return useQuery({
    queryKey: ['analytics', 'charts'],
    queryFn: async (): Promise<AnalyticsCharts> => {
      const { data, error } = await supabase.rpc('get_dashboard_charts');
      if (error) throw new Error(error.message);
      return data as unknown as AnalyticsCharts;
    }
  });
};

// ==========================================
// 3. Business Insights
// ==========================================
export interface BusinessInsight {
  type: 'trend' | 'concentration' | 'quality' | 'alert' | 'system';
  importance: 'high' | 'medium' | 'low';
  icon: string;
  title: string;
  description: string;
  variation: number;
  metadata?: any;
}

export const useBusinessInsights = () => {
  return useQuery({
    queryKey: ['analytics', 'insights'],
    queryFn: async (): Promise<BusinessInsight[]> => {
      const { data, error } = await supabase.rpc('get_business_insights');
      if (error) throw new Error(error.message);
      return data as unknown as BusinessInsight[];
    }
  });
};
