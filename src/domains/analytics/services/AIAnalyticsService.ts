import type { IAIAnalyticsRepository } from '../repositories/IAIAnalyticsRepository';
import type { AIExecutiveMetrics, AIHealthMetric, AIAnalyticsFilters } from '../types/AIAnalytics';

export class AIAnalyticsService {
  private repository: IAIAnalyticsRepository;

  constructor(repository: IAIAnalyticsRepository) {
    this.repository = repository;
  }

  async getExecutiveMetrics(filters?: AIAnalyticsFilters): Promise<AIExecutiveMetrics> {
    try {
      return await this.repository.getExecutiveMetrics(filters);
    } catch (error) {
      console.error('AIAnalyticsService.getExecutiveMetrics error:', error);
      throw error;
    }
  }

  async getHealthMetrics(): Promise<AIHealthMetric[]> {
    try {
      return await this.repository.getHealthMetrics();
    } catch (error) {
      console.error('AIAnalyticsService.getHealthMetrics error:', error);
      throw error;
    }
  }
}
