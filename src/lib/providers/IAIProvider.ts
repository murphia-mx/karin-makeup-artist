/**
 * AI Provider Interface (Dependency Inversion)
 * Ensures the system is completely decoupled from any specific AI provider.
 */

export interface AIAnalysisResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  tone: string; // e.g., 'enthusiastic', 'constructive', 'angry'
  strengths: string[];
  weaknesses: string[];
  tags: string[];
  spamRisk: number; // 0 to 1
  isSpam: boolean;
  suggestedFeatured: boolean;
  featureReason?: string;
  confidenceScore: number;
}

export interface IAIProvider {
  /**
   * Analyzes a review text and extracts intelligence based on the prompt context.
   */
  analyzeReviewText(reviewText: string): Promise<AIAnalysisResult>;
}
