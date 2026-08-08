import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { LLMGateway } from '../_shared/llm/gateway.ts'
import { TelemetryService } from '../_shared/telemetry.ts'
import { RuleEngine } from './ruleEngine.ts'
import { ReviewPayload, AIAnalysisResult } from './schema.ts'

// Ensure TypeScript doesn't complain about Deno global
declare const Deno: any;

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

const telemetryService = new TelemetryService();

// Default hardcoded for development, should ideally be fetched from `llm_providers` and `ai_prompts`
const SYSTEM_PROMPT = `
Eres un analista experto en Experiencia del Cliente (CX) para Karin Workspace (un centro de estética premium).
Analiza la siguiente reseña y devuelve un JSON estricto con esta estructura exacta:
{
  "sentiment": "highly_positive" | "positive" | "neutral" | "negative" | "highly_negative",
  "confidence_score": <number between 0 and 1>,
  "keywords": [<string array>],
  "topics": [<string array>],
  "intent": <string>,
  "tone": <string>,
  "positive_aspects": [<string array>],
  "negative_aspects": [<string array>],
  "is_spam": <boolean>,
  "spam_reason": <string>,
  "toxicity_risk": <boolean>,
  "requires_human_review": <boolean>,
  "short_summary": <string max 150 chars>
}
Si la reseña es vacía o incomprensible, asígnala como neutral y marca requires_human_review = true.
`;

