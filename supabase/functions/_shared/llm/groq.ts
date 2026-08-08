import { LLMProvider } from './provider.ts';
import { LLMRequest, LLMResponse } from '../types.ts';

export class GroqProvider implements LLMProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiUrl: string) {
    this.apiKey = Deno.env.get('GROQ_API_KEY') || '';
    // Expected default for apiUrl in DB: https://api.groq.com/openai/v1/chat/completions
    this.baseUrl = apiUrl.trim().replace(/\/+$/, '');
    
    if (!this.apiKey) {
      console.warn('GROQ_API_KEY is not set in the environment.');
    }
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    // Note: Groq models include 'llama-3.1-8b-instant', 'llama-3.1-70b-versatile', 'llama-3.3-70b-versatile'
    const endpoint = this.baseUrl;
    
    const payload: any = {
      model: request.model.trim(),
      messages: [
        {
          role: "system",
          content: request.systemPrompt
        },
        {
          role: "user",
          content: request.userPrompt
        }
      ],
      temperature: request.temperature ?? 0.0,
      max_tokens: request.maxTokens ?? 1000
    };

    if (request.responseFormat === 'json_object') {
      payload.response_format = { type: 'json_object' };
    }

    console.log(`[GROQ DIAGNOSTICS] PRE-FLIGHT REQUEST:`);
    console.log(`[GROQ DIAGNOSTICS] Method: POST`);
    console.log(`[GROQ DIAGNOSTICS] URL: ${endpoint}`);
    console.log(`[GROQ DIAGNOSTICS] Model: ${payload.model}`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey.trim()}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[GROQ DIAGNOSTICS] HTTP ${response.status} ${response.statusText}`);
      console.error(`[GROQ DIAGNOSTICS] Raw Error Body: ${errorText}`);
      
      if (response.status === 400 && (errorText.includes('decommissioned') || errorText.includes('does not exist'))) {
        throw new Error(`Google/Groq API Error (400): El modelo '${payload.model}' ha sido descontinuado o no existe. Por favor, actualiza a un modelo soportado (ej. 'llama-3.1-8b-instant').`);
      }
      
      throw new Error(`Groq API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    // Extract response from Groq OpenAI-compatible payload
    const content = data.choices?.[0]?.message?.content || '';
    
    // Usage metadata
    const usage = data.usage || {};
    
    return {
      content,
      model: data.model || payload.model, // Echoing the actual executed model
      usage: {
        promptTokens: usage.prompt_tokens || 0,
        completionTokens: usage.completion_tokens || 0,
        totalTokens: usage.total_tokens || 0
      }
    };
  }
}
