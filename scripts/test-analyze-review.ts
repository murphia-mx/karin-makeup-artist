import { RuleEngine } from '../supabase/functions/analyze-review/ruleEngine.ts';
import { LLMGateway } from '../supabase/functions/_shared/llm/gateway.ts';
import { ReviewPayload, AIAnalysisResult } from '../supabase/functions/analyze-review/schema.ts';

// 1. Deno Mocking for local testing
(globalThis as any).Deno = {
  env: {
    get: (key: string) => {
      if (key === 'GEMINI_API_KEY') return process.env.GEMINI_API_KEY || '';
      return '';
    }
  }
};

async function testPipeline() {
  console.log("=== INICIANDO PRUEBA DEL MOTOR DE IA (Etapa 3) ===\n");

  const mockPayload: ReviewPayload = {
    type: 'INSERT',
    record: {
      id: 'test-uuid-1234',
      rating: 5,
      review_text: 'El trato fue excelente, las chicas de recepción me atendieron súper bien y el masaje me dejó como nueva. Sin duda volveré el mes que viene.',
      status: 'approved',
      created_at: new Date().toISOString()
    }
  };

  console.log("📝 Reseña de entrada:", mockPayload.record.review_text);
  console.log("\n⚙️ 1. Evaluando Rule Engine...");
  
  const ruleEvaluation = RuleEngine.evaluate(mockPayload);
  
  if (!ruleEvaluation.requiresAI) {
    console.log("✅ Rule Engine bloqueó la llamada (Determinístico):", ruleEvaluation.deterministicResult);
    return;
  }
  
  console.log("✅ Rule Engine autorizó el análisis profundo (requiresAI: true).");

  if (!process.env.GEMINI_API_KEY) {
    console.log("\n⚠️ ATENCIÓN: No se detectó GEMINI_API_KEY en el entorno local.");
    console.log("⚠️ Para hacer la petición real a Google, ejecuta este script de la siguiente manera:");
    console.log("   $env:GEMINI_API_KEY='tu_clave' ; npx tsx scripts/test-analyze-review.ts");
    
    console.log("\nSimulando respuesta exitosa del Gateway...");
    const mockResult: AIAnalysisResult = {
      sentiment: 'highly_positive',
      confidence_score: 0.98,
      keywords: ['trato', 'recepción', 'masaje', 'volveré'],
      topics: ['Atención al cliente', 'Masajes', 'Fidelización'],
      intent: 'recomendación_futura',
      tone: 'entusiasta',
      positive_aspects: ['Atención de recepción', 'Calidad del masaje'],
      negative_aspects: [],
      is_spam: false,
      spam_reason: '',
      toxicity_risk: false,
      requires_human_review: false,
      short_summary: 'Clienta muy satisfecha con el masaje y la atención en recepción. Planea volver.'
    };
    console.log("\n📊 Resultado Estructurado Final (Mock):\n", JSON.stringify(mockResult, null, 2));
    console.log("\n💾 (El Edge Function insertaría esto en 'ai_review_analysis' usando Supabase)");
    return;
  }

  console.log("\n🚀 2. Invocando LLM Gateway (Proveedor: Gemini)...");
  
  try {
    const provider = LLMGateway.getProvider({
      id: 'gemini-1',
      provider_name: 'gemini',
      api_url: 'https://generativelanguage.googleapis.com/v1beta/models'
    });

    const SYSTEM_PROMPT = `
Eres un analista experto en Experiencia del Cliente (CX) para Karin Workspace (un centro de estética premium).
Analiza la siguiente reseña y devuelve un JSON estricto con esta estructura exacta:
{
  "sentiment": "highly_positive" | "positive" | "neutral" | "negative" | "highly_negative",
  "confidence_score": 0.9,
  "keywords": ["word1", "word2"],
  "topics": ["topic1", "topic2"],
  "intent": "string",
  "tone": "string",
  "positive_aspects": ["string"],
  "negative_aspects": ["string"],
  "is_spam": false,
  "spam_reason": "",
  "toxicity_risk": false,
  "requires_human_review": false,
  "short_summary": "string"
}`;

    const startTime = Date.now();
    const llmResponse = await provider.generate({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: `Review Rating: ${mockPayload.record.rating}\nReview Text: ${mockPayload.record.review_text}`,
      model: 'gemini-1.5-flash',
      temperature: 0.1,
      responseFormat: 'json_object'
    });

    const duration = Date.now() - startTime;
    
    console.log(`✅ Respuesta recibida en ${duration}ms`);
    console.log(`📊 Tokens usados: ${llmResponse.usage.totalTokens} (Prompt: ${llmResponse.usage.promptTokens}, Completitud: ${llmResponse.usage.completionTokens})`);
    
    const parsedData = JSON.parse(llmResponse.content.replace(/```json/g, '').replace(/```/g, '').trim());
    console.log("\n📊 Resultado Estructurado Final (Real):\n", JSON.stringify(parsedData, null, 2));

  } catch (error: any) {
    console.error("\n❌ Error durante la ejecución del Pipeline:", error.message);
  }
}

testPipeline();
