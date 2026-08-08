import type { IAIProvider, AIAnalysisResult } from '../../../lib/providers/IAIProvider';
import { logger } from '../../../lib/observability/logger';
import { Features } from '../../../config/features.config';

/**
 * Domain Service for AI Moderation & Intelligence.
 * Depends on the abstracted IAIProvider.
 */
export class AIService {
  private aiProvider: IAIProvider;

  constructor(aiProvider: IAIProvider) {
    this.aiProvider = aiProvider;
  }

  /**
   * Evaluates a review using the injected AI Provider.
   * If AI is disabled via Feature Flags, returns a safe fallback.
   */
  async evaluateReview(reviewText: string): Promise<AIAnalysisResult> {
    const logContext = { domain: 'MODERATION' as const, action: 'evaluateReview' };

    if (!Features.enableAIModeration) {
      logger.warn('AI Moderation is disabled via feature flags. Returning fallback analysis.', logContext);
      return this.getFallbackAnalysis();
    }

    try {
      logger.info('Starting AI Review Evaluation', logContext);
      
      return await logger.trackPerformance('AI Analysis', logContext, async () => {
        const result = await this.aiProvider.analyzeReviewText(reviewText);
        
        if (result.spamRisk > 0.8) {
          logger.warn('High spam risk detected in review', { ...logContext, spamRisk: result.spamRisk });
        }
        
        return result;
      });
    } catch (error) {
      logger.error(error instanceof Error ? error : String(error), logContext);
      throw new Error('AI analysis failed. System must fallback to manual review.');
    }
  }

  private getFallbackAnalysis(): AIAnalysisResult {
    return {
      sentiment: 'neutral',
      tone: 'unknown',
      strengths: [],
      weaknesses: [],
      tags: [],
      spamRisk: 0,
      isSpam: false,
      suggestedFeatured: false,
      confidenceScore: 0,
    };
  }
}
