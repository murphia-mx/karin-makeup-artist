import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { LLMGateway } from '../_shared/llm/gateway.ts'
import { corsHeaders } from '../_shared/cors.ts'

// Ensure TypeScript doesn't complain about Deno global
declare const Deno: any;

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

const SYSTEM_PROMPT = `
Eres la Asesora Ejecutiva de Negocios de Karin Workspace (un centro de estética premium).
Tu objetivo es leer métricas estadísticas y observaciones pasadas para darle a Karin tranquilidad, claridad y una única acción diaria.

REGLAS ABSOLUTAS DE TONO:
1. PROHIBIDO USAR: "implementar estrategias", "optimizar procesos", "fortalecer capacidades", "maximizar resultados", "programa de capacitación", "desarrollar un plan", "percepción negativa del servicio", "mejorar la experiencia".
2. Habla como una compañera de trabajo. Cercana, humana, natural.
3. Transmite CALMA. No seas alarmista ni excesivamente optimista. Si hay un problema grave, dilo con tacto ("Varias clientas coinciden... Conviene actuar cuanto antes").
4. No uses párrafos. Explicaciones de 1 oración.

REGLA DE MEMORIA (MUY IMPORTANTE):
Recibirás el "REPORTE ANTERIOR". Debes analizar si un problema previo desapareció (y felicitarla), si un problema persiste (y alertar que es una tendencia), o si algo bueno se mantiene. Menciónalo explícitamente.

ESTRUCTURA DE RESPUESTA JSON:
{
  "hero_greeting": "El mensaje principal. Ej: '🌸 Hola Karin. Hoy todo marcha bastante bien. Solo encontré una cosa que vale la pena revisar...'",
  "hero_action": "La única acción clara que debe hacer hoy. Corta y directa.",
  "observations": [
    {
      "type": "good_news" | "needs_review" | "opportunity",
      "priority": "high" | "medium" | "low",
      "title": "Un título conversacional",
      "what_we_saw": "Lo que vimos (1 oración).",
      "what_we_recommend": "Lo que recomendamos (1 acción práctica).",
      "evidence_count": <número>
    }
  ]
}
Nota: Genera máximo 3 observaciones. Las observaciones deben ordenar lo bueno primero, luego lo que requiere revisión, luego oportunidades.
`;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const { data: snapRev, error: reviewsErr } = await supabase
      .from('reviews')
      .select('rating, created_at')
      .eq('status', 'approved');
    if (reviewsErr) throw reviewsErr;
    const snapshotReviews = snapRev || [];

    const curr_total = snapshotReviews.length;
    if (curr_total < 3) {
      return new Response(JSON.stringify({
        status: "insufficient_data",
        minimum_required: 3,
        current_reviews: curr_total,
        message: "Todavía no hay suficientes opiniones para generar una asesoría confiable."
      }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const { data: currentMetrics, error: currErr } = await supabase.rpc('get_ai_executive_metrics', {
      start_date: thirtyDaysAgo.toISOString(),
      end_date: now.toISOString()
    });
    if (currErr) throw currErr;

    const { data: prevMetrics, error: prevErr } = await supabase.rpc('get_ai_executive_metrics', {
      start_date: sixtyDaysAgo.toISOString(),
      end_date: thirtyDaysAgo.toISOString()
    });
    if (prevErr) throw prevErr;

    const { data: lastReport, error: lrErr } = await supabase
      .from('ai_advisor_reports')
      .select('observations')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (lrErr) throw lrErr;

    const curr_avg = curr_total > 0 ? (snapshotReviews.reduce((acc: number, r: any) => acc + r.rating, 0) / curr_total).toFixed(2) : 0;
    const curr_positive = snapshotReviews.filter((r: any) => r.rating >= 4).length;
    const curr_negative = snapshotReviews.filter((r: any) => r.rating <= 3).length;
    const sortedDates = snapshotReviews.map((r: any) => new Date(r.created_at).getTime()).sort((a: number, b: number) => b - a);
    const curr_latest = sortedDates.length > 0 ? new Date(sortedDates[0]).toISOString() : null;

    let context = `--- ALCANCE DEL ANÁLISIS (ESTADO ACTUAL DEL NEGOCIO) ---\n`;
    context += `Este análisis está basado en ${curr_total} opiniones aprobadas.\n`;
    context += `Calificación promedio general: ${curr_avg}/5.0\n`;
    context += `Opiniones positivas: ${curr_positive} | Opiniones negativas/regulares: ${curr_negative}\n\n`;

    context += `--- DATOS DEL PERIODO ACTUAL (Últimos 30 días) ---\n`;
    context += JSON.stringify(currentMetrics, null, 2);
    context += `\n\n--- DATOS DEL PERIODO ANTERIOR (31 a 60 días atrás) ---\n`;
    context += JSON.stringify(prevMetrics, null, 2);
    
    if (lastReport && lastReport.observations) {
      context += `\n\n--- REPORTE ANTERIOR (MEMORIA DE LA IA) ---\n`;
      context += `Estas fueron tus conclusiones la última vez. Úsalas para comparar e identificar si los problemas persisten o desaparecieron.\n`;
      context += JSON.stringify(lastReport.observations, null, 2);
    }

    const { data: providerData, error: providerError } = await supabase
      .from('llm_providers')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .single();
    if (providerError || !providerData) throw new Error('No active LLM provider found.');

    const provider = LLMGateway.getProvider({
      id: providerData.id,
      provider_name: providerData.provider_name,
      api_url: providerData.api_url
    });

    const llmResponse = await provider.generate({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: context,
      model: providerData.provider_name.toLowerCase() === 'groq' ? 'llama-3.1-8b-instant' : 'gpt-4o-mini',
      temperature: 0.2, 
      responseFormat: 'json_object'
    });

    const cleanText = llmResponse.content.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanText);
    const payload = {
      hero_greeting: parsedData.hero_greeting,
      hero_action: parsedData.hero_action,
      items: parsedData.observations || []
    };

    // Obtain the exact cryptographic signature at the moment of generating the report
    const { data: currentSignature, error: sigErr } = await supabase.rpc('get_reviews_signature');
    if (sigErr) throw sigErr;

    const totalAnalyzed = currentMetrics?.total_analyzed || 0;
    const { error: insertError } = await supabase
      .from('ai_advisor_reports')
      .insert({
        period_start: thirtyDaysAgo.toISOString(),
        period_end: now.toISOString(),
        total_reviews_analyzed: totalAnalyzed,
        observations: payload, 
        snapshot_total_reviews: curr_total,
        snapshot_average_rating: curr_avg,
        snapshot_positive_reviews: curr_positive,
        snapshot_negative_reviews: curr_negative,
        snapshot_latest_review_at: curr_latest,
        snapshot_signature: currentSignature,
        snapshot_generated_at: now.toISOString()
      });
    if (insertError) throw insertError;

    return new Response(JSON.stringify({ success: true }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (err: any) {
    console.error(`[ERROR]`, err);
    return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
