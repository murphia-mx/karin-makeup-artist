import { ReviewPayload, AIAnalysisResult } from './schema.ts';

export class RuleEngine {
  static evaluate(payload: ReviewPayload): { requiresAI: boolean; deterministicResult?: Partial<AIAnalysisResult> } {
    const { review_text, rating } = payload.record;

    // Rule 1: No comment or extremely short comment
    if (!review_text || review_text.trim().length < 5) {
      return {
        requiresAI: false,
        deterministicResult: {
          sentiment: rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative',
          confidence_score: 1.0,
          keywords: [],
          topics: ['rating_only'],
          intent: 'feedback',
          tone: 'neutral',
          positive_aspects: [],
          negative_aspects: [],
          is_spam: false,
          spam_reason: '',
          toxicity_risk: false,
          requires_human_review: false,
          short_summary: 'Reseña sin comentario detallado.'
        }
      };
    }

    // Rule 2: Basic Spam / Toxicity Detection (Deterministic fast-path)
    const toxicWords = ['fraude', 'estafa', 'mierda', 'basura'];
    const lowerComment = review_text.toLowerCase();
    const hasToxicWords = toxicWords.some(word => lowerComment.includes(word));
    
    if (hasToxicWords) {
      return {
        requiresAI: true, // Still send to AI for deep analysis, but we already know it's risky
        deterministicResult: {
          toxicity_risk: true,
          requires_human_review: true,
          is_spam: false
        }
      };
    }

    // Rule 3: URL Spam Detection
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    if (urlPattern.test(review_text)) {
      return {
        requiresAI: false,
        deterministicResult: {
          sentiment: 'negative',
          confidence_score: 1.0,
          keywords: ['spam', 'url'],
          topics: ['spam'],
          intent: 'spam',
          tone: 'spam',
          positive_aspects: [],
          negative_aspects: [],
          is_spam: true,
          spam_reason: 'Contiene enlaces externos sospechosos',
          toxicity_risk: false,
          requires_human_review: true,
          short_summary: 'Posible bot de spam publicitario.'
        }
      };
    }

    return { requiresAI: true };
  }
}
