import { LLMRequest, LLMResponse } from '../types.ts';

export interface LLMProvider {
  generate(request: LLMRequest): Promise<LLMResponse>;
}
