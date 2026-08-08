import type { AIExecutiveMetrics, AIHealthMetric, AIAnalyticsFilters } from '../types/AIAnalytics';

export interface IAIAnalyticsRepository {
  getExecutiveMetrics(filters?: AIAnalyticsFilters): Promise<AIExecutiveMetrics>;
  getHealthMetrics(): Promise<AIHealthMetric[]>;
}
