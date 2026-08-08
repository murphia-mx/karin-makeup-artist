/**
 * Review Domain Types
 * Fully decoupled from infrastructure and strictly typed to match the SQL schema.
 */

export const REVIEW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SPAM: 'spam',
  FLAGGED: 'flagged'
} as const;

export type ReviewStatus = typeof REVIEW_STATUS[keyof typeof REVIEW_STATUS];
export type Sentiment = 'positive' | 'negative' | 'neutral';

export interface ReviewMedia {
  id: string; // UUID
  review_id: string; // UUID
  storage_path: string;
  url: string;
  order_index: number;
  created_at: string; // ISO 8601
}

export type DetailedSentiment = 'highly_positive' | 'positive' | 'neutral' | 'negative' | 'highly_negative';

export interface AITelemetry {
  id: string;
  provider_id: string | null;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  duration_ms: number;
  status: 'success' | 'error' | 'rate_limit' | 'filtered_by_rule';
  created_at: string;
}

export interface AIReviewAnalysis {
  id: string;
  review_id: string;
  sentiment: DetailedSentiment | null;
  confidence_score: number | null;
  keywords: string[];
  topics: string[];
  intent: string | null;
  tone: string | null;
  positive_aspects: string[];
  negative_aspects: string[];
  is_spam: boolean;
  spam_reason: string | null;
  analyzed_at: string;
  telemetry_id: string | null;
  
  // Nested relation from Supabase
  ai_telemetry?: AITelemetry | null;
}

export interface Review {
  // Core fields matching table columns exactly
  id: string; // UUID
  service_id: string; // UUID (FK to services)
  invitation_id: string | null; // UUID (FK to invitations)
  client_name: string;
  rating: number; // 1 to 5
  review_text: string;
  status: ReviewStatus;
  verified: boolean;
  featured: boolean;
  admin_reply: string | null;
  admin_reply_at: string | null;
  published_at: string | null;
  edited_at: string | null;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  
  // Relational Data from Supabase Joins (Read Only)
  services?: {
    name: string;
    slug: string;
  } | null;
  
  review_media?: ReviewMedia[];
  ai_review_analysis?: AIReviewAnalysis | null;
}

export type ReviewInsertPayload = Omit<
  Review,
  | 'created_at'
  | 'updated_at'
  | 'admin_reply'
  | 'admin_reply_at'
  | 'published_at'
  | 'edited_at'
  | 'services'
  | 'review_media'
  | 'ai_review_analysis'
>;
