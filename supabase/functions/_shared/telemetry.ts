import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { TelemetryEvent } from './types.ts'

export class TelemetryService {
  private supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  private supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  private supabase = createClient(this.supabaseUrl, this.supabaseServiceKey);

  async logExecution(event: TelemetryEvent): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('ai_telemetry')
        .insert({
          execution_id: event.executionId,
          analysis_type: event.analysisType,
          target_id: event.targetId,
          provider_id: event.providerId,
          model: event.model,
          prompt_version_id: event.promptVersionId,
          prompt_tokens: event.promptTokens,
          completion_tokens: event.completionTokens,
          total_tokens: event.totalTokens,
          estimated_cost_usd: event.estimatedCostUsd,
          duration_ms: event.durationMs,
          status: event.status,
          error_message: event.errorMessage
        });

      if (error) {
        console.error('Failed to log telemetry:', error.message);
      }
    } catch (e) {
      console.error('Exception during telemetry logging:', e);
    }
  }

  // Gemini is currently free under certain limits, we record $0
  calculateCost(provider: string, model: string, promptTokens: number, completionTokens: number): number {
    if (provider === 'gemini') {
      return 0.0;
    }
    // Future placeholders for OpenAI/Anthropic pricing
    return 0.0;
  }
}