Deno.serve(async (req: Request) => {
  const executionId = crypto.randomUUID();
  const startTime = Date.now();
  let payload: ReviewPayload | null = null;
  console.log(`[${executionId}] [START] Edge Function Invocada`);

  try {
    payload = await req.json() as ReviewPayload;
    console.log(`[${executionId}] [PAYLOAD RECEIVED]`, JSON.stringify(payload));
    
    // Only process inserts or updates where status became 'approved'
    if (!payload || !payload.record || !payload.record.review_text) {
      console.log(`[${executionId}] [VALIDATION FAILED] Payload doesn't contain a review_text to analyze.`);
      return new Response(JSON.stringify({ message: "No comment to analyze" }), { status: 200 });
    }
    console.log(`[${executionId}] [VALIDATION PASSED] ID: ${payload.record.id}`);

    // 1. Rule Engine Pre-Flight
    const ruleEvaluation = RuleEngine.evaluate(payload);
    console.log(`[${executionId}] [RULE ENGINE EVALUATED] requiresAI: ${ruleEvaluation.requiresAI}`);
    
    let analysisResult: Partial<AIAnalysisResult> = ruleEvaluation.deterministicResult || {};

    if (ruleEvaluation.requiresAI) {
      // 2. Fetch Active Provider Config from DB dynamically
      const { data: providerData, error: providerError } = await supabase
        .from('llm_providers')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .single();

      if (providerError || !providerData) {
        throw new Error('No active LLM provider found in the database. Please enable one in llm_providers.');
      }

      const providerConfig = {
        id: providerData.id,
        provider_name: providerData.provider_name,
        api_url: providerData.api_url
      };

      const provider = LLMGateway.getProvider(providerConfig);
      
      // Attempt to fetch model from ai_prompts or fallback based on provider
      let activeModel = 'llama-3.1-8b-instant'; // Default fallback for Groq
      if (providerConfig.provider_name.toLowerCase() === 'gemini') activeModel = 'gemini-2.0-flash';
      if (providerConfig.provider_name.toLowerCase() === 'openai') activeModel = 'gpt-4o-mini';

      const { data: promptData } = await supabase
        .from('ai_prompts')
        .select('model, id')
        .eq('name', 'review_analysis')
        .eq('is_active', true)
        .limit(1)
        .single();

      if (promptData?.model) {
        activeModel = promptData.model;
      }
      
      // 3. LLM Invocation
      console.log(`[${executionId}] [LLM CALLING] Provider: ${providerConfig.provider_name}, Model: ${activeModel}`);
      const llmResponse = await provider.generate({
        systemPrompt: SYSTEM_PROMPT,
        userPrompt: `Review Rating: ${payload.record.rating} Stars\nReview Text: ${payload.record.review_text}`,
        model: activeModel,
        temperature: 0.1, // Keep it deterministic
        responseFormat: 'json_object'
      });
      console.log(`[${executionId}] [LLM RESPONSE RECEIVED]`);

      // Update the active model from the actual response (dynamic propagation)
      activeModel = llmResponse.model || activeModel;

      // 4. Parse JSON Response safely
      try {
        console.log(`[${executionId}] [LLM PARSING] Starting JSON parse`);
        const rawText = llmResponse.content.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedAI = JSON.parse(rawText) as AIAnalysisResult;
        console.log(`[${executionId}] [LLM PARSED] Successful JSON parse`);
        
        // Merge AI result with any pre-determined rule results (e.g. toxicity risk)
        analysisResult = { ...parsedAI, ...analysisResult };

        // 5. Telemetry Logging
        console.log(`[${executionId}] [TELEMETRY] Logging success for LLM inference`);
        await telemetryService.logExecution({
          executionId,
          analysisType: 'review_analysis',
          targetId: payload.record.id,
          providerId: providerConfig.id,
          model: activeModel,
          promptVersionId: promptData?.id || null,
          promptTokens: llmResponse.usage.promptTokens,
          completionTokens: llmResponse.usage.completionTokens,
          totalTokens: llmResponse.usage.totalTokens,
          estimatedCostUsd: 0.0,
          durationMs: Date.now() - startTime,
          status: 'success'
        });

      } catch (parseError) {
        console.error(`[${executionId}] [LLM PARSE ERROR]`, parseError);
        throw new Error('LLM did not return a valid JSON format: ' + llmResponse.content);
      }
    } else {
      // Log deterministic bypass
      console.log(`[${executionId}] [TELEMETRY] Logging rule engine bypass`);
      await telemetryService.logExecution({
        executionId,
        analysisType: 'review_analysis',
        targetId: payload.record.id,
        providerId: null,
        model: 'deterministic',
        promptVersionId: null,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        estimatedCostUsd: 0.0,
        durationMs: Date.now() - startTime,
        status: 'filtered_by_rule'
      });
    }

    // 6. Persist to PostgreSQL
    console.log(`[${executionId}] [DB INSERT] Upserting to ai_review_analysis`);
    
    console.log("[PAYLOAD ID]", payload.record.id);
    console.log("[UPSERT OBJECT]", JSON.stringify({
      reviewId: payload.record.id,
      telemetryId: undefined, // Telemetry isn't directly bound here in the current schema
      sentiment: analysisResult.sentiment || 'neutral',
      keywords: analysisResult.keywords || []
    }, null, 2));

    const { error: dbError } = await supabase
      .from('ai_review_analysis')
      .upsert({
        review_id: payload.record.id,
        sentiment: analysisResult.sentiment || 'neutral',
        confidence_score: analysisResult.confidence_score || 1.0,
        keywords: analysisResult.keywords || [],
        topics: analysisResult.topics || [],
        intent: analysisResult.intent || '',
        tone: analysisResult.tone || '',
        positive_aspects: analysisResult.positive_aspects || [],
        negative_aspects: analysisResult.negative_aspects || [],
        is_spam: analysisResult.is_spam || false,
        spam_reason: analysisResult.spam_reason || ''
      }, { onConflict: 'review_id' });

    if (dbError) {
      console.error(`[${executionId}] [DB ERROR] upsert failed`, dbError);
      throw dbError;
    }

    console.log(`[${executionId}] [SUCCESS] Responding 200 OK`);
    return new Response(JSON.stringify({ 
      success: true, 
      method: ruleEvaluation.requiresAI ? 'LLM' : 'RuleEngine',
      result: analysisResult 
    }), { status: 200 });

  } catch (err: any) {
    // Error Handling & Telemetry
    console.error(`[${executionId}] [FATAL ERROR CATCH BLOCK] Name: ${err.name}, Message: ${err.message}`);
    console.error(`[${executionId}] [STACK TRACE]\n${err.stack}`);
    
    await telemetryService.logExecution({
      executionId,
      analysisType: 'review_analysis',
      targetId: payload?.record?.id || null,
      providerId: null,
      model: 'system_error', // Model cannot be null in DB, fallback string
      promptVersionId: null,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      estimatedCostUsd: 0.0,
      durationMs: Date.now() - startTime,
      status: 'error',
      errorMessage: err.message || 'Unknown error'
    });

    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
