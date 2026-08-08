export interface LLMRequest {
  systemPrompt: string;
  userPrompt: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json_object';
}

export interface LLMResponse {
  content: string;
  model: string; // Model that actually performed the inference
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface TelemetryEvent {
  executionId: string;
  analysisType: 'review_analysis' | 'executive_summary';
  targetId?: string | null;
  providerId?: string | null;
  model?: string | null;
  promptVersionId?: string | null;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  durationMs: number;
  status: 'success' | 'error' | 'rate_limit' | 'filtered_by_rule';
  errorMessage?: string;
}

export interface AIProviderConfig {
  id: string;
  provider_name: string;
  api_url: string;
}

export interface AIPromptConfig {
  id: string;
  provider_id: string;
  model: string;
  system_prompt: string;
  temperature: number;
  max_tokens: number;
}
