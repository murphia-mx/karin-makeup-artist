import { LLMProvider } from './provider.ts';
import { GeminiProvider } from './gemini.ts';
import { GroqProvider } from './groq.ts';
import { AIProviderConfig } from '../types.ts';

export class LLMGateway {
  static getProvider(config: AIProviderConfig): LLMProvider {
    switch (config.provider_name.toLowerCase()) {
      case 'gemini':
        return new GeminiProvider(config.api_url);
      case 'groq':
        return new GroqProvider(config.api_url);
      case 'openai':
        throw new Error('OpenAI provider is defined in DB but not yet implemented in Gateway.');
      case 'anthropic':
        throw new Error('Anthropic provider is defined in DB but not yet implemented in Gateway.');
      default:
        throw new Error(`Unsupported LLM Provider: ${config.provider_name}`);
    }
  }
}
