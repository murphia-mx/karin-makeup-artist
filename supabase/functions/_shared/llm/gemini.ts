import { LLMProvider } from './provider.ts';
import { LLMRequest, LLMResponse } from '../types.ts';

export class GeminiProvider implements LLMProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiUrl: string) {
    this.apiKey = Deno.env.get('GEMINI_API_KEY') || '';
    // Expected default for apiUrl in DB: https://generativelanguage.googleapis.com/v1beta/models
    this.baseUrl = apiUrl;
    
    if (!this.apiKey) {
      console.warn('GEMINI_API_KEY is not set in the environment.');
    }
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    // Note: Gemini uses 'gemini-1.5-flash' or 'gemini-1.5-pro'
    // Sanitizing base URL and model name to prevent 404s due to whitespace
    const cleanBaseUrl = this.baseUrl.trim().replace(/\/+$/, '');
    const cleanModel = request.model.trim();
    
    // Using standard Google REST URL without query params for better parsing
    const endpoint = `${cleanBaseUrl}/${cleanModel}:generateContent`;
    
    // Strictly following Gemini REST API v1beta spec (camelCase)
    const payload = {
      systemInstruction: {
        parts: [{ text: request.systemPrompt }]
      },
      contents: [{
        role: "user",
        parts: [{ text: request.userPrompt }]
      }],
      generationConfig: {
        temperature: request.temperature ?? 0.0,
        maxOutputTokens: request.maxTokens ?? 1000,
        responseMimeType: request.responseFormat === 'json_object' ? 'application/json' : 'text/plain',
      }
    };

    console.log(`[GEMINI DIAGNOSTICS] PRE-FLIGHT REQUEST:`);
    console.log(`[GEMINI DIAGNOSTICS] Method: POST`);
    console.log(`[GEMINI DIAGNOSTICS] URL: ${endpoint}`);
    console.log(`[GEMINI DIAGNOSTICS] Model: ${cleanModel}`);
    console.log(`[GEMINI DIAGNOSTICS] Body:`, JSON.stringify(payload, null, 2));

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.apiKey.trim() // Official alternative to ?key= that prevents URL breaking
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[GEMINI DIAGNOSTICS] HTTP ${response.status} ${response.statusText}`);
      console.error(`[GEMINI DIAGNOSTICS] Raw Error Body: ${errorText}`);
      
      if (response.status === 404 && errorText.includes('not found')) {
        throw new Error(`Google Gemini API Error (404): El modelo '${cleanModel}' no existe o ha sido descontinuado por Google. Por favor, actualiza la configuración a un modelo soportado (ej. 'gemini-2.0-flash').`);
      }
      
      throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    // Extract response from Gemini payload
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Usage metadata
    const usageMetadata = data.usageMetadata || {};
    
    return {
      content,
      model: request.model, // Echoing the executed model
      usage: {
        promptTokens: usageMetadata.promptTokenCount || 0,
        completionTokens: usageMetadata.candidatesTokenCount || 0,
        totalTokens: usageMetadata.totalTokenCount || 0
      }
    };
  }
}
