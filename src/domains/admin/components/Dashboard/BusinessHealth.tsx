import { motion } from 'framer-motion';
import { useAIExecutiveMetrics } from '../../../analytics/hooks/useAIAnalytics';

export const BusinessHealth = () => {
  const { data: metrics, isLoading } = useAIExecutiveMetrics();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2 mb-10">
        <div className="h-8 bg-admin-surface-2 rounded-lg w-1/4"></div>
        <div className="h-4 bg-admin-surface-2 rounded w-1/3"></div>
      </div>
    );
  }

  // Lógica conversacional basada en datos reales
  const mainGreeting = "Buenos días, Karin.";
  let statusMessage = "Hoy todo marcha muy bien.";
  let highlightsMessage = "";

  if (metrics && metrics.total_analyzed > 0) {
    const hasNegative = metrics.top_negative_aspects && metrics.top_negative_aspects.length > 0;
    const hasPositive = metrics.top_positive_aspects && metrics.top_positive_aspects.length > 0;
    const words = metrics.top_keywords && metrics.top_keywords.length > 0 ? metrics.top_keywords.slice(0, 2).map(k => k.keyword.toLowerCase()) : [];

    if (hasNegative && hasPositive) {
      statusMessage = "El negocio mantiene un buen ritmo.";
      highlightsMessage = words.length > 0 ? `Tus clientas destacan tu ${words.join(' y ')}.` : "Tus clientas están satisfechas.";
    } else if (hasNegative && !hasPositive) {
      statusMessage = "Hay detalles que requieren tu atención.";
      highlightsMessage = "Revisa los últimos comentarios de tus clientas.";
    } else if (hasPositive && !hasNegative) {
      statusMessage = "Todo marcha de maravilla.";
      highlightsMessage = words.length > 0 ? `Las clientas siguen amando tu ${words.join(' y ')}.` : "Excelente satisfacción general.";
    }
  } else {
    statusMessage = "A la espera de nuevas reseñas.";
    highlightsMessage = "Pronto tendrás insights detallados.";
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mb-8"
    >
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-[32px] md:text-[40px] font-bold text-admin-text tracking-tight leading-tight">
          {mainGreeting} <span className="text-admin-accent-light">✨</span>
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-admin-surface-2 rounded-full border border-admin-accent-soft">
          <div className="w-1.5 h-1.5 rounded-full bg-admin-accent-dark animate-pulse"></div>
          <p className="text-[13px] text-admin-accent-dark font-medium tracking-wide">
            {statusMessage}
          </p>
        </div>
        <p className="text-[13px] text-admin-text-muted font-light">
          {highlightsMessage}
        </p>
      </div>
    </motion.div>
  );
};
