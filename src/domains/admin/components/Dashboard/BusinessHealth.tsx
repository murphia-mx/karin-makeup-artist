import { motion } from 'framer-motion';
import { useAIExecutiveMetrics } from '../../../analytics/hooks/useAIAnalytics';
import { Sparkles } from 'lucide-react';

export const BusinessHealth = () => {
  const { data: metrics, isLoading } = useAIExecutiveMetrics();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3 mb-8">
        <div className="h-10 bg-[#EBDDE2]/30 rounded-lg w-1/3"></div>
        <div className="h-4 bg-[#EBDDE2]/30 rounded-lg w-1/2"></div>
      </div>
    );
  }

  // Lógica conversacional basada en datos reales
  let mainGreeting = "Buenos días, Karin.";
  let statusMessage = "Hoy todo marcha muy bien.";
  let highlightsMessage = "";

  if (metrics && metrics.total_analyzed > 0) {
    const hasNegative = metrics.top_negative_aspects && metrics.top_negative_aspects.length > 0;
    const hasPositive = metrics.top_positive_aspects && metrics.top_positive_aspects.length > 0;
    const words = metrics.top_keywords && metrics.top_keywords.length > 0 ? metrics.top_keywords.slice(0, 2).map(k => k.keyword.toLowerCase()) : [];

    if (hasNegative && hasPositive) {
      statusMessage = "En general el negocio va muy bien.";
      highlightsMessage = words.length > 0 ? `La mayoría destaca tu ${words.join(' y ')}.` : "Tus clientas están satisfechas.";
    } else if (hasNegative && !hasPositive) {
      statusMessage = "Hay detalles importantes que requieren tu atención.";
      highlightsMessage = "Tus clientas recientes han dejado comentarios que debes leer.";
    } else if (hasPositive && !hasNegative) {
      statusMessage = "Hoy todo marcha de maravilla.";
      highlightsMessage = words.length > 0 ? `Las clientas siguen hablando maravillas de tu ${words.join(' y ')}.` : "Tus clientas aman tu trabajo.";
    }
  } else {
    statusMessage = "Aún estamos esperando que tus clientas comiencen a dejar sus reseñas.";
    highlightsMessage = "En cuanto tengamos algunas, aquí verás exactamente qué es lo que más aman de tu trabajo.";
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mb-10 relative z-10"
    >
      <h1 className="text-4xl md:text-5xl font-display font-light text-[#301C27] mb-3 tracking-wide">
        {mainGreeting}
      </h1>
      <div className="flex items-center gap-3">
        <Sparkles className="w-4 h-4 text-[#CF7F9B]" />
        <p className="text-base text-[#765E68] font-light tracking-wide">
          {statusMessage} <span className="text-[#301C27] font-medium">{highlightsMessage}</span>
        </p>
      </div>
    </motion.div>
  );
};
