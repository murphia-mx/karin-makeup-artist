export interface SentimentDistribution {
  highly_positive: number;
  positive: number;
  neutral: number;
  negative: number;
  highly_negative: number;
}

export interface KeywordCount {
  keyword: string;
  count: number;
}

export interface AspectCount {
  aspect: string;
  count: number;
}

export interface AIExecutiveMetrics {
  total_analyzed: number;
  average_confidence: number;
  spam_detected: number;
  sentiment_distribution: Partial<SentimentDistribution>;
  top_keywords: KeywordCount[];
  top_positive_aspects: AspectCount[];
  top_negative_aspects: AspectCount[];
}

export interface AIHealthMetric {
  provider_name: string;
  model: string;
  total_requests: number;
  success_rate: number;
  avg_latency_ms: number;
  avg_tokens: number;
  last_analysis_at: string;
}

export interface AIAnalyticsFilters {
  startDate?: string;
  endDate?: string;
  serviceId?: string;
}
