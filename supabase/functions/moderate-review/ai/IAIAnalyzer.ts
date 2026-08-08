export type Sentiment = 'positive' | 'negative' | 'neutral';

export interface AIAnalysisResult {
  sentiment: Sentiment;
  spam_score: number;
  confidence_score: number;
  toxicity_score: number;
  detected_language: string;
  reasoning: string;
  keywords: string[];
  flags: {
    contains_links: boolean;
    contains_phone: boolean;
    contains_personal_information: boolean;
    requires_human_review: boolean;
  };
  final_decision: 'approved' | 'rejected' | 'flagged';
}

export interface IAIAnalyzer {
  /**
   * The name of the AI provider (e.g. 'openai', 'anthropic')
   */
  readonly providerName: string;

  /**
   * The specific model used (e.g. 'gpt-4o-mini')
   */
  readonly modelName: string;

  /**
   * Analyzes the review text and returns structured metadata.
   */
  analyzeReview(text: string): Promise<AIAnalysisResult>;
}
