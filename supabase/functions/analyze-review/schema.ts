export interface ReviewPayload {
  record: {
    id: string;
    rating: number;
    review_text: string | null;
    status: string;
    created_at: string;
    [key: string]: any;
  };
  type: 'INSERT' | 'UPDATE';
}

export interface AIAnalysisResult {
  sentiment: 'highly_positive' | 'positive' | 'neutral' | 'negative' | 'highly_negative';
  confidence_score: number;
  keywords: string[];
  topics: string[];
  intent: string;
  tone: string;
  positive_aspects: string[];
  negative_aspects: string[];
  is_spam: boolean;
  spam_reason: string;
  // Requested extras mapped for future structural use
  toxicity_risk: boolean;
  requires_human_review: boolean;
  short_summary: string;
}

// Ensure TypeScript doesn't complain about Deno global in standard TS
declare const Deno: any;
